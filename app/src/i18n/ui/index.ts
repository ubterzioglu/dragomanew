import type { Locale } from '../locales'
import { de } from './de'
import { en } from './en'
import { fr } from './fr'
import { tr, type UiStrings } from './tr'

export type { UiStrings }

const DICTIONARIES: Readonly<Record<Locale, UiStrings>> = { tr, en, fr, de }

export function getUi(locale: Locale): UiStrings {
  return DICTIONARIES[locale]
}

/** Fills `{name}` placeholders; a missing variable is a bug, not blank output. */
export function formatTemplate(template: string, vars: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = vars[name]
    if (value === undefined) {
      throw new Error(`Missing template variable "${name}" in "${template}"`)
    }
    return String(value)
  })
}
