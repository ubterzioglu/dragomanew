import { describe, expect, it } from 'vitest'
import { filterRows, statusChip } from '../src/lib/content/listView'
import { checkDimensions, fileProblem, hex, isMediaId, objectPath, targetSize, uniqueId } from '../src/lib/media/upload'
import { mediaUsage } from '../src/lib/media/whereUsed'
import { DELAY_MESSAGE, deployView, formatCountdown, parseLiveRelease } from '../src/lib/publish/deployState'
import type { ContentEntryListRow, SiteDeployRow } from '../src/lib/types'

const MB = 1024 * 1024

describe('upload rules', () => {
  it('accepts the listed image types up to 40 MB', () => {
    expect(fileProblem({ name: 'a.jpg', type: 'image/jpeg', size: 5 * MB })).toBeNull()
    expect(fileProblem({ name: 'a.webp', type: 'image/webp', size: 40 * MB })).toBeNull()
    expect(fileProblem({ name: 'IMG_1.HEIC', type: '', size: MB })).toBeNull()
    expect(fileProblem({ name: 'a.gif', type: 'image/gif', size: MB })).toMatch(/JPEG/)
    expect(fileProblem({ name: 'a.jpg', type: 'image/jpeg', size: 40 * MB + 1 })).toMatch(/40 MB/)
    expect(fileProblem({ name: 'a.jpg', type: 'image/jpeg', size: 0 })).toMatch(/boş/)
  })

  it('refuses a long edge under 800 and warns under 1920 or outside 0.5–2.5', () => {
    expect(checkDimensions(799, 600).error).toMatch(/800/)
    expect(checkDimensions(1200, 800)).toEqual({ error: null, warnings: [expect.stringMatching(/1920/)] })
    expect(checkDimensions(4000, 3000)).toEqual({ error: null, warnings: [] })
    expect(checkDimensions(6000, 2000).warnings).toEqual([expect.stringMatching(/kırpılabilir/)])
    expect(checkDimensions(1000, 2100).warnings).toHaveLength(1)
  })

  it('scales the master to a long edge of at most 3000 and never enlarges', () => {
    expect(targetSize(6000, 4000)).toEqual({ width: 3000, height: 2000 })
    expect(targetSize(3000, 4500)).toEqual({ width: 2000, height: 3000 })
    expect(targetSize(1600, 1200)).toEqual({ width: 1600, height: 1200 })
  })

  it('stores masters at <id>/<sha>.jpg with a hex digest', () => {
    const digest = new Uint8Array([0, 15, 255]).buffer
    expect(hex(digest)).toBe('000fff')
    expect(objectPath('kas-liman', 'a'.repeat(64))).toBe(`kas-liman/${'a'.repeat(64)}.jpg`)
  })

  it('picks a free, valid id', () => {
    expect(uniqueId('kas', new Set(['kas', 'kas-2']))).toBe('kas-3')
    expect(uniqueId('', new Set())).toBe('foto')
    expect(isMediaId('kas-liman-2')).toBe(true)
    expect(isMediaId('Kas Liman')).toBe(false)
  })
})

describe('where media is used', () => {
  it('maps ids from covers, galleries, photos, tiles and share images to entries', () => {
    const usage = mediaUsage([
      { id: 'e1', type: 'event', key: 'gece', draft: { cover: 'm1', gallery: ['m2', 'm1'], seo: { ogImage: 'm3' } } },
      { id: 'h', type: 'home', key: 'home', draft: { hero: { tiles: [{ media: 'm2' }] } } },
    ])
    expect(usage.get('m1')).toEqual([{ id: 'e1', type: 'event', key: 'gece' }])
    expect(usage.get('m2')?.map((entry) => entry.id)).toEqual(['e1', 'h'])
    expect(usage.get('m3')).toHaveLength(1)
  })
})

describe('content list', () => {
  const row = (overrides: Partial<ContentEntryListRow>): ContentEntryListRow => ({
    id: 'id',
    type: 'event',
    key: 'gece-dalisi',
    status: 'published',
    title_tr: 'Gece Dalışı',
    has_changes: false,
    updated_at: '2026-11-01T10:00:00Z',
    updated_by_name: null,
    ...overrides,
  })

  it('maps status and pending changes to the four chips', () => {
    expect(statusChip(row({ status: 'draft' }))).toBe('draft')
    expect(statusChip(row({}))).toBe('published')
    expect(statusChip(row({ has_changes: true }))).toBe('changed')
    expect(statusChip(row({ status: 'archived', has_changes: true }))).toBe('archived')
  })

  it('searches Turkish titles case- and accent-insensitively within one type', () => {
    const rows = [row({ id: '1' }), row({ id: '2', title_tr: 'Kano', key: 'kano' }), row({ id: '3', type: 'post' })]
    expect(filterRows(rows, 'event', 'GECE DALIŞI', null).map((r) => r.id)).toEqual(['1'])
    expect(filterRows(rows, 'event', 'dalisi', null).map((r) => r.id)).toEqual(['1'])
    expect(filterRows(rows, 'event', '', 'changed')).toEqual([])
  })
})

describe('deploy rows', () => {
  const NOW = Date.parse('2026-11-02T12:00:00Z')
  const deploy = (overrides: Partial<SiteDeployRow>): SiteDeployRow => ({
    id: 1,
    status: 'queued',
    release_id: 7,
    first_requested_at: '2026-11-02T11:59:00Z',
    not_before: '2026-11-02T12:00:45Z',
    sending_at: null,
    triggered_at: null,
    attempts: 0,
    last_error: null,
    ...overrides,
  })

  it('counts down a queued deploy', () => {
    expect(deployView(deploy({}), 6, NOW)).toEqual({ label: 'Sırada', tone: 'waiting', countdown: 45, delayed: false })
    expect(deployView(deploy({ not_before: '2026-11-02T11:00:00Z' }), 6, NOW).countdown).toBe(0)
    expect(formatCountdown(125)).toBe('2 dk 5 sn')
  })

  it('shows Kuruluyor until the site serves the release, then Sitede', () => {
    const triggered = deploy({ status: 'triggered', triggered_at: '2026-11-02T11:55:00Z' })
    expect(deployView(triggered, 6, NOW).label).toBe('Kuruluyor')
    expect(deployView(triggered, 7, NOW)).toMatchObject({ label: 'Sitede', tone: 'done' })
    expect(deployView(deploy({ status: 'sending' }), null, NOW).label).toBe('Kuruluyor')
  })

  it('warns 15 minutes after the trigger when the site is still behind', () => {
    const late = deploy({ status: 'triggered', triggered_at: '2026-11-02T11:44:00Z' })
    expect(deployView(late, 6, NOW).delayed).toBe(true)
    expect(deployView(late, 7, NOW).delayed).toBe(false)
    expect(deployView(deploy({ status: 'triggered', triggered_at: '2026-11-02T11:46:00Z' }), 6, NOW).delayed).toBe(false)
    expect(DELAY_MESSAGE).toBe('Kurulum gecikti, ana yöneticiye haber verin')
  })

  it('names failed and skipped rows', () => {
    expect(deployView(deploy({ status: 'failed' }), null, NOW).label).toBe('Tetiklenemedi')
    expect(deployView(deploy({ status: 'skipped' }), null, NOW).tone).toBe('skipped')
  })

  it('reads /release.json defensively', () => {
    expect(parseLiveRelease({ releaseId: 7, createdAt: '2026-11-02T11:00:00Z' })).toEqual({ releaseId: 7, createdAt: '2026-11-02T11:00:00Z' })
    expect(parseLiveRelease({ releaseId: '7' })).toBeNull()
    expect(parseLiveRelease(null)).toBeNull()
  })
})
