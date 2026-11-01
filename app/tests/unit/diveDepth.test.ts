import { describe, expect, it } from 'vitest'
import { diveDepth, MAX_DIVE_DEPTH_M } from '../../src/lib/diveDepth'

describe('diveDepth', () => {
  it('is 0 m at the top and the full depth at the bottom of the page', () => {
    expect(diveDepth(0, 2000)).toBe(0)
    expect(diveDepth(2000, 2000)).toBe(MAX_DIVE_DEPTH_M)
  })

  it('grows with the share of the page scrolled, in whole metres', () => {
    expect(diveDepth(1000, 2000)).toBe(15)
    expect(diveDepth(1010, 2000)).toBe(15)
    expect(diveDepth(1050, 2000)).toBe(16)
  })

  it('stays within 0 and the full depth when the page overscrolls', () => {
    expect(diveDepth(-80, 2000)).toBe(0)
    expect(diveDepth(2300, 2000)).toBe(MAX_DIVE_DEPTH_M)
  })

  it('is 0 m on a page that does not scroll', () => {
    expect(diveDepth(0, 0)).toBe(0)
    expect(diveDepth(10, -5)).toBe(0)
    expect(diveDepth(Number.NaN, 2000)).toBe(0)
  })

  it('takes another maximum depth', () => {
    expect(diveDepth(500, 1000, 18)).toBe(9)
  })
})
