import {
  collectSources,
  TARGET_LOCALES,
  translationStatus,
  type TargetLocale,
  type TranslatableValue,
  type TranslationMeta,
  type TranslationSource,
  type TranslationState,
} from '../../shared/content/translation.ts'
import { isRecord } from './docPath'

/** How the editor shows translation state (§9 badges) and what a DeepL run would cost. */

export const STATE_BADGES: Readonly<Record<Exclude<TranslationState, 'ok'>, string>> = {
  missing: 'eksik',
  stale: 'güncellenmeli',
  manual: 'elle düzeltildi',
}

export type TranslateMode = 'missing' | 'stale' | 'all'

export const MODE_LABELS: Readonly<Record<TranslateMode, string>> = {
  missing: 'Eksik olanlar',
  stale: 'Güncellenmesi gerekenler',
  all: 'Tümü',
}

const isMark = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.hash === 'string' &&
  typeof value.at === 'string' &&
  (value.origin === 'deepl' || value.origin === 'manual' || value.origin === 'seed')

/** `translation_meta` from the database, keeping only well-formed marks. */
export function parseMeta(value: unknown): TranslationMeta {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value).flatMap(([path, marks]) => {
      if (!isRecord(marks)) return []
      const kept = Object.fromEntries(
        TARGET_LOCALES.flatMap((locale) => (isMark(marks[locale]) ? [[locale, marks[locale]]] : [])),
      )
      return [[path, kept]]
    }),
  ) as TranslationMeta
}

export type StateByPointer = ReadonlyMap<string, Partial<Record<TargetLocale, TranslationState>>>

export function statesByPointer(doc: unknown, meta: TranslationMeta): StateByPointer {
  const map = new Map<string, Partial<Record<TargetLocale, TranslationState>>>()
  for (const { path, locale, state } of translationStatus(doc, meta)) {
    map.set(path, { ...map.get(path), [locale]: state })
  }
  return map
}

export type LocaleSummary = Record<TargetLocale, Record<Exclude<TranslationState, 'ok'>, number>>

export function summarize(doc: unknown, meta: TranslationMeta): LocaleSummary {
  const empty = () => ({ missing: 0, stale: 0, manual: 0 })
  return translationStatus(doc, meta).reduce<LocaleSummary>(
    (acc, { locale, state }) =>
      state === 'ok' ? acc : { ...acc, [locale]: { ...acc[locale], [state]: acc[locale][state] + 1 } },
    { en: empty(), fr: empty(), de: empty() },
  )
}

/** The list's "Çeviri güncellenmeli" badge: a Turkish edit left some translation behind. */
export function needsTranslationUpdate(doc: unknown, meta: TranslationMeta): boolean {
  return translationStatus(doc, meta).some(({ state }) => state === 'stale')
}

const codePoints = (text: string): number => [...text].length

/** DeepL bills characters of the strings sent: plain text, list lines, block text and items. */
export function sourceChars(value: TranslatableValue): number {
  if (typeof value === 'string') return codePoints(value)
  return value.reduce<number>((sum, item) => {
    if (typeof item === 'string') return sum + codePoints(item)
    const text = typeof item.text === 'string' ? codePoints(item.text) : 0
    const items = Array.isArray(item.items)
      ? item.items.reduce<number>((n, line) => n + (typeof line === 'string' ? codePoints(line) : 0), 0)
      : 0
    return sum + text + items
  }, 0)
}

export interface TranslateEstimate {
  /** Values that would be sent. */
  count: number
  chars: number
  /** Manual fixes the run would overwrite if allowed (it skips them otherwise). */
  manualCount: number
}

export function estimateTranslation(
  doc: unknown,
  meta: TranslationMeta,
  locales: readonly TargetLocale[],
  mode: TranslateMode,
  includeManual: boolean,
): TranslateEstimate {
  const withManual = collectSources(doc, meta, locales, mode, true)
  const sources: TranslationSource[] = includeManual ? withManual : collectSources(doc, meta, locales, mode, false)
  return {
    count: sources.length,
    chars: sources.reduce((sum, { source }) => sum + sourceChars(source), 0),
    manualCount: withManual.length - collectSources(doc, meta, locales, mode, false).length,
  }
}

export type UsageLevel = 'ok' | 'warn' | 'critical'

/** §2: warn at 80 %, critical at 100 %. */
export function usageLevel(count: number, limit: number): UsageLevel {
  if (limit <= 0) return 'critical'
  const ratio = count / limit
  return ratio >= 1 ? 'critical' : ratio >= 0.8 ? 'warn' : 'ok'
}

const RANK: Readonly<Record<UsageLevel, number>> = { ok: 0, warn: 1, critical: 2 }

/** The stricter of the server's level and the one the numbers give (a stale cache never hides 100 %). */
export function bannerLevel(usage: { count: number; limit: number; level: UsageLevel }): UsageLevel {
  const computed = usageLevel(usage.count, usage.limit)
  return RANK[computed] > RANK[usage.level] ? computed : usage.level
}
