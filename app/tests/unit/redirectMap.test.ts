import { describe, expect, it } from 'vitest'
import { buildRedirects, REDIRECT_PATH, renderRedirectMap } from '../../scripts/lib/redirectMap.mjs'
import { staticRouteSpecs } from '../../src/app/routePaths'
import { contentData } from '../../src/content/data'
import { eventPath, postPath, productPath } from '../../src/content/urls'
import type { DragomanEvent } from '../../src/content/schema'

/** Slug-change 301s for nginx (dalga2-sozlesme §2 SEO-02, §7). */
const paths = { eventPath, postPath, productPath }
const event = contentData.events.find((e) => e.status === 'published' && e.category === 'seaKayak') as DragomanEvent
const archived = contentData.events.find((e) => e.status === 'archived') as DragomanEvent
const post = contentData.posts.find((p) => p.status === 'published')!
const product = contentData.products.find((p) => p.status === 'published')!
const fixedRoutes = staticRouteSpecs().map((spec) => (spec.path === '' ? '/' : `/${spec.path}/`))

const redirectsFor = (slugHistory: Parameters<typeof buildRedirects>[0]['slugHistory'], liveRoutes: string[] = fixedRoutes) =>
  buildRedirects({ content: contentData, slugHistory, paths, liveRoutes })

describe('buildRedirects', () => {
  it('sends an old event slug to the current page of the same language', () => {
    const { redirects } = redirectsFor([{ type: 'event', id: event.id, locale: 'en', slug: 'old-kayak-tour' }])
    expect(redirects).toEqual([{ from: eventPath('en', { category: event.category, slug: { ...event.slug, en: 'old-kayak-tour' } }), to: eventPath('en', event) }])
    expect(redirects[0]?.from).toMatch(/^\/[a-z0-9-]+\/old-kayak-tour\/$/)
  })

  it('follows a changed event category with the old category in the old address', () => {
    const { redirects } = redirectsFor([{ type: 'event', id: event.id, locale: 'tr', slug: event.slug.tr, category: 'outdoor' }])
    expect(redirects).toEqual([{ from: eventPath('tr', { category: 'outdoor', slug: event.slug }), to: eventPath('tr', event) }])
  })

  it('covers posts and products', () => {
    const { redirects } = redirectsFor([
      { type: 'post', id: post.id, locale: 'de', slug: 'alter-beitrag' },
      { type: 'product', id: product.id, locale: 'fr', slug: 'ancien-livre' },
    ])
    expect(redirects).toEqual(
      [
        { from: postPath('de', { slug: { ...post.slug, de: 'alter-beitrag' } }), to: postPath('de', post) },
        { from: productPath('fr', { slug: { ...product.slug, fr: 'ancien-livre' } }), to: productPath('fr', product) },
      ].toSorted((a, b) => (a.from < b.from ? -1 : 1)),
    )
  })

  it('never redirects archived or missing records (they answer 404)', () => {
    const { redirects } = redirectsFor([
      { type: 'event', id: archived.id, locale: 'en', slug: 'old-archived' },
      { type: 'post', id: 'no-such-post', locale: 'en', slug: 'gone' },
    ])
    expect(redirects).toEqual([])
  })

  it('ignores a slug that came back and never shadows a live page', () => {
    const live = eventPath('en', { category: event.category, slug: { ...event.slug, en: 'taken-now' } })
    const { redirects, skipped } = redirectsFor(
      [
        { type: 'event', id: event.id, locale: 'en', slug: event.slug.en },
        { type: 'event', id: event.id, locale: 'en', slug: 'taken-now' },
      ],
      [...fixedRoutes, live],
    )
    expect(redirects).toEqual([])
    expect(skipped).toEqual([{ from: live, reason: 'is a live page' }])
  })

  it('drops an address two records once used', () => {
    const other = contentData.events.find((e) => e.status === 'published' && e.category === event.category && e.id !== event.id)!
    const { redirects, skipped } = redirectsFor([
      { type: 'event', id: event.id, locale: 'en', slug: 'shared-old' },
      { type: 'event', id: other.id, locale: 'en', slug: 'shared-old' },
    ])
    expect(redirects).toEqual([])
    expect(skipped[0]?.reason).toMatch(/^ambiguous/)
  })
})

describe('renderRedirectMap', () => {
  it('writes one nginx map line per redirect under a comment', () => {
    const text = renderRedirectMap(
      [
        { from: '/tr/blog/eski/', to: '/tr/blog/yeni/' },
        { from: '/blog/old/', to: '/blog/new/' },
      ],
      'release 7',
    )
    expect(text).toBe('# release 7\n/tr/blog/eski/ /tr/blog/yeni/;\n/blog/old/ /blog/new/;\n')
    for (const line of text.trim().split('\n').slice(1)) {
      const [from, to] = line.replace(/;$/, '').split(' ')
      expect(REDIRECT_PATH.test(from!) && REDIRECT_PATH.test(to!)).toBe(true)
    }
  })

  it('accepts an old WordPress path with an underscore', () => {
    expect(renderRedirectMap([{ from: '/refund_returns/', to: '/terms-and-conditions/' }], 'x')).toBe('# x\n/refund_returns/ /terms-and-conditions/;\n')
  })

  it('writes a comment-only map when nothing moved', () => {
    expect(renderRedirectMap([], 'fixture')).toBe('# fixture\n')
  })

  it('refuses anything but a plain lowercase site path', () => {
    for (const from of ['/Blog/x/', '/blog/x', 'blog/x/', '/blog/x/;return 200', '/blog/x/ /evil/']) {
      expect(() => renderRedirectMap([{ from, to: '/blog/y/' }], 'x'), from).toThrow(/refusing/)
    }
  })
})
