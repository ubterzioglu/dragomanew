import { canonicalJson } from '../../shared/content/release.ts'
import { markManualEdits, slugify, type TranslationMeta } from '../../shared/content/translation.ts'
import {
  CORE_FIELDS,
  CUSTOM_LIMITS,
  type CoreKey,
  type CustomFieldType,
  type CustomFormField,
  type FormDefinition,
  type FormField,
  type FormLabel,
} from '../../shared/requests/forms.ts'
import type { RequestKind } from '../../shared/requests/payload.ts'

/**
 * Pure editing logic for /panel/formlar (dalga2-sozlesme §8). Every function returns a new
 * definition; validateDefinition (shared) stays the gate before saving and publish-content checks
 * again on the server.
 */

export const FORM_KINDS: readonly RequestKind[] = ['event', 'transport', 'lodging', 'contact']
export const FORM_LOCALES = ['tr', 'en', 'fr', 'de'] as const
export type FormLocale = (typeof FORM_LOCALES)[number]

/** The site's Turkish labels, shown wherever a core field has no label of its own. */
export const CORE_LABELS_TR: Readonly<Record<CoreKey, string>> = {
  preferredDate: 'Tercih ettiğiniz tarih',
  partySize: 'Kişi sayısı',
  distribution: 'Seçeneklere göre kişi sayısı',
  fullName: 'Ad soyad',
  email: 'E-posta',
  phone: 'Telefon',
  message: 'Mesajınız',
  tripType: 'Yolculuk türü',
  from: 'Nereden',
  to: 'Nereye',
  dateTime: 'Tarih ve saat',
  childSeat: 'Çocuk koltuğu istiyorum',
  note: 'Mesajınız',
  checkIn: 'Giriş tarihi',
  checkOut: 'Çıkış tarihi',
  adults: 'Yetişkin sayısı',
  children: 'Çocuk sayısı',
  rooms: 'Oda sayısı',
  preferences: 'Konaklama tercihiniz (oda tipi vb.)',
  subject: 'Konu',
}

export const CUSTOM_TYPE_LABELS: Readonly<Record<CustomFieldType, string>> = {
  text: 'Kısa metin',
  textarea: 'Uzun metin',
  number: 'Sayı',
  select: 'Seçim listesi',
  checkbox: 'Onay kutusu',
  date: 'Tarih',
}

interface StaffLike {
  role: string
  active?: boolean
  extra_permissions?: readonly string[]
}

/** forms.manage: main_admin, or anyone given it as an extra permission. The database decides regardless. */
export function canManageForms(staff: StaffLike | null | undefined): boolean {
  if (!staff || staff.active === false) return false
  return staff.role === 'main_admin' || (staff.extra_permissions ?? []).includes('forms.manage')
}

/** The Turkish label a field shows: its own, else the site's built-in one. */
export function fieldTitle(field: FormField): string {
  return field.label?.tr ?? (field.kind === 'core' ? CORE_LABELS_TR[field.key] : field.key)
}

function coreSpec(kind: RequestKind, key: string) {
  return CORE_FIELDS[kind].find((spec) => spec.key === key)
}

/** Fixed fields only move and get new labels; free ones and custom ones can be hidden. */
export function canHide(kind: RequestKind, field: FormField): boolean {
  return field.kind === 'custom' || coreSpec(kind, field.key)?.mode === 'free'
}

/** A checkbox is always answered, so the child seat has no "required" to toggle. */
export function canRequire(kind: RequestKind, field: FormField): boolean {
  if (field.kind === 'custom') return true
  return coreSpec(kind, field.key)?.mode === 'free' && field.key !== 'childSeat'
}

/** Whether the field is required under the definition (built-in default for core fields). */
export function isRequired(kind: RequestKind, field: FormField): boolean {
  if (field.kind === 'custom') return field.required
  const spec = coreSpec(kind, field.key)
  return spec?.mode === 'fixed' ? true : (field.required ?? spec?.required ?? false)
}

const replaceAt = (definition: FormDefinition, index: number, field: FormField): FormDefinition => ({
  ...definition,
  fields: definition.fields.map((current, at) => (at === index ? field : current)),
})

const indexOf = (definition: FormDefinition, key: string): number => definition.fields.findIndex((field) => field.key === key)

/** Moves a field one place up (-1) or down (+1); at the edge nothing changes. */
export function moveField(definition: FormDefinition, key: string, delta: -1 | 1): FormDefinition {
  const from = indexOf(definition, key)
  const to = from + delta
  if (from < 0 || to < 0 || to >= definition.fields.length) return definition
  const fields = [...definition.fields]
  const [moved] = fields.splice(from, 1)
  if (!moved) return definition
  fields.splice(to, 0, moved)
  return { ...definition, fields }
}

/** Hides or shows a field; unset rather than false, so an untouched core field stays as the default. */
export function setHidden(kind: RequestKind, definition: FormDefinition, key: string, hidden: boolean): FormDefinition {
  const index = indexOf(definition, key)
  const field = definition.fields[index]
  if (!field || !canHide(kind, field)) return definition
  const { hidden: _old, ...rest } = field
  return replaceAt(definition, index, (hidden ? { ...rest, hidden: true } : rest) as FormField)
}

export function setRequired(kind: RequestKind, definition: FormDefinition, key: string, required: boolean): FormDefinition {
  const index = indexOf(definition, key)
  const field = definition.fields[index]
  if (!field || !canRequire(kind, field)) return definition
  if (field.kind === 'custom') return replaceAt(definition, index, { ...field, required })
  const { required: _old, ...rest } = field
  const builtIn = coreSpec(kind, field.key)?.required ?? false
  return replaceAt(definition, index, required === builtIn ? rest : { ...rest, required })
}

function withText(current: FormLabel | undefined, locale: FormLocale, text: string): FormLabel | undefined {
  const value = text.trim() === '' && locale !== 'tr' ? undefined : text
  const next: Record<string, string | undefined> = { ...current, [locale]: value }
  for (const [code, inner] of Object.entries(next)) if (inner === undefined) delete next[code]
  if (next.tr === undefined || next.tr.trim() === '') return undefined
  return next as FormLabel
}

/**
 * Sets one language of a field's label or help. An empty Turkish text removes a core field's own
 * label (the site's built-in one shows again); a custom field keeps an empty one for validation.
 */
export function setText(definition: FormDefinition, key: string, part: 'label' | 'help', locale: FormLocale, text: string): FormDefinition {
  const index = indexOf(definition, key)
  const field = definition.fields[index]
  if (!field) return definition
  const value = withText(field[part], locale, text)
  if (field.kind === 'custom' && part === 'label') {
    return replaceAt(definition, index, { ...field, label: value ?? { ...field.label, tr: locale === 'tr' ? text : field.label.tr } })
  }
  const { [part]: _old, ...rest } = field
  return replaceAt(definition, index, (value ? { ...rest, [part]: value } : rest) as FormField)
}

/** `c_` plus the Turkish label as a slug, made unique against the keys already used. */
export function customKeyFor(label: string, taken: readonly string[]): `c_${string}` {
  const base = slugify(label).replaceAll('-', '_').slice(0, 30).replace(/_+$/, '') || 'alan'
  let key: `c_${string}` = `c_${base}`
  for (let n = 2; taken.includes(key); n += 1) key = `c_${base}_${n}`
  return key
}

export interface NewCustomField {
  type: CustomFieldType
  label: string
  required: boolean
  /** One option label per line, for select fields. */
  options?: readonly string[]
  min?: number
  max?: number
}

export function customCount(definition: FormDefinition): number {
  return definition.fields.filter((field) => field.kind === 'custom').length
}

/** Appends a custom field; null once the form has its ten. */
export function addCustomField(definition: FormDefinition, input: NewCustomField): FormDefinition | null {
  if (customCount(definition) >= CUSTOM_LIMITS.fields) return null
  const key = customKeyFor(input.label, definition.fields.map((field) => field.key))
  const optionLabels = (input.options ?? []).map((option) => option.trim()).filter(Boolean)
  const optionValues: string[] = []
  const options = optionLabels.map((text) => {
    const base = slugify(text) || 'secenek'
    let value = base
    for (let n = 2; optionValues.includes(value); n += 1) value = `${base}-${n}`
    optionValues.push(value)
    return { value, label: { tr: text } }
  })
  const field: CustomFormField = {
    kind: 'custom',
    key,
    type: input.type,
    required: input.required,
    label: { tr: input.label.trim() },
    ...(input.type === 'select' ? { options } : {}),
    ...(input.type === 'number' && input.min !== undefined ? { min: input.min } : {}),
    ...(input.type === 'number' && input.max !== undefined ? { max: input.max } : {}),
  }
  return { ...definition, fields: [...definition.fields, field] }
}

/** A custom field never published can be removed; a published one can only be hidden. */
export function removeCustomField(definition: FormDefinition, key: string, published: FormDefinition | null): FormDefinition {
  const field = definition.fields.find((candidate) => candidate.key === key)
  if (!field || field.kind !== 'custom') return definition
  if (published?.fields.some((old) => old.key === key)) return definition
  return { ...definition, fields: definition.fields.filter((candidate) => candidate.key !== key) }
}

export function isPublishedKey(key: string, published: FormDefinition | null): boolean {
  return published?.fields.some((field) => field.key === key) ?? false
}

/** The draft differs from the latest published version; a form never published always counts as changed. */
export function hasUnpublishedChanges(draft: FormDefinition, published: FormDefinition | null): boolean {
  return published === null || canonicalJson(draft) !== canonicalJson(published)
}

/**
 * Translation marks are keyed by JSON Pointer (`/fields/3/label`), so moving or removing a field
 * would hand its marks to another one. This rewrites the field index of every mark by field key.
 */
export function remapMeta(meta: TranslationMeta, before: FormDefinition, after: FormDefinition): TranslationMeta {
  const next: Record<string, TranslationMeta[string]> = {}
  for (const [path, marks] of Object.entries(meta)) {
    const match = /^\/fields\/(\d+)(\/.*)$/.exec(path)
    if (!match) {
      next[path] = marks
      continue
    }
    const key = before.fields[Number(match[1])]?.key
    const index = key === undefined ? -1 : indexOf(after, key)
    if (index >= 0) next[`/fields/${index}${match[2]}`] = marks
  }
  return next
}

/**
 * The meta to save with `draft`: marks follow their fields, and every translation a person changed
 * since `saved` becomes `manual` (markManualEdits), compared field by field rather than by position.
 */
export function metaForSave(saved: FormDefinition, savedMeta: TranslationMeta, draft: FormDefinition, at: string): TranslationMeta {
  const aligned = { ...saved, fields: draft.fields.map((field) => saved.fields.find((old) => old.key === field.key) ?? null) }
  return markManualEdits(aligned, draft, remapMeta(savedMeta, saved, draft), at)
}

export interface CustomAnswer {
  key: string
  label: string
  value: string
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null

/**
 * A request's custom answers with the Turkish labels of the version it was sent with. Answers the
 * definition does not know (should not happen) are listed by key, so nothing stored stays unseen.
 */
export function customAnswers(payload: unknown, definition: FormDefinition | null): CustomAnswer[] {
  const answers = asRecord(asRecord(payload)?.custom)
  if (!answers) return []
  const format = (field: CustomFormField | undefined, value: unknown): string => {
    if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır'
    const option = field?.type === 'select' ? field.options?.find((candidate) => candidate.value === value) : undefined
    if (option) return option.label.tr
    return typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value)
  }
  const known = (definition?.fields ?? []).filter((field): field is CustomFormField => field.kind === 'custom')
  const listed = known
    .filter((field) => answers[field.key] !== undefined && answers[field.key] !== null && answers[field.key] !== '')
    .map((field) => ({ key: field.key, label: field.label.tr, value: format(field, answers[field.key]) }))
  const unknown = Object.entries(answers)
    .filter(([key, value]) => !known.some((field) => field.key === key) && value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ({ key, label: key, value: format(undefined, value) }))
  return [...listed, ...unknown]
}
