import { describe, expect, it } from 'vitest'
import { resolveGa4Id } from '../../src/lib/analytics/ga4Id'

describe('resolveGa4Id (VITE_GA4_ID)', () => {
  it('turns analytics off when the id is not set', () => {
    expect(resolveGa4Id(undefined)).toBe('')
    expect(resolveGa4Id('')).toBe('')
    expect(resolveGa4Id('   ')).toBe('')
  })

  it('accepts a GA4 measurement id, without surrounding spaces', () => {
    expect(resolveGa4Id('G-ABC123XYZ9')).toBe('G-ABC123XYZ9')
    expect(resolveGa4Id(' G-ABC123XYZ9\n')).toBe('G-ABC123XYZ9')
  })

  it('fails the build on anything else', () => {
    for (const bad of ['G-', 'g-abc123', 'G-abc123', 'UA-12345-1', 'GTM-ABC123', 'AW-123456', 'G-ABC 123', 'G-ABC123"><script>', 'ABC123']) {
      expect(() => resolveGa4Id(bad), bad).toThrow(/VITE_GA4_ID/)
    }
  })
})
