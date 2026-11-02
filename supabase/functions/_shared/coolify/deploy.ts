/**
 * Coolify Deploy Webhook call (dalga2-sozlesme §6 site-deploy): `POST <COOLIFY_DEPLOY_URL>`
 * (`…/api/v1/deploy?uuid=…&force=false`, https only) with `Authorization: Bearer <token>` and a
 * 15 s timeout. `force` is always rewritten to `false`, so a misconfigured URL can never start a
 * cache-less rebuild. The token never appears in a result or an error. Deno-free.
 */

export const COOLIFY_TIMEOUT_MS = 15_000

export interface CoolifyConfig {
  deployUrl: string | null
  token: string | null
}

export type CoolifyResult =
  | { status: 'not_configured' }
  /** The URL is not https (or not a URL): a setting to fix, not worth retrying. */
  | { status: 'invalid_url' }
  | { status: 'triggered'; deploymentUuid: string | null }
  | { status: 'failed'; error: string }

/** The webhook URL with `force=false`, or null when it is not an https URL. */
export function deployUrl(raw: string): string | null {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  url.searchParams.set('force', 'false')
  return url.toString()
}

export async function triggerCoolifyDeploy(config: CoolifyConfig, doFetch: typeof fetch = fetch, timeoutMs = COOLIFY_TIMEOUT_MS): Promise<CoolifyResult> {
  if (!config.deployUrl || !config.token) return { status: 'not_configured' }
  const url = deployUrl(config.deployUrl)
  if (!url) return { status: 'invalid_url' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await doFetch(url, { method: 'POST', headers: { authorization: `Bearer ${config.token}`, accept: 'application/json' }, signal: controller.signal })
    if (response.status !== 200) {
      await response.body?.cancel().catch(() => undefined)
      return { status: 'failed', error: `http_${response.status}` }
    }
    const data = (await response.json().catch(() => null)) as { deployments?: Array<{ deployment_uuid?: unknown }> } | null
    const uuid = data?.deployments?.[0]?.deployment_uuid
    return { status: 'triggered', deploymentUuid: typeof uuid === 'string' ? uuid : null }
  } catch (error) {
    return { status: 'failed', error: controller.signal.aborted ? 'timeout' : `network: ${error instanceof Error ? error.name : 'error'}` }
  } finally {
    clearTimeout(timer)
  }
}
