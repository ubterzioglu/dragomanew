import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import {
  applyTranslations,
  collectSources,
  hashSource,
  markManualEdits,
  slugify,
  translatablePaths,
  translationStatus,
  type TranslationMeta,
} from '../../src/shared/content/translation'

/** Translation bookkeeping: missing / stale / manual / ok (dalga2-sozlesme §2, §4, §11 A). */
const AT = '2026-11-02T10:00:00.000Z'
const LATER = '2026-11-03T10:00:00.000Z'

const doc = {
  id: 'kekova',
  slug: { tr: 'kekova', en: 'kekova', fr: 'kekova', de: 'kekova' },
  title: { tr: 'Kekova turu', en: 'Kekova tour' },
  body: { tr: [{ type: 'p', text: 'Batık şehir.' }], en: [{ type: 'p', text: 'Sunken city.' }], fr: [{ type: 'p', text: 'Ville engloutie.' }] },
  includes: { tr: ['Öğle yemeği', 'Rehber'] },
  faq: [{ question: { tr: 'Ne giymeli?', en: 'What to wear?', de: 'Was anziehen?' }, answer: { tr: 'Mayo.' } }],
  price: 45,
}

const seeded = (value: unknown, locales: readonly ('en' | 'fr' | 'de')[], origin: 'seed' | 'manual' = 'seed') =>
  Object.fromEntries(locales.map((locale) => [locale, { hash: hashSource(value), origin, at: AT }]))

const meta: TranslationMeta = {
  '/title': seeded(doc.title.tr, ['en']),
  '/body': seeded(doc.body.tr, ['en', 'fr']),
  '/faq/0/question': { ...seeded(doc.faq[0]?.question.tr, ['en']), ...seeded(doc.faq[0]?.question.tr, ['de'], 'manual') },
}

const stateOf = (items: ReturnType<typeof translationStatus>, path: string, locale: string) => items.find((item) => item.path === path && item.locale === locale)?.state

describe('translatablePaths', () => {
  it('finds every localized string, list and block body, never slugs', () => {
    expect(translatablePaths(doc)).toEqual(['/title', '/body', '/includes', '/faq/0/question', '/faq/0/answer'])
  })

  it('covers every localized value of the fixture', () => {
    const event = contentData.events.find((candidate) => candidate.faq.length > 0)
    expect(event && translatablePaths(event)).toEqual(expect.arrayContaining(['/title', '/summary', '/body', '/faq/0/question', '/options/0/name']))
    expect(translatablePaths(contentData.home)).toContain('/hero/tiles/0/tagline')
  })
})

describe('hashSource and slugify', () => {
  it('hashes synchronously to 14 hex digits, independent of key order', () => {
    expect(hashSource('Kekova turu')).toMatch(/^[0-9a-f]{14}$/)
    expect(hashSource('Kekova turu')).not.toBe(hashSource('Kekova Turu'))
    expect(hashSource({ a: 1, b: [2] })).toBe(hashSource({ b: [2], a: 1 }))
  })

  it('folds Turkish letters and accents into a lowercase-hyphen slug', () => {
    expect(slugify('Kaş’ta Dalış: İlk Adımlar')).toBe('kasta-dalis-ilk-adimlar')
    expect(slugify('  Çığ Ötesi — Üçağız!  ')).toBe('cig-otesi-ucagiz')
    expect(slugify('Plongée à Kaş')).toBe('plongee-a-kas')
    expect(slugify('x'.repeat(100))).toHaveLength(80)
  })
})

describe('translationStatus', () => {
  it('reports missing, ok and manual', () => {
    const items = translationStatus(doc, meta)
    expect(items).toHaveLength(15)
    expect(stateOf(items, '/title', 'en')).toBe('ok')
    expect(stateOf(items, '/title', 'fr')).toBe('missing')
    expect(stateOf(items, '/includes', 'en')).toBe('missing')
    expect(stateOf(items, '/faq/0/question', 'de')).toBe('manual')
  })

  it('marks translations stale after a Turkish edit, manual fixes included, and keeps them', () => {
    const edited = { ...doc, title: { ...doc.title, tr: 'Kekova kano turu' }, faq: [{ ...doc.faq[0]!, question: { ...doc.faq[0]!.question, tr: 'Ne giyelim?' } }] }
    const items = translationStatus(edited, meta)
    expect(stateOf(items, '/title', 'en')).toBe('stale')
    expect(stateOf(items, '/faq/0/question', 'de')).toBe('stale')
    expect(stateOf(items, '/body', 'fr')).toBe('ok')
    expect(edited.title.en).toBe('Kekova tour')
  })
})

describe('collectSources', () => {
  const edited = { ...doc, title: { ...doc.title, tr: 'Kekova kano turu' }, faq: [{ ...doc.faq[0]!, question: { ...doc.faq[0]!.question, tr: 'Ne giyelim?' } }] }

  it('collects missing values per locale with the Turkish source', () => {
    expect(collectSources(doc, meta, ['fr'], 'missing', false)).toEqual([
      { path: '/title', locale: 'fr', source: 'Kekova turu' },
      { path: '/includes', locale: 'fr', source: ['Öğle yemeği', 'Rehber'] },
      { path: '/faq/0/question', locale: 'fr', source: 'Ne giymeli?' },
      { path: '/faq/0/answer', locale: 'fr', source: 'Mayo.' },
    ])
  })

  it('skips stale manual fixes unless asked', () => {
    expect(collectSources(edited, meta, ['en', 'de'], 'stale', false)).toEqual([
      { path: '/title', locale: 'en', source: 'Kekova kano turu' },
      { path: '/faq/0/question', locale: 'en', source: 'Ne giyelim?' },
    ])
    expect(collectSources(edited, meta, ['de'], 'stale', true)).toEqual([{ path: '/faq/0/question', locale: 'de', source: 'Ne giyelim?' }])
  })

  it('takes everything in mode all, still sparing manual fixes', () => {
    expect(collectSources(doc, meta, ['de'], 'all', false).map((item) => item.path)).toEqual(['/title', '/body', '/includes', '/faq/0/answer'])
    expect(collectSources(doc, meta, ['de'], 'all', true)).toHaveLength(5)
  })
})

describe('applyTranslations', () => {
  it('writes the draft and marks DeepL with the current Turkish hash, immutably', () => {
    const before = JSON.stringify({ doc, meta })
    const result = applyTranslations(doc, meta, [
      { path: '/title', locale: 'fr', value: 'Tour de Kekova' },
      { path: '/includes', locale: 'de', value: ['Mittagessen', 'Guide'] },
      { path: '/nope', locale: 'de', value: 'ignored' },
    ], LATER)
    expect(result.doc.title).toEqual({ tr: 'Kekova turu', en: 'Kekova tour', fr: 'Tour de Kekova' })
    expect(result.doc.includes).toEqual({ tr: ['Öğle yemeği', 'Rehber'], de: ['Mittagessen', 'Guide'] })
    expect(result.meta['/title']).toEqual({ en: meta['/title']?.en, fr: { hash: hashSource('Kekova turu'), origin: 'deepl', at: LATER } })
    expect(result.doc).not.toHaveProperty('nope')
    expect(JSON.stringify({ doc, meta })).toBe(before)
    expect(stateOf(translationStatus(result.doc, result.meta), '/title', 'fr')).toBe('ok')
  })
})

describe('markManualEdits', () => {
  it('turns an edited translation into a manual fix with the current Turkish hash', () => {
    const after = { ...doc, title: { ...doc.title, tr: 'Kekova kano turu', en: 'Kekova canoe tour' } }
    const next = markManualEdits(doc, after, meta, LATER)
    expect(next['/title']?.en).toEqual({ hash: hashSource('Kekova kano turu'), origin: 'manual', at: LATER })
    expect(stateOf(translationStatus(after, next), '/title', 'en')).toBe('manual')
    expect(next['/body']).toBe(meta['/body'])
    expect(meta['/title']?.en?.origin).toBe('seed')
  })

  it('leaves untouched translations stale and drops the mark of a cleared one', () => {
    const after = { ...doc, title: { tr: 'Kekova kano turu' } }
    const next = markManualEdits(doc, after, meta, LATER)
    expect(next['/title']).toEqual({})
    const onlyTurkish = { ...doc, title: { ...doc.title, tr: 'Kekova kano turu' } }
    expect(markManualEdits(doc, onlyTurkish, meta, LATER)).toEqual(meta)
  })

  it('marks a new translation typed by hand', () => {
    const after = { ...doc, includes: { ...doc.includes, fr: ['Déjeuner', 'Guide'] } }
    expect(markManualEdits(doc, after, meta, LATER)['/includes']).toEqual({ fr: { hash: hashSource(doc.includes.tr), origin: 'manual', at: LATER } })
  })
})
