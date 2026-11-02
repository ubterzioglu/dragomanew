import type { CoolifyConfig } from '../_shared/coolify/deploy.ts'

/** What handleSiteDeploy needs from the outside world; everything is injected so vitest can run it. */

/** The site_deploys row pg_cron's dispatcher just moved to `sending` (attempts already counted). */
export interface SendingDeploy {
  id: number
  attempts: number
  releaseId: number | null
}

export interface DeployStore {
  /** The `sending` row with this id, or the newest `sending` row when no id is given. */
  findSending(deployId: number | null): Promise<SendingDeploy | null>
  /** status = skipped, last_error = reason. */
  markSkipped(id: number, reason: string): Promise<void>
  /** status = triggered, triggered_at = now, coolify_deployment_uuid. */
  markTriggered(id: number, deploymentUuid: string | null): Promise<void>
  /** status = queued again with not_before; falls back to failed if another row is queued already. */
  requeue(id: number, error: string, notBefore: Date): Promise<void>
  /** status = failed for good. */
  markFailed(id: number, error: string): Promise<void>
}

export interface SiteDeployDeps {
  store: DeployStore
  coolify: CoolifyConfig
  /** DEPLOY_DISPATCH_SECRET; null refuses every call. */
  dispatchSecret: string | null
  fetch?: typeof fetch
  clock: () => Date
  reportError?: (context: string, error: unknown) => void
}
