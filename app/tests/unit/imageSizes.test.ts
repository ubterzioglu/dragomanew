import { describe, expect, it } from 'vitest'
import { coverSizes } from '../../src/lib/imageSizes'

describe('coverSizes (object-fit: cover boxes)', () => {
  it('widens every length when the image is wider than its box', () => {
    // 3:2 photo in a 3:4 tile renders twice as wide as the tile.
    expect(coverSizes('(min-width: 768px) 33vw, 82vw', 3 / 2, 3 / 4)).toBe('(min-width: 768px) calc(33vw * 2), calc(82vw * 2)')
  })

  it('folds an existing calc() into the product', () => {
    expect(coverSizes('(min-width: 1024px) 33vw, calc(100vw - 2rem)', 16 / 9, 4 / 3)).toBe(
      '(min-width: 1024px) calc(33vw * 1.34), calc((100vw - 2rem) * 1.34)',
    )
  })

  it('keeps conditions that contain several parentheses', () => {
    expect(coverSizes('(min-width: 640px) and (max-width: 1023px) 50vw, 144px', 2, 1)).toBe(
      '(min-width: 640px) and (max-width: 1023px) calc(50vw * 2), calc(144px * 2)',
    )
  })

  it('keeps a condition apart from a calc() that has its own parentheses', () => {
    expect(coverSizes('(min-width: 40rem) calc((100vw - 2rem) / 2), 100vw', 2, 1)).toBe(
      '(min-width: 40rem) calc(((100vw - 2rem) / 2) * 2), calc(100vw * 2)',
    )
  })

  it('leaves sizes alone when the image is as narrow as the box or narrower', () => {
    expect(coverSizes('(min-width: 1024px) 50vw, 100vw', 16 / 10, 16 / 10)).toBe('(min-width: 1024px) 50vw, 100vw')
    expect(coverSizes('50vw', 4 / 5, 16 / 9)).toBe('50vw')
    expect(coverSizes('50vw', 1.01, 1)).toBe('50vw')
  })

  it('rounds the factor up so the browser never picks a candidate that is too small', () => {
    expect(coverSizes('100vw', 1280 / 457, 4 / 3)).toBe('calc(100vw * 2.11)')
  })
})
