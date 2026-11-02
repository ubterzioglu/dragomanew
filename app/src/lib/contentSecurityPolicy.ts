import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CHARSET = '<meta charset="UTF-8">'
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi
/** Script types the browser runs; any other type (JSON data blocks) is never executed. */
const RUNNABLE_TYPE = /^(?:module|text\/javascript)$/i

/**
 * CSP hash sources for the page's inline scripts. Browsers hash the script text
 * after normalising line breaks to "\n", so the build does the same.
 */
export function inlineScriptHashes(html: string): string[] {
  const hashes = new Set<string>()
  for (const [, attributes = '', body = ''] of html.matchAll(INLINE_SCRIPT)) {
    const type = /\stype="([^"]*)"/i.exec(attributes)?.[1]
    if (type !== undefined && !RUNNABLE_TYPE.test(type)) continue
    const digest = createHash('sha256').update(body.replace(/\r\n?/g, '\n'), 'utf8').digest('base64')
    hashes.add(`'sha256-${digest}'`)
  }
  return [...hashes]
}

/** The local Supabase stack answers on plain http; anything else must be https or the browser blocks it as mixed content. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

/**
 * connect-src sources for the forms' Supabase project (VITE_SUPABASE_URL): its origin, or nothing
 * while the URL is unset (Stage A, sample forms). Validated here so a malformed URL fails the build
 * instead of every form submission.
 */
export function supabaseConnectSources(supabaseUrl: string | undefined): string[] {
  const value = supabaseUrl?.trim()
  if (!value) return []
  const reject = (): never => {
    throw new Error(`VITE_SUPABASE_URL "${value}" is not an https URL (http only for localhost); expected e.g. https://<project>.supabase.co`)
  }
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return reject()
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname))) reject()
  return [url.origin]
}

/**
 * Everything the site loads is its own (check:dist enforces that), and each
 * page's inline scripts (hydration data, build hash, app loader) are allowed by
 * hash. Scripts may also connect to `connectSources` (the forms' Supabase origin).
 * frame-ancestors cannot be set from a meta tag: the host sends it as a header
 * (deploy/nginx/dragoman.conf).
 */
export function contentSecurityPolicy(scriptHashes: readonly string[], connectSources: readonly string[] = []): string {
  return [
    "default-src 'self'",
    ["script-src 'self'", ...scriptHashes].join(' '),
    "style-src 'self'",
    "img-src 'self'",
    "font-src 'self'",
    ["connect-src 'self'", ...connectSources].join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

const POLICY_META = /<meta http-equiv="Content-Security-Policy" content="[^"]*">/g

/** Puts the page's policy right after <meta charset>, ahead of every script it governs; replaces an earlier one. */
export function addContentSecurityPolicy(page: string, connectSources: readonly string[] = []): string {
  const html = page.replace(POLICY_META, '')
  const at = html.indexOf(CHARSET)
  if (at < 0) throw new Error(`addContentSecurityPolicy: no ${CHARSET} to place the policy after`)
  const end = at + CHARSET.length
  const meta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(inlineScriptHashes(html), connectSources)}">`
  return html.slice(0, end) + meta + html.slice(end)
}

/**
 * Adds the policy to every prerendered page in `dir`. Runs once the whole site
 * is written: vite-react-ssg fills in one inline script (the build hash) only
 * after onPageRendered, so hashing any earlier would block that script.
 */
export async function addContentSecurityPolicyToPages(dir: string, connectSources: readonly string[] = []): Promise<number> {
  const root = path.resolve(dir)
  const pages = (await readdir(root, { recursive: true })).filter((file) => file.endsWith('.html'))
  for (const page of pages) {
    const file = path.join(root, page)
    await writeFile(file, addContentSecurityPolicy(await readFile(file, 'utf8'), connectSources), 'utf8')
  }
  return pages.length
}
