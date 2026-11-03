import { contentErrorMessage, FunctionCallError } from './content/messages'
import { formatDateTime } from './format'

/** The staff-account Edge Function's answer: shown once on screen, never stored. */
export interface IssuedPassword {
  password: string
  email: string
  /** True when the sign-in account was opened just now; false when its password was replaced. */
  created: boolean
}

const MESSAGES: Readonly<Record<string, string>> = {
  own_account: 'Kendi şifrenizi Şifre ekranından değiştirin.',
  inactive: 'Pasif bir kullanıcıya şifre verilemez. Önce Etkinleştir ile açın.',
  account_exists: 'Bu adresle açılmış bir giriş hesabı başka bir kullanıcıya bağlı. Geliştiriciye haber verin.',
  not_found: 'Kullanıcı bulunamadı. Sayfayı yenileyip tekrar deneyin.',
}

export function staffAccountErrorMessage(error: unknown): string {
  if (error instanceof FunctionCallError) {
    const own = MESSAGES[error.code]
    if (own) return own
  }
  return contentErrorMessage(error)
}

/** Shape check of the function's 200 body; null when it is not what the screen can show. */
export function parseIssuedPassword(value: unknown): IssuedPassword | null {
  if (typeof value !== 'object' || value === null) return null
  const { password, email, created } = value as Record<string, unknown>
  if (typeof password !== 'string' || password === '' || typeof email !== 'string' || typeof created !== 'boolean') return null
  return { password, email, created }
}

interface TempPasswordState {
  password_change_required: boolean
  temp_password_issued_at: string | null
}

/** The line under the account status while a temporary password waits to be replaced. */
export function tempPasswordNote(row: TempPasswordState): string | null {
  if (!row.password_change_required) return null
  return row.temp_password_issued_at ? `Geçici şifre verildi: ${formatDateTime(row.temp_password_issued_at)}` : 'Geçici şifre verildi'
}
