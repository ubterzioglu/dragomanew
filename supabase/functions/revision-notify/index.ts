import { createStaffVerifier, serviceClient } from '../_shared/auth/supabase.ts'
import { allowedOrigins, env, publishableKeys, requiredEnv, secretKey } from '../_shared/http/env.ts'
import { createSmtpMailer } from '../_shared/mail/smtp.ts'
import type { Mailer } from '../_shared/mail/types.ts'
import { readSmtp } from '../submit-request/mailer.ts'
import { createReporter } from '../submit-request/redact.ts'
import { handleRevisionNotify } from './handler.ts'
import { createRevisionNotifyStore } from './store.ts'
import type { RevisionNotifyDeps } from './types.ts'

/**
 * Thin Deno entry for revision-notify. verify_jwt is off; handler.ts checks the staff session
 * (signed-in token + revisions.use) after answering the CORS preflight. No secret of its own: it
 * reads the SMTP settings and PANEL_URL submit-request already uses (with submit-request's reader
 * and masked logger). Without SMTP every mail is recorded as smtp_not_configured; the function runs.
 */

/** Long enough for an SMTP handshake; smtpOptions.ts keeps every socket timeout below it. */
const MAIL_TIMEOUT_MS = 8_000

const url = requiredEnv('SUPABASE_URL')
const [publishableKey] = publishableKeys()
if (!publishableKey) throw new Error('SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) is not set')
const service = serviceClient(url, secretKey())
const origins = allowedOrigins()
if (origins.length === 0) console.error('revision-notify: ALLOWED_ORIGINS is empty; every browser call gets 403')

function mailerFromEnv(): Mailer | null {
  const smtp = readSmtp((name) => Deno.env.get(name))
  if (!smtp.ok) {
    console.error(`revision-notify: SMTP not configured (${smtp.invalid.join(', ')}); mails are recorded as smtp_not_configured`)
    return null
  }
  try {
    return createSmtpMailer(smtp.settings)
  } catch (error) {
    // Only the class: a transport error could quote the settings it was given.
    console.error(`revision-notify: SMTP mailer did not start (${error instanceof Error ? error.name : 'unknown error'})`)
    return null
  }
}

const panelUrl = env('PANEL_URL')
const linkBase = panelUrl && /^https?:\/\//.test(panelUrl) ? panelUrl : null
if (!linkBase) console.error('revision-notify: PANEL_URL is not set; mails go out without a link to the request')

const deps: RevisionNotifyDeps = {
  store: createRevisionNotifyStore(service),
  auth: createStaffVerifier(url, publishableKey, service),
  mailer: mailerFromEnv(),
  panelUrl: linkBase,
  allowedOrigins: origins,
  mailTimeoutMs: MAIL_TIMEOUT_MS,
  clock: () => new Date(),
  reportError: createReporter((line) => console.error(line)),
}

Deno.serve((request) => handleRevisionNotify(request, deps))
