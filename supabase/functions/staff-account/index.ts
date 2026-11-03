import { createStaffVerifier, serviceClient } from '../_shared/auth/supabase.ts'
import { allowedOrigins, logError, publishableKeys, requiredEnv, secretKey } from '../_shared/http/env.ts'
import { handleStaffAccount } from './handler.ts'
import { createStaffAccountStore } from './store.ts'

/**
 * Thin Deno entry for staff-account. verify_jwt is off; handler.ts checks the staff session
 * (signed-in token + staff.manage). The secret key is needed for the Auth admin calls and never
 * leaves the server.
 */

const url = requiredEnv('SUPABASE_URL')
const [publishableKey] = publishableKeys()
if (!publishableKey) throw new Error('SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) is not set')
const service = serviceClient(url, secretKey())
const origins = allowedOrigins()
if (origins.length === 0) console.error('staff-account: ALLOWED_ORIGINS is empty; every browser call gets 403')

const deps = {
  store: createStaffAccountStore(service),
  auth: createStaffVerifier(url, publishableKey, service),
  allowedOrigins: origins,
  clock: () => new Date(),
  reportError: logError,
}

Deno.serve((request) => handleStaffAccount(request, deps))
