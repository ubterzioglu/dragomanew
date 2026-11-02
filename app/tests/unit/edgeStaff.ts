import type { StaffVerifier } from '../../../supabase/functions/_shared/auth/staff.ts'

/** Shared fakes for the Dalga 2 staff-function tests (not a test file itself). */

export const ORIGIN = 'http://127.0.0.1:5175'

const ALL = ['content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy']

/** token → claims and permissions, as getClaims + my_permissions would answer. */
const TOKENS: Readonly<Record<string, { sub: string; aal: string; permissions: string[] }>> = {
  admin: { sub: 'user-admin', aal: 'aal2', permissions: ALL },
  content: { sub: 'user-content', aal: 'aal2', permissions: ['content.edit', 'content.translate'] },
  forms: { sub: 'user-forms', aal: 'aal2', permissions: ['forms.manage'] },
  publisher: { sub: 'user-publisher', aal: 'aal2', permissions: ['content.edit', 'content.translate', 'content.publish'] },
  aal1: { sub: 'user-admin', aal: 'aal1', permissions: [] },
  orphan: { sub: 'user-orphan', aal: 'aal2', permissions: ALL },
}

export const STAFF_ID = '11111111-1111-4111-8111-111111111111'

export function fakeVerifier(): StaffVerifier {
  return {
    claims: async (token) => {
      const entry = TOKENS[token]
      return entry ? { sub: entry.sub, aal: entry.aal } : null
    },
    permissions: async (token) => TOKENS[token]?.permissions ?? [],
    staffId: async (userId) => (userId === 'user-orphan' ? null : STAFF_ID),
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
