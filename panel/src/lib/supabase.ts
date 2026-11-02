import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readPanelConfig } from './env'

const config = readPanelConfig(import.meta.env)

/** Names of missing settings, shown on a setup screen instead of a broken panel. */
export const configProblem: readonly string[] | null = config.ok ? null : config.missing

/**
 * PKCE keeps the OAuth and magic-link code exchange in this browser; the session lives in
 * localStorage under the panel's own origin path.
 */
const client: SupabaseClient | null = config.ok
  ? createClient(config.url, config.key, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

/** The client; main.tsx renders the setup screen first when the config is missing. */
export function db(): SupabaseClient {
  if (!client) throw new Error('Supabase is not configured')
  return client
}
