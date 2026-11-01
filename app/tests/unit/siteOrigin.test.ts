import { describe, expect, it } from 'vitest'
import { DEFAULT_SITE_ORIGIN, resolveSiteOrigin } from '../../src/lib/siteOrigin'

describe('resolveSiteOrigin (VITE_SITE_ORIGIN)', () => {
  it('falls back to the final domain when the variable is unset or blank', () => {
    expect(DEFAULT_SITE_ORIGIN).toBe('https://dragoman-turkey.com')
    expect(resolveSiteOrigin(undefined)).toBe(DEFAULT_SITE_ORIGIN)
    expect(resolveSiteOrigin('')).toBe(DEFAULT_SITE_ORIGIN)
    expect(resolveSiteOrigin('   ')).toBe(DEFAULT_SITE_ORIGIN)
  })

  it('accepts the temporary host with or without a trailing slash', () => {
    expect(resolveSiteOrigin('https://notyetbro.club/')).toBe('https://notyetbro.club')
    expect(resolveSiteOrigin('https://notyetbro.club')).toBe('https://notyetbro.club')
    expect(resolveSiteOrigin(' https://NotYetBro.club ')).toBe('https://notyetbro.club')
  })

  it('keeps a non-default port and allows plain http only for local previews', () => {
    expect(resolveSiteOrigin('https://staging.example.com:8443')).toBe('https://staging.example.com:8443')
    expect(resolveSiteOrigin('http://localhost:4173/')).toBe('http://localhost:4173')
    expect(resolveSiteOrigin('http://127.0.0.1:4173')).toBe('http://127.0.0.1:4173')
  })

  it('rejects values that would produce wrong canonical or hreflang URLs', () => {
    for (const bad of [
      'notyetbro.club',
      'http://notyetbro.club',
      'ftp://notyetbro.club',
      'https://notyetbro.club/tr/',
      'https://notyetbro.club/?x=1',
      'https://notyetbro.club/#top',
      'https://user:pass@notyetbro.club',
    ]) {
      expect(() => resolveSiteOrigin(bad), bad).toThrow(/VITE_SITE_ORIGIN/)
    }
  })
})
