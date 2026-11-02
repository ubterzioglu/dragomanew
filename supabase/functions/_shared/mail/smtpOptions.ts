import type { SmtpSettings } from './types.ts'

/**
 * The pure part of the SMTP mailer: transport options and error labelling, kept apart from
 * nodemailer so the site's vitest suite can check them without the package.
 */

/**
 * All below submit-request's 8 s send deadline (env.ts MAIL_TIMEOUT_MS). nodemailer's defaults
 * (10 s connect and greeting, 15 s socket) outlive it: the handler would mark the mail failed
 * while a slow server still delivers it, and the socket would dangle in the worker.
 */
export const SMTP_TIMEOUTS = { connectionTimeout: 5_000, greetingTimeout: 5_000, socketTimeout: 7_000 } as const

export interface SmtpTransportOptions {
  host: string
  port: number
  secure: boolean
  auth: { user: string; pass: string } | undefined
  ignoreTLS: boolean
  connectionTimeout: number
  greetingTimeout: number
  socketTimeout: number
}

export function smtpTransportOptions(settings: SmtpSettings): SmtpTransportOptions {
  return {
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.user && settings.pass ? { user: settings.user, pass: settings.pass } : undefined,
    // Without implicit TLS this is local Mailpit; never attempt STARTTLS there.
    ignoreTLS: !settings.secure,
    ...SMTP_TIMEOUTS,
  }
}

/** nodemailer's timeout messages differ ("Greeting never received"); last_error should say timeout. */
export function withTimeoutLabel(error: unknown): unknown {
  if (!(error instanceof Error) || (error as { code?: unknown }).code !== 'ETIMEDOUT') return error
  return new Error(`timeout: ${error.message}`, { cause: error })
}
