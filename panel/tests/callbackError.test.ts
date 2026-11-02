import { describe, expect, it } from 'vitest'
import {
  CALLBACK_GENERAL,
  CALLBACK_NOT_STAFF,
  CALLBACK_PROVIDER_OFF,
  callbackErrorMessage,
  carryCallbackError,
} from '../src/auth/callbackError'

const HOOK_TEXT = 'Bu e-posta adresi Dragoman personeli olarak kayıtlı değil.'

describe('callbackErrorMessage', () => {
  it('is null when the address carries no sign-in error', () => {
    expect(callbackErrorMessage('', '')).toBeNull()
    expect(callbackErrorMessage('?sekme=mine', '#main')).toBeNull()
  })

  it('explains a refused staff address, from the query (PKCE) or the hash', () => {
    const query = new URLSearchParams({ error: 'access_denied', error_code: 'unexpected_failure', error_description: HOOK_TEXT })
    expect(callbackErrorMessage(`?${query.toString()}`, '')).toBe(CALLBACK_NOT_STAFF)
    expect(callbackErrorMessage('', `#${query.toString()}`)).toBe(CALLBACK_NOT_STAFF)
    expect(callbackErrorMessage('?error=access_denied&error_code=signup_disabled', '')).toBe(CALLBACK_NOT_STAFF)
  })

  it('names an expired e-mail link (dev login) instead of blaming Google', () => {
    const hash = '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'
    expect(callbackErrorMessage('', hash)).toBe('Kodun ya da bağlantının süresi dolmuş. Yeni bir tane isteyin.')
  })

  it('says Google sign-in is not open yet while the provider is disabled on the project', () => {
    const query = new URLSearchParams({
      error: 'invalid_request',
      error_code: 'validation_failed',
      error_description: 'Unsupported provider: provider is not enabled',
    })
    expect(callbackErrorMessage(`?${query.toString()}`, '')).toBe(CALLBACK_PROVIDER_OFF)
    expect(callbackErrorMessage('', `#${query.toString()}`)).toBe(CALLBACK_PROVIDER_OFF)
    expect(callbackErrorMessage('?error_code=provider_disabled', '')).toBe(CALLBACK_PROVIDER_OFF)
    // Other validation failures keep the generic validation text.
    expect(callbackErrorMessage('?error_code=validation_failed&error_description=Bad+redirect', '')).toBe(
      'Girilen değerlerden biri geçerli değil.',
    )
  })

  it('gives a general message for anything else, such as a cancelled Google screen', () => {
    expect(callbackErrorMessage('?error=access_denied&error_description=User+denied', '')).toBe(CALLBACK_GENERAL)
    expect(callbackErrorMessage('?error_code=bad_oauth_state', '')).toBe(CALLBACK_GENERAL)
  })

  it('never shows the raw error text', () => {
    const message = callbackErrorMessage('?error=server_error&error_description=%3Cscript%3Ealert(1)%3C%2Fscript%3E', '')
    expect(message).toBe(CALLBACK_GENERAL)
    expect(message).not.toContain('script')
  })
})

describe('carryCallbackError', () => {
  it('keeps only the sign-in error fields when the gate sends people to the sign-in page', () => {
    expect(carryCallbackError('?error=access_denied&sekme=mine', '#error_code=signup_disabled&x=1')).toEqual({
      search: '?error=access_denied',
      hash: '#error_code=signup_disabled',
    })
  })

  it('carries nothing when there is no error', () => {
    expect(carryCallbackError('?sekme=mine&talep=1', '')).toEqual({ search: '', hash: '' })
  })
})
