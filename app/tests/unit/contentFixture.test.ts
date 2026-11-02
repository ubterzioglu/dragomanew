import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import type { SeoFields } from '../../src/content/schema'
import { cardPrice } from '../../src/lib/price'
import { LOCALES } from '../../src/i18n/locales'
import { siteConfig } from '../../src/lib/siteConfig'

/**
 * Acceptance test for the Stage A sample content (plan Batch 3): facts about the fixture in
 * src/content/data, not rules for any published release. The rules every content set must keep
 * (schemas, unique ids and slugs, references, pages, no HTML or personal email) are
 * validateContent's job (tests/unit/content.test.ts, contentValidate.test.ts).
 */
const d = contentData
const published = d.events.filter((e) => e.status === 'published')

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

const textOf = (blocks: readonly { type: string; text?: string; items?: string[] }[] | undefined) =>
  (blocks ?? []).map((b) => b.text ?? b.items?.join(' ') ?? '').join(' ')

describe('fixed pages', () => {
  it('marks the legal placeholders and the provisional lifeguard scope', () => {
    expect(d.richPages.find((r) => r.key === 'privacy')?.notice).toBe('placeholder-legal')
    expect(d.richPages.find((r) => r.key === 'terms')?.notice).toBe('placeholder-legal')
    expect(d.richPages.find((r) => r.key === 'lifeguard')?.notice).toBe('provisional-scope')
  })

  it('starts every form at version 0 with the built-in definition', () => {
    expect(Object.values(d.forms).map((form) => form.version)).toEqual([0, 0, 0, 0])
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

describe('languages', () => {
  it('has every text in all four languages (no silent fallback)', () => {
    const { media: _media, ...content } = d
    expect(missingTranslations(content)).toEqual([])
  })

  it('never marks German as coming from the old site (it had no German)', () => {
    const records = [...d.events, ...d.posts, ...d.products, ...d.richPages, ...d.categoryPages, ...d.serviceOffers]
    expect(records.filter((r) => r.translationOrigin.de === 'cloner').map((r) => ('id' in r ? r.id : r.key))).toEqual([])
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
})
