import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { media } from '../../src/content/data/media'
import { mediaAssetSchema } from '../../src/content/schema'

const MEDIA_DIR = fileURLToPath(new URL('../../public/media/', import.meta.url))
const FORMATS = ['avif', 'webp', 'jpg'] as const

describe('media catalog', () => {
  it('is not empty', () => {
    expect(media.length).toBeGreaterThan(0)
  })

  it.each(media.map((asset) => [asset.id, asset] as const))('%s matches mediaAssetSchema', (_id, asset) => {
    expect(() => mediaAssetSchema.parse(asset)).not.toThrow()
  })

  it('has unique ids', () => {
    const ids = media.map((asset) => asset.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists widths in ascending order with the largest matching width', () => {
    for (const asset of media) {
      expect([...asset.widths].sort((a, b) => a - b)).toEqual(asset.widths)
      expect(asset.widths[asset.widths.length - 1]).toBe(asset.width)
    }
  })

  it('has every optimised file on disk', () => {
    const missing = media.flatMap((asset) =>
      asset.widths.flatMap((w) =>
        FORMATS.map((ext) => `${asset.id}-${w}.${ext}`).filter((name) => !existsSync(`${MEDIA_DIR}${name}`)),
      ),
    )
    expect(missing).toEqual([])
  })
})
