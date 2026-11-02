import { parseLiveRelease } from '../../lib/publish/deployState'
import { db } from '../../lib/supabase'
import type { ContentReleaseRow, SiteDeployRow } from '../../lib/types'

/** /panel/yayin reads: releases (never the snapshot column), deploy rows and the live release. */

export async function listReleases(limit = 20): Promise<ContentReleaseRow[]> {
  const { data, error } = await db()
    .from('content_releases')
    .select('id, created_at, created_by, action, entry_ids, note, snapshot_sha256')
    .order('id', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as ContentReleaseRow[]
}

export async function listDeploys(limit = 10): Promise<SiteDeployRow[]> {
  const { data, error } = await db()
    .from('site_deploys')
    .select('id, status, release_id, first_requested_at, not_before, sending_at, triggered_at, attempts, last_error')
    .order('id', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as SiteDeployRow[]
}

/** site.deploy only; queues a deploy due now. */
export async function requestSiteDeploy(): Promise<void> {
  const { error } = await db().rpc('request_site_deploy')
  if (error) throw error
}

/** The site's own /release.json (same origin); null when it is missing (fixture builds). */
export async function fetchLiveRelease(): Promise<{ releaseId: number; createdAt: string | null } | null> {
  try {
    const response = await fetch('/release.json', { cache: 'no-store', credentials: 'omit' })
    if (!response.ok) return null
    return parseLiveRelease(await response.json())
  } catch {
    return null
  }
}
