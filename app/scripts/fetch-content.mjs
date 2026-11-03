// First step of `npm run build` (dalga2-sozlesme §1, §7): decides which content the site is built from.
//
//   CONTENT_SOURCE unset or "fixture"  the typed Stage A data in src/content/data (tests, demo build, e2e).
//                                      Removes any earlier release output and writes an empty redirect map.
//   CONTENT_SOURCE=release             GET ${VITE_SUPABASE_URL}/functions/v1/content-release[?id=CONTENT_RELEASE_ID]
//                                      with the publishable key as `apikey`, validates the snapshot with the
//                                      site's own schemas, checks every repo image, makes derivatives of the
//                                      panel uploads (cache MEDIA_CACHE_DIR) and writes
//                                        src/content/release/release.json   read by src/content/server.ts
//                                        public/release.json                {releaseId, createdAt}, served no-store
//                                        build-meta/nginx-redirects.map     slug-change 301s for nginx
//                                        build-meta/media/                  upload derivatives (postbuild copies them)
//
// Any error fails the build. Release mode never falls back to the fixture: a broken or missing
// release must keep the old container online, not ship sample content.
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { cachedDerivatives, derivativeNames } from './lib/mediaPipeline.mjs'
import { buildRedirects, renderRedirectMap } from './lib/redirectMap.mjs'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const OUTPUTS = {
  releaseDir: path.join('src', 'content', 'release'),
  releaseFile: path.join('src', 'content', 'release', 'release.json'),
  publicRelease: path.join('public', 'release.json'),
  redirectMap: path.join('build-meta', 'nginx-redirects.map'),
  uploadMedia: path.join('build-meta', 'media'),
}

const TIMEOUT_MS = 30_000
const RETRIES = 3

/** TypeScript modules the release check needs, loaded through Vite like postbuild.mjs does. */
export async function loadModules(appDir = APP) {
  const { runnerImport } = await import('vite')
  // configFile: false keeps the SSG build options (and their env checks) out of a plain data load.
  const load = async (file) => (await runnerImport(path.join(appDir, file), { configFile: false, root: appDir })).module
  const [release, validate, urls, routePaths, locales, legacy] = await Promise.all([
    load('src/shared/content/release.ts'),
    load('src/shared/content/validate.ts'),
    load('src/content/urls.ts'),
    load('src/app/routePaths.ts'),
    load('src/i18n/locales.ts'),
    load('src/content/legacyRedirects.ts'),
  ])
  return {
    releaseSnapshotSchema: release.releaseSnapshotSchema,
    validateContent: validate.validateContent,
    eventPath: urls.eventPath,
    postPath: urls.postPath,
    productPath: urls.productPath,
    staticRouteSpecs: routePaths.staticRouteSpecs,
    locales: locales.LOCALES,
    legacyRedirects: legacy.legacyRedirects,
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const isRetryable = (error) => !(error instanceof HttpError) || error.status === 429 || error.status >= 500

/** GET with a 30 s timeout and 3 retries on network errors, timeouts, 429 and 5xx (never on other 4xx). */
async function getWithRetry(fetchImpl, url, headers, what, retryDelayMs) {
  let lastError
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, retryDelayMs * 2 ** (attempt - 1)))
    try {
      const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-store' })
      if (!response.ok) {
        const detail = (await response.text().catch(() => '')).slice(0, 200)
        throw new HttpError(response.status, `${what}: HTTP ${response.status}${detail ? ` ${detail}` : ''}`)
      }
      return response
    } catch (error) {
      lastError = error
      if (!isRetryable(error)) break
    }
  }
  throw lastError instanceof HttpError ? lastError : new Error(`${what}: ${lastError instanceof Error ? lastError.message : String(lastError)}`)
}

function releaseUrl(env) {
  const base = env.VITE_SUPABASE_URL?.trim()
  if (!base) throw new Error('CONTENT_SOURCE=release needs VITE_SUPABASE_URL')
  let parsed
  try {
    parsed = new URL(base)
  } catch {
    throw new Error(`VITE_SUPABASE_URL is not a URL: ${base}`)
  }
  const local = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) throw new Error('VITE_SUPABASE_URL must be https (http only for localhost)')
  const id = env.CONTENT_RELEASE_ID?.trim()
  if (id && !/^[1-9]\d*$/.test(id)) throw new Error(`CONTENT_RELEASE_ID must be a positive integer, got "${id}"`)
  const url = new URL('functions/v1/content-release', `${parsed.origin}${parsed.pathname.replace(/\/*$/, '/')}`)
  if (id) url.searchParams.set('id', id)
  return { url: url.toString(), id: id ? Number(id) : null }
}

const summarize = (issues, format) => {
  const shown = issues.slice(0, 20).map(format)
  return `${shown.join('\n  ')}${issues.length > shown.length ? `\n  … and ${issues.length - shown.length} more` : ''}`
}

/** Every path the build renders: fixed pages per language plus each visible record's page. */
function liveRoutes(modules, content) {
  const fixed = modules.staticRouteSpecs().map((spec) => (spec.path === '' ? '/' : `/${spec.path}/`))
  const visible = (list) => list.filter((record) => record.status === 'published')
  const records = modules.locales.flatMap((locale) => [
    ...visible(content.events).map((event) => modules.eventPath(locale, event)),
    ...visible(content.posts).map((post) => modules.postPath(locale, post)),
    ...visible(content.products).map((product) => modules.productPath(locale, product)),
  ])
  return [...fixed, ...records]
}

/** A repo image's derivatives are committed under public/media; a release must not point past them. */
function missingRepoDerivatives(media, mediaDir) {
  return media
    .filter((asset) => asset.storage === 'repo')
    .flatMap((asset) => derivativeNames(asset.id, asset.widths).filter((name) => !existsSync(path.join(mediaDir, name))))
}

/** The site's MediaAsset for a release media row (an upload gets the widths made from its master). */
async function resolveMedia(asset, context) {
  if (asset.storage === 'repo') {
    const { storage: _storage, ...repo } = asset
    return repo
  }
  const download = context.downloads.find((item) => item?.objectPath === asset.objectPath)
  const dims = await cachedDerivatives({
    id: asset.id,
    sha256: asset.sha256,
    cacheDir: context.cacheDir,
    outDir: context.uploadDir,
    load: async () => {
      if (!download || typeof download.url !== 'string') throw new Error(`media "${asset.id}": the release has no download for ${asset.objectPath}`)
      const response = await getWithRetry(context.fetchImpl, download.url, {}, `media "${asset.id}" download`, context.retryDelayMs)
      return Buffer.from(await response.arrayBuffer())
    },
  })
  context.log(`  upload ${asset.id}: ${dims.cached ? 'cached' : 'built'} [${dims.widths.join(', ')}]`)
  return {
    id: asset.id,
    sourceFile: asset.objectPath,
    widths: dims.widths,
    width: dims.width,
    height: dims.height,
    alt: asset.alt,
    topic: asset.topic,
    rights: asset.rights,
    placeholder: false,
  }
}

async function writeOutput(outDir, relative, text) {
  const file = path.join(outDir, relative)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, text, 'utf8')
}

/** Removes every output of an earlier run, so a failed run leaves nothing a later build could pick up. */
async function clearOutputs(outDir) {
  for (const relative of [OUTPUTS.releaseDir, OUTPUTS.publicRelease, OUTPUTS.uploadMedia, OUTPUTS.redirectMap]) {
    await rm(path.join(outDir, relative), { recursive: true, force: true })
  }
}

/**
 * @param {object} [options]
 * @param {Record<string, string | undefined>} [options.env]
 * @param {string} [options.appDir] where public/media and the TypeScript sources are read
 * @param {string} [options.outDir] where the outputs go (defaults to appDir)
 * @param {Awaited<ReturnType<typeof loadModules>>} [options.modules]
 * @param {typeof fetch} [options.fetchImpl]
 */
export async function fetchContent({ env = process.env, appDir = APP, outDir = appDir, modules, fetchImpl = fetch, log = console.log, retryDelayMs = 1000 } = {}) {
  const source = env.CONTENT_SOURCE?.trim() || 'fixture'
  if (source !== 'fixture' && source !== 'release') throw new Error(`CONTENT_SOURCE must be "fixture" or "release", got "${source}"`)
  await clearOutputs(outDir)

  if (source === 'fixture') {
    await writeOutput(outDir, OUTPUTS.redirectMap, renderRedirectMap([], 'fixture build: no slug redirects'))
    log('fetch-content: fixture (src/content/data); no release written')
    return { source }
  }

  const { url, id } = releaseUrl(env)
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!key) throw new Error('CONTENT_SOURCE=release needs VITE_SUPABASE_PUBLISHABLE_KEY')
  const loaded = modules ?? (await loadModules(appDir))
  log(`fetch-content: release ${id ?? 'latest'} from ${url}`)

  const response = await getWithRetry(fetchImpl, url, { apikey: key, accept: 'application/json' }, 'content-release', retryDelayMs)
  let body
  try {
    body = await response.json()
  } catch {
    throw new Error('content-release: response is not JSON')
  }
  if (!body || typeof body !== 'object' || !Array.isArray(body.downloads)) throw new Error('content-release: response has no snapshot/downloads')

  const parsed = loaded.releaseSnapshotSchema.safeParse(body.snapshot)
  if (!parsed.success) {
    throw new Error(`release snapshot does not match the schema:\n  ${summarize(parsed.error.issues, (issue) => `/${issue.path.join('/')}: ${issue.message}`)}`)
  }
  const snapshot = parsed.data
  if (id !== null && snapshot.releaseId !== id) throw new Error(`asked for release ${id}, got release ${snapshot.releaseId}`)
  const issues = loaded.validateContent(snapshot.content)
  if (issues.length > 0) {
    throw new Error(`release ${snapshot.releaseId} fails validateContent (${issues.length}):\n  ${summarize(issues, (issue) => `${issue.code} ${issue.recordType}:${issue.recordId}${issue.path ?? ''} ${issue.message}`)}`)
  }

  const missing = missingRepoDerivatives(snapshot.content.media, path.join(appDir, 'public', 'media'))
  if (missing.length > 0) throw new Error(`release ${snapshot.releaseId} uses repo images whose files are missing from public/media:\n  ${summarize(missing, String)}`)

  const context = {
    downloads: body.downloads,
    cacheDir: env.MEDIA_CACHE_DIR?.trim() || path.join(appDir, '.media-cache'),
    uploadDir: path.join(outDir, OUTPUTS.uploadMedia),
    fetchImpl,
    retryDelayMs,
    log,
  }
  const media = []
  for (const asset of snapshot.content.media) media.push(await resolveMedia(asset, context))

  const content = { ...snapshot.content, media }
  const live = new Set(liveRoutes(loaded, content))
  const slugMoves = buildRedirects({
    content,
    slugHistory: snapshot.slugHistory,
    paths: { eventPath: loaded.eventPath, postPath: loaded.postPath, productPath: loaded.productPath },
    liveRoutes: live,
  })
  // Old WordPress addresses; a slug redirect for the same address wins (it follows the release).
  const oldSite = loaded.legacyRedirects(content, live)
  const taken = new Set(slugMoves.redirects.map((redirect) => redirect.from))
  const oldSiteRedirects = oldSite.redirects.filter((redirect) => !taken.has(redirect.from))
  const redirects = [...slugMoves.redirects, ...oldSiteRedirects].toSorted((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0))
  for (const item of [...slugMoves.skipped, ...oldSite.skipped]) log(`  redirect skipped: ${item.from} (${item.reason})`)

  const release = { format: 1, releaseId: snapshot.releaseId, createdAt: snapshot.createdAt, content, forms: snapshot.forms, slugHistory: snapshot.slugHistory }
  await writeOutput(outDir, OUTPUTS.releaseFile, `${JSON.stringify(release)}\n`)
  await writeOutput(outDir, OUTPUTS.publicRelease, `${JSON.stringify({ releaseId: snapshot.releaseId, createdAt: snapshot.createdAt })}\n`)
  const header = `release ${snapshot.releaseId} (${snapshot.createdAt}): ${slugMoves.redirects.length} slug redirects, ${oldSiteRedirects.length} old-site redirects`
  await writeOutput(outDir, OUTPUTS.redirectMap, renderRedirectMap(redirects, header))
  const uploads = media.length - snapshot.content.media.filter((asset) => asset.storage === 'repo').length
  log(`fetch-content: release ${snapshot.releaseId} written (${media.length} media, ${uploads} uploads, ${redirects.length} redirects)`)
  return { source, releaseId: snapshot.releaseId, redirects }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // FETCH_CONTENT_OUT_DIR only redirects the outputs (tests); a build always writes into app/.
  // VITE_ values as the production build reads them: process.env first, then app/.env* files.
  const { loadEnv } = await import('vite')
  const env = { ...process.env, ...loadEnv('production', APP, 'VITE_') }
  fetchContent({ env, outDir: process.env.FETCH_CONTENT_OUT_DIR?.trim() || APP }).catch((error) => {
    console.error(`fetch-content failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
}
