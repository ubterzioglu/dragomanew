import type { Mailer, SmtpSettings } from '../_shared/mail/types.ts'

/**
 * Builds the mailer without letting a bad SMTP setting take the whole function down at boot.
 * A missing SMTP_HOST must not lose requests: they are still stored, and the outbox marks each
 * mail failed, so it can be resent once SMTP is fixed. Pure apart from `get`, so vitest runs it.
 */

/** Reads one environment variable; Deno.env.get in the function, a map in tests. */
export type EnvGetter = (name: string) => string | undefined

export type SmtpConfig = { ok: true; settings: SmtpSettings } | { ok: false; invalid: string[] }

/** Contract: implicit TLS on 465, the one SMTP port Supabase leaves open. */
const DEFAULT_PORT = 465

/** The error every send gets while SMTP is unusable; notifications.last_error keeps it. */
export const SMTP_NOT_CONFIGURED = 'smtp_not_configured'

/** Names the variables that are missing or wrong, never their values. */
export function readSmtp(get: EnvGetter): SmtpConfig {
  const value = (name: string): string | null => get(name)?.trim() || null
  const host = value('SMTP_HOST')
  const from = value('MAIL_FROM')
  const rawPort = value('SMTP_PORT')
  const port = rawPort === null ? DEFAULT_PORT : Number(rawPort)
  const user = value('SMTP_USER')
  const pass = value('SMTP_PASS')

  const invalid = [
    ...(host ? [] : ['SMTP_HOST']),
    ...(Number.isInteger(port) && port > 0 && port <= 65_535 ? [] : ['SMTP_PORT']),
    ...(from ? [] : ['MAIL_FROM']),
    // One without the other would send unauthenticated and be refused by the provider.
    ...(Boolean(user) === Boolean(pass) ? [] : [user ? 'SMTP_PASS' : 'SMTP_USER']),
  ]
  if (!host || !from || invalid.length > 0) return { ok: false, invalid }
  // Implicit TLS unless explicitly turned off (local Mailpit).
  return { ok: true, settings: { host, port, secure: value('SMTP_SECURE') !== 'false', user, pass, from } }
}

const unconfigured: Mailer = {
  send: () => Promise.reject(new Error(SMTP_NOT_CONFIGURED)),
}

export function mailerFromEnv(get: EnvGetter, build: (settings: SmtpSettings) => Mailer, report: (message: string) => void): Mailer {
  const config = readSmtp(get)
  if (!config.ok) {
    report(`submit-request: SMTP not configured (${config.invalid.join(', ')}); requests are stored, their mails marked failed`)
    return unconfigured
  }
  try {
    return build(config.settings)
  } catch (error) {
    // Only the class: a transport error could quote the settings it was given.
    report(`submit-request: SMTP mailer did not start (${error instanceof Error ? error.name : 'unknown error'})`)
    return unconfigured
  }
}
