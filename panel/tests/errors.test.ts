import { describe, expect, it } from 'vitest'
import { friendlyError } from '../src/lib/errors'

describe('friendlyError', () => {
  it('maps database permission errors', () => {
    expect(friendlyError({ code: '42501', message: 'permission denied for table requests' })).toBe(
      'Bu işlem için yetkiniz yok.',
    )
  })

  it('maps a duplicate staff e-mail', () => {
    expect(friendlyError({ code: '23505', message: 'duplicate key value violates unique constraint' })).toBe(
      'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.',
    )
  })

  it('maps auth error codes', () => {
    expect(friendlyError({ name: 'AuthApiError', code: 'mfa_verification_failed', message: 'Invalid TOTP code' })).toBe(
      'Kod hatalı ya da süresi geçmiş. Uygulamadaki güncel kodu girin.',
    )
    expect(friendlyError({ code: 'over_email_send_rate_limit', message: 'x' })).toContain('Çok fazla deneme')
    expect(friendlyError({ code: 'otp_expired', message: 'x' })).toContain('süresi')
  })

  it('reads the staff hook refusal from its own message, whatever code Auth wraps it in', () => {
    const hookText = 'Bu e-posta adresi Dragoman personeli olarak kayıtlı değil.'
    expect(friendlyError({ name: 'AuthApiError', code: 'unexpected_failure', message: hookText })).toBe(
      'Bu e-posta adresi panel kullanıcısı olarak kayıtlı değil.',
    )
    expect(friendlyError({ message: hookText })).toBe('Bu e-posta adresi panel kullanıcısı olarak kayıtlı değil.')
  })

  it('reports a broken sign-in hook as a setup fault, never as an unregistered address', () => {
    for (const code of ['hook_timeout', 'hook_timeout_after_retry', 'hook_payload_over_size_limit']) {
      const text = friendlyError({ code, message: 'x' })
      expect(text).toContain('yöneticiye')
      expect(text).not.toContain('kayıtlı değil')
    }
    // Not an Auth code (absent from GoTrue v2.197); must not claim the address is unregistered.
    expect(friendlyError({ code: 'hook_payload_invalid_content_type', message: 'x' })).not.toContain('kayıtlı değil')
  })

  it('explains the AAL2 guard on adding or removing a second factor', () => {
    expect(friendlyError({ code: 'insufficient_aal', message: 'AAL2 required to enroll a new factor' })).toContain(
      'doğrulama kodu',
    )
  })

  it('maps network failures', () => {
    expect(friendlyError(new TypeError('Failed to fetch'))).toBe(
      'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
    )
  })

  it('maps refused request actions raised by the workflow RPCs', () => {
    expect(friendlyError({ code: '55000', message: 'request is already in progress' })).toBe(
      'Bu talep bu arada işleme alınmış. Listeyi yenileyip tekrar bakın.',
    )
    expect(friendlyError({ code: 'P0002', message: 'request not found' })).toBe('Talep bulunamadı.')
    expect(friendlyError({ code: '22023', message: 'target must be active staff who can work requests' })).toBe(
      'Talep bu kişiye verilemiyor: kişi etkin olmalı, talepler üzerinde çalışabilmeli ve talep zaten onda olmamalı.',
    )
    expect(friendlyError({ code: 'P0001', message: 'x' })).toBe(
      'İşlem yapılamadı; talep bu arada değişmiş olabilir. Listeyi yenileyip tekrar deneyin.',
    )
  })

  it('explains the last main_admin guard apart from other check failures', () => {
    expect(
      friendlyError({ code: '23514', message: 'the last active main_admin cannot be demoted or deactivated' }),
    ).toBe('Son etkin ana yönetici pasifleştirilemez ya da rolü değiştirilemez.')
    expect(friendlyError({ code: '23514', message: 'new row violates check constraint' })).toBe(
      'Girilen değerlerden biri geçerli değil.',
    )
  })

  it('never shows raw error text for anything else', () => {
    const text = friendlyError(new Error('relation "secret_table" does not exist'))
    expect(text).toBe('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.')
    expect(friendlyError(undefined)).toBe('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.')
  })

  it('always returns a string, even for codes that match Object.prototype keys', () => {
    expect(friendlyError({ code: 'toString', message: 'x' })).toBe('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.')
    expect(friendlyError({ code: 'constructor', message: 'x' })).toBe(
      'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
    )
  })
})
