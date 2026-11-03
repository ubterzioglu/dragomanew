import { beforeEach, describe, expect, it, vi } from 'vitest'
import { navTrail, visibleNav } from '../src/components/nav/navItems'
import { can, parsePermissions } from '../src/lib/permissions'
import { notifyMessage, parseNotifyAnswer, revisionErrorMessage } from '../src/lib/revisions/messages'
import {
  buildThread,
  byUrgency,
  commentProblem,
  describeStatusChange,
  groupRevisions,
  newRequestProblem,
  parseFilter,
  requestAttachments,
  statusActions,
  statusChangedMessage,
  urgencyTone,
  type RevisionAttachment,
  type RevisionComment,
  type RevisionRequest,
  type RevisionStatusChange,
} from '../src/lib/revisions/model'
import { addScreenshots, formatBytes, MAX_SCREENSHOTS, screenshotPath, screenshotProblem } from '../src/lib/revisions/screenshots'

// ---------------------------------------------------------------------------------------------
// A stubbed client for the data layer: queries record their steps and resolve with `respond`.

interface Call {
  table: string
  steps: [string, ...unknown[]][]
}
type Result = { data?: unknown; error?: unknown; count?: number | null }

const calls: Call[] = []
let respond: (call: Call) => Result = () => ({ data: [], error: null })
const uploads: { bucket: string; path: string; options: unknown }[] = []
let uploadFails: (path: string) => unknown = () => null
const rpc = vi.fn()
const invoke = vi.fn()
const createSignedUrls = vi.fn()

function query(table: string) {
  const call: Call = { table, steps: [] }
  calls.push(call)
  const builder: Record<string, unknown> = {}
  for (const step of ['select', 'insert', 'update', 'eq', 'order', 'single', 'maybeSingle']) {
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
    rpc,
    functions: { invoke },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, _file: unknown, options: unknown) => {
          uploads.push({ bucket, path, options })
          const error = uploadFails(path)
          return error ? { data: null, error } : { data: { path }, error: null }
        },
        createSignedUrls,
      }),
    },
  }),
}))

const data = await import('../src/data/revisions')

const steps = (call: Call | undefined, name: string) => call?.steps.filter(([step]) => step === name) ?? []

beforeEach(() => {
  calls.length = 0
  uploads.length = 0
  respond = () => ({ data: [], error: null })
  uploadFails = () => null
  rpc.mockReset()
  invoke.mockReset()
  createSignedUrls.mockReset()
})

// ---------------------------------------------------------------------------------------------
// Fixtures

const REQUEST_ID = '30000000-0000-4000-8000-000000000001'

const request = (overrides: Partial<RevisionRequest> = {}): RevisionRequest => ({
  id: REQUEST_ID,
  number: 1,
  requester_id: 's-client',
  description: 'Logo büyüsün',
  urgency: 5,
  status: 'open',
  created_at: '2026-11-03T10:00:00Z',
  updated_at: '2026-11-03T10:00:00Z',
  completed_at: null,
  ...overrides,
})

const comment = (id: string, at: string, author = 's-client'): RevisionComment => ({
  id,
  request_id: REQUEST_ID,
  author_id: author,
  body: `yorum ${id}`,
  created_at: at,
  edited_at: null,
})

const change = (from: RevisionStatusChange['from_status'], to: RevisionStatusChange['to_status'], at: string, by = 's-admin'): RevisionStatusChange => ({
  id: `${from}-${to}`,
  request_id: REQUEST_ID,
  from_status: from,
  to_status: to,
  changed_by: by,
  created_at: at,
})

const attachment = (id: string, commentId: string | null): RevisionAttachment => ({
  id,
  request_id: REQUEST_ID,
  comment_id: commentId,
  object_path: `${REQUEST_ID}/${id}.png`,
  uploaded_by: 's-client',
  created_at: '2026-11-03T10:00:00Z',
})

const file = (name: string, type: string, size: number): File => new File([new Uint8Array(size)], name, { type })

// ---------------------------------------------------------------------------------------------

describe('who sees Revizyonlar (revisions.use)', () => {
  it('mirrors the database: main_admin by role, every other role only through extra permissions', () => {
    expect(can({ role: 'main_admin' }, 'revisions.use')).toBe(true)
    for (const role of ['reservations', 'accounting', 'content'] as const) {
      expect(can({ role }, 'revisions.use')).toBe(false)
      expect(can({ role, extra_permissions: ['revisions.use'] }, 'revisions.use')).toBe(true)
    }
    expect(can({ role: 'main_admin', active: false }, 'revisions.use')).toBe(false)
  })

  it('lets my_permissions() decide once it has answered, and keeps the name when parsing it', () => {
    expect(can({ role: 'content', permissions: ['content.edit', 'revisions.use'] }, 'revisions.use')).toBe(true)
    expect(can({ role: 'main_admin', permissions: [] }, 'revisions.use')).toBe(false)
    expect(parsePermissions(['revisions.use', 'revisions.manage'])).toEqual(['revisions.use'])
  })

  it('puts the menu item next to Dragoman soruları and keeps it on the detail screens', () => {
    const genel = visibleNav({ role: 'main_admin', can: () => true }).find((group) => group.id === 'genel')
    expect(genel?.items.map((item) => item.to)).toEqual(['/', '/beni-oku', '/sorular', '/revizyonlar', '/talepler'])
    const trail = navTrail(`/revizyonlar/${REQUEST_ID}`)
    expect(trail ? `${trail.group.label} / ${trail.item.label}` : null).toBe('Genel / Revizyonlar')
    expect(trail?.item.guide).toBe('revizyonlar')
  })
})

describe('the list', () => {
  const rows = [
    request({ id: 'a', number: 1, urgency: 3, created_at: '2026-11-01T10:00:00Z' }),
    request({ id: 'b', number: 2, urgency: 9, status: 'in_progress', created_at: '2026-11-01T11:00:00Z' }),
    request({ id: 'c', number: 3, urgency: 9, created_at: '2026-11-02T09:00:00Z' }),
    request({ id: 'd', number: 4, urgency: 10, status: 'done', completed_at: '2026-11-02T12:00:00Z' }),
    request({ id: 'e', number: 5, urgency: 1, status: 'done', completed_at: '2026-11-03T08:00:00Z' }),
  ]

  it('shows active requests most urgent first, the newest first within the same urgency', () => {
    expect(groupRevisions(rows, 'all').active.map((row) => row.id)).toEqual(['c', 'b', 'a'])
    expect([...rows].sort(byUrgency)[0]?.id).toBe('d')
  })

  it('keeps the finished ones apart, the most recently completed first', () => {
    expect(groupRevisions(rows, 'all').done.map((row) => row.id)).toEqual(['e', 'd'])
  })

  it('filters by Açık and Devam Ediyor and counts each', () => {
    expect(groupRevisions(rows, 'open').active.map((row) => row.id)).toEqual(['c', 'a'])
    expect(groupRevisions(rows, 'in_progress').active.map((row) => row.id)).toEqual(['b'])
    expect(groupRevisions(rows, 'open').counts).toEqual({ all: 3, open: 2, in_progress: 1 })
    expect(groupRevisions(rows, 'open').done).toHaveLength(2)
  })

  it('reads the filter from the address, anything unknown meaning Tümü', () => {
    expect(parseFilter('in_progress')).toBe('in_progress')
    expect(parseFilter('done')).toBe('all')
    expect(parseFilter(null)).toBe('all')
  })

  it('colours urgency 8–10 high, 4–7 medium, 1–3 low', () => {
    expect([10, 8, 7, 4, 3, 1].map(urgencyTone)).toEqual(['high', 'high', 'medium', 'medium', 'low', 'low'])
  })
})

describe('the forms', () => {
  it('needs a description and an urgency from 1 to 10', () => {
    expect(newRequestProblem('Logo', 5)).toBeNull()
    expect(newRequestProblem('   ', 5)).toBe('İsteğinizi yazın.')
    expect(newRequestProblem('Logo', 0)).toContain('1 ile 10')
    expect(newRequestProblem('Logo', 11)).toContain('1 ile 10')
    expect(newRequestProblem('x'.repeat(10_001), 5)).toContain('10.000')
  })

  it('needs a comment text', () => {
    expect(commentProblem('Tamam')).toBeNull()
    expect(commentProblem('\n ')).toBe('Yorumunuzu yazın.')
  })
})

describe('status buttons (set_revision_status)', () => {
  it('give main_admin every other status', () => {
    expect(statusActions(true, 'open')).toEqual([
      { to: 'in_progress', label: 'Devam Ediyor yap' },
      { to: 'done', label: 'Tamamlandı yap' },
    ])
    expect(statusActions(true, 'in_progress').map((action) => action.label)).toEqual(['Açık yap', 'Tamamlandı yap'])
    expect(statusActions(true, 'done').map((action) => action.label)).toEqual(['Yeniden aç', 'Devam Ediyor yap'])
  })

  it('give everyone else only "Yeniden aç", and only on a done request', () => {
    expect(statusActions(false, 'open')).toEqual([])
    expect(statusActions(false, 'in_progress')).toEqual([])
    expect(statusActions(false, 'done')).toEqual([{ to: 'open', label: 'Yeniden aç' }])
  })

  it('announce the change', () => {
    expect(statusChangedMessage(12, 'done')).toBe('#12 artık Tamamlandı.')
    expect(statusChangedMessage(12, 'open')).toBe('#12 yeniden Açık.')
  })
})

describe('the thread', () => {
  const name = (id: string) => ({ 's-admin': 'Ana Yönetici', 's-client': 'Ayşe' })[id] ?? 'Bilinmeyen kullanıcı'

  it('merges comments and status changes oldest first, each comment with its own screenshots', () => {
    const entries = buildThread(
      [comment('c2', '2026-11-03T12:00:00Z'), comment('c1', '2026-11-03T10:00:00Z')],
      [change('open', 'done', '2026-11-03T11:00:00Z'), change('done', 'open', '2026-11-03T13:00:00Z', 's-client')],
      [attachment('a1', null), attachment('a2', 'c1'), attachment('a3', 'c2')],
    )
    expect(entries.map((entry) => (entry.kind === 'comment' ? entry.comment.id : entry.change.id))).toEqual([
      'c1',
      'open-done',
      'c2',
      'done-open',
    ])
    const first = entries[0]
    expect(first?.kind === 'comment' ? first.attachments.map((item) => item.id) : null).toEqual(['a2'])
  })

  it('keeps the request\'s own screenshots apart from the comments\'', () => {
    expect(requestAttachments([attachment('a1', null), attachment('a2', 'c1')]).map((item) => item.id)).toEqual(['a1'])
  })

  it('names who changed what, and calls done → open a reopening', () => {
    expect(describeStatusChange(change('open', 'in_progress', ''), name)).toBe('Ana Yönetici durumu Devam Ediyor yaptı.')
    expect(describeStatusChange(change('done', 'open', '', 's-client'), name)).toBe('Ayşe isteği yeniden açtı.')
  })
})

describe('screenshots', () => {
  it('accept PNG, JPEG and WebP up to 5 MB, as the bucket does', () => {
    expect(screenshotProblem({ name: 'a.png', type: 'image/png', size: 1000 })).toBeNull()
    expect(screenshotProblem({ name: 'a.jpg', type: 'image/jpeg', size: 5 * 1024 * 1024 })).toBeNull()
    expect(screenshotProblem({ name: 'a.gif', type: 'image/gif', size: 1000 })).toContain('PNG, JPEG ya da WebP')
    expect(screenshotProblem({ name: 'a.pdf', type: 'application/pdf', size: 1000 })).toContain('PNG, JPEG ya da WebP')
    expect(screenshotProblem({ name: 'b.webp', type: 'image/webp', size: 5 * 1024 * 1024 + 1 })).toContain('5 MB')
    expect(screenshotProblem({ name: 'c.png', type: 'image/png', size: 0 })).toContain('boş')
  })

  it(`take at most ${MAX_SCREENSHOTS} per request or comment and say why a file was left out`, () => {
    const many = Array.from({ length: 7 }, (_, index) => ({ name: `${index}.png`, type: 'image/png', size: 10 }))
    const picked = addScreenshots([], [...many, { name: 'x.gif', type: 'image/gif', size: 10 }])
    expect(picked.files).toHaveLength(MAX_SCREENSHOTS)
    expect(picked.problems).toHaveLength(3)
    expect(addScreenshots(picked.files, [{ name: 'y.png', type: 'image/png', size: 10 }]).files).toHaveLength(MAX_SCREENSHOTS)
  })

  it('go to <request id>/<file id>.<ext>, the path the bucket policy accepts', () => {
    expect(screenshotPath(REQUEST_ID, 'f1', 'image/jpeg')).toBe(`${REQUEST_ID}/f1.jpg`)
    expect(screenshotPath(REQUEST_ID, 'f1', 'image/webp')).toBe(`${REQUEST_ID}/f1.webp`)
    expect(() => screenshotPath(REQUEST_ID, 'f1', 'image/gif')).toThrow()
  })

  it('show their size readably', () => {
    expect(formatBytes(1536)).toBe('2 KB')
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2,5 MB')
  })
})

describe('messages', () => {
  it('turn the revision codes into Turkish, the rest through the panel mapping', () => {
    expect(revisionErrorMessage({ code: '55000' })).toContain('durumu bu arada değişti')
    expect(revisionErrorMessage({ code: 'P0002' })).toContain('bulunamadı')
    expect(revisionErrorMessage({ code: '54000' })).toContain('en fazla 10')
    expect(revisionErrorMessage({ code: '42501' })).toBe('Bu işlem için yetkiniz yok.')
    expect(revisionErrorMessage({ statusCode: '413', message: 'The object exceeded the maximum allowed size' })).toContain('5 MB')
    expect(revisionErrorMessage({ statusCode: '415', message: 'mime type image/gif is not supported' })).toContain('PNG')
    expect(revisionErrorMessage({ message: 'new row violates row-level security policy' })).toBe('Bu işlem için yetkiniz yok.')
    expect(revisionErrorMessage(new Error('relation public.revision_requests'))).not.toContain('revision_requests')
  })

  it('read the notification answer defensively', () => {
    expect(parseNotifyAnswer({ ok: true, recipients: 3, sent: 2, failed: 1, notConfigured: 0, skipped: 0 })).toEqual({
      recipients: 3,
      sent: 2,
      failed: 1,
      notConfigured: 0,
    })
    expect(parseNotifyAnswer({ ok: false, error: 'forbidden' })).toBeNull()
    expect(parseNotifyAnswer({ ok: true, sent: -1, failed: 'x' })).toEqual({ recipients: 0, sent: 0, failed: 0, notConfigured: 0 })
    expect(parseNotifyAnswer(null)).toBeNull()
  })

  it('say honestly what happened to the e-mails, never more than the server reported', () => {
    expect(notifyMessage({ recipients: 2, sent: 0, failed: 0, notConfigured: 2 })).toContain('e-posta ayarı henüz yapılmadı')
    expect(notifyMessage({ recipients: 2, sent: 1, failed: 1, notConfigured: 0 })).toBe('E-posta bildirimi 1 kişiye gönderildi, 1 kişiye gönderilemedi.')
    expect(notifyMessage({ recipients: 1, sent: 0, failed: 1, notConfigured: 0 })).toContain('gönderilemedi')
    expect(notifyMessage({ recipients: 2, sent: 2, failed: 0, notConfigured: 0 })).toBe('E-posta bildirimi 2 kişiye gönderildi.')
    expect(notifyMessage({ recipients: 0, sent: 0, failed: 0, notConfigured: 0 })).toBeNull()
    expect(notifyMessage(null)).toContain('kayıt yine de alındı')
  })
})

describe('the data layer', () => {
  it('lists every request, most urgent first', async () => {
    respond = () => ({ data: [request()], error: null })
    await expect(data.listRevisions()).resolves.toHaveLength(1)
    expect(calls[0]?.table).toBe('revision_requests')
    expect(steps(calls[0], 'order')).toEqual([
      ['order', 'urgency', { ascending: false }],
      ['order', 'created_at', { ascending: false }],
    ])
  })

  it('creates a request with the description and urgency only; the requester is the database\'s', async () => {
    respond = () => ({ data: request(), error: null })
    await data.createRevision('Logo büyüsün', 7)
    expect(steps(calls[0], 'insert')).toEqual([['insert', { description: 'Logo büyüsün', urgency: 7 }]])
    expect(steps(calls[0], 'single')).toHaveLength(1)
  })

  it('adds a comment with the request and text only', async () => {
    respond = () => ({ data: comment('c1', ''), error: null })
    await data.addComment(REQUEST_ID, 'Tamam')
    expect(steps(calls[0], 'insert')).toEqual([['insert', { request_id: REQUEST_ID, body: 'Tamam' }]])
  })

  it('an edit that changes no row (someone else\'s comment) reads as "not found or not allowed"', async () => {
    respond = () => ({ error: null, count: 0 })
    await expect(data.editComment('c1', 'x')).rejects.toMatchObject({ code: 'PGRST116' })
    respond = () => ({ error: null, count: 1 })
    await expect(data.editComment('c1', 'x')).resolves.toBeUndefined()
    expect(steps(calls[1], 'update')).toEqual([['update', { body: 'x' }, { count: 'exact' }]])
  })

  it('changes a status through set_revision_status and passes refusals on', async () => {
    rpc.mockResolvedValueOnce({ data: 'change-1', error: null })
    await expect(data.setRevisionStatus(REQUEST_ID, 'done')).resolves.toBe('change-1')
    expect(rpc).toHaveBeenCalledWith('set_revision_status', { p_request: REQUEST_ID, p_status: 'done' })
    const refusal = { code: '42501', message: 'only the main admin sets this status' }
    rpc.mockResolvedValueOnce({ data: null, error: refusal })
    await expect(data.setRevisionStatus(REQUEST_ID, 'in_progress')).rejects.toBe(refusal)
  })

  it('uploads screenshots under the request, then records them for the request or the comment', async () => {
    let n = 0
    const newId = () => `f${(n += 1)}`
    await data.attachScreenshots({ requestId: REQUEST_ID, commentId: 'c1' }, [file('a.png', 'image/png', 10), file('b.jpg', 'image/jpeg', 10)], newId)
    expect(uploads).toEqual([
      { bucket: 'revision-screenshots', path: `${REQUEST_ID}/f1.png`, options: { contentType: 'image/png', upsert: false } },
      { bucket: 'revision-screenshots', path: `${REQUEST_ID}/f2.jpg`, options: { contentType: 'image/jpeg', upsert: false } },
    ])
    expect(calls).toHaveLength(1)
    expect(calls[0]?.table).toBe('revision_attachments')
    expect(steps(calls[0], 'insert')).toEqual([
      [
        'insert',
        [
          { request_id: REQUEST_ID, comment_id: 'c1', object_path: `${REQUEST_ID}/f1.png` },
          { request_id: REQUEST_ID, comment_id: 'c1', object_path: `${REQUEST_ID}/f2.jpg` },
        ],
      ],
    ])
  })

  it('records the screenshots that arrived and then reports the one that did not', async () => {
    let n = 0
    const tooBig = { statusCode: '413', message: 'The object exceeded the maximum allowed size' }
    uploadFails = (path) => (path.endsWith('f2.png') ? tooBig : null)
    const result = data.attachScreenshots({ requestId: REQUEST_ID, commentId: null }, [file('a.png', 'image/png', 10), file('b.png', 'image/png', 10)], () => `f${(n += 1)}`)
    await expect(result).rejects.toBe(tooBig)
    expect(steps(calls[0], 'insert')).toEqual([['insert', [{ request_id: REQUEST_ID, comment_id: null, object_path: `${REQUEST_ID}/f1.png` }]]])
  })

  it('does nothing without files', async () => {
    await data.attachScreenshots({ requestId: REQUEST_ID, commentId: null }, [])
    expect(uploads).toHaveLength(0)
    expect(calls).toHaveLength(0)
  })

  it('signs the private screenshots for ten minutes only', async () => {
    createSignedUrls.mockResolvedValueOnce({ data: [{ path: 'p1', signedUrl: 'https://x/p1?token=1' }, { path: 'p2', signedUrl: null }], error: null })
    await expect(data.screenshotUrls(['p1', 'p2'])).resolves.toEqual({ p1: 'https://x/p1?token=1' })
    expect(createSignedUrls).toHaveBeenCalledWith(['p1', 'p2'], 600)
    await expect(data.screenshotUrls([])).resolves.toEqual({})
    expect(createSignedUrls).toHaveBeenCalledTimes(1)
  })

  it('asks revision-notify after an action and never throws, whatever happens to it', async () => {
    invoke.mockResolvedValueOnce({ data: { ok: true, recipients: 2, sent: 0, failed: 0, notConfigured: 2, skipped: 0 }, error: null })
    await expect(data.notifyRevision('created', REQUEST_ID)).resolves.toEqual({ recipients: 2, sent: 0, failed: 0, notConfigured: 2 })
    expect(invoke).toHaveBeenCalledWith('revision-notify', { body: { event: 'created', id: REQUEST_ID } })
    invoke.mockResolvedValueOnce({ data: null, error: new Error('boom') })
    await expect(data.notifyRevision('done', 'change-1')).resolves.toBeNull()
    invoke.mockRejectedValueOnce(new TypeError('fetch failed'))
    await expect(data.notifyRevision('commented', 'c1')).resolves.toBeNull()
  })

  it('loads one request with its comments, status changes and screenshots', async () => {
    respond = (call) => ({ data: call.table === 'revision_requests' ? request() : [], error: null })
    const detail = await data.loadRevision(REQUEST_ID)
    expect(detail.request?.id).toBe(REQUEST_ID)
    expect(calls.map((call) => call.table).sort()).toEqual(['revision_attachments', 'revision_comments', 'revision_requests', 'revision_status_changes'])
    for (const call of calls.filter((item) => item.table !== 'revision_requests')) {
      expect(steps(call, 'eq')).toEqual([['eq', 'request_id', REQUEST_ID]])
    }
    const failure = { code: 'PGRST301', message: 'JWT expired' }
    respond = (call) => (call.table === 'revision_comments' ? { data: null, error: failure } : { data: [], error: null })
    await expect(data.loadRevision(REQUEST_ID)).rejects.toBe(failure)
  })
})
