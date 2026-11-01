// Builds the logo and favicon copies the site uses from the real Dragoman
// image archive. The source folder is read-only: nothing there is modified.
//   node scripts/brand-assets.mjs            (default source folder)
//   DRAGOMAN_IMAGES_DIR=... node scripts/brand-assets.mjs
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SOURCE_DIR = process.env.DRAGOMAN_IMAGES_DIR ?? 'C:\\temp_private\\dragoman\\cloner\\images'
const LOGO = path.join(SOURCE_DIR, 'dragoman-logo-transparent-e95d6bdb5f76.png')
const FAVICON = path.join(SOURCE_DIR, 'favicon-512x512-1-463c40e1296f.png')
const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'brand')

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const width of [240, 480]) {
    await sharp(LOGO).resize({ width }).webp({ quality: 90 }).toFile(path.join(OUT_DIR, `dragoman-logo-${width}.webp`))
  }
  await sharp(LOGO).resize({ width: 480 }).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, 'dragoman-logo-480.png'))

  for (const size of [32, 180, 512]) {
    await sharp(FAVICON).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, `favicon-${size}.png`))
  }
  console.log(`Brand assets written to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error('Brand asset generation failed:', error)
  process.exit(1)
})
