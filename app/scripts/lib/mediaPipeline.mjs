// The image derivative pipeline, shared by images-optimize.mjs (repo photos, npm run media) and
// fetch-content.mjs (panel uploads of a release, dalga2-sozlesme §7). One set of widths and encoder
// settings, so an uploaded photo is served exactly like a repo one: /media/{id}-{w}.{avif,webp,jpg}.
//
// EXIF orientation is applied, then all metadata (EXIF/GPS/ICC/XMP) is dropped: sharp strips metadata
// unless withMetadata()/keepMetadata() is called, and this module never calls them.
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

// 720 serves full-width phone images at DPR ~1.75–2 (e.g. 380 px × 1.75 = 665 px), which otherwise get 800.
export const WIDTHS = [480, 720, 800, 1280, 1920]
// A 667 px source would otherwise stop at 480 and lose 28% of its detail; below 1920 such sources also get their own width.
export const MIN_SOURCE_GAIN = 1.15
export const FORMATS = ['avif', 'webp', 'jpg']
export const SETTINGS = {
  version: 1,
  widths: WIDTHS,
  minSourceGain: MIN_SOURCE_GAIN,
  avif: { quality: 50, effort: 4 },
  webp: { quality: 74, effort: 4 },
  jpg: { quality: 78, mozjpeg: true, progressive: true },
  background: '#ffffff',
  placeholder: { width: 1920, height: 1280, background: '#f7f4ee', ink: '#006c50', text: 'Örnek görsel / Sample image' },
}

export const sha256 = (data) => createHash('sha256').update(data).digest('hex')
/** Changes whenever a width or encoder setting changes, so cached derivatives are rebuilt. */
export const settingsHash = sha256(JSON.stringify(SETTINGS))

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Neutral sand/green placeholder, rendered once at full size and then treated like a photo. */
export async function placeholderBuffer() {
  const { width, height, background, ink, text } = SETTINGS.placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${background}"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="${ink}" stroke-opacity="0.25" stroke-width="4"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="56" fill="${ink}">${escapeXml(text)}</text>
</svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

/** The widths a source of this width gets (never upscaled). */
export function targetWidths(sourceWidth) {
  const fitting = WIDTHS.filter((w) => w <= sourceWidth)
  if (fitting.length === 0) return [sourceWidth]
  const last = fitting[fitting.length - 1]
  const keepsSourceDetail = last < WIDTHS[WIDTHS.length - 1] && sourceWidth >= last * MIN_SOURCE_GAIN
  return keepsSourceDetail ? [...fitting, sourceWidth] : fitting
}

function encode(pipeline, format) {
  if (format === 'avif') return pipeline.avif(SETTINGS.avif)
  if (format === 'webp') return pipeline.webp(SETTINGS.webp)
  return pipeline.jpeg(SETTINGS.jpg)
}

/** File names of every derivative of `id`. */
export const derivativeNames = (id, widths) => widths.flatMap((w) => FORMATS.map((f) => `${id}-${w}.${f}`))

export const derivativesExist = (dir, id, widths) => derivativeNames(id, widths).every((name) => existsSync(path.join(dir, name)))

/**
 * Writes {id}-{w}.{avif,webp,jpg} into outDir for every target width.
 * Returns the widths and the size of the largest JPEG (the asset's width/height).
 */
export async function renderDerivatives(input, id, outDir) {
  await mkdir(outDir, { recursive: true })
  // Orientation-corrected width of the source (EXIF orientations 5-8 swap the axes).
  const meta = await sharp(input).metadata()
  const sourceWidth = (meta.orientation ?? 1) >= 5 ? meta.height : meta.width
  const widths = targetWidths(sourceWidth)
  let largest = { width: 0, height: 0 }
  for (const w of widths) {
    const results = await Promise.all(
      FORMATS.map((format) => {
        const pipeline = sharp(input).rotate().resize({ width: w, withoutEnlargement: true }).flatten({ background: SETTINGS.background })
        return encode(pipeline, format).toFile(path.join(outDir, `${id}-${w}.${format}`))
      }),
    )
    const info = results[2]
    if (info.width > largest.width) largest = { width: info.width, height: info.height }
  }
  return { widths, width: largest.width, height: largest.height }
}

const CACHE_ID = 'img'

/**
 * Derivatives of an upload master, through a content cache keyed by the master's sha256 and the
 * settings hash (MEDIA_CACHE_DIR; a BuildKit cache mount in the Dockerfile). On a hit the master is
 * not even downloaded; on a miss `load()` fetches it and its sha256 must match before anything is made.
 * Copies the result into outDir as {id}-{w}.{format}.
 */
export async function cachedDerivatives({ id, sha256: expected, cacheDir, outDir, load }) {
  const keyDir = path.join(cacheDir, `${expected}-${settingsHash.slice(0, 16)}`)
  const metaFile = path.join(keyDir, 'meta.json')
  let dims = null
  let cached = false
  if (existsSync(metaFile)) {
    try {
      const meta = JSON.parse(await readFile(metaFile, 'utf8'))
      if (derivativesExist(keyDir, CACHE_ID, meta.widths)) {
        dims = { widths: meta.widths, width: meta.width, height: meta.height }
        cached = true
      }
    } catch {
      dims = null
    }
  }
  if (!dims) {
    const input = await load()
    const actual = sha256(input)
    if (actual !== expected) throw new Error(`media "${id}": downloaded master has sha256 ${actual}, the release says ${expected}`)
    // Built aside and moved into place, so a crash never leaves a half-filled cache entry.
    const tmpDir = `${keyDir}.tmp-${process.pid}-${Date.now()}`
    dims = await renderDerivatives(input, CACHE_ID, tmpDir)
    await writeFile(path.join(tmpDir, 'meta.json'), `${JSON.stringify(dims)}\n`)
    await rm(keyDir, { recursive: true, force: true })
    await rename(tmpDir, keyDir)
  }
  await mkdir(outDir, { recursive: true })
  for (const w of dims.widths) {
    for (const f of FORMATS) await copyFile(path.join(keyDir, `${CACHE_ID}-${w}.${f}`), path.join(outDir, `${id}-${w}.${f}`))
  }
  return { ...dims, cached }
}
