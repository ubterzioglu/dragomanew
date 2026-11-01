import { describe, expect, it } from 'vitest'
import { createStaticRepository, type ContentData } from '../../src/content/staticRepository'
import type { DragomanEvent, Post } from '../../src/content/schema'

const t = (tr: string) => ({ tr })
const slugs = (base: string) => ({ tr: `${base}-tr`, en: base, fr: `${base}-fr`, de: `${base}-de` })

function event(id: string, overrides: Partial<DragomanEvent> = {}): DragomanEvent {
  return {
    id,
    category: 'seaKayak',
    subgroup: 'gunluk',
    order: 1,
    slug: slugs(id),
    title: t(id),
    summary: t(id),
    body: { tr: [{ type: 'p', text: id }] },
    priceDisplay: 'numeric',
    options: [],
    cover: 'img',
    gallery: [],
    faq: [],
    itinerary: [],
    healthForm: null,
    featured: false,
    status: 'published',
    origin: 'mockup',
    translationOrigin: {},
    sourceRefs: [],
    ...overrides,
  }
}

function post(id: string, date: string): Post {
  return {
    id,
    slug: slugs(id),
    date,
    title: t(id),
    excerpt: t(id),
    body: { tr: [{ type: 'p', text: id }] },
    relatedEvents: [],
    status: 'published',
    origin: 'mockup',
    translationOrigin: {},
    sourceRefs: [],
  }
}

const data = {
  media: [{ id: 'img', sourceFile: 'a.jpg', widths: [480], width: 480, height: 320, alt: t('x'), topic: 'x', rights: 'unverified', placeholder: false }],
  subgroups: [
    { id: 'cok-gunluk', category: 'seaKayak', order: 2, title: t('Çok günlük') },
    { id: 'gunluk', category: 'seaKayak', order: 1, title: t('Günlük') },
    { id: 'deneme', category: 'diving', order: 1, title: t('Deneme') },
  ],
  events: [
    event('kekova-bati', { order: 2 }),
    event('kekova-klasik', { order: 1 }),
    event('eski-tur', { status: 'archived' }),
    event('taslak-tur', { status: 'draft' }),
  ],
  posts: [post('eski', '2025-01-10'), post('yeni', '2026-06-01')],
  categoryPages: [],
  serviceOffers: [],
  products: [],
  team: [],
  testimonials: [],
  richPages: [],
} as unknown as ContentData

const repo = createStaticRepository(data)

describe('createStaticRepository', () => {
  it('lists subgroups of one category in manual order', () => {
    expect(repo.subgroups('seaKayak').map((s) => s.id)).toEqual(['gunluk', 'cok-gunluk'])
  })

  it('lists events in manual order and hides archived and draft ones', () => {
    expect(repo.eventsInSubgroup('gunluk').map((e) => e.id)).toEqual(['kekova-klasik', 'kekova-bati'])
    expect(repo.events().map((e) => e.id)).not.toContain('eski-tur')
    expect(repo.events().map((e) => e.id)).not.toContain('taslak-tur')
  })

  it('finds an event by its slug in the given language only', () => {
    expect(repo.eventBySlug('seaKayak', 'tr', 'kekova-klasik-tr')?.id).toBe('kekova-klasik')
    expect(repo.eventBySlug('seaKayak', 'en', 'kekova-klasik-tr')).toBeNull()
    expect(repo.eventBySlug('diving', 'tr', 'kekova-klasik-tr')).toBeNull()
  })

  it('does not serve archived events by slug (no new requests for them)', () => {
    expect(repo.eventBySlug('seaKayak', 'en', 'eski-tur')).toBeNull()
  })

  it('returns posts newest first', () => {
    expect(repo.posts().map((p) => p.id)).toEqual(['yeni', 'eski'])
  })

  it('fails loudly for a missing media id instead of rendering a broken image', () => {
    expect(() => repo.media('yok')).toThrow(/yok/)
  })
})
