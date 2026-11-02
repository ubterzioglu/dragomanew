import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { StaffVerifier } from './staff.ts'

/**
 * supabase-js side of the staff check and the service client (Deno only). Claims are verified
 * with `auth.getClaims(token)`; permissions come from `public.my_permissions()` called with the
 * user's own token, so RLS and the AAL2 rule are the database's; the staff id is looked up with
 * the service client.
 */

const NO_SESSION = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } as const

export function serviceClient(url: string, secretKey: string): SupabaseClient {
  return createClient(url, secretKey, { auth: NO_SESSION })
}

export function createStaffVerifier(url: string, publishableKey: string, service: SupabaseClient): StaffVerifier {
  const anon = createClient(url, publishableKey, { auth: NO_SESSION })
  return {
    async claims(token) {
      const { data, error } = await anon.auth.getClaims(token)
      if (error || !data) return null
      const { sub, aal } = data.claims as { sub?: unknown; aal?: unknown }
      return typeof sub === 'string' ? { sub, aal: typeof aal === 'string' ? aal : null } : null
    },

    async permissions(token) {
      const asUser = createClient(url, publishableKey, { auth: NO_SESSION, global: { headers: { Authorization: `Bearer ${token}` } } })
      const { data, error } = await asUser.rpc('my_permissions')
      if (error) throw error
      return Array.isArray(data) ? data.filter((item): item is string => typeof item === 'string') : []
    },

    async staffId(userId) {
      const { data, error } = await service
        .from('staff_members')
        .select('id')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle<{ id: string }>()
      if (error) throw error
      return data?.id ?? null
    },
  }
}
