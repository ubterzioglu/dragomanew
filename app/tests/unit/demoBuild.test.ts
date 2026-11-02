import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { addContentSecurityPolicy, supabaseConnectSources } from '../../src/lib/contentSecurityPolicy'
import { assertDemoBuild, liveConnectSources } from '../e2e/demoBuild'

const PAGE = '<!doctype html><html><head><meta charset="UTF-8"><title>x</title></head><body><script>1</script></body></html>'
const SUPABASE = 'https://example-project.supabase.co'

/** A page as the build writes it, with or without the Supabase setting. */
const built = (supabaseUrl?: string) => addContentSecurityPolicy(PAGE, supabaseConnectSources(supabaseUrl))

describe('liveConnectSources', () => {
  it('finds nothing in a demo build', () => {
    expect(liveConnectSources(built())).toEqual([])
  })

  it('finds the Supabase origin of a live build', () => {
    expect(liveConnectSources(built(SUPABASE))).toEqual([SUPABASE])
  })

  it('finds nothing in a page without a policy', () => {
    expect(liveConnectSources(PAGE)).toEqual([])
  })
})

describe('assertDemoBuild', () => {
  const dirs: string[] = []
  const distWith = async (html?: string) => {
    const dir = await mkdtemp(path.join(tmpdir(), 'dragoman-dist-'))
    dirs.push(dir)
    if (html !== undefined) await writeFile(path.join(dir, 'index.html'), html, 'utf8')
    return dir
  }

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
  })

  it('accepts a demo build', async () => {
    await expect(assertDemoBuild(await distWith(built()))).resolves.toBeUndefined()
  })

  it('refuses a live build before any form is submitted', async () => {
    await expect(assertDemoBuild(await distWith(built(SUPABASE)))).rejects.toThrow(/live build.*build:demo/)
  })

  it('asks for a demo build when there is none', async () => {
    await expect(assertDemoBuild(await distWith())).rejects.toThrow(/build:demo/)
  })
})
