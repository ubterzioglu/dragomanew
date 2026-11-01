import { describe, expect, it } from 'vitest'
import { cardPrice, requestSummary, type PricedEvent } from '../../src/lib/price'

const meal = { id: 'yemekli', price: 60, currency: 'EUR', basis: 'person' } as const
const noMeal = { id: 'yemeksiz', price: 45, currency: 'EUR', basis: 'person' } as const

const kekovaKlasik: PricedEvent = { priceDisplay: 'numeric', options: [meal, noMeal] }

describe('cardPrice (category card, V6 §4.3)', () => {
  it('shows "from" the lowest offered price for comparable options', () => {
    expect(cardPrice(kekovaKlasik)).toEqual({ kind: 'from', amount: 45, currency: 'EUR', basis: 'person' })
  })

  it('shows a single price when there is one priced option', () => {
    expect(cardPrice({ priceDisplay: 'numeric', options: [meal] })).toEqual({
      kind: 'single',
      amount: 60,
      currency: 'EUR',
      basis: 'person',
    })
  })

  it('never computes a price for "price on request"', () => {
    expect(cardPrice({ priceDisplay: 'on_request', options: [meal, noMeal] })).toEqual({ kind: 'on_request' })
  })

  it('does not treat an unknown price as zero', () => {
    const unknown = { id: 'ozel', price: null, currency: 'EUR', basis: 'person' } as const
    expect(cardPrice({ priceDisplay: 'numeric', options: [unknown, noMeal] })).toEqual({
      kind: 'from',
      amount: 45,
      currency: 'EUR',
      basis: 'person',
    })
    expect(cardPrice({ priceDisplay: 'numeric', options: [unknown] })).toEqual({ kind: 'none' })
  })

  it('does not compare different currencies or price bases', () => {
    const tl = { id: 'tl', price: 1500, currency: 'TRY', basis: 'person' } as const
    const group = { id: 'grup', price: 300, currency: 'EUR', basis: 'group' } as const
    expect(cardPrice({ priceDisplay: 'numeric', options: [meal, tl] })).toEqual({ kind: 'see_details' })
    expect(cardPrice({ priceDisplay: 'numeric', options: [meal, group] })).toEqual({ kind: 'see_details' })
  })

  it('returns none when there are no options', () => {
    expect(cardPrice({ priceDisplay: 'numeric', options: [] })).toEqual({ kind: 'none' })
  })
})

describe('requestSummary (request form, guide §6)', () => {
  it('computes 2 × 60 EUR + 2 × 45 EUR = 210 EUR', () => {
    expect(requestSummary(kekovaKlasik, { yemekli: 2, yemeksiz: 2 })).toEqual({
      kind: 'total',
      currency: 'EUR',
      total: 210,
      lines: [
        { optionId: 'yemekli', quantity: 2, unitPrice: 60, subtotal: 120 },
        { optionId: 'yemeksiz', quantity: 2, unitPrice: 45, subtotal: 90 },
      ],
    })
  })

  it('updates when quantities change and skips zero lines', () => {
    const summary = requestSummary(kekovaKlasik, { yemekli: 0, yemeksiz: 3 })
    expect(summary).toMatchObject({ kind: 'total', total: 135 })
    expect(summary.kind === 'total' && summary.lines).toHaveLength(1)
  })

  it('shows no total for "price on request"', () => {
    expect(requestSummary({ ...kekovaKlasik, priceDisplay: 'on_request' }, { yemekli: 2 })).toEqual({
      kind: 'on_request',
    })
  })

  it('does not invent a total when a chosen option has no price', () => {
    const unknown = { id: 'ozel', price: null, currency: 'EUR', basis: 'person' } as const
    expect(requestSummary({ priceDisplay: 'numeric', options: [noMeal, unknown] }, { yemeksiz: 1, ozel: 1 })).toEqual({
      kind: 'unpriced',
    })
  })

  it('does not add up different currencies or per-group prices', () => {
    const tl = { id: 'tl', price: 1500, currency: 'TRY', basis: 'person' } as const
    const group = { id: 'grup', price: 300, currency: 'EUR', basis: 'group' } as const
    expect(requestSummary({ priceDisplay: 'numeric', options: [meal, tl] }, { yemekli: 1, tl: 1 })).toEqual({
      kind: 'not_combinable',
    })
    expect(requestSummary({ priceDisplay: 'numeric', options: [group] }, { grup: 4 })).toEqual({
      kind: 'not_combinable',
    })
  })

  it('returns empty when nothing is selected yet', () => {
    expect(requestSummary(kekovaKlasik, {})).toEqual({ kind: 'empty' })
  })
})
