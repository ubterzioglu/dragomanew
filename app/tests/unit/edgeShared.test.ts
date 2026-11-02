import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { authorizeStaff } from '../../../supabase/functions/_shared/auth/staff.ts'
import { bearerToken, corsFor, failure, hasPublishableKey, jsonResponse, readJsonBody, sha256Hex } from '../../../supabase/functions/_shared/http/http.ts'
import { fakeVerifier, STAFF_ID } from './edgeStaff'

const request = (headers: Record<string, string>, body?: string) => new Request('http://localhost/x', { method: body === undefined ? 'GET' : 'POST', headers, ...(body === undefined ? {} : { body }) })

describe('_shared/http', () => {
  it('CORS: headers for an allowed origin, none without Origin, false for a foreign one', () => {
    expect(corsFor('https://a.example', ['https://a.example'])).toMatchObject({ 'access-control-allow-origin': 'https://a.example', vary: 'Origin' })
    expect(corsFor(null, ['https://a.example'])).toEqual({})
    expect(corsFor('https://b.example', ['https://a.example'])).toBe(false)
  })

  it('reads bearer tokens and publishable keys', () => {
    expect(bearerToken(request({ authorization: 'Bearer abc.def' }))).toBe('abc.def')
    expect(bearerToken(request({ authorization: 'Basic abc' }))).toBeNull()
    expect(hasPublishableKey(request({ apikey: 'k1' }), ['k1'])).toBe(true)
    expect(hasPublishableKey(request({ authorization: 'Bearer k1' }), ['k1'])).toBe(true)
    expect(hasPublishableKey(request({ apikey: 'k2' }), ['k1'])).toBe(false)
    expect(hasPublishableKey(request({ apikey: '' }), [])).toBe(false)
  })

  it('reads a capped JSON body', async () => {
    expect(await readJsonBody(request({}, '{"a":1}'))).toEqual({ ok: true, value: { a: 1 } })
    expect(await readJsonBody(request({}, '{'))).toEqual({ ok: false, reason: 'not_json' })
    expect(await readJsonBody(request({}, JSON.stringify({ a: 'x'.repeat(100) })), 50)).toEqual({ ok: false, reason: 'too_large' })
    expect(await readJsonBody(request({ 'content-length': '999999' }, '{}'), 50)).toEqual({ ok: false, reason: 'too_large' })
  })

  it('answers JSON with no-store and the failure envelope', async () => {
    const response = jsonResponse(409, failure('stale_draft', { entryIds: ['x'], ok: true, error: 'spoofed' }))
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ ok: false, error: 'stale_draft', entryIds: ['x'] })
  })

  it('hashes like node:crypto', async () => {
    expect(await sha256Hex('Kaş')).toBe(createHash('sha256').update('Kaş').digest('hex'))
  })
})

describe('_shared/auth authorizeStaff', () => {
  const withToken = (token: string | null) => request(token ? { authorization: `Bearer ${token}` } : {})

  it('accepts a signed-in (aal1) staff member with the permission, no second factor needed', async () => {
    expect(await authorizeStaff(withToken('content'), fakeVerifier(), 'content.translate')).toEqual({
      ok: true,
      caller: { userId: 'user-content', staffId: STAFF_ID, permissions: ['content.edit', 'content.translate'] },
    })
    expect((await authorizeStaff(withToken('forms'), fakeVerifier(), ['content.publish', 'forms.manage'])).ok).toBe(true)
  })

  it('401 without a token or for an invalid or expired token', async () => {
    for (const token of [null, 'bad']) expect(await authorizeStaff(withToken(token), fakeVerifier(), 'content.edit')).toMatchObject({ ok: false, status: 401 })
  })

  it('403 without the permission, for non-staff, for inactive staff or without an active staff row', async () => {
    for (const token of ['outsider', 'inactive']) expect(await authorizeStaff(withToken(token), fakeVerifier(), 'content.edit')).toMatchObject({ ok: false, status: 403, error: 'forbidden' })
    expect(await authorizeStaff(withToken('content'), fakeVerifier(), 'content.publish')).toMatchObject({ ok: false, status: 403, error: 'forbidden' })
    expect(await authorizeStaff(withToken('orphan'), fakeVerifier(), 'content.publish')).toMatchObject({ ok: false, status: 403 })
  })
})
