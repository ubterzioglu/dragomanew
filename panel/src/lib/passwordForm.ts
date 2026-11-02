/**
 * E-mail + password sign-in and the "set / change password" form. Validation is local and only
 * spares a round trip; Supabase Auth has the final word. There is no sign-up: accounts exist only
 * for active staff (the before_user_created hook refuses everyone else).
 */

/** The panel's minimum; the local auth config asks for the same (supabase/config.toml). */
export const MIN_PASSWORD_LENGTH = 12

/** Loose shape check only; Auth decides whether the address and password match. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface SignInInput {
  email: string
  password: string
}

export type SignInErrors = Partial<Record<keyof SignInInput, string>>

export type SignInResult = { ok: true; value: SignInInput } | { ok: false; errors: SignInErrors }

/** Trims and lower-cases the address (staff e-mails are stored that way); the password is kept as typed. */
export function validateSignIn(input: SignInInput): SignInResult {
  const email = input.email.trim().toLowerCase()
  const errors: SignInErrors = {
    ...(EMAIL.test(email) ? {} : { email: 'Geçerli bir e-posta adresi girin.' }),
    ...(input.password ? {} : { password: 'Şifrenizi girin.' }),
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { email, password: input.password } }
}

export interface NewPasswordInput {
  password: string
  confirm: string
}

export type NewPasswordErrors = Partial<Record<keyof NewPasswordInput, string>>

export type NewPasswordResult = { ok: true; value: string } | { ok: false; errors: NewPasswordErrors }

/** Length is counted in characters, not UTF-16 units, so "ş" or an emoji counts once. */
export function validateNewPassword(input: NewPasswordInput): NewPasswordResult {
  const length = [...input.password].length
  if (length < MIN_PASSWORD_LENGTH) {
    return { ok: false, errors: { password: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.` } }
  }
  if (input.password.trim() === '') return { ok: false, errors: { password: 'Şifre yalnızca boşluktan oluşamaz.' } }
  if (input.confirm !== input.password) return { ok: false, errors: { confirm: 'Şifreler aynı değil.' } }
  return { ok: true, value: input.password }
}
