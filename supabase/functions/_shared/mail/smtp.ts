import nodemailer from 'nodemailer'
import { smtpTransportOptions, withTimeoutLabel } from './smtpOptions.ts'
import type { Mailer, SmtpSettings } from './types.ts'

/**
 * SMTP mailer for the Edge Runtime. Supabase blocks outgoing ports 25 and 587, so production
 * uses implicit TLS on 465 (Zoho). nodemailer runs on Deno 2's node:net/node:tls layer.
 * Locally the target is Mailpit without TLS. Options and timeouts live in smtpOptions.ts.
 */

export type { SmtpSettings } from './types.ts'

export function createSmtpMailer(settings: SmtpSettings): Mailer {
  const transport = nodemailer.createTransport(smtpTransportOptions(settings))

  return {
    async send(message) {
      try {
        await transport.sendMail({
          from: settings.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
          ...(message.replyTo ? { replyTo: message.replyTo } : {}),
        })
      } catch (error) {
        throw withTimeoutLabel(error)
      }
    },
  }
}
