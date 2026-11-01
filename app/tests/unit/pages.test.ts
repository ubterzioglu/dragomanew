import { describe, expect, it } from 'vitest'
import { localePath, pageAlternates, PAGE_KEYS } from '../../src/i18n/pages'
import { LOCALES } from '../../src/i18n/locales'

describe('localePath', () => {
  it('keeps English at the root and prefixes other locales', () => {
    expect(localePath('en', 'home')).toBe('/')
    expect(localePath('tr', 'home')).toBe('/tr/')
    expect(localePath('fr', 'home')).toBe('/fr/')
    expect(localePath('de', 'home')).toBe('/de/')
  })

  it('preserves the legacy WordPress category slugs exactly', () => {
    expect(localePath('en', 'diving')).toBe('/diving/')
    expect(localePath('tr', 'diving')).toBe('/tr/diving/')
    expect(localePath('fr', 'diving')).toBe('/fr/plongee/')
    expect(localePath('en', 'seaKayak')).toBe('/sea-kayak/')
    expect(localePath('tr', 'seaKayak')).toBe('/tr/deniz-kanosu/')
    expect(localePath('en', 'transport')).toBe('/transportation-and-accomodation/')
    expect(localePath('tr', 'contact')).toBe('/tr/rezervasyon-ve-iletisim/')
    expect(localePath('en', 'about')).toBe('/dragoman/')
    expect(localePath('tr', 'lifeguard')).toBe('/tr/cankurtarma-merkezi/')
  })

  it('appends child slugs with a trailing slash', () => {
    expect(localePath('tr', 'seaKayak', ['kekova-klasik'])).toBe('/tr/deniz-kanosu/kekova-klasik/')
    expect(localePath('en', 'blog', ['raja-ampat'])).toBe('/blog/raja-ampat/')
  })

  it('rejects child slugs that could escape the site path', () => {
    for (const bad of ['../x', 'a/b', 'a\\b', '', 'https:', 'A b']) {
      expect(() => localePath('en', 'blog', [bad])).toThrow()
    }
  })

  it('has a unique path for every page in every locale', () => {
    const paths = LOCALES.flatMap((locale) => PAGE_KEYS.map((key) => localePath(locale, key)))
    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe('pageAlternates', () => {
  it('returns the same page in all four locales', () => {
    expect(pageAlternates('outdoor')).toEqual({
      tr: '/tr/doga-etkinlikleri/',
      en: '/outdoor-activities/',
      fr: '/fr/activites-pleine-nature/',
      de: '/de/outdoor-aktivitaeten/',
    })
  })
})
