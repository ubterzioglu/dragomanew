import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FunctionsHttpError } from '@supabase/supabase-js'

/** Content data access against a stubbed client (no stack): optimistic saves, functions, permissions. */
interface Call {
  table: string
  steps: [string, ...unknown[]][]
}
type Result = { data?: unknown; error?: unknown }

const calls: Call[] = []
let respond: (call: Call) => Result = () => ({ data: [], error: null })
let invokeResult: { data: unknown; error: unknown } = { data: null, error: null }
const invoked: { name: string; body: unknown }[] = []
let rpcResult: Result = { data: [], error: null }

function query(table: string) {
  const call: Call = { table, steps: [] }
  calls.push(call)
  const builder: Record<string, unknown> = {}
  for (const step of ['select', 'update', 'insert', 'eq', 'in', 'order', 'limit', 'single']) {
    builder[step] = (...args: unknown[]) => {
      call.steps.push([step, ...args])
      return builder
    }
  }
  builder.then = (resolve: (value: Result) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(respond(call)).then(resolve, reject)
  return builder
}

vi.mock('../src/lib/supabase', () => ({
  db: () => ({
    from: query,
    rpc: async () => rpcResult,
    functions: {
      invoke: async (name: string, options: { body: unknown }) => {
        invoked.push({ name, body: options.body })
        return invokeResult
      },
    },
  }),
}))

const { saveDraft, publishEntries, loadMyPermissions, reorderEntries } = await import('../src/data/content/entries')
const { CONFLICT_MESSAGE, contentErrorMessage, serverIssues } = await import('../src/lib/content/messages')

const steps = (call: Call | undefined, name: string) => call?.steps.filter(([step]) => step === name) ?? []

beforeEach(() => {
  calls.length = 0
  invoked.length = 0
  respond = () => ({ data: [], error: null })
  invokeResult = { data: null, error: null }
})

describe('saveDraft', () => {
  it('updates only the loaded revision and returns the bumped one', async () => {
    respond = () => ({ data: [{ draft_revision: 5 }], error: null })
    await expect(saveDraft('e1', 4, { id: 'x' }, {})).resolves.toBe(5)
    expect(steps(calls[0], 'update')).toEqual([['update', { draft: { id: 'x' }, translation_meta: {} }]])
    expect(steps(calls[0], 'eq')).toEqual([
      ['eq', 'id', 'e1'],
      ['eq', 'draft_revision', 4],
    ])
  })

  it('turns "no row back" into the exact conflict message', async () => {
    respond = () => ({ data: [], error: null })
    const failure = await saveDraft('e1', 4, {}, {}).catch((error: unknown) => error)
    expect(contentErrorMessage(failure)).toBe('Bu kayıt başka biri tarafından değiştirildi, yeniden yükleyin')
    expect(CONFLICT_MESSAGE).toBe('Bu kayıt başka biri tarafından değiştirildi, yeniden yükleyin')
  })
})

describe('publish-content calls', () => {
  it('sends the publish body with draft revisions', async () => {
    invokeResult = { data: { ok: true, releaseId: 9, deployNotBefore: null }, error: null }
    await expect(publishEntries([{ id: 'e1', draftRevision: 3 }])).resolves.toMatchObject({ releaseId: 9 })
    expect(invoked).toEqual([{ name: 'publish-content', body: { action: 'publish', entries: [{ id: 'e1', draftRevision: 3 }] } }])
  })

  it('sends the whole reorder scope', async () => {
    invokeResult = { data: { ok: true, releaseId: 10, deployNotBefore: null }, error: null }
    await reorderEntries('event', ['a', 'b'])
    expect(invoked[0]?.body).toEqual({ action: 'reorder', type: 'event', keys: ['a', 'b'] })
  })

  it('reads the error body: 422 issues and 409 stale drafts', async () => {
    const response = new Response(JSON.stringify({ ok: false, error: 'invalid', issues: [{ code: 'schema', recordId: 'gece', path: '/title', message: 'Required' }] }), {
      status: 422,
    })
    invokeResult = { data: null, error: new FunctionsHttpError(response) }
    const failure = await publishEntries([{ id: 'e1', draftRevision: 1 }]).catch((error: unknown) => error)
    expect(failure).toMatchObject({ name: 'FunctionCallError', status: 422, code: 'invalid' })
    expect(serverIssues(failure)).toEqual([{ path: '/title', message: 'Required', recordId: 'gece' }])

    invokeResult = { data: null, error: new FunctionsHttpError(new Response(JSON.stringify({ ok: false, error: 'stale_draft', entryIds: ['e1'] }), { status: 409 })) }
    const stale = await publishEntries([{ id: 'e1', draftRevision: 1 }]).catch((error: unknown) => error)
    expect(contentErrorMessage(stale)).toBe(CONFLICT_MESSAGE)
  })

  it('names the DeepL quota shortfall', async () => {
    const response = new Response(JSON.stringify({ ok: false, error: 'quota_insufficient', needed: 12000, remaining: 3000 }), { status: 409 })
    invokeResult = { data: null, error: new FunctionsHttpError(response) }
    const failure = await publishEntries([]).catch((error: unknown) => error)
    expect(contentErrorMessage(failure)).toMatch(/12\.000 karakter gerekli, 3\.000 kaldı/)
  })

  it('maps a duplicate key to its own message', () => {
    expect(contentErrorMessage({ code: '23505', message: 'duplicate key' })).toMatch(/kısa adla/)
  })
})

describe('loadMyPermissions', () => {
  it('keeps only known permission names', async () => {
    rpcResult = { data: ['content.edit', 'content.publish', 'weird.thing'], error: null }
    await expect(loadMyPermissions()).resolves.toEqual(['content.edit', 'content.publish'])
  })

  it('passes errors on', async () => {
    const failure = { code: '42501' }
    rpcResult = { data: null, error: failure }
    await expect(loadMyPermissions()).rejects.toBe(failure)
  })
})
