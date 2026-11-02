import { createStaffVerifier, serviceClient } from '../_shared/auth/supabase.ts'
import { createDeeplClient } from '../_shared/deepl/client.ts'
import { allowedOrigins, env, logError, publishableKeys, requiredEnv, secretKey } from '../_shared/http/env.ts'
import { handleTranslate } from './handler.ts'
import { createTranslateStore } from './store.ts'

/**
 * Thin Deno entry for translate-content. verify_jwt is off; handler.ts checks the staff session
 * (signed-in token + content.translate). DEEPL_API_KEY is a function secret and never leaves the server.
 */

const url = requiredEnv('SUPABASE_URL')
const [publishableKey] = publishableKeys()
if (!publishableKey) throw new Error('SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) is not set')
const service = serviceClient(url, secretKey())
const origins = allowedOrigins()
if (origins.length === 0) console.error('translate-content: ALLOWED_ORIGINS is empty; every browser call gets 403')
const apiKey = env('DEEPL_API_KEY')
// Without a key every DeepL call answers 403, which the handler reports as deepl_auth.
if (!apiKey) console.error('translate-content: DEEPL_API_KEY is not set')

const deps = {
  store: createTranslateStore(service),
  auth: createStaffVerifier(url, publishableKey, service),
  deepl: createDeeplClient({ apiKey: apiKey ?? '' }),
  allowedOrigins: origins,
  clock: () => new Date(),
  reportError: logError,
}

Deno.serve((request) => handleTranslate(request, deps))
