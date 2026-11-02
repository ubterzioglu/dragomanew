import { describe, expect, it } from 'vitest'
import { gateFor, gateNotice, redirectFor } from '../src/auth/gate'
import { parseLinkedStaffId } from '../src/auth/linkedStaff'
import { devEmailLoginEnabled, panelRedirectUrl, readPanelConfig } from '../src/lib/env'
import { qrImageSrc } from '../src/lib/qr'

describe('gateFor', () => {
  const base = { loading: false, signedIn: true, aal: 'aal1', link: 'ready', staff: 'unknown' } as const

  it('waits while the session is loading', () => {
    expect(gateFor({ ...base, loading: true, signedIn: false })).toBe('loading')
  })

  it('asks to sign in without a session', () => {
    expect(gateFor({ ...base, signedIn: false, link: 'unknown' })).toBe('sign_in')
  })

  it('links the account first and stops people who are not active staff before MFA', () => {
    expect(gateFor({ ...base, link: 'unknown' })).toBe('loading')
    expect(gateFor({ ...base, link: 'missing' })).toBe('not_staff')
    expect(gateFor({ ...base, link: 'error' })).toBe('error')
  })

  it('asks for the second factor until the session is aal2', () => {
    expect(gateFor(base)).toBe('mfa')
    expect(gateFor({ ...base, aal: null })).toBe('mfa')
  })

  it('waits for the staff row at aal2, then opens the panel or refuses', () => {
    expect(gateFor({ ...base, aal: 'aal2' })).toBe('loading')
    expect(gateFor({ ...base, aal: 'aal2', staff: 'ready' })).toBe('ready')
    expect(gateFor({ ...base, aal: 'aal2', staff: 'missing' })).toBe('not_staff')
    expect(gateFor({ ...base, aal: 'aal2', staff: 'error' })).toBe('error')
  })
})

describe('redirectFor', () => {
  it('sends each gate to its page', () => {
    expect(redirectFor('sign_in', '/')).toBe('/giris')
    expect(redirectFor('sign_in', '/giris')).toBeNull()
    expect(redirectFor('mfa', '/kullanicilar')).toBe('/2fa')
    expect(redirectFor('mfa', '/2fa')).toBeNull()
    expect(redirectFor('ready', '/giris')).toBe('/')
    expect(redirectFor('ready', '/2fa')).toBe('/')
    expect(redirectFor('ready', '/kullanicilar')).toBeNull()
    expect(redirectFor('loading', '/')).toBeNull()
  })
})

describe('gateNotice', () => {
  it('explains a refused link in Turkish, including an e-mail that is not confirmed yet', () => {
    const notice = gateNotice('not_staff', null)
    expect(notice?.title).toBe('Erişim yok')
    expect(notice?.text).toContain('etkin bir panel kullanıcısına')
    expect(notice?.text).toContain('doğrulanmamış')
    expect(notice?.canRetry).toBe(false)
  })

  it('shows the friendly lookup error and offers a retry', () => {
    expect(gateNotice('error', 'Sunucuya ulaşılamadı.')).toEqual({
      title: 'Bir sorun oluştu',
      text: 'Sunucuya ulaşılamadı.',
      canRetry: true,
    })
    expect(gateNotice('error', null)?.text).toBe('Kullanıcı bilgileri yüklenemedi.')
  })

  it('has nothing to say for gates that render a page', () => {
    expect(gateNotice('ready', null)).toBeNull()
    expect(gateNotice('loading', null)).toBeNull()
    expect(gateNotice('sign_in', null)).toBeNull()
    expect(gateNotice('mfa', null)).toBeNull()
  })
})

describe('parseLinkedStaffId', () => {
  const id = '8a1f6e0c-6a4e-4f7b-9d61-0c2b0f6f1a11'

  it('reads the uuid link_staff_account() returns', () => {
    expect(parseLinkedStaffId(id)).toBe(id)
  })

  it('returns null when the account is not active staff, or for anything unexpected', () => {
    expect(parseLinkedStaffId(null)).toBeNull()
    expect(parseLinkedStaffId('nope')).toBeNull()
    expect(parseLinkedStaffId({ id })).toBeNull()
  })
})

describe('panel config', () => {
  it('reads the Supabase URL and key', () => {
    expect(readPanelConfig({ VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_PUBLISHABLE_KEY: 'k' })).toEqual({
      ok: true,
      url: 'http://127.0.0.1:54321',
      key: 'k',
    })
  })

  it('names what is missing or broken', () => {
    expect(readPanelConfig({})).toEqual({ ok: false, missing: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'] })
    expect(readPanelConfig({ VITE_SUPABASE_URL: 'ftp://x', VITE_SUPABASE_PUBLISHABLE_KEY: 'k' })).toEqual({
      ok: false,
      missing: ['VITE_SUPABASE_URL'],
    })
  })

  it('shows the e-mail login only in dev with the flag on', () => {
    expect(devEmailLoginEnabled({ DEV: true, VITE_PANEL_DEV_EMAIL_LOGIN: 'true' })).toBe(true)
    expect(devEmailLoginEnabled({ DEV: false, VITE_PANEL_DEV_EMAIL_LOGIN: 'true' })).toBe(false)
    expect(devEmailLoginEnabled({ DEV: true, VITE_PANEL_DEV_EMAIL_LOGIN: 'false' })).toBe(false)
  })

  it('builds the sign-in redirect from the origin and base', () => {
    expect(panelRedirectUrl('http://localhost:5175', '/panel/')).toBe('http://localhost:5175/panel/')
    expect(panelRedirectUrl('https://example.com', '/panel')).toBe('https://example.com/panel/')
  })
})

describe('qrImageSrc', () => {
  it('encodes a raw or loosely encoded SVG data URI so the image always loads', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000"/></svg>'
    const expected = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    expect(qrImageSrc(svg)).toBe(expected)
    expect(qrImageSrc(`data:image/svg+xml;utf-8,${svg}`)).toBe(expected)
  })

  it('keeps an already encoded data URI', () => {
    const uri = 'data:image/png;base64,iVBORw0KGgo='
    expect(qrImageSrc(uri)).toBe(uri)
  })
})
