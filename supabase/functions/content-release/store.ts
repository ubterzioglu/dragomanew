import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReleaseStore } from './types.ts'

/** The real ReleaseStore: content_releases and the private media-originals bucket, with the service client. */

export const MEDIA_BUCKET = 'media-originals'

interface ReleaseRow {
  id: number
  snapshot: unknown
  snapshot_sha256: string | null
}

export function createReleaseStore(db: SupabaseClient): ReleaseStore {
  return {
    async loadRelease(id) {
      const base = db.from('content_releases').select('id, snapshot, snapshot_sha256')
      const query = id === null ? base.not('snapshot', 'is', null).order('id', { ascending: false }).limit(1) : base.eq('id', id)
      const { data, error } = await query.maybeSingle<ReleaseRow>()
      if (error) throw error
      return data ? { id: data.id, snapshot: data.snapshot, snapshotSha256: data.snapshot_sha256 } : null
    },

    async signedUrl(objectPath, expiresInSeconds) {
      const { data, error } = await db.storage.from(MEDIA_BUCKET).createSignedUrl(objectPath, expiresInSeconds)
      if (error) throw error
      return data.signedUrl
    },
  }
}
