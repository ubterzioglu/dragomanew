import type { z } from 'zod'
import { slugify } from '../../shared/content/translation.ts'
import { isRecord, pointer, type DocPath } from './docPath'
import { EDITOR_LOCALES, LOCALIZED_KINDS, TYPE_CONFIG, type EditableType, type FieldConfig } from './editorConfig'

/**
 * Pure draft logic for the editor: a new entry's starting document, dropping empty optional
 * values before validation, and zod issues turned into Turkish, labelled lines.
 */

const PROVENANCE = { origin: 'panel', translationOrigin: {}, sourceRefs: [] }
const slugs = (key: string) => ({ tr: key, en: key, fr: key, de: key })
const body = () => ({ tr: [{ type: 'p', text: '' }] })

/** The document a new entry starts from; `key` = slugify(TR title), copied to every slug. */
export function emptyDraft(type: EditableType, title: string, today: string): Record<string, unknown> {
  const key = slugify(title)
  const name = { tr: title }
  switch (type) {
    case 'event':
      return {
        id: key,
        category: 'diving',
        subgroup: '',
        order: 0,
        slug: slugs(key),
        title: name,
        summary: { tr: '' },
        body: body(),
        priceDisplay: 'on_request',
        options: [],
        cover: '',
        gallery: [],
        faq: [],
        itinerary: [],
        healthForm: null,
        featured: false,
        status: 'draft',
        ...PROVENANCE,
      }
    case 'subgroup':
      return { id: key, category: 'diving', order: 0, title: name }
    case 'service_offer':
      return { id: key, kind: 'transfer', order: 0, title: name, summary: { tr: '' }, cover: '', ...PROVENANCE }
    case 'product':
      return {
        id: key,
        slug: slugs(key),
        order: 0,
        title: name,
        edition: { tr: '' },
        summary: { tr: '' },
        body: body(),
        price: null,
        currency: 'EUR',
        priceVerified: false,
        cover: '',
        gallery: [],
        status: 'draft',
        ...PROVENANCE,
      }
    case 'post':
      return {
        id: key,
        slug: slugs(key),
        date: today,
        title: name,
        excerpt: { tr: '' },
        body: body(),
        relatedEvents: [],
        status: 'draft',
        ...PROVENANCE,
      }
    case 'team_member':
      return { id: key, order: 0, name: title, role: { tr: '' }, ...PROVENANCE }
    default:
      throw new Error(`${type} entries are a fixed set`)
  }
}

/** While a new entry is unsaved, its key follows the TR title into `id` and every slug. */
export function withNewKey(doc: Record<string, unknown>, title: string): Record<string, unknown> {
  const key = slugify(title)
  return { ...doc, id: key, ...('slug' in doc ? { slug: slugs(key) } : {}) }
}

const isEmptyValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

const isEmptyBlock = (block: unknown): boolean => {
  if (!isRecord(block)) return true
  if (block.type === 'ul') return !Array.isArray(block.items) || block.items.length === 0
  return typeof block.text !== 'string' || block.text.trim() === ''
}

/** One language of a localized value without empty lines and blocks. */
function cleanLocaleValue(kind: FieldConfig['kind'], value: unknown): unknown {
  if (kind === 'list' && Array.isArray(value)) return value.filter((line) => typeof line === 'string' && line.trim() !== '')
  if (kind === 'blocks' && Array.isArray(value)) {
    return value
      .map((block) =>
        isRecord(block) && block.type === 'ul' && Array.isArray(block.items)
          ? { ...block, items: block.items.filter((item) => typeof item === 'string' && item.trim() !== '') }
          : block,
      )
      .filter((block) => !isEmptyBlock(block))
  }
  return value
}

function normalizeLocalized(field: FieldConfig, value: unknown): unknown {
  if (!isRecord(value)) return field.optional ? undefined : value
  const cleaned = Object.fromEntries(
    EDITOR_LOCALES.flatMap((locale) => {
      const next = cleanLocaleValue(field.kind, value[locale])
      // TR stays even when empty so a required field reports "boş bırakılamaz".
      if (locale !== 'tr' && isEmptyValue(next)) return []
      return value[locale] === undefined ? [] : [[locale, next]]
    }),
  )
  if (field.optional && isEmptyValue(cleaned.tr) && Object.keys(cleaned).every((key) => key === 'tr')) return undefined
  return cleaned
}

function normalizeField(field: FieldConfig, value: unknown): unknown {
  if (LOCALIZED_KINDS.has(field.kind)) return normalizeLocalized(field, value)
  switch (field.kind) {
    case 'object': {
      if (!isRecord(value)) return field.optional ? undefined : value
      const next = normalizeFields(field.fields ?? [], value)
      return field.optional && Object.keys(next).length === 0 ? undefined : next
    }
    case 'items':
      return Array.isArray(value)
        ? value.map((item) => (isRecord(item) ? normalizeFields(field.fields ?? [], item) : item))
        : value
    case 'select':
      if (value === '' || value === undefined) return field.nullable ? null : field.optional ? undefined : value
      return value
    case 'media':
    case 'date':
    case 'plain':
      return field.optional && isEmptyValue(value) ? undefined : value
    default:
      return value
  }
}

/** Configured fields cleaned; anything the editor does not show (id, order, provenance) is kept. */
function normalizeFields(fields: readonly FieldConfig[], doc: Record<string, unknown>): Record<string, unknown> {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (!(field.key in acc)) return acc
    const next = normalizeField(field, acc[field.key])
    if (next === undefined) {
      const { [field.key]: _dropped, ...rest } = acc
      return rest
    }
    return { ...acc, [field.key]: next }
  }, doc)
}

export function normalizeDraft(type: EditableType, doc: unknown): unknown {
  return isRecord(doc) ? normalizeFields(TYPE_CONFIG[type].fields, doc) : doc
}

export interface DraftIssue {
  /** JSON Pointer inside the document. */
  path: string
  /** Where it is, in the editor's words ("Seçenekler › 2. Seçenek › Fiyat"). */
  label: string
  message: string
}

const LOCALE_SUFFIX: Readonly<Record<string, string>> = { tr: 'TR', en: 'EN', fr: 'FR', de: 'DE' }

/** Walks the descriptors along an issue path to name it the way the editor does. */
export function labelForPath(type: EditableType, path: DocPath): string {
  const parts: string[] = []
  let fields: readonly FieldConfig[] | undefined = TYPE_CONFIG[type].fields
  let current: FieldConfig | undefined
  for (const key of path) {
    if (typeof key === 'number') {
      parts.push(`${key + 1}. ${current?.itemLabel ?? 'öğe'}`)
      continue
    }
    const found: FieldConfig | undefined = fields?.find((field) => field.key === key)
    if (found) {
      current = found
      parts.push(found.label)
      fields = found.fields
    } else if (current && (LOCALIZED_KINDS.has(current.kind) || current.kind === 'slug') && LOCALE_SUFFIX[key]) {
      parts.push(LOCALE_SUFFIX[key] ?? key)
      fields = undefined
    } else if (!current || fields) {
      parts.push(key)
      fields = undefined
    }
  }
  return parts.join(' › ') || 'Kayıt'
}

type Issue = z.core.$ZodIssue

/** zod's English messages in Turkish, short enough for a list next to the editor. */
export function issueMessage(issue: Issue): string {
  switch (issue.code) {
    case 'invalid_type':
      return /received (undefined|null)/.test(issue.message) ? 'Zorunlu alan, doldurun.' : 'Değer türü geçersiz.'
    case 'too_small': {
      const minimum = Number(issue.minimum)
      if (issue.origin === 'string') return minimum <= 1 ? 'Boş bırakılamaz.' : `En az ${minimum} karakter olmalı.`
      if (issue.origin === 'array') return issue.exact ? `Tam ${minimum} öğe olmalı.` : minimum <= 1 ? 'En az bir öğe ekleyin.' : `En az ${minimum} öğe ekleyin.`
      return `En az ${minimum} olmalı.`
    }
    case 'too_big': {
      const maximum = Number(issue.maximum)
      if (issue.origin === 'string') return `En fazla ${maximum} karakter olabilir.`
      if (issue.origin === 'array') return issue.exact ? `Tam ${maximum} öğe olmalı.` : `En fazla ${maximum} öğe olabilir.`
      return `En fazla ${maximum} olabilir.`
    }
    case 'invalid_format':
      if (issue.format === 'date') return 'Tarih YYYY-AA-GG biçiminde olmalı.'
      return 'Yalnız küçük harf, rakam ve tire kullanın (ör. kas-dalis).'
    case 'invalid_value':
      return 'Listeden bir değer seçin.'
    default:
      return 'Geçersiz değer.'
  }
}

/** Live validation: what blocks saving a valid document and publishing it. */
export function draftIssues(type: EditableType, doc: unknown): DraftIssue[] {
  const result = TYPE_CONFIG[type].schema.safeParse(normalizeDraft(type, doc))
  if (result.success) return []
  return result.error.issues.map((issue) => {
    const path = issue.path.filter((key): key is string | number => typeof key !== 'symbol')
    return { path: pointer(path), label: labelForPath(type, path), message: issueMessage(issue) }
  })
}

/** The TR title shown in lists and dialogs. */
export function draftTitle(type: EditableType, doc: unknown): string {
  if (!isRecord(doc)) return ''
  if (type === 'home') {
    const hero = doc.hero
    return isRecord(hero) && isRecord(hero.heading) && typeof hero.heading.tr === 'string' ? hero.heading.tr : 'Ana sayfa'
  }
  const value = doc[TYPE_CONFIG[type].titleKey]
  if (typeof value === 'string') return value
  return isRecord(value) && typeof value.tr === 'string' ? value.tr : ''
}
