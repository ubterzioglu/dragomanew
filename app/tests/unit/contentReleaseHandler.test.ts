import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { canonicalJson } from '../../src/shared/content/release'
import { handleContentRelease } from '../../../supabase/functions/content-release/handler.ts'
import type { ContentReleaseDeps, StoredRelease } from '../../../supabase/functions/content-release/types.ts'

const KEY = 'sb_publishable_test'
const NOW = new Date('2026-11-02T12:00:00.000Z')
const SHA = 'a'.repeat(64)
const upload = (id: string) => ({ id, storage: 'upload', objectPath: `${id}/${'b'.repeat(64)}.jpg` })
const snapshot = { format: 1, releaseId: 4, content: { media: [{ id: 'repo-1', storage: 'repo' }, upload('up-1'), upload('up-2'), upload('up-1')] } }

function setup(releases: Readonly<Record<string, StoredRelease>> = { latest: { id: 4, snapshot, snapshotSha256: SHA }, '3': { id: 3, snapshot: { format: 1, content: { media: [] } }, snapshotSha256: null }, '2': { id: 2, snapshot: null, snapshotSha256: SHA } }) {
  const store = {
    loadRelease: vi.fn(async (id: number | null) => releases[id === null ? 'latest' : String(id)] ?? null),
    signedUrl: vi.fn(async (path: string, seconds: number) => `https://storage.example/sign/${path}?ttl=${seconds}`),
  }
  const reportError = vi.fn()
  const deps: ContentReleaseDeps = { store, publishableKeys: [KEY], clock: () => NOW, reportError }
  return { deps, store, reportError }
}

const get = async (deps: ContentReleaseDeps, query = '', headers: Record<string, string> = { apikey: KEY }, method = 'GET') => {
  const response = await handleContentRelease(new Request(`http://localhost/functions/v1/content-release${query}`, { method, headers }), deps)
  return { status: response.status, headers: response.headers, body: (await response.json()) as Record<string, unknown> }
}

describe('content-release', () => {
  it('returns the latest snapshot with a 600 s signed URL per upload master', async () => {
    const { deps, store } = setup()
    const result = await get(deps)
    expect(result.status).toBe(200)
    expect(result.body.snapshot).toEqual(snapshot)
    expect(result.body.downloads).toEqual(
      ['up-1', 'up-2'].map((id) => ({
        objectPath: `${id}/${'b'.repeat(64)}.jpg`,
        url: `https://storage.example/sign/${id}/${'b'.repeat(64)}.jpg?ttl=600`,
        expiresAt: '2026-11-02T12:10:00.000Z',
      })),
    )
    expect(store.loadRelease).toHaveBeenCalledWith(null)
    expect(result.headers.get('cache-control')).toBe('no-store')
    expect(result.headers.get('etag')).toBe(`"${SHA}"`)
    expect(result.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('serves a release by id; the ETag falls back to the canonical sha256', async () => {
    const { deps, store } = setup()
    const result = await get(deps, '?id=3', { authorization: `Bearer ${KEY}` })
    expect(result.status).toBe(200)
    expect(store.loadRelease).toHaveBeenCalledWith(3)
    const expected = createHash('sha256').update(canonicalJson({ format: 1, content: { media: [] } })).digest('hex')
    expect(result.headers.get('etag')).toBe(`"${expected}"`)
    expect(result.body.downloads).toEqual([])
  })

  it('401 bad_key without the publishable key', async () => {
    const { deps } = setup()
    expect(await get(deps, '', {})).toMatchObject({ status: 401, body: { ok: false, error: 'bad_key' } })
    expect((await get(deps, '', { apikey: 'sb_secret_wrong' })).status).toBe(401)
    expect((await get({ ...deps, publishableKeys: [] }, '', { apikey: KEY })).status).toBe(401)
  })

  it('404 no_release for an unknown, pruned or malformed id, or an empty table', async () => {
    const { deps } = setup()
    for (const query of ['?id=99', '?id=2', '?id=abc', '?id=-1', '?id=0']) expect(await get(deps, query)).toMatchObject({ status: 404, body: { error: 'no_release' } })
    expect((await get(setup({}).deps)).status).toBe(404)
  })

  it('405 for other methods, 500 on a store failure', async () => {
    expect((await get(setup().deps, '', { apikey: KEY }, 'POST')).status).toBe(405)
    const { deps, store, reportError } = setup()
    store.signedUrl.mockRejectedValue(new Error('storage down'))
    expect(await get(deps)).toMatchObject({ status: 500, body: { error: 'server' } })
    expect(reportError).toHaveBeenCalled()
  })
})
