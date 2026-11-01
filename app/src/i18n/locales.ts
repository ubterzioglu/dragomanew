export const LOCALES = ['tr', 'en', 'fr', 'de'] as const

export type Locale = (typeof LOCALES)[number]

/** Turkish is the content source language (V6 §8). */
export const SOURCE_LOCALE: Locale = 'tr'

/**
 * English lives at the site root and the other languages are prefixed,
 * matching the existing dragoman-turkey.com addresses (translation-matrix.csv).
 * Changing the final URL map later only needs this table.
 */
export const LOCALE_PREFIX: Readonly<Record<Locale, string>> = {
  en: '',
  tr: 'tr',
  fr: 'fr',
  de: 'de',
}

/** BCP 47 tags for <html lang> and hreflang. */
export const LOCALE_TAG: Readonly<Record<Locale, string>> = {
  tr: 'tr-TR',
  en: 'en',
  fr: 'fr-FR',
  de: 'de-DE',
}

/** Intl formatting tags: the English copy is British, so dates read "5 July 2026". */
export const INTL_TAG: Readonly<Record<Locale, string>> = { ...LOCALE_TAG, en: 'en-GB' }

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
