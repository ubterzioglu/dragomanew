/**
 * Row shapes the panel reads, mirroring the Dalga 1 tables (supabase/migrations). Kept local so the
 * panel builds on its own; enum values match the database enums exactly.
 */

export const REQUEST_STATUSES = ['pending', 'in_progress'] as const
export const STAFF_ROLES = ['main_admin', 'reservations', 'accounting', 'content'] as const

export type RequestStatus = (typeof REQUEST_STATUSES)[number]
export type StaffRole = (typeof STAFF_ROLES)[number]
export type RequestKind = 'event' | 'transport' | 'lodging' | 'contact'
export type SiteLocale = 'tr' | 'en' | 'fr' | 'de'
export type ActivityAction = 'created' | 'claimed' | 'reassigned' | 'handed_over'

/** The columns every active staff member may read (needed for names and the hand-over list). */
export interface StaffMember {
  id: string
  full_name: string
  role: StaffRole
  active: boolean
}

/** What main_admin sees on the users page: a row of `list_staff_members()`. */
export interface StaffAdminRow extends StaffMember {
  email: string
  extra_permissions: readonly string[]
  /** The Google account is bound (first sign-in done). */
  linked: boolean
  created_at: string
  updated_at: string
}

/** The signed-in staff member; `extra_permissions` is only known when the row could be read. */
export interface CurrentStaff extends StaffMember {
  extra_permissions?: readonly string[]
}

export interface RequestRow {
  id: string
  reference: string
  kind: RequestKind
  status: RequestStatus
  locale: SiteLocale
  full_name: string
  email: string
  phone: string | null
  event_id: string | null
  assignee_id: string | null
  claimed_at: string | null
  created_at: string
}

export interface RequestDetail extends RequestRow {
  payload: unknown
  event_snapshot: unknown
  price_summary: unknown
  updated_at: string
  /** Published form version the request was sent with (Dalga 2); null or absent for the built-in form. */
  form_version?: number | null
}

export interface ActivityRow {
  id: number
  request_id: string
  actor_id: string | null
  action: ActivityAction
  from_staff: string | null
  to_staff: string | null
  created_at: string
}

export const isStaffRole = (value: unknown): value is StaffRole =>
  typeof value === 'string' && (STAFF_ROLES as readonly string[]).includes(value)
