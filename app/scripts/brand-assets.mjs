// Builds the logo and favicon copies the site uses from the real Dragoman
// image archive. The source folder is read-only: nothing there is modified.
//   node scripts/brand-assets.mjs            (default source folder)
//   DRAGOMAN_IMAGES_DIR=... node scripts/brand-assets.mjs
// The share image comes from the old repo's full 1200x630 logo with the "diving & outdoors"
// line (UBT 31.10, tmp/docs/asama-a-teslim/acik-kararlar.md); DRAGOMAN_OG_SOURCE overrides its path.
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SOURCE_DIR = process.env.DRAGOMAN_IMAGES_DIR ?? 'C:\\temp_private\\dragoman\\cloner\\images'
const LOGO = path.join(SOURCE_DIR, 'dragoman-logo-transparent-e95d6bdb5f76.png')
const FAVICON = path.join(SOURCE_DIR, 'favicon-512x512-1-463c40e1296f.png')
const OG_SOURCE = process.env.DRAGOMAN_OG_SOURCE ?? 'C:\\temp_private\\dragoman\\dragomanlogo.png'
const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'brand')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // 960: the large footer logo on high-density screens.
  for (const width of [240, 480, 960]) {
    await sharp(LOGO).resize({ width }).webp({ quality: 90 }).toFile(path.join(OUT_DIR, `dragoman-logo-${width}.webp`))
  }
  await sharp(LOGO).resize({ width: 480 }).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, 'dragoman-logo-480.png'))

  for (const size of [32, 180, 512]) {
    await sharp(FAVICON).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, `favicon-${size}.png`))
  }

  // og:image fallback (src/lib/siteConfig.ts, brand.shareImage): exactly 1200x630 and opaque,
  // since some platforms show transparent areas as black.
  await sharp(OG_SOURCE)
    .resize(1200, 630, { fit: 'contain', background: '#ffffff' })
    .flatten({ background: '#ffffff' })
    // Flat logo colours: a palette PNG is a fraction of the size with no visible loss.
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(OUT_DIR, 'dragoman-og-1200x630.png'))

  console.log(`Brand assets written to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error('Brand asset generation failed:', error)
  process.exit(1)
})
