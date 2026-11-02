import { describe, expect, it } from 'vitest'
import {
  bannerLevel,
  estimateTranslation,
  needsTranslationUpdate,
  parseMeta,
  sourceChars,
  statesByPointer,
  summarize,
  usageLevel,
} from '../src/lib/content/translationView'
import { hashSource, markManualEdits, type TranslationMeta } from '../src/shared/content/translation.ts'

const AT = '2026-11-02T10:00:00.000Z'

const doc = {
  title: { tr: 'Gece dalışı', en: 'Night dive', fr: 'Plongée de nuit' },
  summary: { tr: 'Fenerlerle', en: 'With torches' },
  body: { tr: [{ type: 'p', text: 'Merhaba' }, { type: 'ul', items: ['bir', 'iki'] }] },
}

const meta: TranslationMeta = {
  '/title': {
    en: { hash: hashSource('Gece dalışı'), origin: 'deepl', at: AT },
    fr: { hash: hashSource('Gece dalışı'), origin: 'manual', at: AT },
  },
  '/summary': { en: { hash: hashSource('eski metin'), origin: 'deepl', at: AT } },
}

describe('manual-edit marking on save (editor uses markManualEdits)', () => {
  it('marks a changed translation as manual with the current Turkish hash', () => {
    const after = { ...doc, title: { ...doc.title, en: 'Night diving' } }
    const next = markManualEdits(doc, after, meta, AT)
    expect(next['/title']?.en).toEqual({ hash: hashSource('Gece dalışı'), origin: 'manual', at: AT })
    expect(next['/title']?.fr).toEqual(meta['/title']?.fr)
  })

  it('leaves translations alone when only Turkish changes, so they turn stale', () => {
    const after = { ...doc, title: { ...doc.title, tr: 'Gece dalışı (2 saat)' } }
    const next = markManualEdits(doc, after, meta, AT)
    expect(next).toEqual(meta)
    const states = statesByPointer(after, next).get('/title')
    expect(states).toEqual({ en: 'stale', fr: 'stale', de: 'missing' })
    expect(needsTranslationUpdate(after, next)).toBe(true)
  })

  it('drops the mark of a cleared translation', () => {
    const after = { ...doc, title: { tr: doc.title.tr, en: doc.title.en } }
    expect(markManualEdits(doc, after, meta, AT)['/title']).not.toHaveProperty('fr')
  })
})

describe('translation view', () => {
  it('summarizes states per language', () => {
    expect(summarize(doc, meta)).toEqual({
      en: { missing: 1, stale: 1, manual: 0 },
      fr: { missing: 2, stale: 0, manual: 1 },
      de: { missing: 3, stale: 0, manual: 0 },
    })
  })

  it('reads translation_meta defensively', () => {
    expect(parseMeta(null)).toEqual({})
    expect(parseMeta({ '/title': { en: { hash: 'h', origin: 'deepl', at: AT }, fr: { hash: 1 }, xx: {} }, '/bad': 3 })).toEqual({
      '/title': { en: { hash: 'h', origin: 'deepl', at: AT } },
    })
  })

  it('counts characters the way DeepL bills them (code points of every string sent)', () => {
    expect(sourceChars('Kaş')).toBe(3)
    expect(sourceChars(['ab', 'çğ'])).toBe(4)
    expect(sourceChars([{ type: 'p', text: 'Merhaba' }, { type: 'ul', items: ['bir', 'iki'] }])).toBe(13)
  })

  it('estimates a run and counts the manual fixes it would skip', () => {
    const missingDe = estimateTranslation(doc, meta, ['de'], 'missing', false)
    expect(missingDe).toEqual({ count: 3, chars: 11 + 10 + 13, manualCount: 0 })
    const allFr = estimateTranslation(doc, meta, ['fr'], 'all', false)
    expect(allFr.manualCount).toBe(1)
    expect(allFr.count).toBe(2)
    expect(estimateTranslation(doc, meta, ['fr'], 'all', true).count).toBe(3)
    expect(estimateTranslation(doc, meta, ['en'], 'stale', false)).toEqual({ count: 1, chars: 10, manualCount: 0 })
  })
})

describe('DeepL quota levels', () => {
  it('warns at 80 % and alerts at 100 %', () => {
    expect(usageLevel(79_999, 100_000)).toBe('ok')
    expect(usageLevel(80_000, 100_000)).toBe('warn')
    expect(usageLevel(100_000, 100_000)).toBe('critical')
    expect(usageLevel(0, 0)).toBe('critical')
  })

  it('takes the stricter of the server level and the numbers', () => {
    expect(bannerLevel({ count: 10, limit: 100, level: 'critical' })).toBe('critical')
    expect(bannerLevel({ count: 95, limit: 100, level: 'ok' })).toBe('warn')
  })
})
