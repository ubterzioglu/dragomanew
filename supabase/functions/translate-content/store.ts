import type { SupabaseClient } from '@supabase/supabase-js'
import type { TranslationMeta } from '../_shared/content/translation.ts'
import type { GlossarySetting } from '../_shared/deepl/glossary.ts'
import type { LoadedTarget, TranslateStore, TranslateTarget, UsageSetting } from './types.ts'

/**
 * The real TranslateStore with the service client. Every write carries the revision the caller
 * loaded (`.eq(revision column, n)`); the tables' triggers bump it, so a concurrent panel save
 * makes the update match no row and the handler answers stale_draft.
 */

type Row = Record<string, unknown>

const meta = (value: unknown): TranslationMeta => (value && typeof value === 'object' ? (value as TranslationMeta) : {})
const titleOf = (doc: Row): string | null => {
  const title = doc.title
  return title && typeof title === 'object' && typeof (title as Row).tr === 'string' ? ((title as Row).tr as string) : null
}

interface Table {
  table: 'content_entries' | 'media_assets' | 'form_definitions'
  idColumn: 'id' | 'kind'
  id: string
  revisionColumn: 'draft_revision' | 'revision'
}

function tableOf(target: TranslateTarget): Table {
  switch (target.kind) {
    case 'content':
      return { table: 'content_entries', idColumn: 'id', id: target.id, revisionColumn: 'draft_revision' }
    case 'media':
      return { table: 'media_assets', idColumn: 'id', id: target.id, revisionColumn: 'revision' }
    case 'form':
      return { table: 'form_definitions', idColumn: 'kind', id: target.key, revisionColumn: 'draft_revision' }
  }
}

async function readSetting<T>(db: SupabaseClient, key: string): Promise<T | null> {
  const { data, error } = await db.from('app_settings').select('value').eq('key', key).maybeSingle<{ value: T | null }>()
  if (error) throw error
  return data?.value ?? null
}

async function writeSetting(db: SupabaseClient, key: string, value: unknown): Promise<void> {
  const { error } = await db.from('app_settings').upsert({ key, value }, { onConflict: 'key' })
  if (error) throw error
}

export function createTranslateStore(db: SupabaseClient): TranslateStore {
  return {
    async loadTarget(target) {
      const { table, idColumn, id, revisionColumn } = tableOf(target)
      const columns = target.kind === 'content' ? 'draft, translation_meta, draft_revision, published' : target.kind === 'media' ? 'alt, translation_meta, revision' : 'draft, translation_meta, draft_revision'
      const { data, error } = await db.from(table).select(columns).eq(idColumn, id).maybeSingle<Row>()
      if (error) throw error
      if (!data) return null
      const doc = (target.kind === 'media' ? { alt: data.alt } : (data.draft ?? {})) as Row
      return {
        revision: Number(data[revisionColumn]),
        doc,
        meta: meta(data.translation_meta),
        context: target.kind === 'content' ? titleOf(doc) : null,
        neverPublished: target.kind === 'content' && data.published === null,
      } satisfies LoadedTarget
    },

    async saveTarget(target, expectedRevision, doc, translationMeta) {
      const { table, idColumn, id, revisionColumn } = tableOf(target)
      const patch = target.kind === 'media' ? { alt: doc.alt, translation_meta: translationMeta } : { draft: doc, translation_meta: translationMeta }
      const { data, error } = await db.from(table).update(patch).eq(idColumn, id).eq(revisionColumn, expectedRevision).select(revisionColumn).maybeSingle<Row>()
      if (error) throw error
      return data ? Number(data[revisionColumn]) : null
    },

    async logRun(run) {
      const { error } = await db.from('translation_runs').insert({
        target_kind: run.targetKind,
        target_id: run.targetId,
        locales: run.locales,
        source_chars: run.sourceChars,
        status: run.status,
        error_code: run.errorCode,
        deepl_trace_id: run.deeplTraceId,
        created_by: run.staffId,
      })
      if (error) throw error
    },

    readUsage: () => readSetting<UsageSetting>(db, 'deepl_usage'),
    writeUsage: (usage) => writeSetting(db, 'deepl_usage', usage),
    readGlossary: () => readSetting<GlossarySetting>(db, 'deepl_glossary'),
    writeGlossary: (setting) => writeSetting(db, 'deepl_glossary', setting),
  }
}
