import { afterEach, describe, expect, it, vi } from 'vitest'
import { secretsEqual } from '../../../supabase/functions/_shared/auth/secret.ts'
import { deployUrl, triggerCoolifyDeploy } from '../../../supabase/functions/_shared/coolify/deploy.ts'
import { handleSiteDeploy } from '../../../supabase/functions/site-deploy/handler.ts'
import type { DeployStore, SendingDeploy, SiteDeployDeps } from '../../../supabase/functions/site-deploy/types.ts'

const SECRET = 'dispatch-secret-for-tests-0123456789abcdef'
const NOW = new Date('2026-11-02T12:00:00.000Z')
const DEPLOY_URL = 'https://coolify.example/api/v1/deploy?uuid=app-1&force=false'
const TOKEN = 'coolify-token-test'

function setup(options: { row?: SendingDeploy | null; fetch?: typeof fetch; coolify?: SiteDeployDeps['coolify']; secret?: string | null } = {}) {
  const row = options.row === undefined ? { id: 9, attempts: 1, releaseId: 4 } : options.row
  const store = {
    findSending: vi.fn(async (_id: number | null) => row),
    markSkipped: vi.fn(async () => undefined),
    markTriggered: vi.fn(async () => undefined),
    requeue: vi.fn(async () => undefined),
    markFailed: vi.fn(async () => undefined),
  } satisfies DeployStore
  const fetchMock = vi.fn(options.fetch ?? (async () => new Response(JSON.stringify({ deployments: [{ deployment_uuid: 'dep-1', resource_uuid: 'app-1' }] }), { status: 200 })))
  const reportError = vi.fn()
  const deps: SiteDeployDeps = {
    store,
    coolify: options.coolify ?? { deployUrl: DEPLOY_URL, token: TOKEN },
    dispatchSecret: options.secret === undefined ? SECRET : options.secret,
    fetch: fetchMock as unknown as typeof fetch,
    clock: () => NOW,
    reportError,
  }
  return { deps, store, fetchMock, reportError }
}

const call = async (deps: SiteDeployDeps, body: unknown = { deployId: 9 }, secret: string | null = SECRET, method = 'POST') => {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (secret !== null) headers['x-dispatch-secret'] = secret
  const init: RequestInit = { method, headers, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) }
  const response = await handleSiteDeploy(new Request('http://localhost/functions/v1/site-deploy', init), deps)
  return { status: response.status, body: (await response.json()) as Record<string, unknown> }
}

describe('site-deploy: dispatch secret', () => {
  it('compares timing-safe: equal only for the exact secret, never for an empty configured one', async () => {
    expect(await secretsEqual(SECRET, SECRET)).toBe(true)
    expect(await secretsEqual(`${SECRET}x`, SECRET)).toBe(false)
    expect(await secretsEqual(SECRET.slice(0, -1), SECRET)).toBe(false)
    expect(await secretsEqual('', SECRET)).toBe(false)
    expect(await secretsEqual(null, SECRET)).toBe(false)
    expect(await secretsEqual('', '')).toBe(false)
    expect(await secretsEqual('anything', null)).toBe(false)
  })

  it('401 for a missing or wrong secret, or when none is configured; 405 for GET', async () => {
    const { deps, store } = setup()
    expect(await call(deps, {}, null)).toMatchObject({ status: 401, body: { ok: false, error: 'unauthorized' } })
    expect((await call(deps, {}, 'wrong')).status).toBe(401)
    expect((await call(setup({ secret: null }).deps, {}, SECRET)).status).toBe(401)
    expect((await call(deps, {}, SECRET, 'GET')).status).toBe(405)
    expect(store.findSending).not.toHaveBeenCalled()
  })
})

describe('site-deploy: Coolify', () => {
  afterEach(() => vi.useRealTimers())

  it('without Coolify settings ends skipped / not_configured, without any request', async () => {
    const { deps, store, fetchMock } = setup({ coolify: { deployUrl: null, token: null } })
    expect(await call(deps)).toMatchObject({ status: 200, body: { ok: true, status: 'skipped', reason: 'not_configured' } })
    expect(store.markSkipped).toHaveBeenCalledWith(9, 'not_configured')
    expect(fetchMock).not.toHaveBeenCalled()
    expect((await call(setup({ coolify: { deployUrl: DEPLOY_URL, token: null } }).deps)).body.status).toBe('skipped')
  })

  it('triggers the webhook with the bearer token and stores the deployment uuid', async () => {
    const { deps, store, fetchMock } = setup()
    expect(await call(deps)).toMatchObject({ status: 200, body: { ok: true, status: 'triggered', deploymentUuid: 'dep-1' } })
    expect(store.findSending).toHaveBeenCalledWith(9)
    expect(store.markTriggered).toHaveBeenCalledWith(9, 'dep-1')
    const [url, init] = (fetchMock.mock.calls[0] ?? []) as unknown as [string, RequestInit]
    expect(url).toBe(DEPLOY_URL)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${TOKEN}`)
  })

  it('finds the sending row itself when the body names none', async () => {
    const { deps, store } = setup()
    await call(deps, '')
    expect(store.findSending).toHaveBeenCalledWith(null)
    expect((await call(deps, 'not json')).status).toBe(400)
    expect((await call(deps, { deployId: 'x' })).status).toBe(400)
  })

  it('404 when there is no sending row', async () => {
    expect(await call(setup({ row: null }).deps)).toMatchObject({ status: 404, body: { error: 'not_found' } })
  })

  it('a failed call is re-queued 2 then 5 minutes later; the third failure is final', async () => {
    const failing = async () => new Response('nope', { status: 500 })
    const first = setup({ fetch: failing })
    expect(await call(first.deps)).toMatchObject({ status: 502, body: { error: 'deploy_failed', status: 'queued', reason: 'http_500', notBefore: '2026-11-02T12:02:00.000Z' } })
    expect(first.store.requeue).toHaveBeenCalledWith(9, 'http_500', new Date('2026-11-02T12:02:00.000Z'))

    const second = setup({ fetch: failing, row: { id: 9, attempts: 2, releaseId: 4 } })
    await call(second.deps)
    expect(second.store.requeue).toHaveBeenCalledWith(9, 'http_500', new Date('2026-11-02T12:05:00.000Z'))

    const third = setup({ fetch: failing, row: { id: 9, attempts: 3, releaseId: 4 } })
    expect(await call(third.deps)).toMatchObject({ status: 502, body: { status: 'failed' } })
    expect(third.store.markFailed).toHaveBeenCalledWith(9, 'http_500')
    expect(third.store.requeue).not.toHaveBeenCalled()
  })

  it('a network error or a 15 s timeout counts as a failure', async () => {
    const network = setup({ fetch: async () => Promise.reject(new TypeError('fetch failed')) })
    expect((await call(network.deps)).body).toMatchObject({ status: 'queued', reason: 'network: TypeError' })

    vi.useFakeTimers()
    const hanging = (_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))
    const pending = triggerCoolifyDeploy({ deployUrl: DEPLOY_URL, token: TOKEN }, hanging as typeof fetch)
    await vi.advanceTimersByTimeAsync(14_999)
    let settled = false
    void pending.then(() => (settled = true))
    await Promise.resolve()
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(await pending).toEqual({ status: 'failed', error: 'timeout' })
  })

  it('refuses a non-https URL and rewrites force=true to false', async () => {
    expect(deployUrl('http://coolify.example/api/v1/deploy?uuid=a')).toBeNull()
    expect(deployUrl('not a url')).toBeNull()
    expect(deployUrl('https://coolify.example/api/v1/deploy?uuid=a&force=true')).toBe('https://coolify.example/api/v1/deploy?uuid=a&force=false')

    const { deps, store, fetchMock } = setup({ coolify: { deployUrl: 'http://coolify.example/api/v1/deploy?uuid=a', token: TOKEN } })
    expect(await call(deps)).toMatchObject({ status: 502, body: { status: 'failed', reason: 'invalid_deploy_url' } })
    expect(store.markFailed).toHaveBeenCalledWith(9, 'invalid_deploy_url')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('a 200 without a deployment uuid still counts as triggered; errors never carry the token', async () => {
    const empty = setup({ fetch: async () => new Response('{}', { status: 200 }) })
    expect((await call(empty.deps)).body).toMatchObject({ status: 'triggered', deploymentUuid: null })
    const refused = setup({ fetch: async () => new Response('bad token', { status: 401 }) })
    expect(JSON.stringify((await call(refused.deps)).body)).not.toContain(TOKEN)
  })

  it('500 server when the store fails', async () => {
    const { deps, store, reportError } = setup()
    store.markTriggered.mockRejectedValue(new Error('db'))
    expect(await call(deps)).toMatchObject({ status: 500, body: { error: 'server' } })
    expect(reportError).toHaveBeenCalled()
  })
})
