/** What handleContentRelease needs from the outside world; everything is injected so vitest can run it. */

export interface StoredRelease {
  id: number
  /** content_releases.snapshot; null once pruned (only the last 20 keep theirs). */
  snapshot: unknown
  snapshotSha256: string | null
}

export interface ReleaseStore {
  /** The release with this id, or the newest release that still has a snapshot when id is null. */
  loadRelease(id: number | null): Promise<StoredRelease | null>
  /** A signed GET URL for an object in the private media-originals bucket. */
  signedUrl(objectPath: string, expiresInSeconds: number): Promise<string>
}

export interface ContentReleaseDeps {
  store: ReleaseStore
  /** Publishable keys accepted on `apikey` (or as a bearer token). Empty refuses every call. */
  publishableKeys: readonly string[]
  clock: () => Date
  reportError?: (context: string, error: unknown) => void
}
