import { bearerToken } from '../http/http.ts'

/**
 * Staff authentication for the Dalga 2 functions (dalga2-sozlesme §6): Bearer token →
 * `auth.getClaims` with `aal = 'aal2'` → `rpc('my_permissions')` as that user → the permission
 * the action needs. Writes then go through the service client. Deno-free; the supabase-js side
 * lives in supabase.ts.
 */

export type Permission = 'content.edit' | 'content.translate' | 'content.publish' | 'forms.manage' | 'site.deploy'

export interface VerifiedClaims {
  /** auth.users id. */
  sub: string
  aal: string | null
}

/** What authorizeStaff needs from Supabase; the tests fake it. */
export interface StaffVerifier {
  /** Verified claims of the token, or null when it is invalid or expired. */
  claims(token: string): Promise<VerifiedClaims | null>
  /** public.my_permissions() called as the token's user (empty without active staff or AAL2). */
  permissions(token: string): Promise<readonly string[]>
  /** staff_members.id of an active staff row bound to the user, or null. */
  staffId(userId: string): Promise<string | null>
}

export interface StaffCaller {
  userId: string
  staffId: string
  permissions: readonly string[]
}

export type StaffAuth = { ok: true; caller: StaffCaller } | { ok: false; status: 401 | 403; error: 'unauthorized' | 'forbidden' }

const UNAUTHORIZED = { ok: false, status: 401, error: 'unauthorized' } as const
const FORBIDDEN = { ok: false, status: 403, error: 'forbidden' } as const

/**
 * 401 without a valid AAL2 session; 403 when the staff member lacks `permission` (any of them,
 * when a list is given). Errors from Supabase propagate (the handler answers 500).
 */
export async function authorizeStaff(request: Request, verifier: StaffVerifier, permission: Permission | readonly Permission[]): Promise<StaffAuth> {
  const token = bearerToken(request)
  if (!token) return UNAUTHORIZED
  const claims = await verifier.claims(token)
  if (!claims || claims.aal !== 'aal2') return UNAUTHORIZED

  const permissions = await verifier.permissions(token)
  const needed: readonly Permission[] = typeof permission === 'string' ? [permission] : permission
  if (!needed.some((name) => permissions.includes(name))) return FORBIDDEN

  const staffId = await verifier.staffId(claims.sub)
  if (!staffId) return FORBIDDEN
  return { ok: true, caller: { userId: claims.sub, staffId, permissions } }
}
