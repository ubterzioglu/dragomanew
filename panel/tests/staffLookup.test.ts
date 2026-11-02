import { describe, expect, it } from 'vitest'
import { gateFor } from '../src/auth/gate'
import { lookupOf, staffLookup } from '../src/auth/staffLookup'
import { keyedView } from '../src/lib/useKeyedPromise'

describe('staffLookup', () => {
  const base = {
    level: 'aal2',
    staffId: 'staff-1',
    scope: 'user-1:session-1',
    retry: 0,
    token: 'token-a',
    recheck: 0,
  } as const

  it('waits for AAL2, the linked staff id and a session', () => {
    expect(staffLookup({ ...base, level: 'aal1' })).toBeNull()
    expect(staffLookup({ ...base, level: null })).toBeNull()
    expect(staffLookup({ ...base, staffId: null })).toBeNull()
    expect(staffLookup({ ...base, scope: null })).toBeNull()
    expect(staffLookup({ ...base, token: null })).toBeNull()
  })

  it('starts the key with the staff id, which runStaff reads', () => {
    expect(staffLookup(base)?.key.split('#')[0]).toBe('staff-1')
  })

  it('reads the row again on a token refresh or a re-check, under the same key', () => {
    const first = staffLookup(base)
    const refreshed = staffLookup({ ...base, token: 'token-b' })
    const rechecked = staffLookup({ ...base, recheck: 1 })
    expect(refreshed?.key).toBe(first?.key)
    expect(rechecked?.key).toBe(first?.key)
    expect(refreshed?.revision).not.toBe(first?.revision)
    expect(rechecked?.revision).not.toBe(first?.revision)
  })

  it('starts afresh for a new sign-in or a retry', () => {
    const first = staffLookup(base)
    expect(staffLookup({ ...base, scope: 'user-1:session-2' })?.key).not.toBe(first?.key)
    expect(staffLookup({ ...base, retry: 1 })?.key).not.toBe(first?.key)
  })
})

describe('keyedView', () => {
  it('is idle without a key and pending until an answer for that key arrives', () => {
    expect(keyedView(null, null)).toEqual({ status: 'idle' })
    expect(keyedView('k', null)).toEqual({ status: 'pending' })
    expect(keyedView('k2', { key: 'k', ok: true, value: 1 })).toEqual({ status: 'pending' })
  })

  it('keeps the last answer for the key on screen while a newer revision is read', () => {
    expect(keyedView('k', { key: 'k', ok: true, value: 1 })).toEqual({ status: 'ok', value: 1 })
    const error = new Error('x')
    expect(keyedView('k', { key: 'k', ok: false, error })).toEqual({ status: 'error', error })
  })
})

describe('a re-check that finds the person deactivated', () => {
  it('turns the open panel into the no-access screen', () => {
    const staff = lookupOf({ status: 'ok', value: null })
    expect(staff).toBe('missing')
    expect(gateFor({ loading: false, signedIn: true, aal: 'aal2', link: 'ready', staff })).toBe('not_staff')
  })

  it('maps the other lookup states for the gate', () => {
    expect(lookupOf({ status: 'ok', value: { id: 'staff-1' } })).toBe('ready')
    expect(lookupOf({ status: 'error', error: new Error('x') })).toBe('error')
    expect(lookupOf({ status: 'pending' })).toBe('unknown')
    expect(lookupOf({ status: 'idle' })).toBe('unknown')
  })
})
