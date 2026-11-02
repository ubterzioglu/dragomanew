import { isStaffRole, type StaffRole } from './types'

export interface NewStaffInput {
  email: string
  fullName: string
  role: string
}

export interface NewStaffRow {
  email: string
  full_name: string
  role: StaffRole
}

export type NewStaffErrors = Partial<Record<keyof NewStaffInput, string>>

export type NewStaffResult = { ok: true; value: NewStaffRow } | { ok: false; errors: NewStaffErrors }

/** Loose shape check only; the address is proven when the person signs in with Google. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The table keeps e-mails lower-case (a check constraint), so normalise before insert. */
export function validateNewStaff(input: NewStaffInput): NewStaffResult {
  const email = input.email.trim().toLowerCase()
  const fullName = input.fullName.trim()
  const errors: NewStaffErrors = {
    ...(EMAIL.test(email) ? {} : { email: 'Geçerli bir e-posta adresi girin.' }),
    ...(fullName ? {} : { fullName: 'Ad soyad gerekli.' }),
    ...(isStaffRole(input.role) ? {} : { role: 'Bir rol seçin.' }),
  }
  if (Object.keys(errors).length > 0 || !isStaffRole(input.role)) return { ok: false, errors }
  return { ok: true, value: { email, full_name: fullName, role: input.role } }
}
