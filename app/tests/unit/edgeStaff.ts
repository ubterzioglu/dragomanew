import type { StaffVerifier } from '../../../supabase/functions/_shared/auth/staff.ts'

/** Shared fakes for the Dalga 2 staff-function tests (not a test file itself). */

export const ORIGIN = 'http://127.0.0.1:5175'

const ALL = ['content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy', 'staff.manage']

/**
 * token → user and permissions, as getClaims + my_permissions would answer. Every session is a
 * plain sign-in (Google or e-mail + password, aal1): staff need no second factor.
 */
const TOKENS: Readonly<Record<string, { sub: string; permissions: string[] }>> = {
  admin: { sub: 'user-admin', permissions: ALL },
  content: { sub: 'user-content', permissions: ['content.edit', 'content.translate'] },
  forms: { sub: 'user-forms', permissions: ['forms.manage'] },
  publisher: { sub: 'user-publisher', permissions: ['content.edit', 'content.translate', 'content.publish'] },
  /** Signed in, but no staff row at all: my_permissions() is empty. */
  outsider: { sub: 'user-outsider', permissions: [] },
  /** A deactivated staff member: my_permissions() is empty and no active row is found. */
  inactive: { sub: 'user-inactive', permissions: [] },
  /** Permissions claimed, but no active staff row bound to the user. */
  orphan: { sub: 'user-orphan', permissions: ALL },
}

const NO_ACTIVE_ROW: ReadonlySet<string> = new Set(['user-orphan', 'user-outsider', 'user-inactive'])

export const STAFF_ID = '11111111-1111-4111-8111-111111111111'

export function fakeVerifier(): StaffVerifier {
  return {
    claims: async (token) => {
      const entry = TOKENS[token]
      return entry ? { sub: entry.sub } : null
    },
    permissions: async (token) => TOKENS[token]?.permissions ?? [],
    staffId: async (userId) => (NO_ACTIVE_ROW.has(userId) ? null : STAFF_ID),
  }
}

export function staffRequest(url: string, body: unknown, options: { token?: string | null; origin?: string | null; method?: string } = {}): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  const token = options.token === undefined ? 'admin' : options.token
  if (token) headers.authorization = `Bearer ${token}`
  const origin = options.origin === undefined ? ORIGIN : options.origin
  if (origin) headers.origin = origin
  const method = options.method ?? 'POST'
  return new Request(url, { method, headers, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) })
}
