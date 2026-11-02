import type { StaffVerifier } from '../_shared/auth/staff.ts'
import type { MediaSource } from '../_shared/content/release.ts'
import type { CategoryKey, ContentStatus, ContentType } from '../_shared/content/schema.ts'
import type { FormDefinition } from '../_shared/requests/forms.ts'
import type { RequestKind, SiteLocale } from '../_shared/requests/payload.ts'

/** What handlePublish needs from the outside world; everything is injected so vitest can run it. */

export interface SlugHistoryEntry {
  locale: SiteLocale
  slug: string
  category?: CategoryKey
}

/** One content_entries row. */
export interface EntryRow {
  id: string
  type: ContentType
  key: string
  status: ContentStatus
  draft: Readonly<Record<string, unknown>>
  draftRevision: number
  published: Readonly<Record<string, unknown>> | null
  slugHistory: readonly SlugHistoryEntry[]
}

/** One form_definitions row with the definition of its latest published version. */
export interface FormRow {
  kind: RequestKind
  draft: unknown
  draftRevision: number
  publishedVersion: number | null
  publishedDefinition: FormDefinition | null
}

/** Everything a release is built from, read after the base release id. */
export interface PublishState {
  /** max(content_releases.id), 0 when there is none. */
  baseRelease: number
  entries: readonly EntryRow[]
  /** Every media_assets row as a snapshot media source. */
  media: readonly MediaSource[]
  forms: readonly FormRow[]
}

export type ReleaseChange =
  | { op: 'publish'; entryId: string; draftRevision: number }
  | { op: 'archive' | 'unpublish'; entryId: string }
  | { op: 'reorder'; type: ContentType; keys: readonly string[] }
  | { op: 'publish_form'; kind: RequestKind; draftRevision: number }

export type ReleaseAction = 'publish' | 'archive' | 'unpublish' | 'reorder' | 'publish_form'

/** Arguments of apply_content_release (p_staff … p_note). */
export interface ApplyReleaseArgs {
  staffId: string
  baseRelease: number
  changes: readonly ReleaseChange[]
  snapshot: unknown
  snapshotSha256: string
  action: ReleaseAction
  note: string | null
}

/** apply_content_release raised `conflict`: another release landed since baseRelease. */
export class ReleaseConflict extends Error {
  constructor() {
    super('conflict')
    this.name = 'ReleaseConflict'
  }
}

/** apply_content_release raised `stale_draft:<id>`: the draft changed since the panel loaded it. */
export class StaleDraft extends Error {
  readonly entryId: string
  constructor(entryId: string) {
    super(`stale_draft:${entryId}`)
    this.name = 'StaleDraft'
    this.entryId = entryId
  }
}

/** Maps the raises of apply_content_release (PostgREST error message) onto the errors above; null for anything else. */
export function releaseError(error: { message?: string }): Error | null {
  const text = error.message ?? ''
  if (/^conflict\b/.test(text)) return new ReleaseConflict()
  const stale = /^stale_draft:(\S+)/.exec(text)
  return stale?.[1] ? new StaleDraft(stale[1]) : null
}

export interface PublishStore {
  loadState(): Promise<PublishState>
  /** Calls apply_content_release; throws ReleaseConflict or StaleDraft for those raises. Returns the release id. */
  applyRelease(args: ApplyReleaseArgs): Promise<number>
  /** not_before of the queued deploy that will ship `releaseId`, or null. */
  deployNotBefore(releaseId: number): Promise<string | null>
}

export interface PublishDeps {
  store: PublishStore
  auth: StaffVerifier
  allowedOrigins: readonly string[]
  clock: () => Date
  reportError?: (context: string, error: unknown) => void
}
