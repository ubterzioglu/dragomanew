import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import { getIn, pointer, setIn } from '../src/lib/content/docPath'
import { draftIssues, draftTitle, emptyDraft, labelForPath, normalizeDraft, withNewKey } from '../src/lib/content/draft'
import { EDITABLE_TYPES, TYPE_CONFIG, type FieldConfig } from '../src/lib/content/editorConfig'

const TODAY = '2026-11-02'

/** A complete, valid event as the seed would store it. */
const event = () => ({
  ...emptyDraft('event', 'Kaş’ta Gece Dalışı', TODAY),
  subgroup: 'tekne-dalisi',
  summary: { tr: 'Fenerlerle gece dalışı.' },
  body: { tr: [{ type: 'p', text: 'Gün batımından sonra başlar.' }] },
  cover: 'kas-gece',
})

describe('editorConfig', () => {
  const shapeKeys = (schema: z.ZodType): string[] => Object.keys((schema as unknown as { shape: Record<string, unknown> }).shape)

  it('only shows fields that exist on the type’s zod schema', () => {
    for (const type of EDITABLE_TYPES) {
      const keys = shapeKeys(TYPE_CONFIG[type].schema)
      for (const field of TYPE_CONFIG[type].fields) expect(keys, `${type}.${field.key}`).toContain(field.key)
    }
  })

  it('gives every list of objects a way to add rows unless the schema fixes the count', () => {
    const walk = (fields: readonly FieldConfig[]): FieldConfig[] => fields.flatMap((field) => [field, ...walk(field.fields ?? [])])
    for (const type of EDITABLE_TYPES) {
      for (const field of walk(TYPE_CONFIG[type].fields).filter((item) => item.kind === 'items')) {
        expect(field.fixedLength === true || typeof field.newItem === 'function', `${type}.${field.key}`).toBe(true)
      }
    }
  })
})

describe('emptyDraft and the new key', () => {
  it('derives the key from the Turkish title and copies it to every slug', () => {
    const doc = emptyDraft('event', 'Kaş’ta Gece Dalışı', TODAY)
    expect(doc.id).toBe('kasta-gece-dalisi')
    expect(doc.slug).toEqual({ tr: 'kasta-gece-dalisi', en: 'kasta-gece-dalisi', fr: 'kasta-gece-dalisi', de: 'kasta-gece-dalisi' })
    expect(doc.origin).toBe('panel')
  })

  it('follows a changed title while unsaved', () => {
    const doc = withNewKey(emptyDraft('product', 'Eski', TODAY), 'Likya Yolu Rehberi')
    expect(doc.id).toBe('likya-yolu-rehberi')
    expect(doc.slug).toEqual({ tr: 'likya-yolu-rehberi', en: 'likya-yolu-rehberi', fr: 'likya-yolu-rehberi', de: 'likya-yolu-rehberi' })
    expect(withNewKey(emptyDraft('subgroup', 'A', TODAY), 'Tekne Dalışı')).not.toHaveProperty('slug')
  })

  it('refuses the fixed page sets', () => {
    expect(() => emptyDraft('home', 'x', TODAY)).toThrow()
  })

  it('starts every creatable type with only the fields a person must fill as issues', () => {
    expect(draftIssues('subgroup', emptyDraft('subgroup', 'Tekne Dalışı', TODAY))).toEqual([])
    const paths = draftIssues('event', emptyDraft('event', 'Gece', TODAY)).map((issue) => issue.path)
    expect(paths).toEqual(expect.arrayContaining(['/subgroup', '/summary/tr', '/body/tr', '/cover']))
  })
})

describe('draftIssues', () => {
  it('passes a complete event', () => {
    expect(draftIssues('event', event())).toEqual([])
  })

  it('names an empty Turkish title in the editor’s words', () => {
    const issues = draftIssues('event', setIn(event(), ['title', 'tr'], ''))
    expect(issues).toEqual([{ path: '/title/tr', label: 'Başlık › TR', message: 'Boş bırakılamaz.' }])
  })

  it('labels nested rows by their position', () => {
    const doc = setIn(event(), ['options'], [{ id: 'Tek Dalış', name: { tr: 'Tek dalış' }, price: 40, currency: 'EUR', basis: 'person' }])
    const [issue] = draftIssues('event', doc)
    expect(issue).toMatchObject({ path: '/options/0/id', label: 'Seçenekler ve fiyatlar › 1. Seçenek › Kısa ad (ör. tek-dalis)' })
    expect(issue?.message).toMatch(/küçük harf/)
  })

  it('enforces the SEO limits (title ≤120, description ≤320)', () => {
    const doc = setIn(event(), ['seo'], { title: { tr: 'x'.repeat(121) }, description: { tr: 'y'.repeat(321) } })
    const issues = draftIssues('event', doc)
    expect(issues.map((issue) => [issue.path, issue.message])).toEqual([
      ['/seo/title/tr', 'En fazla 120 karakter olabilir.'],
      ['/seo/description/tr', 'En fazla 320 karakter olabilir.'],
    ])
    expect(issues[0]?.label).toBe('SEO › Arama başlığı (en fazla 120 karakter) › TR')
  })

  it('reports a bad slug and a bad date', () => {
    const post = { ...emptyDraft('post', 'Yazı', TODAY), excerpt: { tr: 'Kısa' }, body: { tr: [{ type: 'p', text: 'Metin' }] } }
    expect(draftIssues('post', post)).toEqual([])
    const issues = draftIssues('post', setIn(setIn(post, ['slug', 'en'], 'Bad Slug'), ['date'], '02.11.2026'))
    expect(issues.map((issue) => issue.path)).toEqual(['/slug/en', '/date'])
    expect(issues[0]?.label).toBe('Adres (kısa ad) › EN')
    expect(issues[1]?.message).toBe('Tarih YYYY-AA-GG biçiminde olmalı.')
  })

  it('asks for exactly three home tiles', () => {
    const issues = draftIssues('home', { hero: { heading: { tr: 'a' }, subheading: { tr: 'b' }, tiles: [] } })
    expect(issues.find((issue) => issue.path === '/hero/tiles')?.message).toBe('Tam 3 öğe olmalı.')
  })
})

describe('normalizeDraft', () => {
  it('drops empty optional values and empty translations, never the Turkish of a required field', () => {
    const doc = {
      ...event(),
      title: { tr: 'Gece', en: '', fr: 'Nuit' },
      duration: { tr: '', en: '' },
      includes: { tr: ['Rehber', ' ', ''], en: [''] },
      body: { tr: [{ type: 'p', text: 'Metin' }, { type: 'p', text: '  ' }, { type: 'ul', items: ['a', ''] }], de: [] },
      seo: { title: { tr: '' }, ogImage: '' },
    }
    const out = normalizeDraft('event', doc) as Record<string, unknown>
    expect(out.title).toEqual({ tr: 'Gece', fr: 'Nuit' })
    expect(out).not.toHaveProperty('duration')
    expect(out.includes).toEqual({ tr: ['Rehber'] })
    expect(out.body).toEqual({ tr: [{ type: 'p', text: 'Metin' }, { type: 'ul', items: ['a'] }] })
    expect(out).not.toHaveProperty('seo')
    expect(normalizeDraft('event', { ...event(), title: { tr: '' } })).toMatchObject({ title: { tr: '' } })
  })

  it('turns an empty nullable select into null and keeps what the editor does not show', () => {
    const out = normalizeDraft('event', { ...event(), healthForm: '', sourceRefs: ['x'] }) as Record<string, unknown>
    expect(out.healthForm).toBeNull()
    expect(out.sourceRefs).toEqual(['x'])
  })

  it('cleans rows inside lists', () => {
    const out = normalizeDraft('event', {
      ...event(),
      options: [{ id: 'tek', name: { tr: 'Tek' }, description: { tr: '' }, price: null, currency: 'EUR', basis: 'person' }],
    }) as { options: Record<string, unknown>[] }
    expect(out.options[0]).not.toHaveProperty('description')
  })

  it('never mutates its input', () => {
    const doc = { ...event(), duration: { tr: '' } }
    const copy = structuredClone(doc)
    normalizeDraft('event', doc)
    expect(doc).toEqual(copy)
  })
})

describe('labels and titles', () => {
  it('falls back to the raw key for unknown paths', () => {
    expect(labelForPath('event', ['status'])).toBe('status')
    expect(labelForPath('event', [])).toBe('Kayıt')
  })

  it('reads the list title per type', () => {
    expect(draftTitle('event', event())).toBe('Kaş’ta Gece Dalışı')
    expect(draftTitle('team_member', { name: 'Ayşe' })).toBe('Ayşe')
    expect(draftTitle('home', { hero: { heading: { tr: 'Kaş' } } })).toBe('Kaş')
  })
})

describe('docPath', () => {
  it('reads and writes immutably', () => {
    const doc = { faq: [{ answer: { tr: 'a' } }] }
    const next = setIn(doc, ['faq', 0, 'answer', 'en'], 'b')
    expect(getIn(next, ['faq', 0, 'answer'])).toEqual({ tr: 'a', en: 'b' })
    expect(doc.faq[0]?.answer).toEqual({ tr: 'a' })
    expect(setIn({ a: 1, b: 2 }, ['a'], undefined)).toEqual({ b: 2 })
    expect(pointer(['faq', 0, 'answer'])).toBe('/faq/0/answer')
  })
})
