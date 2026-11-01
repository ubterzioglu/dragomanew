import { describe, expect, it } from 'vitest'
import { pick } from '../../src/content/localize'
import { typeset } from '../../src/lib/typography'

const NBSP = ' '
const NNBSP = ' '

describe('typeset (no line break before punctuation or units)', () => {
  it('binds French high punctuation and guillemets to their word', () => {
    expect(typeset('À Kaş depuis 2002 : sous la mer', 'fr')).toBe(`À Kaş depuis 2002${NBSP}: sous la mer`)
    expect(typeset('Prêt ? Allons-y ! Oui ; non', 'fr')).toBe(`Prêt${NNBSP}? Allons-y${NNBSP}! Oui${NNBSP}; non`)
    expect(typeset('le webinaire « Et si vous veniez »', 'fr')).toBe(`le webinaire «${NBSP}Et si vous veniez${NBSP}»`)
  })

  it('leaves other languages alone apart from number + degree', () => {
    expect(typeset('Ready? Yes: go!', 'en')).toBe('Ready? Yes: go!')
    expect(typeset('zwischen 19 °C und 29 °C', 'de')).toBe(`zwischen 19${NBSP}°C und 29${NBSP}°C`)
  })

  it('is idempotent and keeps text without such spaces unchanged', () => {
    const once = typeset('Prêt ? « Oui »', 'fr')
    expect(typeset(once, 'fr')).toBe(once)
    expect(typeset('https://example.com/?a=1', 'fr')).toBe('https://example.com/?a=1')
  })
})

describe('pick applies typesetting to the language actually shown', () => {
  it('typesets nested French strings', () => {
    const value = { tr: [{ text: 'Hazır mısın ?' }], fr: [{ text: 'Prêt ?' }] }
    expect(pick(value, 'fr').value).toEqual([{ text: `Prêt${NNBSP}?` }])
  })

  it('does not apply French rules to the Turkish fallback', () => {
    expect(pick({ tr: 'Neden ?' }, 'fr')).toEqual({ value: 'Neden ?', isFallback: true })
  })

  it('returns non-string values unchanged', () => {
    expect(pick({ tr: 3, fr: 4 }, 'fr').value).toBe(4)
  })
})
