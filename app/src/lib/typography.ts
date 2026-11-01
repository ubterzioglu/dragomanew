import type { Locale } from '../i18n/locales'

const NBSP = ' '
const NNBSP = ' '

/**
 * Replaces breakable spaces that must not end a line: French high punctuation
 * and guillemets (NBSP before ":", narrow NBSP before ";", "!", "?"), and a
 * number followed by a degree sign in every language. Only U+0020 is touched,
 * so the result is stable when applied twice.
 */
export function typeset(text: string, locale: Locale): string {
  let result = text.replace(/(\d) °/g, `$1${NBSP}°`)
  if (locale === 'fr') {
    result = result
      .replace(/ :/g, `${NBSP}:`)
      .replace(/ ([;!?])/g, `${NNBSP}$1`)
      .replace(/« /g, `«${NBSP}`)
      .replace(/ »/g, `${NBSP}»`)
  }
  return result
}

/** typeset() applied to every string inside a content value (rich text blocks included). */
export function typesetDeep<T>(value: T, locale: Locale): T {
  if (typeof value === 'string') return typeset(value, locale) as T
  if (Array.isArray(value)) return value.map((item: unknown) => typesetDeep(item, locale)) as T
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typesetDeep(item, locale)])) as T
  }
  return value
}
