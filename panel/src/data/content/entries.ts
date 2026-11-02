import type { TargetLocale, TranslationMeta } from '../../shared/content/translation.ts'
import { ConflictError } from '../../lib/content/messages'
import type { OrderType } from '../../lib/content/ordering'
import type { TranslateMode } from '../../lib/content/translationView'
import { parsePermissions, type Permission } from '../../lib/permissions'
import { db } from '../../lib/supabase'
import type { ContentEntryListRow, ContentEntryRow, DeeplUsage } from '../../lib/types'
import { callFunction } from './functions'

/**
 * Content reads and draft writes go through RLS (content_entries, content_entry_list); publishing
 * and translating go through the publish-content and translate-content functions (§6, §9).
 */

const ENTRY_COLUMNS = 'id, type, key, draft, draft_revision, translation_meta, published, published_revision, status, updated_at'

export async function listEntries(): Promise<ContentEntryListRow[]> {
  const { data, error } = await db()
    .from('content_entry_list')
    .select('id, type, key, status, title_tr, has_changes, updated_at, updated_by_name')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ContentEntryListRow[]
}

export interface DraftRow {
  id: string
  type: string
  key: string
  draft: unknown
  translation_meta: unknown
}

/** Drafts of some types (translation badges, ordering, references, where media is used). */
export async function listDrafts(types: readonly string[]): Promise<DraftRow[]> {
  const { data, error } = await db().from('content_entries').select('id, type, key, draft, translation_meta').in('type', types)
  if (error) throw error
  return (data ?? []) as DraftRow[]
}

export async function getEntry(id: string): Promise<ContentEntryRow> {
  const { data, error } = await db().from('content_entries').select(ENTRY_COLUMNS).eq('id', id).single<ContentEntryRow>()
  if (error) throw error
  return data
}

/**
 * Optimistic save: only the revision the editor loaded may be replaced. The trigger bumps
 * `draft_revision`; no row back means someone else saved in between.
 */
export async function saveDraft(id: string, revision: number, draft: unknown, meta: TranslationMeta): Promise<number> {
  const { data, error } = await db()
    .from('content_entries')
    .update({ draft, translation_meta: meta })
    .eq('id', id)
    .eq('draft_revision', revision)
    .select('draft_revision')
  if (error) throw error
  const row = (data ?? [])[0] as { draft_revision?: unknown } | undefined
  if (!row || typeof row.draft_revision !== 'number') throw new ConflictError()
  return row.draft_revision
}

export async function createEntry(type: string, key: string, draft: unknown): Promise<{ id: string; draft_revision: number }> {
  const { data, error } = await db()
    .from('content_entries')
    .insert({ type, key, draft, translation_meta: {} })
    .select('id, draft_revision')
    .single<{ id: string; draft_revision: number }>()
  if (error) throw error
  return data
}

export interface PublishResult {
  ok: true
  releaseId: number
  deployNotBefore: string | null
}

export const publishEntries = (entries: readonly { id: string; draftRevision: number }[], note?: string) =>
  callFunction<PublishResult>('publish-content', { action: 'publish', entries, ...(note ? { note } : {}) })

export const changeStatus = (action: 'archive' | 'unpublish', entryIds: readonly string[]) =>
  callFunction<PublishResult>('publish-content', { action, entryIds })

export const reorderEntries = (type: OrderType, keys: readonly string[]) =>
  callFunction<PublishResult>('publish-content', { action: 'reorder', type, keys })

export interface TranslateRequest {
  target: { kind: 'content'; id: string } | { kind: 'media'; id: string }
  expectedRevision: number
  locales: readonly TargetLocale[]
  mode: TranslateMode
  includeManual: boolean
}

export interface TranslateResult {
  ok: true
  draftRevision: number
  translated: number
  skippedManual: number
  sourceChars: number
  usage: DeeplUsage
}

export const translate = (request: TranslateRequest) =>
  callFunction<TranslateResult>('translate-content', { action: 'translate', ...request })

export async function deeplUsage(): Promise<DeeplUsage> {
  const result = await callFunction<{ usage: DeeplUsage }>('translate-content', { action: 'usage' })
  return result.usage
}

/** `my_permissions()`: empty without an active staff row. */
export async function loadMyPermissions(): Promise<Permission[]> {
  const { data, error } = await db().rpc('my_permissions')
  if (error) throw error
  return parsePermissions(data)
}
