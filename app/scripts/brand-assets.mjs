// Builds the logo, share image and favicon copies the site and the panel use.
//   node scripts/brand-assets.mjs            (default sources)
//   DRAGOMAN_LOGO_SOURCE=... DRAGOMAN_IMAGES_DIR=... node scripts/brand-assets.mjs
// The logo is the "dragoman / diving & outdoors" artwork in scripts/brand-source (UBT, 04.11.2026);
// the header, footer, panel, Organization logo and share image all come from it. The favicon still
// comes from the real Dragoman image archive, which is read-only: nothing there is modified.
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url))
const LOGO = process.env.DRAGOMAN_LOGO_SOURCE ?? path.join(SCRIPTS_DIR, 'brand-source', 'dragoman-logo.png')
const SOURCE_DIR = process.env.DRAGOMAN_IMAGES_DIR ?? 'C:\\temp_private\\dragoman\\cloner\\images'
const FAVICON = path.join(SOURCE_DIR, 'favicon-512x512-1-463c40e1296f.png')
const OUT_DIR = path.join(SCRIPTS_DIR, '..', 'public', 'brand')

/** The share image keeps this much white around the logo on each side. */
const OG_PADDING = { x: 110, y: 70 }

/** The artwork's two colours, measured as the medians of its solid areas. */
const LOGO_COLOURS = [
  [0xf7, 0x69, 0x00], // orange
  [0x01, 0x58, 0x3b], // green
]
/** Alpha at or above this counts as solid; below the floor it is background noise. */
const SOLID_ALPHA = 240
const NOISE_ALPHA = 8

function nearestColour(r, g, b) {
  let best = LOGO_COLOURS[0]
  let bestDistance = Infinity
  for (const colour of LOGO_COLOURS) {
    const distance = (r - colour[0]) ** 2 + (g - colour[1]) ** 2 + (b - colour[2]) ** 2
    if (distance < bestDistance) [best, bestDistance] = [colour, distance]
  }
  return best
}

/**
 * The source came out of a background remover: its solid areas are ~98% opaque, colours wobble by
 * a few steps and edge pixels carry some of the old white. Flat colours with a clean alpha look the
 * same, show no fringe on the green footer and compress to a fraction of the size. Edge softness
 * (partial alpha) is kept, so curves stay smooth.
 */
async function cleanLogo(file) {
  const { data, info } = await sharp(file).trim().ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixels = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < NOISE_ALPHA) continue // stays transparent black
    const [r, g, b] = nearestColour(data[i], data[i + 1], data[i + 2])
    pixels[i] = r
    pixels[i + 1] = g
    pixels[i + 2] = b
    pixels[i + 3] = alpha >= SOLID_ALPHA ? 255 : Math.round(((alpha - NOISE_ALPHA) * 255) / (SOLID_ALPHA - NOISE_ALPHA))
  }
  return sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // Trimmed (no transparent margin) so the logo lines up with the layout edges.
  const logo = await cleanLogo(LOGO)

  // Two colours and their edge shades fit a palette; palette first, then lossless WebP, is less than
  // half the size of lossy WebP and keeps the colours exact. 960: the large footer logo on
  // high-density screens.
  for (const width of [240, 480, 960]) {
    const palette = await sharp(logo).resize({ width }).png({ palette: true, compressionLevel: 9, effort: 10 }).toBuffer()
    await sharp(palette).webp({ lossless: true, effort: 6 }).toFile(path.join(OUT_DIR, `dragoman-logo-${width}.webp`))
    // The PNG is the Organization logo in structured data (src/lib/siteConfig.ts, brand.logo).
    if (width === 480) await writeFile(path.join(OUT_DIR, 'dragoman-logo-480.png'), palette)
  }

  for (const size of [32, 180, 512]) {
    await sharp(FAVICON).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, `favicon-${size}.png`))
  }

  // og:image fallback (src/lib/siteConfig.ts, brand.shareImage): exactly 1200x630 and opaque,
  // since some platforms show transparent areas as black.
  const inner = await sharp(logo)
    .resize(1200 - 2 * OG_PADDING.x, 630 - 2 * OG_PADDING.y, { fit: 'contain', background: '#ffffff00' })
    .toBuffer()
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#ffffff' } })
    .composite([{ input: inner, gravity: 'centre' }])
    .flatten({ background: '#ffffff' })
    // Flat logo colours: a palette PNG is a fraction of the size with no visible loss.
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(OUT_DIR, 'dragoman-og-1200x630.png'))

  const sizes = await Promise.all(
    [240, 480, 960].map(async (width) => (await sharp(path.join(OUT_DIR, `dragoman-logo-${width}.webp`)).metadata()).height),
  )
  console.log(`Brand assets written to ${OUT_DIR} (logo heights at 240/480/960: ${sizes.join('/')})`)
}

main().catch((error) => {
  console.error('Brand asset generation failed:', error)
  process.exit(1)
})
