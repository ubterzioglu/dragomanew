import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  addContentSecurityPolicy,
  addContentSecurityPolicyToPages,
  contentSecurityPolicy,
  inlineScriptHashes,
  supabaseConnectSources,
} from '../../src/lib/contentSecurityPolicy'

// Example from the CSP Level 3 specification ("hash-source").
const SPEC_SCRIPT = "alert('Hello, world.');"
const SPEC_HASH = "'sha256-qznLcsROx4GACP2dm0UCKCzCG+HiZ1guq6ZZDob/Tng='"
// Only a string in a policy: nothing here connects to it.
const SUPABASE = 'https://abcdefgh.supabase.co'

const page = (head: string) => `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">${head}</head><body></body></html>`

describe('inlineScriptHashes', () => {
  it('hashes the script text the way browsers do', () => {
    expect(inlineScriptHashes(`<script>${SPEC_SCRIPT}</script>`)).toEqual([SPEC_HASH])
  })

  it('normalises CRLF line breaks before hashing, like the HTML parser', () => {
    expect(inlineScriptHashes('<script>a();\r\nb();</script>')).toEqual(inlineScriptHashes('<script>a();\nb();</script>'))
  })

  it('skips external scripts and data blocks the browser never runs', () => {
    const html = `<script type="module" crossorigin src="/assets/app.js"></script><script type="application/ld+json">{"a":1}</script><script type="module">${SPEC_SCRIPT}</script>`
    expect(inlineScriptHashes(html)).toEqual([SPEC_HASH])
  })

  it('lists a repeated script once', () => {
    expect(inlineScriptHashes(`<script>${SPEC_SCRIPT}</script><script>${SPEC_SCRIPT}</script>`)).toEqual([SPEC_HASH])
  })
})

describe('contentSecurityPolicy', () => {
  it('allows only the site itself plus the hashed inline scripts', () => {
    const policy = contentSecurityPolicy([SPEC_HASH])
    expect(policy).toContain(`script-src 'self' ${SPEC_HASH};`)
    expect(policy).toContain("object-src 'none'")
    expect(policy).not.toContain('unsafe-inline')
    expect(policy).not.toContain('unsafe-eval')
    // Ignored in a meta tag; the host sends it as a header.
    expect(policy).not.toContain('frame-ancestors')
  })

  it('lets scripts connect to the site alone unless another source is given', () => {
    expect(contentSecurityPolicy([])).toContain("connect-src 'self';")
  })

  it('adds the given connect sources to connect-src only', () => {
    const policy = contentSecurityPolicy([SPEC_HASH], [SUPABASE])
    expect(policy).toContain(`connect-src 'self' ${SUPABASE};`)
    expect(policy.match(new RegExp(SUPABASE.replace(/[.]/g, '\\.'), 'g'))).toHaveLength(1)
    expect(policy).toContain("default-src 'self';")
    expect(policy).toContain("form-action 'self'")
  })
})

describe('supabaseConnectSources (VITE_SUPABASE_URL)', () => {
  it('adds nothing when the URL is not set', () => {
    expect(supabaseConnectSources(undefined)).toEqual([])
    expect(supabaseConnectSources('')).toEqual([])
    expect(supabaseConnectSources('   ')).toEqual([])
  })

  it('allows the origin of the URL, whatever path or slash it ends with', () => {
    expect(supabaseConnectSources(` ${SUPABASE}/ `)).toEqual([SUPABASE])
    expect(supabaseConnectSources('http://127.0.0.1:54321/functions/v1')).toEqual(['http://127.0.0.1:54321'])
  })

  it('fails the build on a URL the browser could not connect to', () => {
    for (const bad of ['abcdefgh.supabase.co', 'ftp://abcdefgh.supabase.co', 'javascript:alert(1)', 'http://abcdefgh.supabase.co']) {
      expect(() => supabaseConnectSources(bad), bad).toThrow(/VITE_SUPABASE_URL/)
    }
  })
})

describe('addContentSecurityPolicy', () => {
  it('puts the policy straight after the charset, before every script', () => {
    const html = addContentSecurityPolicy(page(`<title>x</title><script>${SPEC_SCRIPT}</script>`))
    const meta = html.indexOf('<meta http-equiv="Content-Security-Policy"')
    expect(meta).toBe(html.indexOf('<meta charset="UTF-8">') + '<meta charset="UTF-8">'.length)
    expect(meta).toBeLessThan(html.indexOf('<script'))
    expect(html).toContain(SPEC_HASH)
  })

  it('fails the build when a page has no charset to anchor the policy', () => {
    expect(() => addContentSecurityPolicy('<html><head></head></html>')).toThrow(/charset/)
  })

  it('passes the connect sources on to the policy', () => {
    expect(addContentSecurityPolicy(page(''), [SUPABASE])).toContain(`connect-src 'self' ${SUPABASE};`)
    expect(addContentSecurityPolicy(page(''))).toContain("connect-src 'self';")
  })

  it('replaces an earlier policy instead of adding a second one', () => {
    const once = addContentSecurityPolicy(page(`<script>${SPEC_SCRIPT}</script>`))
    const twice = addContentSecurityPolicy(once.replace(SPEC_SCRIPT, 'other();'))
    expect(twice.match(/http-equiv="Content-Security-Policy"/g)).toHaveLength(1)
    expect(twice).not.toContain(SPEC_HASH)
  })
})

describe('addContentSecurityPolicyToPages', () => {
  it('adds the policy to every page in the build, nested ones included', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'csp-'))
    try {
      await mkdir(path.join(dir, 'tr', '404'), { recursive: true })
      await writeFile(path.join(dir, 'index.html'), page(`<script>${SPEC_SCRIPT}</script>`))
      await writeFile(path.join(dir, 'tr', '404', 'index.html'), page('<script>other();</script>'))
      await writeFile(path.join(dir, 'data.json'), '{}')
      expect(await addContentSecurityPolicyToPages(dir)).toBe(2)
      expect(await readFile(path.join(dir, 'index.html'), 'utf8')).toContain(SPEC_HASH)
      expect(await readFile(path.join(dir, 'tr', '404', 'index.html'), 'utf8')).toContain('http-equiv="Content-Security-Policy"')
      expect(await readFile(path.join(dir, 'data.json'), 'utf8')).toBe('{}')
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('gives every page the same connect sources', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'csp-'))
    try {
      await mkdir(path.join(dir, 'en'), { recursive: true })
      await writeFile(path.join(dir, 'index.html'), page(''))
      await writeFile(path.join(dir, 'en', 'index.html'), page(''))
      expect(await addContentSecurityPolicyToPages(dir, [SUPABASE])).toBe(2)
      for (const file of ['index.html', path.join('en', 'index.html')]) {
        expect(await readFile(path.join(dir, file), 'utf8')).toContain(`connect-src 'self' ${SUPABASE};`)
      }
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
