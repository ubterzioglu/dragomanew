import { describe, expect, it, vi } from 'vitest'
import { handleStaffAccount } from '../../../supabase/functions/staff-account/handler.ts'
import { PASSWORD_ALPHABET, temporaryPassword } from '../../../supabase/functions/staff-account/password.ts'
import type { StaffAccountDeps, StaffAccountStore, StaffTarget } from '../../../supabase/functions/staff-account/types.ts'
import { fakeVerifier, ORIGIN, STAFF_ID, staffRequest } from './edgeStaff'

const URL = 'http://localhost/functions/v1/staff-account'
const NOW = new Date('2026-11-03T10:00:00.000Z')
const TARGET_ID = '22222222-2222-4222-8222-222222222222'
const GROUPS = /^[^-]{4}-[^-]{4}-[^-]{4}-[^-]{4}$/

const target = (overrides: Partial<StaffTarget> = {}): StaffTarget => ({
  id: TARGET_ID,
  email: 'admin@dragoman-turkey.com',
  active: true,
  authUserId: null,
  ...overrides,
})

function setup(options: { target?: StaffTarget | null; create?: 'created' | 'exists' } = {}) {
  const found = options.target === undefined ? target() : options.target
  const store = {
    findTarget: vi.fn(async (_id: string) => found),
    createAccount: vi.fn(async (_email: string, _password: string) => options.create ?? 'created'),
    setPassword: vi.fn(async (_userId: string, _password: string) => undefined),
    markIssued: vi.fn(async (_staffId: string, _issuedBy: string, _at: Date) => undefined),
  } satisfies StaffAccountStore
  const reportError = vi.fn()
  const deps: StaffAccountDeps = { store, auth: fakeVerifier(), allowedOrigins: [ORIGIN], clock: () => NOW, reportError }
  return { store, deps, reportError }
}

const send = async (deps: StaffAccountDeps, body: unknown, options: Parameters<typeof staffRequest>[2] = {}) => {
  const response = await handleStaffAccount(staffRequest(URL, body, options), deps)
  return {
    status: response.status,
    cache: response.headers.get('cache-control'),
    body: (await response.json().catch(() => null)) as Record<string, unknown> | null,
  }
}

/** A byte source that replays the given bytes in order, then repeats the last one. */
const bytes = (values: readonly number[]) => {
  let index = 0
  return (out: Uint8Array): Uint8Array => {
    for (let i = 0; i < out.length; i += 1) {
      out[i] = values[Math.min(index, values.length - 1)] ?? 0
      index += 1
    }
    return out
  }
}

const at = (char: string): number => PASSWORD_ALPHABET.indexOf(char)
const repeat = (char: string, count: number): number[] => Array.from({ length: count }, () => at(char))

describe('temporaryPassword', () => {
  it('gives four dash-separated groups of four from the unambiguous alphabet', () => {
    for (let run = 0; run < 50; run += 1) {
      const password = temporaryPassword()
      expect(password).toMatch(GROUPS)
      for (const char of password.replaceAll('-', '')) expect(PASSWORD_ALPHABET).toContain(char)
    }
  })

  it('leaves out characters that are easy to mix up when read aloud', () => {
    for (const char of 'IlO0o1L') expect(PASSWORD_ALPHABET).not.toContain(char)
  })

  it('always holds an upper-case letter, a lower-case letter and a digit', () => {
    for (let run = 0; run < 200; run += 1) {
      const password = temporaryPassword()
      expect(password).toMatch(/[A-Z]/)
      expect(password).toMatch(/[a-z]/)
      expect(password).toMatch(/[2-9]/)
    }
  })

  it('skips bytes at or above the largest multiple of the alphabet size, so no character is favoured', () => {
    const limit = 256 - (256 % PASSWORD_ALPHABET.length)
    const fill = bytes([255, limit, at('A'), at('a'), at('2'), ...repeat('A', 13)])
    expect(temporaryPassword(fill)).toBe('Aa2A-AAAA-AAAA-AAAA')
  })

  it('draws again when a draw lacks one of the three kinds', () => {
    const fill = bytes([...repeat('A', 16), at('2'), at('a'), ...repeat('A', 14)])
    expect(temporaryPassword(fill)).toBe('2aAA-AAAA-AAAA-AAAA')
  })
})

describe('staff-account: auth and input', () => {
  it('401 without a session, 403 without staff.manage or for a foreign origin', async () => {
    const { deps, store } = setup()
    expect(await send(deps, { staffId: TARGET_ID }, { token: null })).toMatchObject({ status: 401, body: { error: 'unauthorized' } })
    expect((await send(deps, { staffId: TARGET_ID }, { token: 'content' })).status).toBe(403)
    expect((await send(deps, { staffId: TARGET_ID }, { token: 'outsider' })).status).toBe(403)
    expect((await send(deps, { staffId: TARGET_ID }, { token: 'orphan' })).status).toBe(403)
    expect((await send(deps, { staffId: TARGET_ID }, { origin: 'https://evil.example' })).status).toBe(403)
    expect(store.findTarget).not.toHaveBeenCalled()
  })

  it('answers the CORS preflight and refuses other methods', async () => {
    const { deps } = setup()
    expect((await handleStaffAccount(staffRequest(URL, null, { method: 'OPTIONS' }), deps)).status).toBe(204)
    expect((await handleStaffAccount(staffRequest(URL, null, { method: 'GET' }), deps)).status).toBe(405)
  })

  it('400 for a body without a valid staff id', async () => {
    const { deps } = setup()
    expect((await send(deps, {})).status).toBe(400)
    expect((await send(deps, { staffId: 'not-a-uuid' })).status).toBe(400)
    expect((await send(deps, 'not json')).status).toBe(400)
  })

  it('409 own_account: nobody issues a password for themself, whatever the letter case of the id', async () => {
    const { deps, store } = setup()
    expect(await send(deps, { staffId: STAFF_ID })).toMatchObject({ status: 409, body: { error: 'own_account' } })
    expect(await send(deps, { staffId: STAFF_ID.toUpperCase() })).toMatchObject({ status: 409, body: { error: 'own_account' } })
    expect(store.findTarget).not.toHaveBeenCalled()
  })

  it('looks the row up by the lower-case id', async () => {
    const { deps, store } = setup()
    await send(deps, { staffId: TARGET_ID.toUpperCase() })
    expect(store.findTarget).toHaveBeenCalledWith(TARGET_ID)
  })

  it('404 for an unknown row, 409 inactive for a deactivated one', async () => {
    expect((await send(setup({ target: null }).deps, { staffId: TARGET_ID })).status).toBe(404)
    const inactive = setup({ target: target({ active: false }) })
    expect(await send(inactive.deps, { staffId: TARGET_ID })).toMatchObject({ status: 409, body: { error: 'inactive' } })
    expect(inactive.store.createAccount).not.toHaveBeenCalled()
    expect(inactive.store.setPassword).not.toHaveBeenCalled()
  })
})

describe('staff-account: issuing', () => {
  it('opens the Auth account when there is none, flags the row and returns the password once, uncached', async () => {
    const { deps, store } = setup()
    const reply = await send(deps, { staffId: TARGET_ID })
    expect(reply.status).toBe(200)
    expect(reply.cache).toBe('no-store')
    expect(reply.body).toMatchObject({ ok: true, created: true, email: 'admin@dragoman-turkey.com' })
    const password = reply.body?.password as string
    expect(password).toMatch(GROUPS)
    expect(store.createAccount).toHaveBeenCalledWith('admin@dragoman-turkey.com', password)
    expect(store.setPassword).not.toHaveBeenCalled()
    expect(store.markIssued).toHaveBeenCalledWith(TARGET_ID, STAFF_ID, NOW)
  })

  it('replaces the password of an existing account', async () => {
    const { deps, store } = setup({ target: target({ authUserId: 'auth-user-9' }) })
    const reply = await send(deps, { staffId: TARGET_ID })
    expect(reply.body).toMatchObject({ ok: true, created: false })
    expect(store.setPassword).toHaveBeenCalledWith('auth-user-9', reply.body?.password)
    expect(store.createAccount).not.toHaveBeenCalled()
    expect(store.markIssued).toHaveBeenCalledOnce()
  })

  it('409 account_exists when the address belongs to an account bound elsewhere, without flagging the row', async () => {
    const { deps, store } = setup({ create: 'exists' })
    expect(await send(deps, { staffId: TARGET_ID })).toMatchObject({ status: 409, body: { error: 'account_exists' } })
    expect(store.markIssued).not.toHaveBeenCalled()
  })

  it('500 server on a store failure, reported without the password', async () => {
    const { deps, store, reportError } = setup()
    store.markIssued.mockRejectedValueOnce(new Error('db down'))
    const reply = await send(deps, { staffId: TARGET_ID })
    expect(reply).toMatchObject({ status: 500, body: { ok: false, error: 'server' } })
    expect(reply.body).not.toHaveProperty('password')
    expect(reportError).toHaveBeenCalledWith('staff-account', expect.any(Error))
  })
})
