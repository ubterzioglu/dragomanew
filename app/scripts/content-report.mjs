// Writes the source/sample table for the Stage A hand-over (plan §3.3 item 3, §8.5 item 2)
// from the content data, so it is never typed by hand. Logic: src/content/report.ts.
// Usage: node scripts/content-report.mjs [output.md]
//   default output: ../tmp/docs/asama-a-teslim/kaynak-ornek-ayrimi.md (git-ignored hand-over folder)
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runnerImport } from 'vite'

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.resolve(process.argv[2] ?? path.join(APP, '..', 'tmp', 'docs', 'asama-a-teslim', 'kaynak-ornek-ayrimi.md'))

// configFile: false keeps the SSG build options (and their env checks) out of a plain data load.
const load = async (file) => (await runnerImport(path.join(APP, file), { configFile: false, root: APP })).module

try {
  const { contentData } = await load('src/content/data/index.ts')
  const { buildContentReport, renderContentReport } = await load('src/content/report.ts')
  const report = buildContentReport(contentData)
  const today = new Date().toISOString().slice(0, 10)
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(output, renderContentReport(report, today), 'utf8')
  const { byOrigin, missing } = report.totals
  console.log(`${report.records.length} records (cloner ${byOrigin.cloner}, kayak-site ${byOrigin['kayak-site']}, mockup ${byOrigin.mockup}), ${report.media.length} images, ${report.prices.length} unverified prices.`)
  console.log(`Missing translations: EN ${missing.en}, FR ${missing.fr}, DE ${missing.de}.`)
  console.log(`Written to ${output}`)
} catch (error) {
  console.error('content-report failed:', error)
  process.exit(1)
}
