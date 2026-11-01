import { describe, expect, it } from 'vitest'
import { eventAlternates, eventPath, postPath, productPath } from '../../src/content/urls'

const slug = { tr: 'kekova-klasik', en: 'kekova-classic', fr: 'kekova-classique', de: 'kekova-klassik' }

describe('content URLs', () => {
  it('nests events under their category page in each language', () => {
    expect(eventPath('tr', { category: 'seaKayak', slug })).toBe('/tr/deniz-kanosu/kekova-klasik/')
    expect(eventPath('en', { category: 'seaKayak', slug })).toBe('/sea-kayak/kekova-classic/')
    expect(eventAlternates({ category: 'seaKayak', slug }).fr).toBe('/fr/kayak-de-mer/kekova-classique/')
  })

  it('builds blog and product paths', () => {
    expect(postPath('de', { slug })).toBe('/de/blog/kekova-klassik/')
    expect(productPath('en', { slug })).toBe('/product/kekova-classic/')
  })
})
