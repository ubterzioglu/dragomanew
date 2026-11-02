const HTML_ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Everything a visitor typed goes through this before it reaches an HTML mail. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char)
}

/** Escaped, with line breaks kept, for free-text fields such as a message. */
export function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br>')
}

/** A subject is one header line: line breaks would let a value start a new header. */
export function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}
