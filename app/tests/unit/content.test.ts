import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import {
  categoryPageSchema,
  eventSchema,
  homeContentSchema,
  postSchema,
  productSchema,
  richPageSchema,
  serviceOfferSchema,
  subgroupSchema,
  teamMemberSchema,
  testimonialSchema,
  type SeoFields,
} from '../../src/content/schema'
import { cardPrice } from '../../src/lib/price'
import { LOCALES } from '../../src/i18n/locales'
import { siteConfig } from '../../src/lib/siteConfig'

/**
 * Acceptance test for the Stage A sample content (plan Batch 3). It encodes the
 * guide's rules so content can be refilled later without breaking templates.
 */
const d = contentData
const mediaIds = new Set(d.media.map((m) => m.id))
const published = d.events.filter((e) => e.status === 'published')

const unique = (values: readonly string[]) => new Set(values).size === values.length

/** Walks any value and returns paths of localized objects missing en/fr/de. */
function missingTranslations(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((item, i) => missingTranslations(item, `${path}[${i}]`))
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  const own = 'tr' in record && !('category' in record) && !('id' in record)
    ? ['en', 'fr', 'de'].filter((locale) => record[locale] === undefined).map((locale) => `${path}.${locale}`)
    : []
  return [...own, ...Object.entries(record).flatMap(([key, child]) => missingTranslations(child, `${path}.${key}`))]
}

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(allStrings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings)
  return []
}

const textOf = (blocks: readonly { type: string; text?: string; items?: string[] }[] | undefined) =>
  (blocks ?? []).map((b) => b.text ?? b.items?.join(' ') ?? '').join(' ')

describe('schema validity', () => {
  it.each([
    ['categoryPages', d.categoryPages, categoryPageSchema],
    ['subgroups', d.subgroups, subgroupSchema],
    ['events', d.events, eventSchema],
    ['serviceOffers', d.serviceOffers, serviceOfferSchema],
    ['products', d.products, productSchema],
    ['posts', d.posts, postSchema],
    ['team', d.team, teamMemberSchema],
    ['testimonials', d.testimonials, testimonialSchema],
    ['richPages', d.richPages, richPageSchema],
  ] as const)('%s match the schema', (_name, records, schema) => {
    for (const record of records) {
      const result = schema.safeParse(record)
      expect(result.success, JSON.stringify(result.error?.issues.slice(0, 3))).toBe(true)
    }
  })

  it('home content matches the schema', () => {
    expect(homeContentSchema.safeParse(d.home).success).toBe(true)
  })
})

describe('identity and addresses', () => {
  it('has unique ids', () => {
    expect(unique(d.events.map((e) => e.id))).toBe(true)
    expect(unique(d.posts.map((p) => p.id))).toBe(true)
    expect(unique(d.products.map((p) => p.id))).toBe(true)
    expect(unique(d.subgroups.map((s) => s.id))).toBe(true)
    for (const event of d.events) expect(unique(event.options.map((o) => o.id)), event.id).toBe(true)
  })

  it('has unique slugs per language (per category for events)', () => {
    for (const locale of LOCALES) {
      for (const category of ['diving', 'seaKayak', 'outdoor'] as const) {
        expect(unique(d.events.filter((e) => e.category === category).map((e) => e.slug[locale])), `${category}/${locale}`).toBe(true)
      }
      expect(unique(d.posts.map((p) => p.slug[locale]))).toBe(true)
      expect(unique(d.products.map((p) => p.slug[locale]))).toBe(true)
    }
  })

  it('puts every event in an existing subgroup of the same category', () => {
    for (const event of d.events) {
      const group = d.subgroups.find((s) => s.id === event.subgroup)
      expect(group?.category, event.id).toBe(event.category)
    }
  })
})

describe('references', () => {
  it('only references images that exist in the media catalog', () => {
    const refs = [
      ...d.events.flatMap((e) => [e.cover, ...e.gallery]),
      ...d.categoryPages.map((c) => c.cover),
      ...d.serviceOffers.map((s) => s.cover),
      ...d.products.flatMap((p) => [p.cover, ...p.gallery]),
      ...d.posts.flatMap((p) => (p.cover ? [p.cover] : [])),
      ...d.team.flatMap((t) => (t.photo ? [t.photo] : [])),
      ...d.richPages.flatMap((r) => (r.cover ? [r.cover] : [])),
      ...d.home.hero.tiles.map((t) => t.media),
      ...d.home.quickLinks.map((q) => q.media),
    ]
    expect(refs.filter((id) => !mediaIds.has(id))).toEqual([])
  })

  it('features and related links point at visible records', () => {
    for (const ref of d.home.featured) {
      const target = ref.kind === 'event' ? published.find((e) => e.id === ref.id) : d.posts.find((p) => p.id === ref.id && p.status === 'published')
      expect(target, `${ref.kind}:${ref.id}`).toBeDefined()
    }
    for (const post of d.posts) for (const id of post.relatedEvents) expect(published.some((e) => e.id === id), `${post.id} → ${id}`).toBe(true)
  })

  it('has all five category pages and all fixed content pages', () => {
    expect(d.categoryPages.map((c) => c.key).toSorted()).toEqual(['diving', 'outdoor', 'seaKayak', 'shop', 'transport'])
    expect(d.richPages.map((r) => r.key).toSorted()).toEqual(['about', 'contact', 'diveSites', 'lifeguard', 'privacy', 'terms'])
    expect(d.richPages.find((r) => r.key === 'privacy')?.notice).toBe('placeholder-legal')
    expect(d.richPages.find((r) => r.key === 'terms')?.notice).toBe('placeholder-legal')
    expect(d.richPages.find((r) => r.key === 'lifeguard')?.notice).toBe('provisional-scope')
  })
})

describe('business rules (guide §6, handover 31 Oct)', () => {
  it('has exactly the agreed sea kayak inventory', () => {
    expect(d.events.filter((e) => e.category === 'seaKayak').map((e) => e.id).toSorted()).toEqual(
      [
        'isik-kiyisi',
        'karia-kiyisi',
        'kekova-bati',
        'kekova-dogu',
        'kekova-kayak-gulet',
        'kekova-klasik',
        'kekova-korfezi',
        'likya-kayak-konfor',
        'trak-signature',
      ].toSorted(),
    )
  })

  it('assigns health forms only to diving and outdoor events', () => {
    for (const event of d.events) {
      const expected = event.category === 'seaKayak' ? null : event.category === 'diving' ? 'diving' : 'outdoor'
      expect(event.healthForm, event.id).toBe(expected)
    }
  })

  it('shows Kekova Klasik with meal 60 € / no meal 45 € per person', () => {
    const klasik = d.events.find((e) => e.id === 'kekova-klasik')
    expect(klasik?.options.map((o) => [o.price, o.currency, o.basis]).toSorted()).toEqual([
      [45, 'EUR', 'person'],
      [60, 'EUR', 'person'],
    ])
    expect(klasik && cardPrice(klasik)).toMatchObject({ kind: 'from', amount: 45 })
  })

  it('represents every price display case', () => {
    expect(published.some((e) => e.priceDisplay === 'on_request')).toBe(true)
    expect(published.some((e) => e.priceDisplay === 'numeric' && e.options.length === 1 && e.options[0]?.price !== null)).toBe(true)
    expect(published.some((e) => e.options.some((o) => o.price === null))).toBe(true)
    expect(published.some((e) => e.options.length === 0)).toBe(true)
  })

  it('has multi-day itineraries and an event with no optional sections', () => {
    expect(published.filter((e) => e.itinerary.length >= 2).length).toBeGreaterThanOrEqual(2)
    expect(published.some((e) => e.faq.length === 0 && e.itinerary.length === 0 && !e.includes && !e.meetingPoint)).toBe(true)
    expect(published.filter((e) => e.faq.length > 0).length).toBeGreaterThanOrEqual(5)
  })

  it('keeps one archived event to prove it is hidden', () => {
    expect(d.events.some((e) => e.status === 'archived')).toBe(true)
  })

  it('includes a very long and a very short text for layout checks', () => {
    expect(published.some((e) => textOf(e.body.de).length > 2500)).toBe(true)
    expect(published.some((e) => e.summary.tr.length < 60)).toBe(true)
  })

  it('has the representative amounts of other content', () => {
    expect(d.products).toHaveLength(4)
    expect(d.posts.length).toBeGreaterThanOrEqual(6)
    expect(d.posts.some((p) => /hello-world/.test(p.slug.en))).toBe(false)
    expect(d.team.length).toBeGreaterThanOrEqual(3)
    expect(d.team.every((t) => t.origin === 'mockup')).toBe(true)
    expect(d.testimonials.length).toBeGreaterThanOrEqual(3)
    expect(d.serviceOffers.filter((s) => s.kind === 'transfer').length).toBeGreaterThanOrEqual(2)
    expect(d.serviceOffers.filter((s) => s.kind === 'lodging').length).toBeGreaterThanOrEqual(2)
  })
})

describe('languages and safety', () => {
  it('has every text in all four languages (no silent fallback)', () => {
    const { media: _media, ...content } = d
    expect(missingTranslations(content)).toEqual([])
  })

  it('never marks German as coming from the old site (it had no German)', () => {
    const records = [...d.events, ...d.posts, ...d.products, ...d.richPages, ...d.categoryPages, ...d.serviceOffers]
    expect(records.filter((r) => r.translationOrigin.de === 'cloner').map((r) => ('id' in r ? r.id : r.key))).toEqual([])
  })

  it('contains no HTML and no personal email addresses', () => {
    const strings = allStrings(d)
    expect(strings.filter((s) => /<[a-z!/][^>]*>/i.test(s))).toEqual([])
    const emails = strings.flatMap((s) => s.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [])
    expect(emails.filter((e) => e !== 'info@dragoman-turkey.com')).toEqual([])
  })
})

describe('search titles and descriptions (seo-geo-plan §3)', () => {
  // PageHead renders "<seo title> | Dragoman"; SEO-09 makes 60/160 a target, so the bounds carry a tolerance.
  const suffix = ` | ${siteConfig.siteName}`
  const TITLE = { min: 45, max: 65 }
  const DESCRIPTION = { min: 120, max: 165 }
  const withSeo: [string, { seo?: SeoFields }][] = [
    ['home', d.home],
    ...[...d.events, ...d.products, ...d.posts].map((r): [string, { seo?: SeoFields }] => [r.id, r]),
    ...[...d.richPages, ...d.categoryPages].map((r): [string, { seo?: SeoFields }] => [r.key, r]),
  ]

  it('fills title and description in all four languages, within tolerance', () => {
    const problems = withSeo.flatMap(([name, { seo }]) =>
      seo
        ? LOCALES.flatMap((locale) => {
            const title = seo.title?.[locale]
            const description = seo.description?.[locale]
            const issues: string[] = []
            if (!title) issues.push(`${name}.${locale}: no title`)
            else if (title.length + suffix.length < TITLE.min || title.length + suffix.length > TITLE.max) issues.push(`${name}.${locale}: title ${title.length + suffix.length}`)
            if (!description) issues.push(`${name}.${locale}: no description`)
            else if (description.length < DESCRIPTION.min || description.length > DESCRIPTION.max) issues.push(`${name}.${locale}: description ${description.length}`)
            return issues
          })
        : [],
    )
    expect(problems).toEqual([])
  })

  it('never repeats the site name the head already appends', () => {
    const doubled = withSeo.flatMap(([name, { seo }]) => LOCALES.filter((l) => seo?.title?.[l]?.endsWith(suffix.trim())).map((l) => `${name}.${l}`))
    expect(doubled).toEqual([])
  })

  it('points share-image overrides at real, non-placeholder photos', () => {
    const images = withSeo.flatMap(([name, { seo }]) => (seo?.ogImage ? [[name, seo.ogImage] as const] : []))
    expect(images.filter(([, id]) => !d.media.some((m) => m.id === id && !m.placeholder))).toEqual([])
  })
})