import { describe, expect, it } from 'vitest'
import { needsDistribution, validateDistribution } from '../../src/lib/options'

const twoOptions = [{ id: 'yemekli' }, { id: 'yemeksiz' }]

describe('needsDistribution', () => {
  it('asks per-option head counts only when there is more than one option', () => {
    expect(needsDistribution(twoOptions)).toBe(true)
    expect(needsDistribution([{ id: 'tek' }])).toBe(false)
    expect(needsDistribution([])).toBe(false)
  })
})

describe('validateDistribution (guide §6, E05)', () => {
  it('accepts 4 people as 2 + 2', () => {
    expect(validateDistribution(twoOptions, 4, { yemekli: 2, yemeksiz: 2 })).toEqual([])
  })

  it('accepts all people on a single option; zero means not chosen', () => {
    expect(validateDistribution(twoOptions, 4, { yemekli: 4, yemeksiz: 0 })).toEqual([])
    expect(validateDistribution(twoOptions, 4, { yemekli: 4 })).toEqual([])
  })

  it('rejects totals that do not match the party size (3 or 5 of 4)', () => {
    expect(validateDistribution(twoOptions, 4, { yemekli: 2, yemeksiz: 1 })).toEqual([{ code: 'sum_mismatch' }])
    expect(validateDistribution(twoOptions, 4, { yemekli: 3, yemeksiz: 2 })).toEqual([{ code: 'sum_mismatch' }])
  })

  it('rejects negative and fractional counts', () => {
    expect(validateDistribution(twoOptions, 4, { yemekli: -1, yemeksiz: 5 })).toContainEqual({
      code: 'invalid_count',
      optionId: 'yemekli',
    })
    expect(validateDistribution(twoOptions, 4, { yemekli: 1.5, yemeksiz: 2.5 })).toContainEqual({
      code: 'invalid_count',
      optionId: 'yemekli',
    })
  })

  it('rejects options that belong to another event', () => {
    expect(validateDistribution(twoOptions, 2, { yemekli: 1, 'baska-etkinlik': 1 })).toContainEqual({
      code: 'unknown_option',
      optionId: 'baska-etkinlik',
    })
  })

  it('rejects an invalid party size', () => {
    expect(validateDistribution(twoOptions, 0, {})).toEqual([{ code: 'invalid_party_size' }])
    expect(validateDistribution(twoOptions, 2.5, {})).toEqual([{ code: 'invalid_party_size' }])
  })

  it('needs no distribution for single-option events', () => {
    expect(validateDistribution([{ id: 'tek' }], 3, {})).toEqual([])
  })
})
