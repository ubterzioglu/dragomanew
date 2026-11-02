const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** `link_staff_account()` returns the staff id, or null when the account is not active staff. */
export function parseLinkedStaffId(data: unknown): string | null {
  return typeof data === 'string' && UUID.test(data) ? data : null
}
