import { describe, expect, it } from 'vitest'
import { pick } from '../../src/content/localize'
import { formatMoney } from '../../src/lib/format'

describe('pick (content language with visible fallback)', () => {
  const value = { tr: 'Deniz Kanosu', en: 'Sea Kayak' }

  it('returns the requested language when present', () => {
    expect(pick(value, 'en')).toEqual({ value: 'Sea Kayak', isFallback: false })
  })

  it('falls back to Turkish and flags it, so missing translations are never silent', () => {
    expect(pick(value, 'de')).toEqual({ value: 'Deniz Kanosu', isFallback: true })
  })

  it('keeps Turkish as non-fallback for Turkish pages', () => {
    expect(pick(value, 'tr')).toEqual({ value: 'Deniz Kanosu', isFallback: false })
  })
})

describe('formatMoney', () => {
  it('formats whole amounts without decimals in each language', () => {
    expect(formatMoney(45, 'EUR', 'tr')).toBe('€45')
    expect(formatMoney(45, 'EUR', 'en')).toBe('€45')
    // A no-break space keeps the amount and the symbol on one line.
    expect(formatMoney(45, 'EUR', 'de')).toBe('45 €')
    expect(formatMoney(45, 'EUR', 'fr')).toBe('45 €')
  })

  it('never leaves a breakable space inside an amount', () => {
    for (const locale of ['tr', 'en', 'fr', 'de'] as const) expect(formatMoney(1250, 'EUR', locale)).not.toMatch(/[ \u202f]/)
  })

  it('keeps cents when the amount has them', () => {
    expect(formatMoney(12.5, 'EUR', 'en')).toBe('€12.50')
  })
})
