import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { batchStrings, codePoints, MAX_BATCH_BYTES, rebuild, stringsOf, uniqueStrings } from '../../../supabase/functions/_shared/deepl/batch.ts'
import { createDeeplClient, DEEPL_FREE_BASE, DEEPL_PRO_BASE, DeeplError, deeplBaseUrl, type DeeplClient } from '../../../supabase/functions/_shared/deepl/client.ts'
import { ensureGlossary, glossaryDictionaries, glossaryHash, type GlossarySetting } from '../../../supabase/functions/_shared/deepl/glossary.ts'

/** DeepL client, batching and glossary with a mocked fetch (never a real key or request). */

const FAKE_KEY = 'test-key-not-real:fx'

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'x-trace-id': 'trace-1', ...headers } })

/** Echo translator: "[DE] text" for each text sent. */
const echo = (init?: RequestInit) => {
  const body = JSON.parse(String(init?.body)) as { text: string[]; target_lang: string }
  return json(200, { translations: body.text.map((text) => ({ detected_source_language: 'TR', text: `[${body.target_lang}] ${text}` })) })
}

describe('DeepL client: requests', () => {
  it('uses api-free for :fx keys and api.deepl.com otherwise', () => {
    expect(deeplBaseUrl('abc:fx')).toBe(DEEPL_FREE_BASE)
    expect(deeplBaseUrl('abc')).toBe(DEEPL_PRO_BASE)
  })

  it('sends TR → EN-GB without formality, FR/DE with prefer_more, context and glossary', async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => echo(init))
    const client = createDeeplClient({ apiKey: FAKE_KEY, fetch: fetchMock as unknown as typeof fetch })

    const en = await client.translate({ texts: ['Merhaba'], target: 'en', context: 'Kaş dalışı' })
    await client.translate({ texts: ['Merhaba'], target: 'fr', glossaryId: 'g-1' })
    await client.translate({ texts: ['Merhaba'], target: 'de' })
    expect(en).toEqual({ texts: ['[EN-GB] Merhaba'], traceId: 'trace-1' })

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe(`${DEEPL_FREE_BASE}/v2/translate`)
    expect((init?.headers as Record<string, string>).authorization).toBe(`DeepL-Auth-Key ${FAKE_KEY}`)
    const bodies = fetchMock.mock.calls.map(([, call]) => JSON.parse(String(call?.body)) as Record<string, unknown>)
    expect(bodies[0]).toEqual({ text: ['Merhaba'], source_lang: 'TR', target_lang: 'EN-GB', preserve_formatting: true, context: 'Kaş dalışı' })
    expect(bodies[1]).toMatchObject({ target_lang: 'FR', formality: 'prefer_more', glossary_id: 'g-1' })
    expect(bodies[2]).toMatchObject({ target_lang: 'DE', formality: 'prefer_more' })
    expect(bodies[0]).not.toHaveProperty('formality')
  })

  it('fails as auth without sending a request when no key is configured', async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request) => json(200, { character_count: 0, character_limit: 500000 }))
    const client = createDeeplClient({ apiKey: '', fetch: fetchMock as unknown as typeof fetch })
    await expect(client.usage()).rejects.toMatchObject({ kind: 'auth' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reads /v2/usage', async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request) => json(200, { character_count: 1200, character_limit: 500000 }))
    const client = createDeeplClient({ apiKey: 'pro-key', fetch: fetchMock as unknown as typeof fetch })
    expect(await client.usage()).toEqual({ count: 1200, limit: 500000 })
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${DEEPL_PRO_BASE}/v2/usage`)
  })

  it('rejects a translate answer with the wrong number of texts', async () => {
    const client = createDeeplClient({ apiKey: FAKE_KEY, fetch: (async () => json(200, { translations: [] })) as unknown as typeof fetch })
    await expect(client.translate({ texts: ['a'], target: 'en' })).rejects.toMatchObject({ kind: 'unavailable' })
  })
})

describe('DeepL client: retries', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  /** Runs `promise` while advancing fake time; returns the settled outcome and the elapsed ms. */
  async function settle<T>(promise: Promise<T>): Promise<{ value?: T; error?: unknown; elapsed: number }> {
    const start = Date.now()
    const outcome = promise.then((value) => ({ value }), (error: unknown) => ({ error }))
    await vi.runAllTimersAsync()
    return { ...(await outcome), elapsed: Date.now() - start }
  }

  it('retries 429 and 5xx after 1, 2 and 4 seconds, then succeeds', async () => {
    const statuses = [429, 500, 503]
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const status = statuses.shift()
      return status ? json(status, {}) : echo(init)
    })
    const client = createDeeplClient({ apiKey: FAKE_KEY, fetch: fetchMock as unknown as typeof fetch })
    const result = await settle(client.translate({ texts: ['a'], target: 'en' }))
    expect(result.value?.texts).toEqual(['[EN-GB] a'])
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(result.elapsed).toBe(1000 + 2000 + 4000)
  })

  it('gives up after three retries with deepl unavailable', async () => {
    const fetchMock = vi.fn(async () => json(502, {}, { 'x-trace-id': 'trace-9' }))
    const client = createDeeplClient({ apiKey: FAKE_KEY, fetch: fetchMock as unknown as typeof fetch })
    const result = await settle(client.translate({ texts: ['a'], target: 'en' }))
    expect(result.error).toBeInstanceOf(DeeplError)
    expect(result.error).toMatchObject({ kind: 'unavailable', status: 502, traceId: 'trace-9' })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('retries a timeout (aborted request) and network errors', async () => {
    let calls = 0
    const fetchMock = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
      calls += 1
      if (calls === 1) {
        // Hangs until the client's timeout aborts it.
        return new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))
      }
      if (calls === 2) return Promise.reject(new TypeError('fetch failed'))
      return Promise.resolve(echo(init))
    })
    const client = createDeeplClient({ apiKey: FAKE_KEY, fetch: fetchMock as unknown as typeof fetch, timeoutMs: 5000 })
    const result = await settle(client.translate({ texts: ['a'], target: 'de' }))
    expect(result.value?.texts).toEqual(['[DE] a'])
    expect(result.elapsed).toBe(5000 + 1000 + 2000)
  })

  it('a timeout every time ends unavailable', async () => {
    const fetchMock = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))),
    )
    const client = createDeeplClient({ apiKey: FAKE_KEY, fetch: fetchMock as unknown as typeof fetch, timeoutMs: 100 })
    const result = await settle(client.translate({ texts: ['a'], target: 'en' }))
    expect(result.error).toMatchObject({ kind: 'unavailable', status: null })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it.each([
    [400, 'bad_request'],
    [456, 'quota'],
    [403, 'auth'],
    [401, 'auth'],
    [413, 'bad_request'],
  ] as const)('never retries %i (%s)', async (status, kind) => {
    const fetchMock = vi.fn(async () => json(status, { message: 'echoes input' }))
    const client = createDeeplClient({ apiKey: FAKE_KEY, fetch: fetchMock as unknown as typeof fetch })
    const result = await settle(client.translate({ texts: ['a'], target: 'en' }))
    expect(result.error).toMatchObject({ kind, status })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String((result.error as Error).message)).not.toContain(FAKE_KEY)
  })
})

describe('DeepL batching', () => {
  it('flattens strings, lists and blocks, and rebuilds them with the same structure', () => {
    const blocks = [{ type: 'p', text: 'Bir' }, { type: 'ul', items: ['İki', 'Üç'] }, { type: 'h2', text: 'Dört' }]
    expect(stringsOf('Tek')).toEqual(['Tek'])
    expect(stringsOf(['a', 'b'])).toEqual(['a', 'b'])
    expect(stringsOf(blocks)).toEqual(['Bir', 'İki', 'Üç', 'Dört'])
    expect(rebuild(blocks, (text) => text.toUpperCase())).toEqual([{ type: 'p', text: 'BIR' }, { type: 'ul', items: ['İKI', 'ÜÇ'] }, { type: 'h2', text: 'DÖRT' }])
    expect(rebuild(['x'], (text) => `${text}!`)).toEqual(['x!'])
  })

  it('deduplicates and drops blank strings', () => {
    expect(uniqueStrings(['Kaş', ['Kaş', ' ', 'Kekova'], [{ type: 'p', text: 'Kekova' }]])).toEqual(['Kaş', 'Kekova'])
  })

  it('counts code points, not UTF-16 units', () => {
    expect(codePoints('ş🐟')).toBe(2)
  })

  it('caps batches at 50 strings', () => {
    const strings = Array.from({ length: 120 }, (_, i) => `metin ${i}`)
    const batches = batchStrings(strings)
    expect(batches.map((batch) => batch.length)).toEqual([50, 50, 20])
    expect(batches.flat()).toEqual(strings)
  })

  it('caps batches at 100 KiB and sends an oversized string alone', () => {
    const big = 'ş'.repeat(30 * 1024) // ≈60 KiB in UTF-8
    const batches = batchStrings([big, big, 'kısa', 'x'.repeat(120 * 1024)])
    expect(batches.map((batch) => batch.length)).toEqual([1, 2, 1])
    for (const batch of batches.slice(0, 2)) expect(new TextEncoder().encode(JSON.stringify(batch)).byteLength).toBeLessThanOrEqual(MAX_BATCH_BYTES)
  })
})

describe('DeepL glossary', () => {
  function glossaryFakes(initial: GlossarySetting | null, create: DeeplClient['createGlossary'] = async () => 'g-new') {
    let setting = initial
    const store = { readGlossary: vi.fn(async () => setting), writeGlossary: vi.fn(async (next: GlossarySetting) => void (setting = next)) }
    const client = { translate: vi.fn(), usage: vi.fn(), createGlossary: vi.fn(create), deleteGlossary: vi.fn(async () => undefined) } as unknown as DeeplClient
    return { store, client, report: vi.fn(), current: () => setting }
  }

  it('builds TR → EN/FR/DE dictionaries that keep the names', () => {
    const dictionaries = glossaryDictionaries(['Kaş', 'Kekova'])
    expect(dictionaries.map((dictionary) => dictionary.target_lang)).toEqual(['en', 'fr', 'de'])
    expect(dictionaries[0]).toEqual({ source_lang: 'tr', target_lang: 'en', entries: 'Kaş\tKaş\nKekova\tKekova', entries_format: 'tsv' })
  })

  it('creates the glossary once and reuses it while the hash matches', async () => {
    const fakes = glossaryFakes(null)
    expect(await ensureGlossary(fakes.client, fakes.store, fakes.report)).toBe('g-new')
    expect(fakes.current()).toEqual({ id: 'g-new', hash: glossaryHash() })
    expect(await ensureGlossary(fakes.client, fakes.store, fakes.report)).toBe('g-new')
    expect(fakes.client.createGlossary).toHaveBeenCalledTimes(1)
  })

  it('recreates it when the terms change and deletes the old one', async () => {
    const fakes = glossaryFakes({ id: 'g-old', hash: 'outdated' })
    expect(await ensureGlossary(fakes.client, fakes.store, fakes.report)).toBe('g-new')
    expect(fakes.client.deleteGlossary).toHaveBeenCalledWith('g-old')
  })

  it('skips the glossary (undefined) when DeepL refuses it', async () => {
    const fakes = glossaryFakes(null, async () => Promise.reject(new DeeplError('bad_request', 400, null, 'refused')))
    expect(await ensureGlossary(fakes.client, fakes.store, fakes.report)).toBeUndefined()
    expect(fakes.report).toHaveBeenCalledWith('translate-content: glossary skipped', expect.any(DeeplError))
    expect(fakes.store.writeGlossary).not.toHaveBeenCalled()
  })

  it('creates via POST /v3/glossaries on the client', async () => {
    const fetchMock = vi.fn(async () => json(201, { glossary_id: 'g-42' }))
    const client = createDeeplClient({ apiKey: FAKE_KEY, fetch: fetchMock as unknown as typeof fetch })
    expect(await client.createGlossary('dragoman-names', glossaryDictionaries())).toBe('g-42')
    const [url, init] = (fetchMock.mock.calls[0] ?? []) as unknown as [string, RequestInit]
    expect(url).toBe(`${DEEPL_FREE_BASE}/v3/glossaries`)
    expect(JSON.parse(String(init.body))).toMatchObject({ name: 'dragoman-names', dictionaries: expect.any(Array) })
  })
})
