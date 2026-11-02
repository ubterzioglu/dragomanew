import { FunctionsHttpError } from '@supabase/supabase-js'
import type { TranslationMeta } from '../../shared/content/translation.ts'
import { formDefinitionSchema, type FormDefinition } from '../../shared/requests/forms.ts'
import type { RequestKind } from '../../shared/requests/payload.ts'
import { db } from '../../lib/supabase'

/**
 * Form definitions (dalga2-sozlesme §5, §8). Drafts are read and saved through RLS (forms.manage);
 * publishing goes through publish-content and translating through translate-content, both Edge
 * Functions that check the caller themselves.
 */

export interface FormDefinitionRow {
  kind: RequestKind
  draft: FormDefinition
  draft_revision: number
  translation_meta: TranslationMeta
  published_version: number | null
}

export interface FormVersionRow {
  kind: RequestKind
  version: number
  definition: FormDefinition
  published_at: string
}

/** Rows written by the panel and the functions; a definition that does not parse is shown as an error. */
function parseDefinition(value: unknown): FormDefinition {
  return formDefinitionSchema.parse(value)
}

function toDefinitionRow(row: Record<string, unknown>): FormDefinitionRow {
  return {
    kind: row.kind as RequestKind,
    draft: parseDefinition(row.draft),
    draft_revision: Number(row.draft_revision),
    translation_meta: (row.translation_meta ?? {}) as TranslationMeta,
    published_version: row.published_version === null || row.published_version === undefined ? null : Number(row.published_version),
  }
}

function toVersionRow(row: Record<string, unknown>): FormVersionRow {
  return {
    kind: row.kind as RequestKind,
    version: Number(row.version),
    definition: parseDefinition(row.definition),
    published_at: String(row.published_at ?? ''),
  }
}

const DEFINITION_COLUMNS = 'kind, draft, draft_revision, translation_meta, published_version'
const VERSION_COLUMNS = 'kind, version, definition, published_at'

export interface FormOverview {
  definition: FormDefinitionRow
  /** The latest published version, if any. */
  latest: FormVersionRow | null
}

/** All four forms with their latest version. RLS hides them all from anyone without forms.manage. */
export async function listForms(): Promise<FormOverview[]> {
  const [definitions, versions] = await Promise.all([
    db().from('form_definitions').select(DEFINITION_COLUMNS).order('kind'),
    db().from('form_versions').select(VERSION_COLUMNS).order('version', { ascending: false }),
  ])
  if (definitions.error) throw definitions.error
  if (versions.error) throw versions.error
  const allVersions = ((versions.data ?? []) as Record<string, unknown>[]).map(toVersionRow)
  return ((definitions.data ?? []) as Record<string, unknown>[]).map((row) => {
    const definition = toDefinitionRow(row)
    return { definition, latest: allVersions.find((version) => version.kind === definition.kind) ?? null }
  })
}

export interface FormDetail {
  definition: FormDefinitionRow
  /** Newest first. */
  versions: FormVersionRow[]
}

export async function getForm(kind: RequestKind): Promise<FormDetail | null> {
  const [definition, versions] = await Promise.all([
    db().from('form_definitions').select(DEFINITION_COLUMNS).eq('kind', kind).maybeSingle(),
    db().from('form_versions').select(VERSION_COLUMNS).eq('kind', kind).order('version', { ascending: false }),
  ])
  if (definition.error) throw definition.error
  if (versions.error) throw versions.error
  if (!definition.data) return null
  return {
    definition: toDefinitionRow(definition.data as Record<string, unknown>),
    versions: ((versions.data ?? []) as Record<string, unknown>[]).map(toVersionRow),
  }
}

export const STALE_DRAFT_MESSAGE = 'Bu kayıt başka biri tarafından değiştirildi, yeniden yükleyin.'

/**
 * Saves the draft only if nobody saved since `revision` was read (optimistic, as in §9); the
 * database bumps the revision. Returns the new revision.
 */
export async function saveFormDraft(kind: RequestKind, draft: FormDefinition, meta: TranslationMeta, revision: number): Promise<number> {
  const { data, error } = await db()
    .from('form_definitions')
    .update({ draft, translation_meta: meta })
    .eq('kind', kind)
    .eq('draft_revision', revision)
    .select('draft_revision')
  if (error) throw error
  const [row] = (data ?? []) as Array<{ draft_revision: number }>
  if (!row) throw new Error(STALE_DRAFT_MESSAGE)
  return Number(row.draft_revision)
}

/** An Edge Function's refusal, carrying its `error` code (`{ok:false, error, ...detail}`). */
export class FunctionError extends Error {
  readonly code: string
  readonly detail: Record<string, unknown>

  constructor(code: string, detail: Record<string, unknown> = {}) {
    super(code)
    this.name = 'FunctionError'
    this.code = code
    this.detail = detail
  }
}

/** Calls a staff Edge Function with the signed-in session (supabase-js adds the bearer token). */
export async function callStaffFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await db().functions.invoke<T>(name, { body })
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const response = error.context as Response
      const payload: unknown = await response.json().catch(() => null)
      if (typeof payload === 'object' && payload !== null && typeof (payload as { error?: unknown }).error === 'string') {
        const { error: code, ...detail } = payload as { error: string } & Record<string, unknown>
        throw new FunctionError(code, detail)
      }
      throw new FunctionError(response.status >= 500 ? 'server' : 'bad_request')
    }
    throw error
  }
  return data as T
}

export interface PublishResult {
  ok: true
  releaseId: number
  deployNotBefore: string | null
}

/** publish-content `{action:'publish_form'}`: the draft at `draftRevision` becomes the next version. */
export function publishForm(kind: RequestKind, draftRevision: number): Promise<PublishResult> {
  return callStaffFunction<PublishResult>('publish-content', { action: 'publish_form', kind, draftRevision })
}

export type TranslateMode = 'missing' | 'stale' | 'all'

export interface TranslateResult {
  ok: true
  draftRevision: number
  translated: number
  skippedManual: number
}

/** translate-content for a form draft: DeepL fills EN/FR/DE into the draft only. */
export function translateForm(kind: RequestKind, expectedRevision: number, mode: TranslateMode, includeManual = false): Promise<TranslateResult> {
  return callStaffFunction<TranslateResult>('translate-content', {
    action: 'translate',
    target: { kind: 'form', key: kind },
    expectedRevision,
    locales: ['en', 'fr', 'de'],
    mode,
    includeManual,
  })
}

/** The version a request was sent with, for its custom answers' labels; null for the built-in form. */
export async function getRequestFormVersion(requestId: string): Promise<FormVersionRow | null> {
  const request = await db().from('requests').select('kind, form_version').eq('id', requestId).maybeSingle()
  if (request.error) throw request.error
  const row = request.data as { kind: RequestKind; form_version: number | null } | null
  if (!row || row.form_version === null) return null
  const version = await db().from('form_versions').select(VERSION_COLUMNS).eq('kind', row.kind).eq('version', row.form_version).maybeSingle()
  if (version.error) throw version.error
  return version.data ? toVersionRow(version.data as Record<string, unknown>) : null
}
