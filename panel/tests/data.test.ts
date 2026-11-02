import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The data layer against a stubbed client: each query records its calls and resolves with the
 * result queued for its table, so filters, counts and error handling can be checked without a stack.
 */
interface Call {
  table: string
  steps: [string, ...unknown[]][]
}

type Result = { data?: unknown; error?: unknown; count?: number | null }

const calls: Call[] = []
let respond: (call: Call) => Result = () => ({ data: [], error: null })

function query(table: string) {
  const call: Call = { table, steps: [] }
  calls.push(call)
  const builder: Record<string, unknown> = {}
  for (const step of ['select', 'update', 'insert', 'eq', 'order', 'limit']) {
    builder[step] = (...args: unknown[]) => {
      call.steps.push([step, ...args])
      return builder
    }
  }
  builder.then = (resolve: (value: Result) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(respond(call)).then(resolve, reject)
  return builder
}

vi.mock('../src/lib/supabase', () => ({ db: () => ({ from: query }) }))

const { updateStaff } = await import('../src/data/staff')
const { loadInbox } = await import('../src/data/requests')

const stepsNamed = (call: Call | undefined, name: string) => call?.steps.filter(([step]) => step === name) ?? []
const isCount = (call: Call) => stepsNamed(call, 'select').some(([, , options]) => (options as { head?: boolean })?.head)

beforeEach(() => {
  calls.length = 0
  respond = () => ({ data: [], error: null })
})

describe('updateStaff', () => {
  it('updates one row by id and asks for the exact row count', async () => {
    respond = () => ({ error: null, count: 1 })
    await updateStaff('staff-1', { active: false })
    expect(calls).toHaveLength(1)
    expect(calls[0]?.table).toBe('staff_members')
    expect(stepsNamed(calls[0], 'update')).toEqual([['update', { active: false }, { count: 'exact' }]])
    expect(stepsNamed(calls[0], 'eq')).toEqual([['eq', 'id', 'staff-1']])
  })

  it('turns an update that RLS filtered out into "not found or not allowed"', async () => {
    respond = () => ({ error: null, count: 0 })
    await expect(updateStaff('staff-1', { role: 'content' })).rejects.toMatchObject({
      name: 'CodedError',
      code: 'PGRST116',
    })
  })

  it('passes database errors on unchanged', async () => {
    const failure = { code: '23514', message: 'the last active main_admin cannot be demoted or deactivated' }
    respond = () => ({ error: failure, count: null })
    await expect(updateStaff('staff-1', { role: 'content' })).rejects.toBe(failure)
  })
})

describe('loadInbox', () => {
  const counts: Record<string, number> = { 'status:pending': 7, 'status:in_progress': 3, 'assignee_id:staff-1': 2 }

  beforeEach(() => {
    respond = (call) => {
      const [, column, value] = stepsNamed(call, 'eq')[0] ?? []
      if (isCount(call)) return { error: null, count: counts[`${String(column)}:${String(value)}`] ?? 0 }
      return { data: [{ id: 'r1' }], error: null }
    }
  })

  it('lists the chosen tab on the server, newest first, up to the limit', async () => {
    const inbox = await loadInbox('in_progress', 'staff-1', 50)
    const list = calls.find((call) => !isCount(call))
    expect(stepsNamed(list, 'eq')).toEqual([['eq', 'status', 'in_progress']])
    expect(stepsNamed(list, 'order')).toEqual([['order', 'created_at', { ascending: false }]])
    expect(stepsNamed(list, 'limit')).toEqual([['limit', 50]])
    expect(inbox).toEqual({ tab: 'in_progress', rows: [{ id: 'r1' }], counts: { pending: 7, in_progress: 3, mine: 2 } })
  })

  it('filters "Bana Atananlar" by the assignee', async () => {
    await loadInbox('mine', 'staff-1', 200)
    const list = calls.find((call) => !isCount(call))
    expect(stepsNamed(list, 'eq')).toEqual([['eq', 'assignee_id', 'staff-1']])
  })

  it('counts every tab without fetching rows', async () => {
    await loadInbox('pending', 'staff-1', 200)
    const countCalls = calls.filter(isCount)
    expect(countCalls).toHaveLength(3)
    for (const call of countCalls) {
      expect(stepsNamed(call, 'select')).toEqual([['select', 'id', { count: 'exact', head: true }]])
      expect(stepsNamed(call, 'limit')).toEqual([])
    }
  })

  it('without a staff id, "Bana Atananlar" is empty and never queried', async () => {
    const inbox = await loadInbox('mine', null, 200)
    expect(inbox.rows).toEqual([])
    expect(inbox.counts.mine).toBe(0)
    expect(calls.some((call) => stepsNamed(call, 'eq').some(([, column]) => column === 'assignee_id'))).toBe(false)
  })

  it('passes a failed count on as an error', async () => {
    const failure = { code: 'PGRST301', message: 'JWT expired' }
    respond = (call) => (isCount(call) ? { error: failure, count: null } : { data: [], error: null })
    await expect(loadInbox('pending', 'staff-1', 200)).rejects.toBe(failure)
  })
})
