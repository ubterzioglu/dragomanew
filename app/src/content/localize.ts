import { SOURCE_LOCALE, type Locale } from '../i18n/locales'
import { typesetDeep } from '../lib/typography'

export interface LocalizedValue<T> {
  tr: T
  en?: T
  fr?: T
  de?: T
}

export interface Picked<T> {
  value: T
  /** True when the requested language was missing and Turkish was shown instead. */
  isFallback: boolean
}

/**
 * Content in the requested language, falling back to the Turkish source.
 * The fallback is reported so templates can mark it (data-i18n-fallback) and
 * the content report can count it: a missing translation is never "done".
 */
export function pick<T>(value: LocalizedValue<T>, locale: Locale): Picked<T> {
  const own = value[locale]
  // Typesetting follows the language actually shown (FR rules never touch the Turkish fallback).
  if (own !== undefined) return { value: typesetDeep(own, locale), isFallback: false }
  // `tr` is the required source field (SOURCE_LOCALE).
  return { value: typesetDeep(value.tr, SOURCE_LOCALE), isFallback: locale !== SOURCE_LOCALE }
}
