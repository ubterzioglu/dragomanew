import type { TargetLocale } from '../content/translation.ts'

/**
 * A small DeepL API client (dalga2-sozlesme §6 translate-content). Free keys end in `:fx` and use
 * api-free.deepl.com. Requests time out, and 429, 5xx, timeouts and network errors are retried
 * three times after 1, 2 and 4 seconds; 400, 456 and every other 4xx are never retried. The key
 * never leaves the Authorization header: errors carry the status and DeepL's X-Trace-ID only.
 * Deno-free: `fetch` and timers are the platform's (the tests mock fetch and fake the timers).
 */

export const DEEPL_FREE_BASE = 'https://api-free.deepl.com'
export const DEEPL_PRO_BASE = 'https://api.deepl.com'
export const RETRY_DELAYS_MS = [1000, 2000, 4000] as const
export const REQUEST_TIMEOUT_MS = 20_000

export const deeplBaseUrl = (apiKey: string): string => (apiKey.trim().endsWith(':fx') ? DEEPL_FREE_BASE : DEEPL_PRO_BASE)

/** EN-GB, and formal address (`prefer_more`) for French and German only (Q3). */
export const TARGET_LANG: Readonly<Record<TargetLocale, string>> = { en: 'EN-GB', fr: 'FR', de: 'DE' }
const FORMAL = new Set<TargetLocale>(['fr', 'de'])

/** auth = 401/403, quota = 456, unavailable = retries used up, bad_request = any other refusal. */
export type DeeplErrorKind = 'auth' | 'quota' | 'unavailable' | 'bad_request'

export class DeeplError extends Error {
  readonly kind: DeeplErrorKind
  readonly status: number | null
  readonly traceId: string | null

  constructor(kind: DeeplErrorKind, status: number | null, traceId: string | null, detail: string) {
    super(`deepl ${kind}${status === null ? '' : ` (${status})`}: ${detail}`)
    this.name = 'DeeplError'
    this.kind = kind
    this.status = status
    this.traceId = traceId
  }
}

export interface TranslateParams {
  texts: readonly string[]
  target: TargetLocale
  /** Turkish title of the record; DeepL uses it to disambiguate, it is not translated or billed. */
  context?: string
  glossaryId?: string
}

export interface TranslateResult {
  texts: string[]
  traceId: string | null
}

export interface DeeplUsage {
  count: number
  limit: number
}

export interface GlossaryDictionary {
  source_lang: string
  target_lang: string
  entries: string
  entries_format: 'tsv'
}

export interface DeeplClient {
  translate(params: TranslateParams): Promise<TranslateResult>
  usage(): Promise<DeeplUsage>
  createGlossary(name: string, dictionaries: readonly GlossaryDictionary[]): Promise<string>
  deleteGlossary(id: string): Promise<void>
}

export interface DeeplClientOptions {
  apiKey: string
  fetch?: typeof fetch
  timeoutMs?: number
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const retryable = (status: number): boolean => status === 429 || status >= 500

function errorKind(status: number): DeeplErrorKind {
  if (status === 401 || status === 403) return 'auth'
  if (status === 456) return 'quota'
  return retryable(status) ? 'unavailable' : 'bad_request'
}

export function createDeeplClient(options: DeeplClientOptions): DeeplClient {
  const base = deeplBaseUrl(options.apiKey)
  const doFetch = options.fetch ?? fetch
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS

  /** One attempt with a timeout; a timeout or a network failure returns null. */
  async function attempt(path: string, init: RequestInit): Promise<Response | null> {
    // No key configured (the local default): answer as DeepL would, without sending anything.
    if (options.apiKey.trim() === '') return new Response(null, { status: 403 })
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await doFetch(`${base}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { ...(init.headers as Record<string, string> | undefined), authorization: `DeepL-Auth-Key ${options.apiKey}` },
      })
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  async function request(path: string, init: RequestInit): Promise<{ response: Response; traceId: string | null }> {
    let last: { status: number | null; traceId: string | null } = { status: null, traceId: null }
    for (let i = 0; i <= RETRY_DELAYS_MS.length; i += 1) {
      if (i > 0) await sleep(RETRY_DELAYS_MS[i - 1] ?? 0)
      const response = await attempt(path, init)
      if (response === null) {
        last = { status: null, traceId: null }
        continue
      }
      const traceId = response.headers.get('x-trace-id')
      if (response.ok) return { response, traceId }
      // Drain the body so the connection can be reused; its text is not logged (it may echo input).
      await response.body?.cancel().catch(() => undefined)
      if (!retryable(response.status)) throw new DeeplError(errorKind(response.status), response.status, traceId, 'refused')
      last = { status: response.status, traceId }
    }
    throw new DeeplError('unavailable', last.status, last.traceId, last.status === null ? 'timeout or network error' : 'retries exhausted')
  }

  const json = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

  return {
    async translate({ texts, target, context, glossaryId }) {
      const body = {
        text: texts,
        source_lang: 'TR',
        target_lang: TARGET_LANG[target],
        preserve_formatting: true,
        ...(context ? { context } : {}),
        ...(glossaryId ? { glossary_id: glossaryId } : {}),
        ...(FORMAL.has(target) ? { formality: 'prefer_more' } : {}),
      }
      const { response, traceId } = await request('/v2/translate', json(body))
      const data = (await response.json()) as { translations?: Array<{ text?: unknown }> }
      const out = (data.translations ?? []).map((item) => item.text)
      if (out.length !== texts.length || !out.every((item): item is string => typeof item === 'string')) {
        throw new DeeplError('unavailable', response.status, traceId, 'unexpected translate response')
      }
      return { texts: out, traceId }
    },

    async usage() {
      const { response, traceId } = await request('/v2/usage', { method: 'GET' })
      const data = (await response.json()) as { character_count?: unknown; character_limit?: unknown }
      if (typeof data.character_count !== 'number' || typeof data.character_limit !== 'number') {
        throw new DeeplError('unavailable', response.status, traceId, 'unexpected usage response')
      }
      return { count: data.character_count, limit: data.character_limit }
    },

    async createGlossary(name, dictionaries) {
      const { response, traceId } = await request('/v3/glossaries', json({ name, dictionaries }))
      const data = (await response.json()) as { glossary_id?: unknown }
      if (typeof data.glossary_id !== 'string') throw new DeeplError('unavailable', response.status, traceId, 'unexpected glossary response')
      return data.glossary_id
    },

    async deleteGlossary(id) {
      await request(`/v3/glossaries/${encodeURIComponent(id)}`, { method: 'DELETE' })
    },
  }
}
