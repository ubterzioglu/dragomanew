import type { RequestRow, StaffMember, StaffRole } from './types'

/**
 * Mirrors the database's permission matrix (dalga2-sozlesme §5, `public.my_permissions()`) so the
 * panel only offers actions the database will allow. The database still decides: hiding a button
 * here is a convenience, never the protection.
 */
export const PERMISSIONS = [
  'requests.read',
  'requests.work',
  'requests.reassign',
  'staff.manage',
  'settings.manage',
  'content.edit',
  'content.translate',
  'content.publish',
  'forms.manage',
  'site.deploy',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const ROLE_PERMISSIONS: Readonly<Record<StaffRole, readonly Permission[]>> = {
  main_admin: PERMISSIONS,
  reservations: ['requests.read', 'requests.work'],
  accounting: ['requests.read'],
  // Publishing is per person through extra_permissions (Q1).
  content: ['content.edit', 'content.translate'],
}

export interface PermissionSubject {
  role: StaffRole
  active?: boolean
  extra_permissions?: readonly string[]
  /** The answer of `my_permissions()`; when known it replaces the role mirror entirely. */
  permissions?: readonly string[]
}

export function can(staff: PermissionSubject | null | undefined, permission: Permission): boolean {
  if (!staff || staff.active === false) return false
  if (staff.permissions) return staff.permissions.includes(permission)
  return ROLE_PERMISSIONS[staff.role].includes(permission) || (staff.extra_permissions ?? []).includes(permission)
}

const isPermission = (value: unknown): value is Permission =>
  typeof value === 'string' && (PERMISSIONS as readonly string[]).includes(value)

/** `my_permissions()` returns text[]; anything else (or unknown names) is dropped, never trusted. */
export function parsePermissions(value: unknown): Permission[] {
  return Array.isArray(value) ? value.filter(isPermission) : []
}

type RequestState = Pick<RequestRow, 'status' | 'assignee_id'>
type Actor = PermissionSubject & { id: string }

export function canClaim(staff: Actor | null, request: RequestState): boolean {
  return request.status === 'pending' && can(staff, 'requests.work')
}

/** Only the current assignee, who must be able to work requests (hand_over_request checks both). */
export function canHandOver(staff: Actor | null, request: RequestState): boolean {
  return (
    request.status === 'in_progress' && staff !== null && request.assignee_id === staff.id && can(staff, 'requests.work')
  )
}

export function canReassign(staff: Actor | null, request: RequestState): boolean {
  return request.status === 'in_progress' && can(staff, 'requests.reassign')
}

/**
 * People a request can go to: active staff whose role can work requests (private.assert_assignable),
 * minus the current assignee. Others' extra permissions are not readable, so the role decides.
 */
export function handoverCandidates(people: readonly StaffMember[], request: RequestState): StaffMember[] {
  return people.filter(
    (person) => person.active && person.id !== request.assignee_id && can(person, 'requests.work'),
  )
}
