import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ALL_NAV_ITEMS, GUIDE_IDS } from '../src/components/nav/navItems'
import { buildGuide, parseGuideSection, sectionIdFromPath } from '../src/lib/docs/guide'
import { slugify } from '../src/lib/docs/slug'

const GUIDE_DIR = new URL('../src/docs/kilavuz/', import.meta.url)
const fileFor = (id: string): URL => new URL(`${id}.md`, GUIDE_DIR)

describe('the guide files (src/docs/kilavuz/*.md)', () => {
  const linked = ALL_NAV_ITEMS.flatMap((item) => (item.guide ? [[item.label, item.guide] as const] : []))

  it.each(linked)('menu item %s has its section %s.md', (_label, id) => {
    expect(existsSync(fileFor(id)), `${id}.md is missing`).toBe(true)
  })

  it.each(GUIDE_IDS.map((id) => [id]))('%s.md has a title and a "what is it for" paragraph', (id) => {
    const section = parseGuideSection(id, readFileSync(fileFor(id), 'utf8'))
    expect(section.title, `${id}.md: # title`).not.toBe('')
    expect(section.summary, `${id}.md: first paragraph`).not.toBe('')
    expect(section.body.length).toBeGreaterThan(section.summary.length)
  })

  it('has no section file the guide order does not know', () => {
    const files = readdirSync(GUIDE_DIR).filter((name) => name.endsWith('.md'))
    expect(files.map((name) => sectionIdFromPath(name)).sort()).toEqual([...GUIDE_IDS].sort())
  })
})

describe('parseGuideSection', () => {
  it('reads the title, the first paragraph as summary and the rest as body', () => {
    const raw = '\uFEFF# Talepler\r\n\r\nSiteden gelen\r\ntalepler burada.\r\n\r\n## Nasıl kullanılır\r\n\r\n1. Açın.\r\n'
    const section = parseGuideSection('talepler', raw)
    expect(section.title).toBe('Talepler')
    expect(section.summary).toBe('Siteden gelen talepler burada.')
    expect(section.body).toContain('## Nasıl kullanılır')
    expect(section.body.startsWith('Siteden gelen')).toBe(true)
  })

  it('leaves the summary empty when a heading comes first, so the file test catches it', () => {
    expect(parseGuideSection('x', '# Başlık\n\n## Nasıl kullanılır\n\nMetin.').summary).toBe('')
    expect(parseGuideSection('x', 'Başlıksız metin.').title).toBe('')
  })
})

describe('buildGuide', () => {
  it('orders sections by the given ids, unknown files last and alphabetically', () => {
    const files = {
      '../docs/kilavuz/zeta.md': '# Z\n\nz',
      '../docs/kilavuz/talepler.md': '# T\n\nt',
      '../docs/kilavuz/alfa.md': '# A\n\na',
      '../docs/kilavuz/genel-bakis.md': '# G\n\ng',
    }
    expect(buildGuide(files, GUIDE_IDS).map((section) => section.id)).toEqual(['genel-bakis', 'talepler', 'alfa', 'zeta'])
  })
})

describe('slugify', () => {
  it('makes readable anchors from Turkish headings', () => {
    expect(slugify('Nasıl kullanılır?')).toBe('nasil-kullanilir')
    expect(slugify('Kimler kullanabilir')).toBe('kimler-kullanabilir')
    expect(slugify('Giriş ve Şifre / SSS')).toBe('giris-ve-sifre-sss')
    expect(slugify('ÇĞİÖŞÜ çğıöşü')).toBe('cgiosu-cgiosu')
  })
})
