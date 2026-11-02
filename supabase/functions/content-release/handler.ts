import { canonicalJson } from '../_shared/content/release.ts'
import { failure, hasPublishableKey, jsonResponse, sha256Hex } from '../_shared/http/http.ts'
import type { ContentReleaseDeps } from './types.ts'

/**
 * content-release (dalga2-sozlesme §6): the site build's only content source. GET with the
 * publishable key (as submit-request), optional `?id=`. Answers the stored snapshot as is (the
 * build validates it again) plus a 600 s signed URL for every uploaded master. No CORS: only the
 * build calls it. `no-store`, ETag = the snapshot's sha256.
 */

export const SIGNED_URL_SECONDS = 600

export interface Download {
  objectPath: string
  url: string
  expiresAt: string
}

export async function handleContentRelease(request: Request, deps: ContentReleaseDeps): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse(405, failure('method_not_allowed'), { allow: 'GET' })
  if (!hasPublishableKey(request, deps.publishableKeys)) return jsonResponse(401, failure('bad_key'))

  const id = releaseId(new URL(request.url).searchParams.get('id'))
  if (id === undefined) return jsonResponse(404, failure('no_release'))

  try {
    const release = await deps.store.loadRelease(id)
    if (!release || release.snapshot === null || release.snapshot === undefined) return jsonResponse(404, failure('no_release'))

    const expiresAt = new Date(deps.clock().getTime() + SIGNED_URL_SECONDS * 1000).toISOString()
    const downloads: Download[] = await Promise.all(
      uploadPaths(release.snapshot).map(async (objectPath) => ({ objectPath, url: await deps.store.signedUrl(objectPath, SIGNED_URL_SECONDS), expiresAt })),
    )
    const etag = release.snapshotSha256 ?? (await sha256Hex(canonicalJson(release.snapshot)))
    return jsonResponse(200, { snapshot: release.snapshot, downloads }, { etag: `"${etag}"` })
  } catch (error) {
    deps.reportError?.('content-release', error)
    return jsonResponse(500, failure('server'))
  }
}

/** null = latest; undefined = not a positive integer (answered as no_release). */
function releaseId(raw: string | null): number | null | undefined {
  if (raw === null || raw === '') return null
  return /^[1-9][0-9]{0,14}$/.test(raw) ? Number(raw) : undefined
}

/** objectPath of every `storage: 'upload'` media item in the snapshot, without repeats. */
function uploadPaths(snapshot: unknown): string[] {
  const content = (snapshot as { content?: { media?: unknown } } | null)?.content
  const media = Array.isArray(content?.media) ? (content.media as unknown[]) : []
  const paths = media.flatMap((item) => {
    const { storage, objectPath } = (item ?? {}) as { storage?: unknown; objectPath?: unknown }
    return storage === 'upload' && typeof objectPath === 'string' ? [objectPath] : []
  })
  return [...new Set(paths)]
}
