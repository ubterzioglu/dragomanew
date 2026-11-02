import type { SupabaseClient } from '@supabase/supabase-js'
import type { DeployStore, SendingDeploy } from './types.ts'

/** The real DeployStore on public.site_deploys with the service client. */

const UNIQUE_VIOLATION = '23505'

interface DeployRow {
  id: number
  attempts: number
  release_id: number | null
}

export function createDeployStore(db: SupabaseClient): DeployStore {
  const update = async (id: number, patch: Record<string, unknown>): Promise<void> => {
    const { error } = await db.from('site_deploys').update(patch).eq('id', id).eq('status', 'sending')
    if (error) throw error
  }

  return {
    async findSending(deployId) {
      let query = db.from('site_deploys').select('id, attempts, release_id').eq('status', 'sending')
      query = deployId === null ? query : query.eq('id', deployId)
      const { data, error } = await query.order('id', { ascending: false }).limit(1).maybeSingle<DeployRow>()
      if (error) throw error
      return data ? ({ id: data.id, attempts: data.attempts, releaseId: data.release_id } satisfies SendingDeploy) : null
    },

    markSkipped: (id, reason) => update(id, { status: 'skipped', last_error: reason }),

    markTriggered: (id, deploymentUuid) =>
      update(id, { status: 'triggered', triggered_at: new Date().toISOString(), coolify_deployment_uuid: deploymentUuid, last_error: null }),

    async requeue(id, error, notBefore) {
      const { error: dbError } = await db
        .from('site_deploys')
        .update({ status: 'queued', not_before: notBefore.toISOString(), last_error: error })
        .eq('id', id)
        .eq('status', 'sending')
      if (!dbError) return
      // A newer publish already queued its own row (one queued/sending row at most); that row
      // deploys the newer release anyway, so this one ends here.
      if (dbError.code !== UNIQUE_VIOLATION) throw dbError
      await update(id, { status: 'failed', last_error: `${error}; superseded by a queued deploy` })
    },

    markFailed: (id, error) => update(id, { status: 'failed', last_error: error }),
  }
}
