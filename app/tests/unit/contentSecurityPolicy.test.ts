import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  addContentSecurityPolicy,
  addContentSecurityPolicyToPages,
  contentSecurityPolicy,
  inlineScriptHashes,
} from '../../src/lib/contentSecurityPolicy'

// Example from the CSP Level 3 specification ("hash-source").
const SPEC_SCRIPT = "alert('Hello, world.');"
const SPEC_HASH = "'sha256-qznLcsROx4GACP2dm0UCKCzCG+HiZ1guq6ZZDob/Tng='"

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
})
