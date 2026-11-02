import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readme = readFileSync(new URL('../src/docs/beni-oku.md', import.meta.url), 'utf8')

describe('Beni Oku! (src/docs/beni-oku.md)', () => {
  it('has its title, the state table and no internal project names', () => {
    expect(readme.startsWith('# Beni Oku!\n')).toBe(true)
    expect(readme).toContain('## Şu anki durum')
    expect(readme).not.toMatch(/\bUBT\b|Dalga \d|Lane [A-F]|Supabase|Coolify/)
  })

  it('links only to panel pages that exist', () => {
    const links = [...readme.matchAll(/\]\((\/[^)#]*)/g)].map((match) => match[1])
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) expect(['/kilavuz', '/guncellemeler']).toContain(link)
  })
})
