import { serviceClient } from '../_shared/auth/supabase.ts'
import { env, logError, requiredEnv, secretKey } from '../_shared/http/env.ts'
import { handleSiteDeploy } from './handler.ts'
import { createDeployStore } from './store.ts'

/**
 * Thin Deno entry for site-deploy. verify_jwt is off: pg_net calls it with x-dispatch-secret
 * (Vault deploy_dispatch_secret = DEPLOY_DISPATCH_SECRET), checked in handler.ts.
 */

const dispatchSecret = env('DEPLOY_DISPATCH_SECRET')
if (!dispatchSecret) console.error('site-deploy: DEPLOY_DISPATCH_SECRET is not set; every call gets 401')

const deps = {
  store: createDeployStore(serviceClient(requiredEnv('SUPABASE_URL'), secretKey())),
  coolify: { deployUrl: env('COOLIFY_DEPLOY_URL'), token: env('COOLIFY_API_TOKEN') },
  dispatchSecret,
  clock: () => new Date(),
  reportError: logError,
}

Deno.serve((request) => handleSiteDeploy(request, deps))
