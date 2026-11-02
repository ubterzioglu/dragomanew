import { canonicalJson } from './release.ts'

/**
 * Translation bookkeeping (dalga2-sozlesme §2, §4). Turkish is the source; DeepL and people write
 * the other languages into the draft. Per localized value and language the meta keeps the hash of
 * the Turkish text it was made from, so a Turkish edit marks it stale without losing it. Every
 * function returns new objects and never mutates its input.
 */

export const TARGET_LOCALES = ['en', 'fr', 'de'] as const
export type TargetLocale = (typeof TARGET_LOCALES)[number]

export type TranslationOriginKind = 'deepl' | 'manual' | 'seed'

export interface TranslationMark {
  /** hashSource of the Turkish value the translation was made from. */
  hash: string
  origin: TranslationOriginKind
  /** ISO timestamp. */
  at: string
}

/** Keyed by JSON Pointer of the localized object (e.g. `/title`, `/faq/0/answer`). */
export type TranslationMeta = Readonly<Record<string, Partial<Record<TargetLocale, TranslationMark>>>>

export type TranslationState = 'missing' | 'stale' | 'manual' | 'ok'

export interface TranslationStatusItem {
  path: string
  locale: TargetLocale
  state: TranslationState
}

/** A Turkish value to translate: a string, a string list, or body blocks. */
export type TranslatableValue = string | readonly string[] | readonly Readonly<Record<string, unknown>>[]

export interface TranslationSource {
  path: string
  locale: TargetLocale
  source: TranslatableValue
}

export interface TranslationResult {
  path: string
  locale: TargetLocale
  value: TranslatableValue
}

const LOCALE_KEYS = new Set(['tr', 'en', 'fr', 'de'])

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

function isTranslatable(value: unknown): value is TranslatableValue {
  if (typeof value === 'string') return true
  if (!Array.isArray(value)) return false
  return value.every((item) => typeof item === 'string') || value.every((item) => isRecord(item) && typeof item.type === 'string')
}

/** `{ tr, en?, fr?, de? }` with a translatable Turkish value. */
const isLocalized = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && 'tr' in value && Object.keys(value).every((key) => LOCALE_KEYS.has(key)) && isTranslatable(value.tr)

const escape = (segment: string): string => segment.replaceAll('~', '~0').replaceAll('/', '~1')
const unescape = (segment: string): string => segment.replaceAll('~1', '/').replaceAll('~0', '~')
const segments = (path: string): string[] => (path === '' ? [] : path.slice(1).split('/').map(unescape))

function getAt(doc: unknown, path: string): unknown {
  return segments(path).reduce<unknown>((node, segment) => (node !== null && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined), doc)
}

function setAt<T>(doc: T, keys: readonly string[], value: unknown): T {
  const [head, ...rest] = keys
  if (head === undefined) return value as T
  if (Array.isArray(doc)) return doc.map((item, i) => (String(i) === head ? setAt(item, rest, value) : item)) as T
  const record = (isRecord(doc) ? doc : {}) as Record<string, unknown>
  return { ...record, [head]: setAt(record[head], rest, value) } as T
}

/** JSON Pointers of every localized value in `doc` (slugs excluded: they follow their own rules). */
export function translatablePaths(doc: unknown, path = ''): string[] {
  if (isLocalized(doc)) return [path]
  if (Array.isArray(doc)) return doc.flatMap((item, i) => translatablePaths(item, `${path}/${i}`))
  if (!isRecord(doc)) return []
  return Object.entries(doc).flatMap(([key, child]) => (key === 'slug' ? [] : translatablePaths(child, `${path}/${escape(key)}`)))
}

/** Sync 53-bit hash (cyrb53) of the canonical JSON, as 14 hex digits. */
export function hashSource(value: unknown): string {
  const input = canonicalJson(value) ?? ''
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0')
}

const TURKISH: Readonly<Record<string, string>> = { ı: 'i', İ: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g', ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c', ß: 'ss' }

/** URL slug from a title: apostrophes dropped (Kaş'ta → kasta), Turkish letters folded, accents dropped, lowercase-hyphen, ≤80 characters. */
export function slugify(text: string): string {
  return text
    .replace(/['’]/g, '')
    .replace(/[ıİşŞğĞüÜöÖçÇß]/g, (letter) => TURKISH[letter] ?? letter)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '')
}

const isPresent = (value: unknown): boolean => (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : value !== undefined)

/** State of every translation in `doc`. A Turkish change makes a translation stale, manual fixes included. */
export function translationStatus(doc: unknown, meta: TranslationMeta): TranslationStatusItem[] {
  return translatablePaths(doc).flatMap((path) => {
    const localized = getAt(doc, path) as Record<string, unknown>
    const hash = hashSource(localized.tr)
    return TARGET_LOCALES.map((locale): TranslationStatusItem => {
      const mark = meta[path]?.[locale]
      const state: TranslationState = !isPresent(localized[locale])
        ? 'missing'
        : mark && mark.hash !== hash
          ? 'stale'
          : mark?.origin === 'manual'
            ? 'manual'
            : 'ok'
      return { path, locale, state }
    })
  })
}

/**
 * Turkish values to send for `locales`. `missing` = untranslated, `stale` = Turkish changed since,
 * `all` = everything. Manual fixes are skipped unless `includeManual`.
 */
export function collectSources(
  doc: unknown,
  meta: TranslationMeta,
  locales: readonly TargetLocale[],
  mode: 'missing' | 'stale' | 'all',
  includeManual: boolean,
): TranslationSource[] {
  return translationStatus(doc, meta)
    .filter(({ locale }) => locales.includes(locale))
    .filter(({ state }) => mode === 'all' || state === mode)
    .filter(({ path, locale }) => includeManual || meta[path]?.[locale]?.origin !== 'manual')
    .map(({ path, locale }) => ({ path, locale, source: getAt(doc, path + '/tr') as TranslatableValue }))
}

/** Writes DeepL results into the draft and marks them with the current Turkish hash. */
export function applyTranslations<T>(doc: T, meta: TranslationMeta, results: readonly TranslationResult[], at: string): { doc: T; meta: TranslationMeta } {
  return results.reduce(
    (acc, { path, locale, value }) => {
      if (!isLocalized(getAt(acc.doc, path))) return acc
      const mark: TranslationMark = { hash: hashSource(getAt(acc.doc, `${path}/tr`)), origin: 'deepl', at }
      return { doc: setAt(acc.doc, [...segments(path), locale], value), meta: { ...acc.meta, [path]: { ...acc.meta[path], [locale]: mark } } }
    },
    { doc, meta },
  )
}

/**
 * After a person saves: every translation that changed between `before` and `after` becomes
 * `manual`, made from the current Turkish text. A cleared translation loses its mark.
 */
export function markManualEdits(before: unknown, after: unknown, meta: TranslationMeta, at: string): TranslationMeta {
  return translatablePaths(after).reduce<TranslationMeta>((acc, path) => {
    const now = getAt(after, path) as Record<string, unknown>
    const old = getAt(before, path)
    const hash = hashSource(now.tr)
    return TARGET_LOCALES.reduce<TranslationMeta>((inner, locale) => {
      const value = now[locale]
      const previous = isRecord(old) ? old[locale] : undefined
      if (canonicalJson(value) === canonicalJson(previous)) return inner
      const { [locale]: _dropped, ...others } = inner[path] ?? {}
      const marks = isPresent(value) ? { ...others, [locale]: { hash, origin: 'manual' as const, at } } : others
      return { ...inner, [path]: marks }
    }, acc)
  }, meta)
}
