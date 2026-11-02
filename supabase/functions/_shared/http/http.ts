/**
 * HTTP plumbing shared by the Dalga 2 functions (publish-content, translate-content,
 * content-release, site-deploy): CORS, keys and tokens, a size-capped JSON body and the
 * `{ ok: false, error, ...detail }` replies (dalga2-sozlesme §6). Deno-free, so the site's vitest
 * suite runs it in Node. submit-request keeps its own copy (Lane E owns it).
 */

export type HeaderMap = Record<string, string>

const ALLOWED_HEADERS = 'apikey, authorization, content-type, x-client-info'

/** Body cap for the staff functions; a publish request lists at most 50 ids. */
export const MAX_JSON_BYTES = 64 * 1024

export type Failure<E extends string = string> = { ok: false; error: E } & Record<string, unknown>

/**
 * CORS for a browser call from an allowed origin. `null` origin (server-to-server, curl) gets no
 * CORS headers but is not refused: the staff functions authenticate by bearer token, not cookie.
 * Returns `false` for a disallowed origin.
 */
export function corsFor(origin: string | null, allowed: readonly string[], methods = 'POST, OPTIONS'): HeaderMap | false {
  if (!origin) return {}
  if (!allowed.includes(origin)) return false
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': methods,
    'access-control-allow-headers': ALLOWED_HEADERS,
    'access-control-max-age': '86400',
    vary: 'Origin',
  }
}

/** The bearer token of an `Authorization: Bearer …` header, or null. */
export function bearerToken(request: Request): string | null {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)\s*$/i)?.[1]
  return token ?? null
}

/** The publishable key may come on `apikey` (supabase-js style) or as a bearer token. */
export function hasPublishableKey(request: Request, keys: readonly string[]): boolean {
  if (keys.length === 0) return false
  const apikey = request.headers.get('apikey')
  return [apikey, bearerToken(request)].some((candidate) => typeof candidate === 'string' && keys.includes(candidate.trim()))
}

/** Reads the body as text, stopping once it passes `limit` bytes. Null when it is too large. */
export async function readLimitedText(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > limit) return null
  if (!request.body) return ''

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limit) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  chunks.reduce((offset, chunk) => {
    bytes.set(chunk, offset)
    return offset + chunk.byteLength
  }, 0)
  return new TextDecoder().decode(bytes)
}

export type JsonBody = { ok: true; value: unknown } | { ok: false; reason: 'too_large' | 'not_json' }

export async function readJsonBody(request: Request, limit = MAX_JSON_BYTES): Promise<JsonBody> {
  const raw = await readLimitedText(request, limit)
  if (raw === null) return { ok: false, reason: 'too_large' }
  try {
    return { ok: true, value: JSON.parse(raw) as unknown }
  } catch {
    return { ok: false, reason: 'not_json' }
  }
}

export function jsonResponse(status: number, body: unknown, headers: HeaderMap = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export const failure = <E extends string>(error: E, detail: Record<string, unknown> = {}): Failure<E> => ({ ...detail, ok: false, error })

/** Lowercase hex SHA-256 of a UTF-8 string (Web Crypto: Deno and Node alike). */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
