import { describe, expect, it } from 'vitest'
import { content } from '../../src/content/server'
import { contentData } from '../../src/content/data'
import { postAlternates, postPath, productAlternates, productPath } from '../../src/content/urls'
import { LOCALES } from '../../src/i18n/locales'

// The repository over the real sample data: the lookups the pages rely on.
const published = <T extends { status: string }>(records: readonly T[]) => records.filter((r) => r.status === 'published')

describe('content repository over the sample data', () => {
  it('finds visible events and posts by id, and nothing for hidden ones', () => {
    const event = published(contentData.events)[0]
    const post = published(contentData.posts)[0]
    expect(event && content.eventById(event.id)?.id).toBe(event?.id)
    expect(post && content.postById(post.id)?.id).toBe(post?.id)
    const archived = contentData.events.find((e) => e.status === 'archived')
    expect(archived && content.eventById(archived.id)).toBeNull()
    expect(content.postById('no-such-post')).toBeNull()
  })

  it('finds every visible product by its slug in each language', () => {
    for (const product of published(contentData.products)) {
      for (const locale of LOCALES) expect(content.productBySlug(locale, product.slug[locale])?.id).toBe(product.id)
    }
    expect(content.productBySlug('tr', 'no-such-book')).toBeNull()
  })

  it('returns team, testimonials and service offers in manual order', () => {
    const orders = content.team().map((member) => member.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
    expect(content.testimonials()).toHaveLength(contentData.testimonials.length)
    for (const kind of ['transfer', 'lodging'] as const) {
      const offers = content.serviceOffers(kind)
      expect(offers.every((offer) => offer.kind === kind)).toBe(true)
      expect(offers.map((o) => o.order)).toEqual(offers.map((o) => o.order).toSorted((a, b) => a - b))
    }
  })

  it('serves every rich page and fails loudly for an unknown one', () => {
    for (const page of contentData.richPages) expect(content.richPage(page.key).key).toBe(page.key)
    expect(() => content.richPage('nope' as never)).toThrow(/Content missing/)
    expect(() => content.categoryPage('nope' as never)).toThrow(/Content missing/)
  })

  it('returns copies, so callers cannot change the stored lists', () => {
    const events = content.events()
    events.length = 0
    expect(content.events().length).toBeGreaterThan(0)
  })
})

describe('post and product alternates', () => {
  it('give the same record in every language', () => {
    const post = published(contentData.posts)[0]
    const product = contentData.products[0]
    if (!post || !product) throw new Error('sample content missing')
    for (const locale of LOCALES) {
      expect(postAlternates(post)[locale]).toBe(postPath(locale, post))
      expect(productAlternates(product)[locale]).toBe(productPath(locale, product))
    }
  })
})
