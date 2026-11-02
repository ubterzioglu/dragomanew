/** One outgoing mail, already rendered. */
export interface MailMessage {
  to: string
  subject: string
  text: string
  html: string
  /** Where a reply goes instead of the From address; validated by the request schema. */
  replyTo?: string
}

/** Where and how the SMTP mailer connects; read from the environment by submit-request. */
export interface SmtpSettings {
  host: string
  port: number
  /** true = implicit TLS from the first byte (port 465). */
  secure: boolean
  user: string | null
  pass: string | null
  from: string
}

/** Sends one mail or rejects; the caller decides about timeouts and the outbox. */
export interface Mailer {
  send(message: MailMessage): Promise<void>
}
