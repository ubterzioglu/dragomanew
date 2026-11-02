/**
 * Log hygiene. SMTP servers quote the recipient in their errors ("<x@y>: Recipient address
 * rejected") and PostgREST can quote row values, so every error text is masked before it
 * reaches the function logs or notifications.last_error. Only the message and codes of an
 * error are ever logged, never the object itself or a request payload.
 */

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
/** Enough for any SMTP or PostgREST reason; a longer text is not a reason any more. */
const MAX_LOGGED = 500

export function redactEmails(text: string): string {
  return text.replace(EMAIL, '[email]')
}

const label = (value: unknown): string | null =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : null

/** Class, error code and SMTP response code first, then the masked message. */
export function describeError(error: unknown): string {
  if (typeof error !== 'object' || error === null) return redactEmails(String(error)).slice(0, MAX_LOGGED)
  const { message, code, responseCode } = error as { message?: unknown; code?: unknown; responseCode?: unknown }
  const head = [error instanceof Error ? error.name : null, label(code), label(responseCode)].filter(
    (part): part is string => part !== null && part !== '',
  )
  const text = redactEmails(typeof message === 'string' ? message : 'no message').slice(0, MAX_LOGGED)
  return head.length > 0 ? `${redactEmails(head.join(' '))}: ${text}` : text
}

/** The function's reportError: one masked line per failure. */
export function createReporter(log: (line: string) => void): (context: string, error: unknown) => void {
  return (context, error) => log(`${context}: ${describeError(error)}`)
}
