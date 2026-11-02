/**
 * Supabase Auth sends a refused Google sign-in back to the redirect URL with `error`,
 * `error_code` and `error_description` in the query (PKCE) or the hash. The before_user_created
 * hook refuses addresses without an active staff row. The raw text is never shown: it is English
 * or technical, and it is part of the URL, so anyone could craft it.
 */

import { knownErrorMessage, STAFF_HOOK_TEXT } from '../lib/errors'

const ERROR_KEYS = ['error', 'error_code', 'error_description'] as const

/** Codes that mean "this address is not a staff address"; the hook's own text is matched too. */
const NOT_STAFF_CODES: ReadonlySet<string> = new Set(['signup_disabled', 'user_not_found', 'user_banned'])

export const CALLBACK_NOT_STAFF =
  'Bu Google hesabının e-posta adresi kayıtlı bir Dragoman çalışanına ait değil. Doğru hesapla girdiğinizden emin olun ya da ana yöneticiye başvurun.'
export const CALLBACK_GENERAL =
  'Google ile giriş tamamlanamadı. Panel yalnızca kayıtlı Dragoman çalışanlarının adresleriyle açılır; tekrar deneyin, sorun sürerse ana yöneticiye başvurun.'
export const CALLBACK_PROVIDER_OFF = 'Google girişi henüz açılmadı; yöneticiye haber verin.'

/**
 * While the Google provider is off on the hosted project, /authorize comes back with
 * error_code=validation_failed and this description; the generic validation text would mislead.
 */
const PROVIDER_OFF_TEXT = 'provider is not enabled'

const isProviderOff = (code: string, description: string): boolean =>
  code === 'provider_disabled' || (code === 'validation_failed' && description.toLowerCase().includes(PROVIDER_OFF_TEXT))

const paramsOf = (part: string): URLSearchParams => new URLSearchParams(part.replace(/^[?#]/, ''))

function readError(search: string, hash: string): Map<string, string> | null {
  const found = new Map<string, string>()
  for (const params of [paramsOf(search), paramsOf(hash)]) {
    for (const key of ERROR_KEYS) {
      const value = params.get(key)
      if (value !== null && !found.has(key)) found.set(key, value)
    }
  }
  return found.size > 0 ? found : null
}

/** A friendly Turkish message for the sign-in error in this address, or null when there is none. */
export function callbackErrorMessage(search: string, hash: string): string | null {
  const error = readError(search, hash)
  if (!error) return null
  const code = error.get('error_code') ?? ''
  const description = error.get('error_description') ?? ''
  if (NOT_STAFF_CODES.has(code) || description.includes(STAFF_HOOK_TEXT)) return CALLBACK_NOT_STAFF
  if (isProviderOff(code, description)) return CALLBACK_PROVIDER_OFF
  // A known code (e.g. otp_expired from an old dev e-mail link) has a fixed text of its own.
  return knownErrorMessage(code) ?? CALLBACK_GENERAL
}

/**
 * The gate redirects to the sign-in page, which would drop the error. This keeps only the error
 * fields of the query and the hash, so nothing else of the old address travels along.
 */
export function carryCallbackError(search: string, hash: string): { search: string; hash: string } {
  const keep = (part: string, prefix: '?' | '#'): string => {
    const params = paramsOf(part)
    const kept = new URLSearchParams(
      ERROR_KEYS.flatMap((key) => {
        const value = params.get(key)
        return value === null ? [] : [[key, value] as [string, string]]
      }),
    ).toString()
    return kept ? `${prefix}${kept}` : ''
  }
  return { search: keep(search, '?'), hash: keep(hash, '#') }
}
