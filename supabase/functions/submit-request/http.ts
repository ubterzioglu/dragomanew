import type { SubmitErrorCode, SubmitResponse } from '../_shared/requests/payload.ts'

/** HTTP plumbing for handleSubmit: CORS, the key check, a size-capped body read and JSON replies. */

export type HeaderMap = Record<string, string>

const ALLOWED_HEADERS = 'apikey, authorization, content-type, x-client-info'

/** CORS headers for an allowed origin, or null; browsers always send Origin on this cross-site POST. */
export function corsHeaders(origin: string | null, allowed: readonly string[]): HeaderMap | null {
  if (!origin || !allowed.includes(origin)) return null
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': ALLOWED_HEADERS,
    'access-control-max-age': '86400',
    vary: 'Origin',
  }
}

/** The publishable key may come on `apikey` (supabase-js style) or as a bearer token. */
export function hasPublishableKey(request: Request, keys: readonly string[]): boolean {
  const apikey = request.headers.get('apikey')
  const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  return [apikey, bearer].some((candidate) => typeof candidate === 'string' && keys.includes(candidate.trim()))
}

/** Requests that carry no usable address share one bucket: throttled together, never unlimited. */
export const UNKNOWN_CLIENT = 'unknown'

/**
 * The visitor's address for the rate limit, from headers the caller cannot choose.
 * - Hosted *.supabase.co sits behind Cloudflare, which sets CF-Connecting-IP to the address
 *   that connected to it (developers.cloudflare.com/fundamentals/reference/http-headers/).
 * - X-Forwarded-For is appended to, not replaced: a caller that sends "X-Forwarded-For: spoofed"
 *   reaches the function as "spoofed,<real ip>" with cf-connecting-ip = <real ip>
 *   (github.com/orgs/supabase/discussions/34647). So the left-most entry is never trusted;
 *   without CF-Connecting-IP (local `supabase functions serve`) the right-most entry, added by
 *   the nearest proxy, is used.
 * X-Real-IP is ignored: nothing guarantees a proxy overwrote it.
 */
export function clientIp(request: Request): string {
  const edge = request.headers.get('cf-connecting-ip')?.trim()
  if (edge) return edge
  const hops = (request.headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((hop) => hop.trim())
    .filter((hop) => hop !== '')
  return hops.at(-1) ?? UNKNOWN_CLIENT
}

/**
 * Reads the body as text, stopping as soon as it passes `limit` bytes so an oversized
 * upload is never buffered whole. Returns null when the body is too large.
 */
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

export function jsonResponse(status: number, body: SubmitResponse, headers: HeaderMap = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export const failure = (error: SubmitErrorCode, fields?: string[]): SubmitResponse =>
  fields && fields.length > 0 ? { ok: false, error, fields } : { ok: false, error }
