import { describe, expect, it } from 'vitest'
import { DIVE_ZONES, diveDepth, MAX_DIVE_DEPTH_M, scrollProgress, waterOpacity, zoneOpacity } from '../../src/lib/diveDepth'

describe('zoneOpacity', () => {
  // Mirrors the zone-* keyframes and animation ranges in app.css.
  it('shows the shallow fish near the surface and lets them go on the way down', () => {
    expect(zoneOpacity('shallow', 0)).toBe(1)
    expect(zoneOpacity('shallow', 0.3)).toBe(1)
    expect(zoneOpacity('shallow', 0.3825)).toBeCloseTo(0.5)
    expect(zoneOpacity('shallow', 0.5)).toBe(0)
  })

  it('brings the mid-water animals in and out in the middle of the page', () => {
    expect(zoneOpacity('mid', 0.1)).toBe(0)
    expect(zoneOpacity('mid', 0.31875)).toBeCloseTo(0.5)
    expect(zoneOpacity('mid', 0.5)).toBe(1)
    expect(zoneOpacity('mid', 0.73125)).toBeCloseTo(0.5)
    expect(zoneOpacity('mid', 0.9)).toBe(0)
  })

  it('keeps the deep animals for the bottom of the page', () => {
    expect(zoneOpacity('deep', 0.5)).toBe(0)
    expect(zoneOpacity('deep', 0.68)).toBeCloseTo(0.5)
    expect(zoneOpacity('deep', 0.9)).toBe(1)
    expect(zoneOpacity('deep', 1)).toBe(1)
  })

  it('always has some animals in view', () => {
    for (let step = 0; step <= 100; step += 1) {
      const progress = step / 100
      const shown = DIVE_ZONES.reduce((sum, zone) => sum + zoneOpacity(zone, progress), 0)
      expect(shown).toBeGreaterThanOrEqual(0.9)
    }
  })
})

describe('scrollProgress', () => {
  it('runs from 0 at the top to 1 at the bottom, clamped', () => {
    expect(scrollProgress(0, 2000)).toBe(0)
    expect(scrollProgress(500, 2000)).toBe(0.25)
    expect(scrollProgress(2000, 2000)).toBe(1)
    expect(scrollProgress(-40, 2000)).toBe(0)
    expect(scrollProgress(2400, 2000)).toBe(1)
  })

  it('is 0 on a page that does not scroll', () => {
    expect(scrollProgress(0, 0)).toBe(0)
    expect(scrollProgress(10, -5)).toBe(0)
    expect(scrollProgress(Number.NaN, 2000)).toBe(0)
  })
})

describe('diveDepth', () => {
  it('is 0 m at the top and the full depth at the bottom of the page', () => {
    expect(diveDepth(0)).toBe(0)
    expect(diveDepth(1)).toBe(MAX_DIVE_DEPTH_M)
  })

  it('grows with the scroll progress, in whole metres', () => {
    expect(diveDepth(0.5)).toBe(15)
    expect(diveDepth(0.505)).toBe(15)
    expect(diveDepth(0.525)).toBe(16)
  })

  it('stays within 0 and the full depth', () => {
    expect(diveDepth(-0.2)).toBe(0)
    expect(diveDepth(1.3)).toBe(MAX_DIVE_DEPTH_M)
  })

  it('takes another maximum depth', () => {
    expect(diveDepth(0.5, 18)).toBe(9)
  })
})

describe('waterOpacity', () => {
  // Mirrors the dive-deeper keyframes in app.css: 0 at the top, 0.43 at 15 %, 1 at the bottom, linear in between.
  it('follows the keyframes of the CSS water', () => {
    expect(waterOpacity(0)).toBe(0)
    expect(waterOpacity(0.15)).toBeCloseTo(0.43)
    expect(waterOpacity(0.075)).toBeCloseTo(0.215)
    expect(waterOpacity(0.575)).toBeCloseTo(0.715)
    expect(waterOpacity(1)).toBe(1)
  })

  it('stays between 0 and 1', () => {
    expect(waterOpacity(-0.5)).toBe(0)
    expect(waterOpacity(1.5)).toBe(1)
  })
})
