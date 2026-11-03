import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { fetchContent, OUTPUTS, type FetchContentModules } from '../../scripts/fetch-content.mjs'
import { staticRouteSpecs } from '../../src/app/routePaths'
import { contentData } from '../../src/content/data'
import { eventPath, postPath, productPath } from '../../src/content/urls'
import { LOCALES } from '../../src/i18n/locales'
import { buildReleaseSnapshot, releaseSnapshotSchema, type MediaSource, type ReleaseEntryInput, type ReleaseInput, type ReleaseSnapshot } from '../../src/shared/content/release'
import { validateContent } from '../../src/shared/content/validate'
import { DEFAULT_FORM_DEFINITIONS } from '../../src/shared/requests/forms'

/**
 * scripts/fetch-content.mjs against a local mock of the content-release function (dalga2-sozlesme §7,
 * §11 D): no real Supabase. The snapshot is built with buildReleaseSnapshot from the fixture, plus one
 * panel upload and two slug changes.
 */
const APP = fileURLToPath(new URL('../..', import.meta.url))
const KEY = 'sb_publishable_test'
const UPLOAD_ID = 'yeni-kapak'

const modules = {
  releaseSnapshotSchema,
  validateContent,
  eventPath,
  postPath,
  productPath,
  staticRouteSpecs,
  locales: LOCALES,
} as unknown as FetchContentModules

const d = contentData
const movedEvent = d.events.find((e) => e.status === 'published')!
const coverPost = d.posts.find((p) => p.status === 'published' && p.cover)!

let master: Buffer
let masterSha: string

function snapshotFixture(releaseId: number): ReleaseSnapshot {
  const entry = (type: ReleaseEntryInput['type'], key: string, doc: object, status: ReleaseEntryInput['status'] = 'published', slugHistory?: ReleaseEntryInput['slugHistory']): ReleaseEntryInput => ({
    type,
    key,
    status,
    published: doc as Record<string, unknown>,
    order: 'order' in doc && typeof doc.order === 'number' ? doc.order : null,
    slugHistory,
  })
  const entries: ReleaseEntryInput[] = [
    entry('home', 'home', d.home),
    ...d.categoryPages.map((page) => entry('category_page', page.key, page)),
    ...d.subgroups.map((group) => entry('subgroup', group.id, group)),
    ...d.events.map((event) => entry('event', event.id, event, event.status, event.id === movedEvent.id ? [{ locale: 'en', slug: 'old-event-slug' }] : undefined)),
    ...d.serviceOffers.map((offer) => entry('service_offer', offer.id, offer)),
    ...d.products.map((product) => entry('product', product.id, product, product.status)),
    ...d.posts.map((post) =>
      entry('post', post.id, post.id === coverPost.id ? { ...post, cover: UPLOAD_ID } : post, post.status, post.id === coverPost.id ? [{ locale: 'tr', slug: 'eski-yazi' }] : undefined),
    ),
    ...d.team.map((member) => entry('team_member', member.id, member)),
    ...d.testimonials.map((testimonial) => entry('testimonial', testimonial.id, testimonial)),
    ...d.richPages.map((page) => entry('rich_page', page.key, page)),
  ]
  const upload: MediaSource = {
    id: UPLOAD_ID,
    storage: 'upload',
    objectPath: `${UPLOAD_ID}/${masterSha}.jpg`,
    sha256: masterSha,
    width: 1000,
    height: 700,
    alt: { tr: 'Yeni kapak', en: 'New cover', fr: 'Nouvelle couverture', de: 'Neues Titelbild' },
    topic: 'test',
    rights: 'confirmed',
    placeholder: false,
  }
  const media: MediaSource[] = [...d.media.map((asset): MediaSource => ({ ...asset, storage: 'repo' })), upload]
  const forms = Object.fromEntries(Object.entries(DEFAULT_FORM_DEFINITIONS).map(([kind, definition]) => [kind, { version: 1, definition }])) as ReleaseInput['forms']
  return buildReleaseSnapshot({ releaseId, createdAt: '2026-11-02T10:00:00.000Z', entries, media, forms })
}

/** What the mock function answers; tests swap it. */
interface MockState {
  snapshot: unknown
  failuresBeforeSuccess: number
  masterBody: () => Buffer
}
let state: MockState
const hits = { release: 0, master: 0, lastUrl: '' }
let server: Server
let base = ''

beforeAll(async () => {
  master = await sharp({ create: { width: 1000, height: 700, channels: 3, background: '#2f6f8f' } }).jpeg({ quality: 90 }).toBuffer()
  masterSha = createHash('sha256').update(master).digest('hex')
  server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    if (url.pathname === '/storage/master.jpg') {
      hits.master += 1
      response.writeHead(200, { 'content-type': 'image/jpeg' }).end(state.masterBody())
      return
    }
    if (url.pathname !== '/functions/v1/content-release') return void response.writeHead(404).end()
    hits.release += 1
    hits.lastUrl = request.url ?? ''
    if (request.headers.apikey !== KEY) return void response.writeHead(401, { 'content-type': 'application/json' }).end('{"ok":false,"error":"bad_key"}')
    if (state.failuresBeforeSuccess > 0) {
      state.failuresBeforeSuccess -= 1
      return void response.writeHead(503).end('busy')
    }
    const wanted = url.searchParams.get('id')
    const releaseId = (state.snapshot as { releaseId?: number }).releaseId
    if (wanted && Number(wanted) !== releaseId) return void response.writeHead(404, { 'content-type': 'application/json' }).end('{"ok":false,"error":"no_release"}')
    const downloads = [{ objectPath: `${UPLOAD_ID}/${masterSha}.jpg`, url: `${base}/storage/master.jpg`, expiresAt: '2026-11-02T10:10:00Z' }]
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify({ snapshot: state.snapshot, downloads }))
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
}, 30_000)

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

let outDir: string
let cacheDir: string

beforeEach(async () => {
  state = { snapshot: snapshotFixture(42), failuresBeforeSuccess: 0, masterBody: () => master }
  hits.release = 0
  hits.master = 0
  outDir = await mkdtemp(path.join(tmpdir(), 'dragoman-fetch-'))
  cacheDir = path.join(outDir, 'cache')
  return () => rm(outDir, { recursive: true, force: true })
})

const releaseEnv = (extra: Record<string, string> = {}) => ({ CONTENT_SOURCE: 'release', VITE_SUPABASE_URL: base, VITE_SUPABASE_PUBLISHABLE_KEY: KEY, MEDIA_CACHE_DIR: cacheDir, ...extra })
const run = (env: Record<string, string>, options: { appDir?: string } = {}) =>
  fetchContent({ env, appDir: options.appDir ?? APP, outDir, modules, log: () => {}, retryDelayMs: 1 })
const out = (relative: string) => path.join(outDir, relative)

describe('fixture mode', () => {
  it('removes an earlier release and writes an empty redirect map', async () => {
    await mkdir(out(OUTPUTS.releaseDir), { recursive: true })
    await writeFile(out(OUTPUTS.releaseFile), '{}')
    await mkdir(path.dirname(out(OUTPUTS.publicRelease)), { recursive: true })
    await writeFile(out(OUTPUTS.publicRelease), '{}')
    await expect(run({})).resolves.toEqual({ source: 'fixture' })
    expect(existsSync(out(OUTPUTS.releaseDir))).toBe(false)
    expect(existsSync(out(OUTPUTS.publicRelease))).toBe(false)
    expect(await readFile(out(OUTPUTS.redirectMap), 'utf8')).toMatch(/^# fixture build/)
    expect(hits.release).toBe(0)
  })

  it('rejects an unknown CONTENT_SOURCE', async () => {
    await expect(run({ CONTENT_SOURCE: 'db' })).rejects.toThrow(/CONTENT_SOURCE/)
  })
})

describe('release mode', () => {
  it('writes the release, /release.json, the redirect map and the upload derivatives', async () => {
    const result = await run(releaseEnv())
    expect(result.releaseId).toBe(42)
    expect(hits.lastUrl).toBe('/functions/v1/content-release')

    const release = JSON.parse(await readFile(out(OUTPUTS.releaseFile), 'utf8'))
    expect(release.releaseId).toBe(42)
    expect(release.content.events).toHaveLength(d.events.filter((event) => event.status !== 'draft').length)
    expect(release.forms.event.version).toBe(1)
    const upload = release.content.media.find((asset: { id: string }) => asset.id === UPLOAD_ID)
    expect(upload).toMatchObject({ id: UPLOAD_ID, widths: [480, 720, 800, 1000], width: 1000, height: 700, placeholder: false })
    expect(release.content.media.every((asset: object) => !('storage' in asset))).toBe(true)

    expect(JSON.parse(await readFile(out(OUTPUTS.publicRelease), 'utf8'))).toEqual({ releaseId: 42, createdAt: '2026-11-02T10:00:00.000Z' })

    const map = await readFile(out(OUTPUTS.redirectMap), 'utf8')
    expect(map).toContain(`${eventPath('en', { category: movedEvent.category, slug: { ...movedEvent.slug, en: 'old-event-slug' } })} ${eventPath('en', movedEvent)};`)
    expect(map).toContain(`${postPath('tr', { slug: { ...coverPost.slug, tr: 'eski-yazi' } })} ${postPath('tr', coverPost)};`)

    const files = (await readdir(out(OUTPUTS.uploadMedia))).toSorted()
    expect(files).toEqual([480, 720, 800, 1000].flatMap((w) => ['avif', 'jpg', 'webp'].map((f) => `${UPLOAD_ID}-${w}.${f}`)).toSorted())
    expect(hits.master).toBe(1)
  }, 60_000)

  it('reuses cached derivatives without downloading the master again', async () => {
    await run(releaseEnv())
    await run(releaseEnv())
    expect(hits.master).toBe(1)
    expect(existsSync(out(path.join(OUTPUTS.uploadMedia, `${UPLOAD_ID}-1000.avif`)))).toBe(true)
  }, 60_000)

  it('asks for CONTENT_RELEASE_ID and refuses a release that does not exist', async () => {
    await run(releaseEnv({ CONTENT_RELEASE_ID: '42' }))
    expect(hits.lastUrl).toBe('/functions/v1/content-release?id=42')
    await expect(run(releaseEnv({ CONTENT_RELEASE_ID: '999999' }))).rejects.toThrow(/HTTP 404/)
    expect(existsSync(out(OUTPUTS.releaseFile))).toBe(false)
  }, 60_000)

  it('retries a busy function and gives up at once on a bad key', async () => {
    state.failuresBeforeSuccess = 2
    await expect(run(releaseEnv())).resolves.toMatchObject({ releaseId: 42 })
    expect(hits.release).toBe(3)

    hits.release = 0
    await expect(run(releaseEnv({ VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_wrong' }))).rejects.toThrow(/HTTP 401/)
    expect(hits.release).toBe(1)
  }, 60_000)

  it('fails on a broken snapshot and leaves no release behind (never the fixture)', async () => {
    const broken = structuredClone(state.snapshot) as { content: { events: { slug: { en: string } }[] } }
    broken.content.events[0]!.slug.en = 'Not A Slug'
    state.snapshot = broken
    await expect(run(releaseEnv())).rejects.toThrow(/does not match the schema/)
    expect(existsSync(out(OUTPUTS.releaseFile))).toBe(false)
    expect(existsSync(out(OUTPUTS.publicRelease))).toBe(false)
  })

  it('fails when the snapshot breaks a whole-set rule', async () => {
    const invalid = structuredClone(state.snapshot) as ReleaseSnapshot
    state.snapshot = { ...invalid, content: { ...invalid.content, media: invalid.content.media.filter((asset) => asset.id !== movedEvent.cover) } }
    await expect(run(releaseEnv())).rejects.toThrow(/fails validateContent[\s\S]*missing_media/)
  })

  it('fails when an upload does not match its sha256', async () => {
    state.masterBody = () => Buffer.concat([master, Buffer.from('tampered')])
    await expect(run(releaseEnv())).rejects.toThrow(/sha256/)
    expect(existsSync(out(OUTPUTS.releaseFile))).toBe(false)
  })

  it('fails when a repo image has no derivatives in public/media', async () => {
    await expect(run(releaseEnv(), { appDir: outDir })).rejects.toThrow(/missing from public\/media/)
  })

  it('needs the Supabase URL and key', async () => {
    await expect(run({ CONTENT_SOURCE: 'release', VITE_SUPABASE_PUBLISHABLE_KEY: KEY })).rejects.toThrow(/VITE_SUPABASE_URL/)
    await expect(run({ CONTENT_SOURCE: 'release', VITE_SUPABASE_URL: 'http://example.com' })).rejects.toThrow(/https/)
    await expect(run({ CONTENT_SOURCE: 'release', VITE_SUPABASE_URL: base })).rejects.toThrow(/PUBLISHABLE_KEY/)
    await expect(run(releaseEnv({ CONTENT_RELEASE_ID: 'latest' }))).rejects.toThrow(/positive integer/)
  })
})

describe('command line (TypeScript modules loaded through Vite)', () => {
  const cli = (env: Record<string, string>) =>
    promisify(execFile)(process.execPath, ['scripts/fetch-content.mjs'], { cwd: APP, env: { ...process.env, ...env, FETCH_CONTENT_OUT_DIR: outDir } })

  it('builds a release end to end', async () => {
    const { stdout } = await cli(releaseEnv())
    expect(stdout).toMatch(/release 42 written/)
    expect(JSON.parse(await readFile(out(OUTPUTS.releaseFile), 'utf8')).releaseId).toBe(42)
  }, 120_000)

  it('exits non-zero on a broken snapshot', async () => {
    state.snapshot = { format: 1, releaseId: 42 }
    await expect(cli(releaseEnv())).rejects.toMatchObject({ code: 1, stderr: expect.stringMatching(/fetch-content failed: release snapshot does not match/) })
    expect(existsSync(out(OUTPUTS.releaseFile))).toBe(false)
  }, 120_000)
})
