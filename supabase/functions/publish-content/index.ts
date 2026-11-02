import { createStaffVerifier, serviceClient } from '../_shared/auth/supabase.ts'
import { allowedOrigins, logError, publishableKeys, requiredEnv, secretKey } from '../_shared/http/env.ts'
import { handlePublish } from './handler.ts'
import { createPublishStore } from './store.ts'

/**
 * Thin Deno entry for publish-content. verify_jwt is off; handler.ts checks the staff session
 * (AAL2 + my_permissions) itself, after answering the CORS preflight.
 */

const url = requiredEnv('SUPABASE_URL')
const [publishableKey] = publishableKeys()
if (!publishableKey) throw new Error('SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) is not set')
const service = serviceClient(url, secretKey())
const origins = allowedOrigins()
if (origins.length === 0) console.error('publish-content: ALLOWED_ORIGINS is empty; every browser call gets 403')

const deps = {
  store: createPublishStore(service),
  auth: createStaffVerifier(url, publishableKey, service),
  allowedOrigins: origins,
  clock: () => new Date(),
  reportError: logError,
}

Deno.serve((request) => handlePublish(request, deps))
