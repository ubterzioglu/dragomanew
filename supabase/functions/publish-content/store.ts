import type { SupabaseClient } from '@supabase/supabase-js'
import type { MediaSource } from '../_shared/content/release.ts'
import type { FormDefinition } from '../_shared/requests/forms.ts'
import { releaseError, type EntryRow, type FormRow, type PublishStore } from './types.ts'

/**
 * The real PublishStore with the service client. apply_content_release lives in schema
 * `private`, which PostgREST does not expose; it is reached through `public.apply_content_release`
 * (same arguments, execute granted to service_role only), a wrapper Lane B provides.
 */

interface EntryDbRow {
  id: string
  type: EntryRow['type']
  key: string
  status: EntryRow['status']
  draft: Record<string, unknown>
  draft_revision: number
  published: Record<string, unknown> | null
  slug_history: EntryRow['slugHistory'] | null
}

interface MediaDbRow {
  id: string
  storage: 'repo' | 'upload'
  source_file?: string | null
  object_path: string | null
  sha256: string | null
  widths: number[] | null
  width: number
  height: number
  alt: MediaSource['alt']
  topic: string
  rights: MediaSource['rights']
  placeholder: boolean
}

interface FormDbRow {
  kind: FormRow['kind']
  draft: unknown
  draft_revision: number
  published_version: number | null
}

interface FormVersionDbRow {
  kind: FormRow['kind']
  version: number
  definition: FormDefinition
}

function toMedia(row: MediaDbRow): MediaSource {
  const shared = { id: row.id, width: row.width, height: row.height, alt: row.alt, topic: row.topic, rights: row.rights }
  if (row.storage === 'upload') {
    return { ...shared, storage: 'upload', objectPath: row.object_path ?? '', sha256: row.sha256 ?? '', placeholder: false }
  }
  // Repo media keep their original file name when the table has it; the build only needs the id and widths.
  return { ...shared, storage: 'repo', sourceFile: row.source_file || `${row.id}.jpg`, widths: row.widths ?? [], placeholder: row.placeholder }
}

export function createPublishStore(db: SupabaseClient): PublishStore {
  return {
    async loadState() {
      // The base release first: if anything below changes afterwards, the RPC sees a newer release and raises conflict.
      const latest = await db.from('content_releases').select('id').order('id', { ascending: false }).limit(1).maybeSingle<{ id: number }>()
      if (latest.error) throw latest.error
      const [entries, media, forms, versions] = await Promise.all([
        db.from('content_entries').select('id, type, key, status, draft, draft_revision, published, slug_history').returns<EntryDbRow[]>(),
        db.from('media_assets').select('*').returns<MediaDbRow[]>(),
        db.from('form_definitions').select('kind, draft, draft_revision, published_version').returns<FormDbRow[]>(),
        db.from('form_versions').select('kind, version, definition').returns<FormVersionDbRow[]>(),
      ])
      for (const result of [entries, media, forms, versions]) if (result.error) throw result.error

      return {
        baseRelease: latest.data?.id ?? 0,
        entries: (entries.data ?? []).map((row) => ({
          id: row.id,
          type: row.type,
          key: row.key,
          status: row.status,
          draft: row.draft,
          draftRevision: row.draft_revision,
          published: row.published,
          slugHistory: row.slug_history ?? [],
        })),
        media: (media.data ?? []).map(toMedia),
        forms: (forms.data ?? []).map((row) => ({
          kind: row.kind,
          draft: row.draft,
          draftRevision: row.draft_revision,
          publishedVersion: row.published_version,
          publishedDefinition: (versions.data ?? []).find((version) => version.kind === row.kind && version.version === row.published_version)?.definition ?? null,
        })),
      }
    },

    async applyRelease(args) {
      const { data, error } = await db.rpc('apply_content_release', {
        p_staff: args.staffId,
        p_base_release: args.baseRelease,
        p_changes: args.changes,
        p_snapshot: args.snapshot,
        p_snapshot_sha256: args.snapshotSha256,
        p_action: args.action,
        p_note: args.note,
      })
      if (error) throw releaseError(error) ?? error
      const id = Number(data)
      if (!Number.isInteger(id) || id <= 0) throw new Error('apply_content_release returned no release id')
      return id
    },

    async deployNotBefore(releaseId) {
      const { data, error } = await db
        .from('site_deploys')
        .select('not_before')
        .eq('release_id', releaseId)
        .in('status', ['queued', 'sending'])
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle<{ not_before: string | null }>()
      if (error) throw error
      return data?.not_before ?? null
    },
  }
}
