import { describe, expect, it } from 'vitest'
import { passwordRedirect, PASSWORD_PATH } from '../src/auth/gate'
import { FunctionCallError } from '../src/lib/content/messages'
import { parseIssuedPassword, staffAccountErrorMessage, tempPasswordNote } from '../src/lib/staffAccount'

describe('passwordRedirect', () => {
  it('sends someone with a temporary password to the Şifre screen from anywhere else', () => {
    expect(passwordRedirect(true, '/')).toBe(PASSWORD_PATH)
    expect(passwordRedirect(true, '/talepler')).toBe(PASSWORD_PATH)
    expect(passwordRedirect(true, '/icerik/event/1')).toBe(PASSWORD_PATH)
  })

  it('lets them stay on the Şifre screen, and leaves everyone else alone', () => {
    expect(passwordRedirect(true, PASSWORD_PATH)).toBeNull()
    expect(passwordRedirect(false, '/')).toBeNull()
    expect(passwordRedirect(false, PASSWORD_PATH)).toBeNull()
  })
})

describe('staffAccountErrorMessage', () => {
  it('names the staff-account refusals in Turkish', () => {
    expect(staffAccountErrorMessage(new FunctionCallError(409, 'own_account', {}))).toContain('Şifre ekranından')
    expect(staffAccountErrorMessage(new FunctionCallError(409, 'inactive', {}))).toContain('Pasif')
    expect(staffAccountErrorMessage(new FunctionCallError(409, 'account_exists', {}))).toContain('başka bir kullanıcıya bağlı')
    expect(staffAccountErrorMessage(new FunctionCallError(404, 'not_found', {}))).toContain('bulunamadı')
  })

  it('falls back to the shared function messages', () => {
    expect(staffAccountErrorMessage(new FunctionCallError(403, 'forbidden', {}))).toBe('Bu işlem için yetkiniz yok.')
    expect(staffAccountErrorMessage(new FunctionCallError(0, 'network', {}))).toContain('Sunucuya ulaşılamadı')
  })
})

describe('parseIssuedPassword', () => {
  it('accepts the function answer', () => {
    expect(parseIssuedPassword({ ok: true, password: 'Ab2c-defg-hjk3-MNPQ', email: 'a@b.co', created: true })).toEqual({
      password: 'Ab2c-defg-hjk3-MNPQ',
      email: 'a@b.co',
      created: true,
    })
  })

  it('rejects anything else', () => {
    expect(parseIssuedPassword(null)).toBeNull()
    expect(parseIssuedPassword({ password: '', email: 'a@b.co', created: true })).toBeNull()
    expect(parseIssuedPassword({ password: 'x', email: 'a@b.co' })).toBeNull()
    expect(parseIssuedPassword('Ab2c')).toBeNull()
  })
})

describe('tempPasswordNote', () => {
  it('shows when a temporary password still waits to be replaced', () => {
    expect(tempPasswordNote({ password_change_required: true, temp_password_issued_at: '2026-11-03T10:00:00.000Z' })).toMatch(
      /^Geçici şifre verildi: 3 Kas 2026/,
    )
    expect(tempPasswordNote({ password_change_required: true, temp_password_issued_at: null })).toBe('Geçici şifre verildi')
  })

  it('says nothing once the person set their own password', () => {
    expect(tempPasswordNote({ password_change_required: false, temp_password_issued_at: '2026-11-03T10:00:00.000Z' })).toBeNull()
  })
})
