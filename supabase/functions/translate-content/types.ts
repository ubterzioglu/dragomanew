import type { StaffVerifier } from '../_shared/auth/staff.ts'
import type { TargetLocale, TranslationMeta } from '../_shared/content/translation.ts'
import type { DeeplClient } from '../_shared/deepl/client.ts'
import type { GlossaryStore } from '../_shared/deepl/glossary.ts'
import type { RequestKind } from '../_shared/requests/payload.ts'

/** What handleTranslate needs from the outside world; everything is injected so vitest can run it. */

export type TranslateTarget = { kind: 'content'; id: string } | { kind: 'media'; id: string } | { kind: 'form'; key: RequestKind }

/**
 * The draft to translate. content: content_entries.draft (revision = draft_revision); media:
 * `{ alt }` of media_assets (revision = revision); form: form_definitions.draft (draft_revision).
 */
export interface LoadedTarget {
  revision: number
  doc: Readonly<Record<string, unknown>>
  meta: TranslationMeta
  /** Turkish title sent to DeepL as `context`; null when the target has none. */
  context: string | null
  /** True for a content entry that was never published (its slugs may still follow the title). */
  neverPublished: boolean
}

export interface TranslationRun {
  targetKind: TranslateTarget['kind']
  targetId: string
  locales: readonly TargetLocale[]
  sourceChars: number
  status: 'ok' | 'failed'
  errorCode: string | null
  /** DeepL X-Trace-ID: stored for support, never shown to the caller. */
  deeplTraceId: string | null
  staffId: string
}

/** app_settings.deepl_usage. */
export interface UsageSetting {
  count: number
  limit: number
  /** ISO timestamp of the last /v2/usage answer. */
  checkedAt: string
}

export interface TranslateStore extends GlossaryStore {
  loadTarget(target: TranslateTarget): Promise<LoadedTarget | null>
  /** Writes doc + meta if the revision is still `expectedRevision`; returns the new revision, or null when it moved. */
  saveTarget(target: TranslateTarget, expectedRevision: number, doc: Readonly<Record<string, unknown>>, meta: TranslationMeta): Promise<number | null>
  logRun(run: TranslationRun): Promise<void>
  readUsage(): Promise<UsageSetting | null>
  writeUsage(usage: UsageSetting): Promise<void>
}

export interface TranslateDeps {
  store: TranslateStore
  auth: StaffVerifier
  deepl: DeeplClient
  allowedOrigins: readonly string[]
  clock: () => Date
  reportError?: (context: string, error: unknown) => void
}
