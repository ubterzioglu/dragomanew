import { createSmtpMailer } from '../_shared/mail/smtp.ts'
import { readConfig, requiredEnv, secretKey } from './env.ts'
import { handleSubmit } from './handler.ts'
import { createIpHasher } from './ipHash.ts'
import { mailerFromEnv } from './mailer.ts'
import { createReporter } from './redact.ts'
import { createSupabaseStore } from './store.ts'
import type { Deps } from './types.ts'

/**
 * Thin Deno entry for submit-request. verify_jwt is off (config.toml) because visitors have
 * no session; handleSubmit checks the publishable key itself, after answering the CORS
 * preflight, which carries no key. Everything else lives in handler.ts.
 */

const config = readConfig()
if (config.publishableKeys.length === 0) console.error('submit-request: no publishable key configured; every call gets 401')
if (config.allowedOrigins.length === 0) console.error('submit-request: ALLOWED_ORIGINS is empty; every browser call gets 403')

const deps: Deps = {
  store: createSupabaseStore(requiredEnv('SUPABASE_URL'), secretKey()),
  // A bad SMTP setting must not stop requests from being stored; the outbox records the failure.
  mailer: mailerFromEnv((name) => Deno.env.get(name), createSmtpMailer, (message) => console.error(message)),
  clock: () => new Date(),
  config,
  hashIp: createIpHasher(requiredEnv('THROTTLE_SALT')),
  reportError: createReporter((line) => console.error(line)),
}

Deno.serve((request) => handleSubmit(request, deps))
