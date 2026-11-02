import { describe, expect, it, vi } from 'vitest'
import { hashSource, type TranslationMeta } from '../../src/shared/content/translation'
import { DeeplError, type DeeplClient, type TranslateParams } from '../../../supabase/functions/_shared/deepl/client.ts'
import { glossaryHash, type GlossarySetting } from '../../../supabase/functions/_shared/deepl/glossary.ts'
import { handleTranslate } from '../../../supabase/functions/translate-content/handler.ts'
import type { LoadedTarget, TranslateDeps, TranslateStore, TranslateTarget, TranslationRun, UsageSetting } from '../../../supabase/functions/translate-content/types.ts'
import { fakeVerifier, ORIGIN, staffRequest } from './edgeStaff'

const URL = 'http://localhost/functions/v1/translate-content'
const NOW = new Date('2026-11-02T12:00:00.000Z')
const ENTRY = '00000000-0000-4000-8000-000000000001'

const draft = () => ({
  id: 'kekova-tur',
  slug: { tr: 'kekova-turu', en: 'kekova-turu', fr: '', de: 'kekova-tour-de' },
  title: { tr: 'Kekova turu', de: 'Kekova Tour' },
  summary: { tr: 'Kaş açıklarında gün boyu kano.' },
  body: { tr: [{ type: 'p', text: 'Kekova turu' }, { type: 'ul', items: ['Kano', 'Öğle yemeği'] }] },
})

interface Fakes {
  loaded?: LoadedTarget | null
  usage?: UsageSetting | null
  glossary?: GlossarySetting | null
  save?: TranslateStore['saveTarget']
  translate?: DeeplClient['translate']
  freshUsage?: DeeplClient['usage']
}

function setup(fakes: Fakes = {}) {
  const loaded: LoadedTarget | null =
    fakes.loaded === undefined ? { revision: 5, doc: draft(), meta: {}, context: 'Kekova turu', neverPublished: true } : fakes.loaded
  let usage: UsageSetting | null = fakes.usage === undefined ? { count: 1000, limit: 500000, checkedAt: '2026-11-02T11:55:00.000Z' } : fakes.usage
  let glossary = fakes.glossary === undefined ? { id: 'g-1', hash: glossaryHash() } : fakes.glossary
  const saved: Array<{ target: TranslateTarget; revision: number; doc: Record<string, unknown>; meta: TranslationMeta }> = []
  const runs: TranslationRun[] = []
  const store: TranslateStore = {
    loadTarget: vi.fn(async () => loaded),
    saveTarget: vi.fn(
      fakes.save ??
        (async (target, revision, doc, meta) => {
          saved.push({ target, revision, doc: doc as Record<string, unknown>, meta })
          return revision + 1
        }),
    ),
    logRun: vi.fn(async (run: TranslationRun) => void runs.push(run)),
    readUsage: vi.fn(async () => usage),
    writeUsage: vi.fn(async (next: UsageSetting) => void (usage = next)),
    readGlossary: vi.fn(async () => glossary),
    writeGlossary: vi.fn(async (next: GlossarySetting) => void (glossary = next)),
  }
  const calls: TranslateParams[] = []
  const deepl: DeeplClient = {
    translate: vi.fn(async (params: TranslateParams) => {
      calls.push(params)
      if (fakes.translate) return fakes.translate(params)
      return { texts: params.texts.map((text) => `${params.target}:${text}`), traceId: 'trace-7' }
    }),
    usage: vi.fn(fakes.freshUsage ?? (async () => ({ count: 2000, limit: 500000 }))),
    createGlossary: vi.fn(async () => 'g-new'),
    deleteGlossary: vi.fn(async () => undefined),
  }
  const reportError = vi.fn()
  const deps: TranslateDeps = { store, auth: fakeVerifier(), deepl, allowedOrigins: [ORIGIN], clock: () => NOW, reportError }
  return { deps, store, deepl, calls, saved, runs, reportError, usage: () => usage }
}

const translateBody = (overrides: Record<string, unknown> = {}) => ({
  action: 'translate',
  target: { kind: 'content', id: ENTRY },
  expectedRevision: 5,
  locales: ['en', 'fr', 'de'],
  mode: 'missing',
  ...overrides,
})

const send = async (deps: TranslateDeps, body: unknown, options: Parameters<typeof staffRequest>[2] = {}) => {
  const response = await handleTranslate(staffRequest(URL, body, options), deps)
  return { status: response.status, body: (await response.json().catch(() => null)) as Record<string, unknown> | null }
}

describe('translate-content: auth and input', () => {
  it('401 without an AAL2 session, 403 without content.translate, 403 for a foreign origin', async () => {
    const { deps } = setup()
    expect(await send(deps, { action: 'usage' }, { token: null })).toMatchObject({ status: 401, body: { error: 'unauthorized' } })
    expect((await send(deps, { action: 'usage' }, { token: 'aal1' })).status).toBe(401)
    expect(await send(deps, { action: 'usage' }, { token: 'forms' })).toMatchObject({ status: 403, body: { error: 'forbidden' } })
    expect((await send(deps, { action: 'usage' }, { origin: 'https://evil.example' })).status).toBe(403)
  })

  it('403 when the caller may translate but not edit that kind of draft (forms need forms.manage)', async () => {
    const { deps, saved } = setup()
    const formBody = translateBody({ target: { kind: 'form', key: 'contact' }, expectedRevision: 1, locales: ['en'] })
    expect(await send(deps, formBody, { token: 'content' })).toMatchObject({ status: 403, body: { error: 'forbidden' } })
    expect(saved).toHaveLength(0)
  })

  it('400 bad_request for a bad body', async () => {
    const { deps } = setup()
    expect(await send(deps, translateBody({ locales: ['tr'] }))).toMatchObject({ status: 400, body: { error: 'bad_request' } })
    expect((await send(deps, translateBody({ target: { kind: 'content', id: 'not-a-uuid' } }))).status).toBe(400)
    expect((await send(deps, '[')).status).toBe(400)
  })

  it('404 not_found for a missing target, 409 stale_draft for a moved revision', async () => {
    expect(await send(setup({ loaded: null }).deps, translateBody())).toMatchObject({ status: 404, body: { error: 'not_found' } })
    expect(await send(setup().deps, translateBody({ expectedRevision: 4 }))).toMatchObject({ status: 409, body: { error: 'stale_draft' } })
  })
})

describe('translate-content: usage', () => {
  it('serves the cached usage for 10 minutes, then refreshes /v2/usage', async () => {
    const fresh = setup()
    expect(await send(fresh.deps, { action: 'usage' })).toMatchObject({ status: 200, body: { ok: true, usage: { count: 1000, limit: 500000, ratio: 0.002, level: 'ok' } } })
    expect(fresh.deepl.usage).not.toHaveBeenCalled()

    const old = setup({ usage: { count: 420000, limit: 500000, checkedAt: '2026-11-02T11:40:00.000Z' }, freshUsage: async () => ({ count: 450000, limit: 500000 }) })
    expect(await send(old.deps, { action: 'usage' })).toMatchObject({ body: { usage: { count: 450000, level: 'warn' } } })
    expect(old.usage()).toEqual({ count: 450000, limit: 500000, checkedAt: NOW.toISOString() })

    const full = setup({ usage: null, freshUsage: async () => ({ count: 500000, limit: 500000 }) })
    expect(await send(full.deps, { action: 'usage' })).toMatchObject({ body: { usage: { ratio: 1, level: 'critical' } } })
  })

  it('maps a DeepL failure without a cached value onto deepl_auth / deepl_unavailable', async () => {
    const auth = setup({ usage: null, freshUsage: async () => Promise.reject(new DeeplError('auth', 403, null, 'refused')) })
    expect(await send(auth.deps, { action: 'usage' })).toMatchObject({ status: 502, body: { error: 'deepl_auth' } })
    const down = setup({ usage: null, freshUsage: async () => Promise.reject(new DeeplError('unavailable', 503, null, 'x')) })
    expect(await send(down.deps, { action: 'usage' })).toMatchObject({ status: 503, body: { error: 'deepl_unavailable' } })
  })
})

describe('translate-content: translate', () => {
  it('translates missing values, dedupes strings, sends context and glossary, follows slugs', async () => {
    const { deps, calls, saved, runs } = setup()
    const result = await send(deps, translateBody())
    expect(result).toMatchObject({ status: 200, body: { ok: true, draftRevision: 6, skippedManual: 0, usage: { count: 2000 } } })

    // de has a title already; en/fr/de miss summary and body.
    const en = calls.find((call) => call.target === 'en')
    expect(en).toMatchObject({ context: 'Kekova turu', glossaryId: 'g-1' })
    // "Kekova turu" (title and first block) is sent once.
    expect(en?.texts).toEqual(['Kekova turu', 'Kaş açıklarında gün boyu kano.', 'Kano', 'Öğle yemeği'])
    expect(calls.find((call) => call.target === 'de')?.texts).toEqual(['Kaş açıklarında gün boyu kano.', 'Kekova turu', 'Kano', 'Öğle yemeği'])

    const doc = saved[0]?.doc as Record<string, Record<string, unknown>>
    expect(doc.title).toEqual({ tr: 'Kekova turu', en: 'en:Kekova turu', fr: 'fr:Kekova turu', de: 'Kekova Tour' })
    expect(doc.body?.en).toEqual([{ type: 'p', text: 'en:Kekova turu' }, { type: 'ul', items: ['en:Kano', 'en:Öğle yemeği'] }])
    // en was a copy of the tr slug and fr was empty: both follow the new title; de had its own.
    expect(doc.slug).toEqual({ tr: 'kekova-turu', en: 'en-kekova-turu', fr: 'fr-kekova-turu', de: 'kekova-tour-de' })
    expect(saved[0]?.meta['/title']?.en).toEqual({ hash: hashSource('Kekova turu'), origin: 'deepl', at: NOW.toISOString() })

    const chars = (texts: string[]) => texts.reduce((sum, text) => sum + [...text].length, 0)
    const expected = calls.reduce((sum, call) => sum + chars([...call.texts]), 0)
    expect(result.body?.sourceChars).toBe(expected)
    expect(result.body?.translated).toBe(8)
    expect(runs).toEqual([expect.objectContaining({ targetKind: 'content', targetId: ENTRY, status: 'ok', deeplTraceId: 'trace-7', sourceChars: expected })])
    expect(JSON.stringify(result.body)).not.toContain('trace-7')
  })

  it('leaves slugs of a published entry alone', async () => {
    const { deps, saved } = setup({ loaded: { revision: 5, doc: draft(), meta: {}, context: 'Kekova turu', neverPublished: false } })
    await send(deps, translateBody())
    expect((saved[0]?.doc as ReturnType<typeof draft>).slug).toEqual(draft().slug)
  })

  it('skips manual fixes unless asked, and counts them', async () => {
    const meta: TranslationMeta = { '/title': { de: { hash: 'old', origin: 'manual', at: '2026-11-01T00:00:00.000Z' } } }
    const loaded = { revision: 5, doc: draft(), meta, context: null, neverPublished: false }
    const skipped = setup({ loaded })
    const result = await send(skipped.deps, translateBody({ mode: 'stale', locales: ['de'] }))
    expect(result).toMatchObject({ status: 200, body: { translated: 0, skippedManual: 1, sourceChars: 0 } })
    expect(skipped.deepl.translate).not.toHaveBeenCalled()

    const included = setup({ loaded })
    expect(await send(included.deps, translateBody({ mode: 'stale', locales: ['de'], includeManual: true }))).toMatchObject({ body: { translated: 1, skippedManual: 0 } })
    expect(included.calls[0]).toMatchObject({ target: 'de', texts: ['Kekova turu'] })
    expect(included.calls[0]).not.toHaveProperty('context', expect.anything())
  })

  it('409 quota_insufficient before anything is sent', async () => {
    const { deps, deepl } = setup({ usage: { count: 499990, limit: 500000, checkedAt: '2026-11-02T11:59:00.000Z' } })
    const result = await send(deps, translateBody())
    expect(result).toMatchObject({ status: 409, body: { error: 'quota_insufficient', remaining: 10 } })
    expect(result.body?.needed).toBeGreaterThan(10)
    expect(deepl.translate).not.toHaveBeenCalled()
  })

  it('409 stale_draft when the draft moved during translation', async () => {
    const { deps, runs } = setup({ save: async () => null })
    expect(await send(deps, translateBody())).toMatchObject({ status: 409, body: { error: 'stale_draft' } })
    expect(runs[0]).toMatchObject({ status: 'failed', errorCode: 'stale_draft' })
  })

  it('502 deepl_auth, 503 deepl_quota (marks usage full), 503 deepl_unavailable, 500 for a DeepL 400', async () => {
    const auth = setup({ translate: async () => Promise.reject(new DeeplError('auth', 403, 'tr-a', 'refused')) })
    expect(await send(auth.deps, translateBody())).toMatchObject({ status: 502, body: { error: 'deepl_auth' } })
    expect(auth.runs[0]).toMatchObject({ status: 'failed', errorCode: 'deepl_auth', deeplTraceId: 'tr-a' })

    const quota = setup({ translate: async () => Promise.reject(new DeeplError('quota', 456, null, 'refused')) })
    expect(await send(quota.deps, translateBody())).toMatchObject({ status: 503, body: { error: 'deepl_quota' } })
    expect(quota.usage()).toMatchObject({ count: 500000, limit: 500000 })

    const down = setup({ translate: async () => Promise.reject(new DeeplError('unavailable', 503, null, 'x')) })
    expect(await send(down.deps, translateBody())).toMatchObject({ status: 503, body: { error: 'deepl_unavailable' } })
    expect(down.saved).toHaveLength(0)

    const bad = setup({ translate: async () => Promise.reject(new DeeplError('bad_request', 400, null, 'x')) })
    expect(await send(bad.deps, translateBody())).toMatchObject({ status: 500, body: { error: 'server' } })
  })

  it('500 server for a store failure, still logged since DeepL already counted the characters', async () => {
    const { deps, reportError, runs } = setup({ save: async () => Promise.reject(new Error('db')) })
    expect(await send(deps, translateBody())).toMatchObject({ status: 500, body: { error: 'server' } })
    expect(reportError).toHaveBeenCalled()
    expect(runs).toHaveLength(1)
    expect(runs[0]).toMatchObject({ status: 'failed', errorCode: 'server' })
    expect(runs[0]?.sourceChars).toBeGreaterThan(0)
  })

  it('creates the glossary when none is stored and translates without one when that fails', async () => {
    const fresh = setup({ glossary: null })
    await send(fresh.deps, translateBody({ locales: ['en'] }))
    expect(fresh.calls[0]?.glossaryId).toBe('g-new')

    const failing = setup({ glossary: null })
    vi.mocked(failing.deepl.createGlossary).mockRejectedValue(new DeeplError('bad_request', 400, null, 'unsupported'))
    expect((await send(failing.deps, translateBody({ locales: ['en'] }))).status).toBe(200)
    expect(failing.calls[0]?.glossaryId).toBeUndefined()
  })

  it('translates media alt text and form labels', async () => {
    const media = setup({ loaded: { revision: 2, doc: { alt: { tr: 'Kekova batık şehir' } }, meta: {}, context: null, neverPublished: false } })
    const mediaResult = await send(media.deps, translateBody({ target: { kind: 'media', id: 'kekova-1' }, expectedRevision: 2, locales: ['fr'] }))
    expect(mediaResult).toMatchObject({ status: 200, body: { translated: 1 } })
    expect(media.saved[0]?.doc).toEqual({ alt: { tr: 'Kekova batık şehir', fr: 'fr:Kekova batık şehir' } })

    const form = { format: 1, fields: [{ kind: 'custom', key: 'c_diet', type: 'text', required: false, label: { tr: 'Diyet' } }] }
    const forms = setup({ loaded: { revision: 3, doc: form, meta: {}, context: null, neverPublished: false } })
    await send(forms.deps, translateBody({ target: { kind: 'form', key: 'event' }, expectedRevision: 3, locales: ['en'] }))
    expect((forms.saved[0]?.doc as typeof form).fields[0]?.label).toEqual({ tr: 'Diyet', en: 'en:Diyet' })
    expect(forms.runs[0]).toMatchObject({ targetKind: 'form', targetId: 'event' })
  })
})
