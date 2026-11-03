import { z } from 'zod'
import { authorizeStaff } from '../_shared/auth/staff.ts'
import { corsFor, failure, jsonResponse, readJsonBody } from '../_shared/http/http.ts'
import { temporaryPassword } from './password.ts'
import type { StaffAccountDeps } from './types.ts'

/**
 * staff-account: a main admin (staff.manage) issues a temporary password for another active staff
 * member from Kullanıcılar. Without an Auth account one is created with the address confirmed
 * (confirmed_email() needs that); otherwise its password is replaced, which also ends that
 * account's open sessions. Auth's admin API skips the before_user_created hook, so the active
 * check here is the only gate on creating the account.
 * The row is flagged so the panel sends the person to the Şifre screen first. The password is in
 * this one response only: never stored by us, never logged. Body: `{ "staffId": <uuid> }`.
 */

const bodySchema = z.object({ staffId: z.uuid() })

export async function handleStaffAccount(request: Request, deps: StaffAccountDeps): Promise<Response> {
  const cors = corsFor(request.headers.get('origin'), deps.allowedOrigins)
  if (cors === false) return jsonResponse(403, failure('forbidden'))
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (request.method !== 'POST') return jsonResponse(405, failure('bad_request'), { ...cors, allow: 'POST, OPTIONS' })
  const reply = (status: number, body: unknown) => jsonResponse(status, body, cors)

  try {
    const auth = await authorizeStaff(request, deps.auth, 'staff.manage')
    if (!auth.ok) return reply(auth.status, failure(auth.error))

    const raw = await readJsonBody(request)
    if (!raw.ok) return reply(raw.reason === 'too_large' ? 413 : 400, failure('bad_request'))
    const body = bodySchema.safeParse(raw.value)
    if (!body.success) return reply(400, failure('bad_request'))
    // Lower-case, as Postgres prints uuids: an upper-case copy of your own id must not slip past.
    const staffId = body.data.staffId.toLowerCase()

    // The users page locks your own row; changing your own password is the Şifre screen's job.
    if (staffId === auth.caller.staffId) return reply(409, failure('own_account'))

    const target = await deps.store.findTarget(staffId)
    if (!target) return reply(404, failure('not_found'))
    if (!target.active) return reply(409, failure('inactive'))

    const password = temporaryPassword(deps.random)
    let created = false
    if (target.authUserId) {
      await deps.store.setPassword(target.authUserId, password)
    } else {
      // An Auth account with this address that another staff row is bound to (staff_auth_user_id skips it).
      if ((await deps.store.createAccount(target.email, password)) === 'exists') return reply(409, failure('account_exists'))
      created = true
    }
    await deps.store.markIssued(target.id, auth.caller.staffId, deps.clock())
    return reply(200, { ok: true, password, created, email: target.email })
  } catch (error) {
    deps.reportError?.('staff-account', error)
    return reply(500, failure('server'))
  }
}
