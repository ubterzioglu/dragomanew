/**
 * Where the signed-in person may be. The account is linked to its staff row first, then the
 * staff row is read. Any signed-in session (Google or e-mail + password, aal1) is enough: staff
 * need no second factor since 2026-11-02, and every query is still checked by the database.
 */

export type Lookup = 'unknown' | 'ready' | 'missing' | 'error'

export interface GateInput {
  loading: boolean
  signedIn: boolean
  /** link_staff_account(): ready = active staff, missing = not staff. */
  link: Lookup
  /** The caller's own staff row. */
  staff: Lookup
}

export type Gate = 'loading' | 'sign_in' | 'not_staff' | 'error' | 'ready'

const settled = (lookup: Lookup): Gate | null => {
  if (lookup === 'unknown') return 'loading'
  if (lookup === 'missing') return 'not_staff'
  if (lookup === 'error') return 'error'
  return null
}

export function gateFor({ loading, signedIn, link, staff }: GateInput): Gate {
  if (loading) return 'loading'
  if (!signedIn) return 'sign_in'
  return settled(link) ?? settled(staff) ?? 'ready'
}

export const SIGN_IN_PATH = '/giris'
export const HOME_PATH = '/'
export const PASSWORD_PATH = '/sifre'

/**
 * Someone who signed in with a temporary password sets their own first: every other screen sends
 * them to Şifre. A guide, not a guard: the database still checks every query.
 */
export function passwordRedirect(mustChange: boolean, pathname: string): string | null {
  return mustChange && pathname !== PASSWORD_PATH ? PASSWORD_PATH : null
}

export interface GateNotice {
  title: string
  text: string
  /** A failed lookup can be retried; a refused account cannot. */
  canRetry: boolean
}

/**
 * link_staff_account() returns null both for addresses without an active staff row and for an
 * account whose e-mail is not confirmed yet, so the text names both causes.
 */
const NOT_STAFF: GateNotice = {
  title: 'Erişim yok',
  text: 'Bu hesapla panele girilemiyor: e-posta adresi etkin bir panel kullanıcısına ait değil ya da henüz doğrulanmamış. Kayıtlı hesabınızla yeniden giriş yapın; sorun sürerse ana yöneticiye başvurun.',
  canRetry: false,
}

/** What the shell shows for gates that render no page; null for the gates that do. */
export function gateNotice(gate: Gate, staffError: string | null): GateNotice | null {
  if (gate === 'not_staff') return NOT_STAFF
  if (gate === 'error') {
    return { title: 'Bir sorun oluştu', text: staffError ?? 'Kullanıcı bilgileri yüklenemedi.', canRetry: true }
  }
  return null
}

/** The path to move to for this gate, or null to stay. Router paths are relative to /panel. */
export function redirectFor(gate: Gate, pathname: string): string | null {
  if (gate === 'sign_in') return pathname === SIGN_IN_PATH ? null : SIGN_IN_PATH
  if (gate === 'ready') return pathname === SIGN_IN_PATH ? HOME_PATH : null
  return null
}
