import { serviceClient } from '../_shared/auth/supabase.ts'
import { logError, publishableKeys, requiredEnv, secretKey } from '../_shared/http/env.ts'
import { handleContentRelease } from './handler.ts'
import { createReleaseStore } from './store.ts'

/**
 * Thin Deno entry for content-release. verify_jwt is off: the build sends only the publishable
 * key, which handler.ts checks. The snapshot column is not granted to staff; this function reads
 * it with the service client.
 */

const keys = publishableKeys()
if (keys.length === 0) console.error('content-release: no publishable key configured; every call gets 401')

const deps = {
  store: createReleaseStore(serviceClient(requiredEnv('SUPABASE_URL'), secretKey())),
  publishableKeys: keys,
  clock: () => new Date(),
  reportError: logError,
}

Deno.serve((request) => handleContentRelease(request, deps))
