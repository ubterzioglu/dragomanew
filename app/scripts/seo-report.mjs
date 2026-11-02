// Scores the built pages with UBT's seo-analyzer.js (repo root, not part of the site) and prints a
// summary (plan §6). Target: overall >= 90 on indexable pages; in Stage A only "search index" may fail.
// Read-only: needs a build in dist/ (npm run build:demo), changes nothing.  Usage: npm run seo-report
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import { APP, DIST, ORIGIN, PUBLIC_RELEASE, listHtml, pageUrl } from './lib/dist.mjs'

const ANALYZER = path.join(APP, '..', 'seo-analyzer.js')
const TARGET = 90
const PART_LABELS = {
  title: 'Title length',
  meta: 'Meta description',
  h1: 'H1',
  hierarchy: 'Heading hierarchy',
  canonical: 'Canonical',
  imagesAlt: 'Image alt text',
  // The analyzer's own thresholds: 700 visible words, 10 distinct schema.org types.
  wordCount: 'Word count (>= 700)',
  openGraph: 'Open Graph',
  schema: 'Structured data (>= 10 types)',
}

// The analyzer is a browser script that hangs its API on `self`; hand it a plain object instead.
async function loadAnalyzer() {
  if (!existsSync(ANALYZER)) throw new Error(`seo-analyzer.js not found at ${ANALYZER}; put UBT's analyzer at the repo root to run this report`)
  const holder = {}
  new Function('self', await readFile(ANALYZER, 'utf8'))(holder)
  if (!holder.SpindoraSEO?.analyzeDocument) throw new Error(`${ANALYZER} did not define SpindoraSEO.analyzeDocument`)
  return holder.SpindoraSEO
}

async function analyzePages(seo) {
  const results = []
  for (const file of await listHtml()) {
    const url = `${ORIGIN}${pageUrl(file)}`
    const { document } = new JSDOM(await readFile(file, 'utf8'), { url }).window
    // Pages without a canonical (404s, participant forms, review index) are kept out of search on purpose.
    if (!document.querySelector('link[rel="canonical"]')) continue
    results.push({ url, page: seo.analyzeDocument(document, url, {}), geo: seo.analyzeGeo(document, url) })
  }
  return results
}

const average = (values) => (values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : 0)
const percent = (count, total) => `${Math.round((count / total) * 100)}%`

function printSummary(results) {
  const total = results.length
  const scores = results.map((result) => result.page.score)
  const gradeCount = (grade) => results.filter((result) => result.geo.grade === grade).length
  console.log(`\nSEO report: ${total} indexable pages in dist/ (${PUBLIC_RELEASE ? 'public release' : 'Stage A'} build, ${ORIGIN})\n`)
  console.table({
    'Overall (full)': { average: average(scores), min: Math.min(...scores), [`>= ${TARGET}`]: percent(scores.filter((s) => s >= TARGET).length, total) },
    Technical: { average: average(results.map((r) => r.page.scoreTechnical)), min: Math.min(...results.map((r) => r.page.scoreTechnical)) },
    Content: { average: average(results.map((r) => r.page.scoreContent)), min: Math.min(...results.map((r) => r.page.scoreContent)) },
    GEO: { average: average(results.map((r) => r.geo.score)), min: Math.min(...results.map((r) => r.geo.score)), grades: ['A', 'B', 'C', 'D'].map((grade) => `${grade}:${gradeCount(grade)}`).join(' ') },
  })
  const checks = Object.fromEntries(Object.entries(PART_LABELS).map(([key, label]) => [label, { pass: percent(results.filter((r) => r.page.parts[key].ok).length, total) }]))
  checks['Published date'] = { pass: percent(results.filter((r) => r.page.parts.pageDates.published.present).length, total) }
  console.log('Checks passed (seo-analyzer analyzeDocument):')
  console.table(checks)
  return scores
}

function printGeoFailures(results) {
  const failures = new Map()
  for (const { geo } of results) for (const pillar of geo.pillars) for (const item of pillar.items) if (!item.ok) failures.set(item.label, (failures.get(item.label) ?? 0) + 1)
  const rows = [...failures].toSorted((a, b) => b[1] - a[1]).map(([label, count]) => ({ 'GEO item failing': label, pages: count }))
  console.log('GEO items failing (analyzeGeo):')
  if (rows.length) console.table(rows)
  else console.log('  none')
}

function printWorst(results) {
  const worst = results.toSorted((a, b) => a.page.score - b.page.score).slice(0, 5)
  console.log('Lowest overall scores:')
  for (const { url, page } of worst) console.log(`  ${page.score}  ${url.slice(ORIGIN.length)}  ${page.scoreDetail.map((d) => `-${d.points} ${d.reason}`).join(', ')}`)
}

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/ has no build; run npm run build:demo first')
  const results = await analyzePages(await loadAnalyzer())
  if (results.length === 0) throw new Error('no indexable page (with a canonical) in dist/')
  const scores = printSummary(results)
  printGeoFailures(results)
  printWorst(results)
  const overall = average(scores)
  console.log(`\nOverall average ${overall} (target >= ${TARGET}): ${overall >= TARGET ? 'met' : 'NOT met'}`)
}

main().catch((error) => {
  console.error('seo-report failed:', error.message ?? error)
  process.exit(1)
})
