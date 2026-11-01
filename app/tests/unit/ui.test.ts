import { describe, expect, it } from 'vitest'
import { formatTemplate, getUi } from '../../src/i18n/ui'
import { LOCALES } from '../../src/i18n/locales'

describe('formatTemplate', () => {
  it('replaces named placeholders', () => {
    expect(formatTemplate('{price} başlayan', { price: '45 €' })).toBe('45 € başlayan')
  })

  it('throws on a missing variable instead of printing a raw placeholder', () => {
    expect(() => formatTemplate('{price} başlayan', {})).toThrow()
  })
})

describe('ui dictionaries', () => {
  it('keeps the slogan in its original English in every locale', () => {
    for (const locale of LOCALES) {
      expect(getUi(locale).brand.slogan).toBe('Once a Dragoman, always a Dragoman.')
    }
  })

  it('has no empty strings in any locale', () => {
    const walk = (value: unknown, path: string): void => {
      if (typeof value === 'string') {
        expect(value.trim(), path).not.toBe('')
        return
      }
      if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`)
      }
    }
    for (const locale of LOCALES) walk(getUi(locale), locale)
  })
})
