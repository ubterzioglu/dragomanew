import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import { postSchema, seoSchema } from '../../src/content/schema'
import { pageSeo, shareImageId } from '../../src/content/seo'

const fallback = { title: 'Görünen başlık', description: 'Görünen özet' }
const seo = {
  title: { tr: 'Arama başlığı', en: 'Search title' },
  description: { tr: 'Arama açıklaması', en: 'Search description' },
}

describe('pageSeo', () => {
  it('prefers the record seo texts in the page language', () => {
    expect(pageSeo(seo, 'en', fallback)).toEqual({ title: 'Search title', description: 'Search description' })
  })

  it('falls back to Turkish seo text before the visible title (pick rule)', () => {
    expect(pageSeo(seo, 'de', fallback).title).toBe('Arama başlığı')
  })

  it('uses what the page shows when a record has no seo, or only part of it', () => {
    expect(pageSeo(undefined, 'tr', fallback)).toEqual(fallback)
    expect(pageSeo({ title: seo.title }, 'tr', fallback)).toEqual({ title: 'Arama başlığı', description: 'Görünen özet' })
  })
})

describe('shareImageId', () => {
  it('uses seo.ogImage when set, otherwise the page photo', () => {
    expect(shareImageId({ ogImage: 'cover-diving' }, 'hero-diving')).toBe('cover-diving')
    expect(shareImageId(undefined, 'hero-diving')).toBe('hero-diving')
    expect(shareImageId({}, undefined)).toBeUndefined()
  })
})

describe('seo schema fields', () => {
  it('accepts an empty seo object and rejects a non-slug image id', () => {
    expect(seoSchema.safeParse({}).success).toBe(true)
    expect(seoSchema.safeParse({ ogImage: 'Not An Id' }).success).toBe(false)
  })

  it('accepts an ISO update date on posts and rejects anything else', () => {
    const post = contentData.posts[0]
    expect(postSchema.safeParse({ ...post, updated: '2026-11-02' }).success).toBe(true)
    expect(postSchema.safeParse({ ...post, updated: '02.11.2026' }).success).toBe(false)
  })
})
