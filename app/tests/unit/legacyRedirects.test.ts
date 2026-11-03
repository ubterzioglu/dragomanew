import { describe, expect, it } from 'vitest'
import { REDIRECT_PATH } from '../../scripts/lib/redirectMap.mjs'
import { staticRouteSpecs } from '../../src/app/routePaths'
import { contentData } from '../../src/content/data'
import { LEGACY_ADDRESSES, legacyRedirects } from '../../src/content/legacyRedirects'
import { eventPath, postPath, productPath } from '../../src/content/urls'
import { LOCALES } from '../../src/i18n/locales'

const published = <T extends { status: string }>(list: readonly T[]) => list.filter((record) => record.status === 'published')

/** Every path the fixture build renders (fetch-content's liveRoutes, on the fixture). */
const live = new Set([
  ...staticRouteSpecs().map((spec) => (spec.path === '' ? '/' : `/${spec.path}/`)),
  ...LOCALES.flatMap((locale) => [
    ...published(contentData.events).map((event) => eventPath(locale, event)),
    ...published(contentData.posts).map((post) => postPath(locale, post)),
    ...published(contentData.products).map((product) => productPath(locale, product)),
  ]),
])

const resolved = legacyRedirects(contentData, live)
const target = (from: string) => resolved.redirects.find((redirect) => redirect.from === from)?.to

describe('old WordPress addresses', () => {
  it('are plain, unique site paths', () => {
    const froms = LEGACY_ADDRESSES.map((address) => address.from)
    expect(new Set(froms).size).toBe(froms.length)
    for (const from of froms) expect(REDIRECT_PATH.test(from), from).toBe(true)
  })

  it('skip the addresses the new site still serves', () => {
    for (const kept of ['/diving/', '/tr/deniz-kanosu/', '/fr/activites-pleine-nature/', '/kas-dive-sites/', '/product/the-diving-guide-kas/']) {
      expect(live.has(kept), kept).toBe(true)
      expect(target(kept), kept).toBeUndefined()
    }
  })

  it('send shop, form, sample and legal pages to their page in the same language', () => {
    expect(target('/cart/')).toBe('/shop/')
    expect(target('/tr/sepet/')).toBe('/tr/dukkan/')
    expect(target('/fr/mon-compte/')).toBe('/fr/boutique/')
    expect(target('/refund_returns/')).toBe('/terms-and-conditions/')
    expect(target('/tr/katilmak-istiyorum/')).toBe('/tr/rezervasyon-ve-iletisim/')
    expect(target('/tr/sample-page/')).toBe('/tr/')
    expect(target('/dragoman-blog/hello-world/')).toBe('/blog/')
  })

  it('send old posts and products to the record that took them over', () => {
    const post = (id: string) => contentData.posts.find((record) => record.id === id)!
    const product = (id: string) => contentData.products.find((record) => record.id === id)!
    expect(target('/dragoman-blog/raja-ampat/')).toBe(postPath('en', post('raja-ampat-2027')))
    expect(target('/tr/dragoman-blog-tr/sea-kayak-kekova-west-tour/')).toBe(postPath('tr', post('kekova-bati-turu')))
    expect(target('/fr/non-categorise/dragoman-maldives-diving-trip-2026/')).toBe(postPath('fr', post('maldivler-2026')))
    expect(target('/fr/produit/tropikal-akdeniz/')).toBe(productPath('fr', product('tropical-mediterranean-turkish')))
  })

  it('resolve every address that is not live, to a live page, without chains', () => {
    expect(resolved.skipped).toEqual([])
    for (const { from, to } of resolved.redirects) {
      expect(live.has(to), `${from} -> ${to}`).toBe(true)
      expect(REDIRECT_PATH.test(to), to).toBe(true)
      expect(resolved.redirects.some((other) => other.from === to), `${to} is itself redirected`).toBe(false)
    }
  })

  it('leave an address whose record is not published to answer 404', () => {
    const posts = contentData.posts.map((record) => (record.id === 'maldivler-2026' ? { ...record, status: 'archived' as const } : record))
    const result = legacyRedirects({ ...contentData, posts }, live)
    expect(result.redirects.some((redirect) => redirect.from === '/dragoman-blog/dragoman-maldives-diving-trip-2026/')).toBe(false)
    expect(result.skipped).toContainEqual({ from: '/dragoman-blog/dragoman-maldives-diving-trip-2026/', reason: 'post "maldivler-2026" is not published' })
  })
})
