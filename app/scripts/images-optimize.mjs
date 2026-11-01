/**
 * Builds optimised usage copies of the selected real photos and regenerates the
 * typed media catalog (src/content/data/media.ts).
 *
 *   node scripts/images-optimize.mjs        (npm run media)
 *
 * Input:  scripts/media-selection.json  [{ id, sourceFile, topic, alt, placeholder? }]
 * Source: C:\temp_private\dragoman\cloner\images (read-only, never written to)
 * Output: public/media/{id}-{w}.{avif,webp,jpg} for w in WIDTHS, plus the source width
 *         when it sits well above the last fitting step (never upscaled)
 *
 * EXIF orientation is applied, then all metadata (EXIF/GPS/ICC/XMP) is dropped:
 * sharp strips metadata unless withMetadata()/keepMetadata() is called, and this
 * script never calls them. Unchanged inputs are skipped via scripts/.media-cache.json.
 */
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIR = process.env.DRAGOMAN_IMAGES_DIR ?? 'C:\\temp_private\\dragoman\\cloner\\images'
const SELECTION_FILE = path.join(APP_DIR, 'scripts', 'media-selection.json')
const CACHE_FILE = path.join(APP_DIR, 'scripts', '.media-cache.json')
const OUT_DIR = path.join(APP_DIR, 'public', 'media')
const CATALOG_FILE = path.join(APP_DIR, 'src', 'content', 'data', 'media.ts')

// 720 serves full-width phone images at DPR ~1.75–2 (e.g. 380 px × 1.75 = 665 px), which otherwise get 800.
const WIDTHS = [480, 720, 800, 1280, 1920]
// A 667 px source would otherwise stop at 480 and lose 28% of its detail; below 1920 such sources also get their own width.
const MIN_SOURCE_GAIN = 1.15
const FORMATS = ['avif', 'webp', 'jpg']
const PLACEHOLDER_SOURCE = 'generated-placeholder'
const SETTINGS = {
  version: 1,
  widths: WIDTHS,
  minSourceGain: MIN_SOURCE_GAIN,
  avif: { quality: 50, effort: 4 },
  webp: { quality: 74, effort: 4 },
  jpg: { quality: 78, mozjpeg: true, progressive: true },
  background: '#ffffff',
  placeholder: { width: 1920, height: 1280, background: '#f7f4ee', ink: '#006c50', text: 'Örnek görsel / Sample image' },
}
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LOCALES = ['tr', 'en', 'fr', 'de']
const OUTPUT_NAME = /^([a-z0-9-]+)-(\d+)\.(avif|webp|jpg)$/

const sha256 = (data) => createHash('sha256').update(data).digest('hex')
const settingsHash = sha256(JSON.stringify(SETTINGS))

function validateSelection(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('media-selection.json must be a non-empty array')
  const seen = new Set()
  const errors = []
  for (const [index, entry] of entries.entries()) {
    const where = `entry #${index} (${entry?.id ?? 'no id'})`
    if (typeof entry?.id !== 'string' || !SLUG.test(entry.id)) errors.push(`${where}: id must be a lowercase-hyphen slug`)
    if (seen.has(entry?.id)) errors.push(`${where}: duplicate id`)
    seen.add(entry?.id)
    if (typeof entry?.sourceFile !== 'string' || entry.sourceFile.length === 0) errors.push(`${where}: sourceFile missing`)
    if (typeof entry?.topic !== 'string' || entry.topic.length === 0) errors.push(`${where}: topic missing`)
    for (const locale of LOCALES) {
      if (typeof entry?.alt?.[locale] !== 'string' || entry.alt[locale].trim() === '') errors.push(`${where}: alt.${locale} missing`)
    }
    const isPlaceholder = entry?.placeholder === true
    if (isPlaceholder && entry.sourceFile !== PLACEHOLDER_SOURCE) errors.push(`${where}: placeholders must use sourceFile "${PLACEHOLDER_SOURCE}"`)
    // Reads stay inside the source archive: a "..\" sourceFile must not reach other files.
    const resolved = path.resolve(SOURCE_DIR, entry?.sourceFile ?? '')
    if (!isPlaceholder && !resolved.startsWith(path.resolve(SOURCE_DIR) + path.sep)) errors.push(`${where}: sourceFile escapes the source folder`)
    else if (!isPlaceholder && !existsSync(resolved)) errors.push(`${where}: source not found: ${entry?.sourceFile}`)
  }
  if (errors.length > 0) throw new Error(`Invalid media selection:\n  ${errors.join('\n  ')}`)
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Neutral sand/green placeholder, rendered once at full size and then treated like a photo. */
async function placeholderBuffer() {
  const { width, height, background, ink, text } = SETTINGS.placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${background}"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="${ink}" stroke-opacity="0.25" stroke-width="4"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="56" fill="${ink}">${escapeXml(text)}</text>
</svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

function targetWidths(sourceWidth) {
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

async function processEntry(entry, input) {
  // Orientation-corrected width of the source (EXIF orientations 5-8 swap the axes).
  const meta = await sharp(input).metadata()
  const sourceWidth = (meta.orientation ?? 1) >= 5 ? meta.height : meta.width
  const widths = targetWidths(sourceWidth)
  let largest = { width: 0, height: 0 }
  for (const w of widths) {
    const results = await Promise.all(
      FORMATS.map((format) => {
        const pipeline = sharp(input)
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          .flatten({ background: SETTINGS.background })
        return encode(pipeline, format).toFile(path.join(OUT_DIR, `${entry.id}-${w}.${format}`))
      }),
    )
    const info = results[2]
    if (info.width > largest.width) largest = { width: info.width, height: info.height }
  }
  return { widths, width: largest.width, height: largest.height }
}

const outputsExist = (id, widths) =>
  widths.every((w) => FORMATS.every((f) => existsSync(path.join(OUT_DIR, `${id}-${w}.${f}`))))

async function readCache() {
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8'))
  } catch {
    return {}
  }
}

/** Remove generated files that no longer belong to any selected id/width. */
async function removeOrphans(results) {
  const expected = new Set(results.flatMap((r) => r.widths.flatMap((w) => FORMATS.map((f) => `${r.id}-${w}.${f}`))))
  let removed = 0
  for (const name of await readdir(OUT_DIR)) {
    if (OUTPUT_NAME.test(name) && !expected.has(name)) {
      await unlink(path.join(OUT_DIR, name))
      removed += 1
    }
  }
  return removed
}

function renderCatalog(assets) {
  const body = JSON.stringify(assets, null, 2)
  return `// Generated by scripts/images-optimize.mjs (npm run media). Do not edit by hand:
// change scripts/media-selection.json and re-run the script instead.
import type { MediaAsset } from '../schema'

export const media: MediaAsset[] = ${body}
`
}

async function main() {
  const selection = JSON.parse(await readFile(SELECTION_FILE, 'utf8'))
  validateSelection(selection)
  await mkdir(OUT_DIR, { recursive: true })

  const cache = await readCache()
  const nextCache = {}
  const results = []
  const assets = []
  let built = 0
  let skipped = 0
  const placeholderInput = selection.some((e) => e.placeholder === true) ? await placeholderBuffer() : null

  for (const entry of selection) {
    const input = entry.placeholder === true ? placeholderInput : await readFile(path.join(SOURCE_DIR, entry.sourceFile))
    const key = `${sha256(input)}:${settingsHash}`
    const cached = cache[entry.id]
    let dims
    if (cached && cached.key === key && outputsExist(entry.id, cached.widths)) {
      dims = { widths: cached.widths, width: cached.width, height: cached.height }
      skipped += 1
    } else {
      dims = await processEntry(entry, input)
      built += 1
      process.stdout.write(`built ${entry.id} [${dims.widths.join(', ')}]\n`)
    }
    nextCache[entry.id] = { key, ...dims }
    results.push({ id: entry.id, ...dims })

    assets.push({
      id: entry.id,
      sourceFile: entry.sourceFile,
      widths: dims.widths,
      width: dims.width,
      height: dims.height,
      alt: Object.fromEntries(LOCALES.map((l) => [l, entry.alt[l]])),
      topic: entry.topic,
      rights: 'unverified',
      placeholder: entry.placeholder === true,
    })
  }

  const removed = await removeOrphans(results)
  await writeFile(CACHE_FILE, `${JSON.stringify(nextCache, null, 2)}\n`)
  await mkdir(path.dirname(CATALOG_FILE), { recursive: true })
  await writeFile(CATALOG_FILE, renderCatalog(assets))
  process.stdout.write(
    `media: ${selection.length} assets (${built} built, ${skipped} unchanged, ${removed} orphan files removed) -> ${path.relative(APP_DIR, CATALOG_FILE)}\n`,
  )
}

main().catch((error) => {
  process.stderr.write(`images-optimize failed: ${error instanceof Error ? error.stack : String(error)}\n`)
  process.exit(1)
})
