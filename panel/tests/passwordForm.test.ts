import { describe, expect, it } from 'vitest'
import { MIN_PASSWORD_LENGTH, validateNewPassword, validateSignIn } from '../src/lib/passwordForm'

describe('validateSignIn', () => {
  it('trims and lower-cases the e-mail, and keeps the password exactly as typed', () => {
    expect(validateSignIn({ email: '  Ali@Example.COM ', password: ' gizli şifre ' })).toEqual({
      ok: true,
      value: { email: 'ali@example.com', password: ' gizli şifre ' },
    })
  })

  it('reports a bad address and a missing password in Turkish', () => {
    expect(validateSignIn({ email: 'not-an-email', password: '' })).toEqual({
      ok: false,
      errors: { email: 'Geçerli bir e-posta adresi girin.', password: 'Şifrenizi girin.' },
    })
    expect(validateSignIn({ email: '', password: 'x' })).toEqual({
      ok: false,
      errors: { email: 'Geçerli bir e-posta adresi girin.' },
    })
  })
})

describe('validateNewPassword', () => {
  const strong = 'uzun-bir-sifre-42'

  it('accepts a long enough password typed twice', () => {
    expect(validateNewPassword({ password: strong, confirm: strong })).toEqual({ ok: true, value: strong })
  })

  it('asks for at least 12 characters, counting characters rather than UTF-16 units', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(12)
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1)
    expect(validateNewPassword({ password: short, confirm: short })).toEqual({
      ok: false,
      errors: { password: 'Şifre en az 12 karakter olmalı.' },
    })
    const emoji = '🔑'.repeat(MIN_PASSWORD_LENGTH - 1)
    expect(validateNewPassword({ password: emoji, confirm: emoji }).ok).toBe(false)
    const exact = 'ş'.repeat(MIN_PASSWORD_LENGTH)
    expect(validateNewPassword({ password: exact, confirm: exact })).toEqual({ ok: true, value: exact })
  })

  it('refuses a password of spaces only', () => {
    const spaces = ' '.repeat(MIN_PASSWORD_LENGTH)
    expect(validateNewPassword({ password: spaces, confirm: spaces })).toEqual({
      ok: false,
      errors: { password: 'Şifre yalnızca boşluktan oluşamaz.' },
    })
  })

  it('refuses a confirmation that does not match', () => {
    expect(validateNewPassword({ password: strong, confirm: `${strong}x` })).toEqual({
      ok: false,
      errors: { confirm: 'Şifreler aynı değil.' },
    })
  })
})
