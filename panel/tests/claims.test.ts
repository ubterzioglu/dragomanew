import { describe, expect, it } from 'vitest'
import { readTokenClaims, sessionScope } from '../src/auth/claims'

const encode = (value: unknown): string => Buffer.from(JSON.stringify(value)).toString('base64url')
const tokenWith = (payload: Record<string, unknown>): string => `${encode({ alg: 'HS256' })}.${encode(payload)}.sig`

const USER = '8a1f6e0c-6a4e-4f7b-9d61-0c2b0f6f1a11'

describe('readTokenClaims', () => {
  it('reads the session from the token itself, whatever the assurance level', () => {
    expect(readTokenClaims(tokenWith({ aal: 'aal1', session_id: 's-1' }))).toEqual({ sessionId: 's-1' })
    expect(readTokenClaims(tokenWith({ aal: 'aal2', session_id: 's-1' }))).toEqual({ sessionId: 's-1' })
  })

  it('reads non-ASCII claims (base64url, UTF-8)', () => {
    expect(readTokenClaims(tokenWith({ session_id: 'ş?>~', email: 'çağrı@örnek.com' })).sessionId).toBe('ş?>~')
  })

  it('treats anything unexpected as no session', () => {
    expect(readTokenClaims(tokenWith({ session_id: '' }))).toEqual({ sessionId: null })
    expect(readTokenClaims(tokenWith({ session_id: 42 }))).toEqual({ sessionId: null })
    expect(readTokenClaims('not-a-token')).toEqual({ sessionId: null })
    expect(readTokenClaims('a.%%%.c')).toEqual({ sessionId: null })
    expect(readTokenClaims('')).toEqual({ sessionId: null })
  })
})

describe('sessionScope', () => {
  it('stays the same across a token refresh of one sign-in', () => {
    const first = tokenWith({ sub: USER, aal: 'aal1', session_id: 's-1', iat: 1 })
    const refreshed = tokenWith({ sub: USER, aal: 'aal1', session_id: 's-1', iat: 2 })
    expect(sessionScope(USER, first)).toBe(sessionScope(USER, refreshed))
  })

  it('changes when the same user signs out and in again, so no cached lookup is reused', () => {
    const before = tokenWith({ sub: USER, aal: 'aal1', session_id: 's-1' })
    const after = tokenWith({ sub: USER, aal: 'aal1', session_id: 's-2' })
    expect(sessionScope(USER, before)).not.toBe(sessionScope(USER, after))
  })

  it('falls back to the token when there is no session id, and never contains the key separator', () => {
    const odd = tokenWith({ sub: USER, aal: 'aal1' })
    expect(sessionScope(USER, odd)).toBe(`${USER}:${odd}`)
    expect(sessionScope(USER, tokenWith({ session_id: 'a#b' }))).not.toContain('#')
  })
})