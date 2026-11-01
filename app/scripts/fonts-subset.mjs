// Builds one WOFF2 file per font weight from the full Barlow sources (OFL, tools/fonts/source).
// Each file covers Latin, Latin-1, Latin Extended-A (Turkish, œ) and the punctuation the
// four languages use, so a page loads 4 font files instead of 10 latin + latin-ext pairs.
//   node scripts/fonts-subset.mjs   (or npm run fonts)
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIR = path.join(APP, 'tools', 'fonts', 'source')
const OUT_DIR = path.join(APP, 'src', 'assets', 'fonts')

const FONTS = [
  { source: 'Barlow-Regular.ttf', out: 'barlow-400.woff2' },
  { source: 'Barlow-SemiBold.ttf', out: 'barlow-600.woff2' },
  { source: 'BarlowCondensed-SemiBold.ttf', out: 'barlow-condensed-600.woff2' },
  { source: 'BarlowCondensed-Bold.ttf', out: 'barlow-condensed-700.woff2' },
]

// Keep in sync with the unicode-range of the @font-face rules in src/styles/app.css.
export const UNICODE_RANGES = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xff], // Latin-1: French and German letters, « », °, ©
  [0x100, 0x17f], // Latin Extended-A: ğ ı İ ş Ş, œ
  [0x2010, 0x2027], // dashes, quotes, bullet, ellipsis
  [0x202f, 0x203a], // narrow no-break space, per mille, ‹ ›
  [0x20ac, 0x20ac], // €
  [0x20ba, 0x20ba], // ₺
  [0x2122, 0x2122], // ™
  [0x2190, 0x2193], // arrows used in "read more" links
]

function characters() {
  return UNICODE_RANGES.flatMap(([from, to]) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i))).join('')
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const text = characters()
  for (const { source, out } of FONTS) {
    const subset = await subsetFont(await readFile(path.join(SOURCE_DIR, source)), text, { targetFormat: 'woff2' })
    await writeFile(path.join(OUT_DIR, out), subset)
    console.log(`${out}: ${(subset.length / 1024).toFixed(1)} KiB`)
  }
  await copyFile(path.join(SOURCE_DIR, 'OFL.txt'), path.join(OUT_DIR, 'OFL.txt'))
}

main().catch((error) => {
  console.error('Font subsetting failed:', error)
  process.exit(1)
})
