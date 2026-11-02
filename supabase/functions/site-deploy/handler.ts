import { secretsEqual } from '../_shared/auth/secret.ts'
import { triggerCoolifyDeploy } from '../_shared/coolify/deploy.ts'
import { failure, jsonResponse, readLimitedText } from '../_shared/http/http.ts'
import type { SiteDeployDeps } from './types.ts'

/**
 * site-deploy (dalga2-sozlesme §6): called by private.dispatch_site_deploy through pg_net with
 * `x-dispatch-secret`. Without Coolify settings the row ends `skipped / not_configured` (the
 * local default); otherwise the Deploy Webhook is called once. A 200 marks the row `triggered`;
 * anything else re-queues it (2 then 5 minutes later) until the third attempt, which ends
 * `failed`. Body: optional `{ "deployId": <site_deploys.id> }`.
 */

/** The contract's 3-attempt cap: attempts 1 and 2 are re-queued after these delays, the 3rd failure is final. */
export const MAX_ATTEMPTS = 3
export const RETRY_DELAYS_MIN = [2, 5] as const

export async function handleSiteDeploy(request: Request, deps: SiteDeployDeps): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse(405, failure('method_not_allowed'), { allow: 'POST' })
  if (!(await secretsEqual(request.headers.get('x-dispatch-secret'), deps.dispatchSecret))) return jsonResponse(401, failure('unauthorized'))

  const deployId = await readDeployId(request)
  if (deployId === undefined) return jsonResponse(400, failure('bad_request'))

  try {
    const row = await deps.store.findSending(deployId)
    if (!row) return jsonResponse(404, failure('not_found'))

    const result = await triggerCoolifyDeploy(deps.coolify, deps.fetch)
    switch (result.status) {
      case 'not_configured':
        await deps.store.markSkipped(row.id, 'not_configured')
        return jsonResponse(200, { ok: true, status: 'skipped', reason: 'not_configured' })
      case 'invalid_url':
        await deps.store.markFailed(row.id, 'invalid_deploy_url')
        return jsonResponse(502, failure('deploy_failed', { status: 'failed', reason: 'invalid_deploy_url' }))
      case 'triggered':
        await deps.store.markTriggered(row.id, result.deploymentUuid)
        return jsonResponse(200, { ok: true, status: 'triggered', deploymentUuid: result.deploymentUuid })
      case 'failed': {
        const delay = row.attempts < MAX_ATTEMPTS ? RETRY_DELAYS_MIN[row.attempts - 1] : undefined
        if (delay === undefined) {
          await deps.store.markFailed(row.id, result.error)
          return jsonResponse(502, failure('deploy_failed', { status: 'failed', reason: result.error }))
        }
        const notBefore = new Date(deps.clock().getTime() + delay * 60_000)
        await deps.store.requeue(row.id, result.error, notBefore)
        return jsonResponse(502, failure('deploy_failed', { status: 'queued', reason: result.error, notBefore: notBefore.toISOString() }))
      }
    }
  } catch (error) {
    deps.reportError?.('site-deploy', error)
    return jsonResponse(500, failure('server'))
  }
}

/** null = no id given; undefined = a body that is not `{}` / `{ deployId: positive int }`. */
async function readDeployId(request: Request): Promise<number | null | undefined> {
  const raw = await readLimitedText(request, 4096)
  if (raw === null) return undefined
  if (raw.trim() === '') return null
  try {
    const body = JSON.parse(raw) as unknown
    if (typeof body !== 'object' || body === null || Array.isArray(body)) return undefined
    const id = (body as Record<string, unknown>).deployId
    if (id === undefined || id === null) return null
    return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : undefined
  } catch {
    return undefined
  }
}
