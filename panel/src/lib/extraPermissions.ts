import { permissionLabel } from './labels'
import { can, PERMISSIONS, type Permission } from './permissions'
import type { StaffRole } from './types'

/**
 * Per-person permissions on top of the role (`staff_members.extra_permissions`), as the users page
 * offers them. Only permissions every screen reads from `my_permissions()`: the request screens and
 * the hand-over list go by the role alone, and staff.manage / settings.manage make an administrator,
 * which is what the main_admin role is for. Extras given another way can be taken back, not added.
 */
export interface ExtraPermissionOption {
  permission: Permission
  description: string
}

export const EXTRA_PERMISSION_OPTIONS: readonly ExtraPermissionOption[] = [
  { permission: 'revisions.use', description: 'Revizyonlar ekranında istek açar, yorum ve ekran görüntüsü ekler.' },
  { permission: 'content.edit', description: 'İçerik ve Medya ekranlarında taslakları ve fotoğrafları düzenler.' },
  { permission: 'content.translate', description: 'Taslakları DeepL ile çevirir; İçerik düzenleme ya da Formlar ile birlikte işe yarar.' },
  { permission: 'content.publish', description: 'İçeriği yayınlar, arşivler, yayından kaldırır ve sıralamayı değiştirir.' },
  { permission: 'site.deploy', description: 'Yayın ekranındaki Siteyi şimdi yeniden kur düğmesini kullanır.' },
  { permission: 'forms.manage', description: 'Talep formlarının alanlarını düzenler ve yayınlar.' },
]

const OFFERED: readonly string[] = EXTRA_PERMISSION_OPTIONS.map((option) => option.permission)

const isPermission = (value: string): value is Permission => (PERMISSIONS as readonly string[]).includes(value)

/** The role brings it already: its box shows ticked and locked. */
export function roleIncludes(role: StaffRole, permission: Permission): boolean {
  return can({ role }, permission)
}

const rank = (permission: string): number => {
  const index = (PERMISSIONS as readonly string[]).indexOf(permission)
  return index === -1 ? PERMISSIONS.length : index
}

/** Each value once, in the order of the matrix; unknown values last, as they came. */
const ordered = (values: readonly string[]): string[] => [...new Set(values)].sort((a, b) => rank(a) - rank(b))

/**
 * Extras on the row that the screen does not offer (given another way, for example in the database)
 * and the role does not bring: the dialog lists them ticked, so they can be taken back.
 */
export function grantedElsewhere(role: StaffRole, stored: readonly string[]): string[] {
  return ordered(stored.filter((value) => !OFFERED.includes(value) && !(isPermission(value) && roleIncludes(role, value))))
}

/** The values the dialog's boxes decide: the offered ones the role lacks, and grantedElsewhere. */
const decidedBy = (role: StaffRole, stored: readonly string[]): ReadonlySet<string> =>
  new Set([...OFFERED.filter((value) => isPermission(value) && !roleIncludes(role, value)), ...grantedElsewhere(role, stored)])

/** The boxes ticked when the dialog opens. */
export function initiallyTicked(role: StaffRole, stored: readonly string[]): string[] {
  const decided = decidedBy(role, stored)
  return stored.filter((value) => decided.has(value))
}

/**
 * The extra_permissions to save. A box decides its value; one the role brings stays as it was
 * stored (so a later role change keeps it), and a value without a box can never be added.
 */
export function nextExtraPermissions(role: StaffRole, stored: readonly string[], ticked: readonly string[]): string[] {
  const decided = decidedBy(role, stored)
  const kept = stored.filter((value) => !decided.has(value))
  const added = ticked.filter((value) => decided.has(value))
  return ordered([...kept, ...added])
}

/** Same permissions, whatever the order or repeats. */
export function samePermissions(left: readonly string[], right: readonly string[]): boolean {
  const a = ordered(left)
  const b = ordered(right)
  return a.length === b.length && a.every((permission, index) => permission === b[index])
}

/** "Talepler üzerinde çalışma, Yayınlama" under the role on the users page. */
export function extraPermissionSummary(extras: readonly string[]): string {
  return ordered(extras).map(permissionLabel).join(', ')
}
