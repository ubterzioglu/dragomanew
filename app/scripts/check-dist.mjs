// Checks the prerendered site in dist/ without a browser (SEO-01/05, E01, E13):
//  - charset declared within the first 1024 bytes
//  - <html lang>, canonical and noindex present on every page
//  - every internal link points at a page that exists in dist/
//  - canonical is the page's own URL; hreflang targets exist, include x-default and the page itself
//  - robots.txt keeps the Stage A preview out of search indexes
//  - Stage A pages show the sample-content banner
//  - nothing is loaded from another origin (scripts, styles, fonts, media, preconnects, CSS url())
//  - content data is not in the JS bundle; per-page loader JSON carries no source details
//  - the app script starts after the first paint (no blocking module script left)
// Exit code 1 when anything fails.  Usage: node scripts/check-dist.mjs
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(APP, 'dist')
const STATIC_PREFIXES = ['/assets/', '/brand/', '/media/', '/fonts/']
// Read like the production build does: process.env first, then app/.env* files.
const env = loadEnv('production', APP, 'VITE_')
// Same flag as src/lib/env.ts: a public release must be indexable, Stage A must not be.
const PUBLIC_RELEASE = env.VITE_PUBLIC_RELEASE === 'true'
// Same origin as siteConfig.origin (src/lib/siteOrigin.ts); the build has already rejected malformed values.
const ORIGIN = env.VITE_SITE_ORIGIN?.trim() ? new URL(env.VITE_SITE_ORIGIN.trim()).origin : 'https://dragoman-turkey.com'
// Stage A review index: noindex, never built for a public release, so it claims no canonical URL.
const NO_CANONICAL = new Set(['/__demo/'])
// The 404 page points canonical and hreflang at the home pages instead of itself.
const NOT_SELF_REFERENCING = new Set(['/404/'])

// Tags that make the browser fetch something on page load. Plain <a href> links to other sites are fine.
const LOADING_TAGS = /<(?:script|img|source|iframe|video|audio|link)\b[^>]*>/g
const LOADING_LINK_RELS = /rel="(?:stylesheet|preload|modulepreload|preconnect|dns-prefetch|prefetch|icon|apple-touch-icon|manifest)"/
const EXTERNAL_URL = /(?:src|srcset|href|imagesrcset)="[^"]*(?:https?:)?\/\/(?!localhost)[^"]*"/

function externalLoads(html) {
  return [...html.matchAll(LOADING_TAGS)]
    .map((match) => match[0])
    .filter((tag) => !tag.startsWith('<link') || LOADING_LINK_RELS.test(tag))
    .filter((tag) => EXTERNAL_URL.test(tag))
}

// Content reaches the browser only as per-page loader JSON, without source bookkeeping (security review L2).
async function checkContentStaysServerSide(fail) {
  const assets = path.join(DIST, 'assets')
  for (const name of (await readdir(assets)).filter((file) => file.endsWith('.js'))) {
    if ((await readFile(path.join(assets, name), 'utf8')).includes('sourceRefs')) fail(`assets/${name}: contains the content data`)
  }
  const dataDir = path.join(DIST, 'static-loader-data')
  if (!existsSync(dataDir)) return fail('static-loader-data/: missing (pages have no content slices)')
  for (const entry of await readdir(dataDir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue
    const json = await readFile(path.join(entry.parentPath, entry.name), 'utf8')
    if (/"sourceRefs":\[[^\]]/.test(json) || /"sourceFile":"[^"]/.test(json)) fail(`static-loader-data/${entry.name}: exposes source details`)
  }
}

async function checkStylesheets(fail) {
  const assets = path.join(DIST, 'assets')
  for (const name of (await readdir(assets)).filter((file) => file.endsWith('.css'))) {
    const css = await readFile(path.join(assets, name), 'utf8')
    if (/url\(\s*['"]?(?:https?:)?\/\//.test(css) || /@import\s+(?:url\()?['"]?(?:https?:)?\/\//.test(css)) fail(`assets/${name}: loads from another origin`)
  }
}

function linkHrefs(html, rel) {
  return [...html.matchAll(/<link[^>]+>/g)]
    .map((match) => match[0])
    .filter((tag) => tag.includes(`rel="${rel}"`))
    .map((tag) => ({ href: /href="([^"]*)"/.exec(tag)?.[1] ?? '', hreflang: /hreflang="([^"]*)"/.exec(tag)?.[1] }))
}

function checkHead(url, html, fail) {
  const canonical = linkHrefs(html, 'canonical')[0]?.href
  if (canonical && !NOT_SELF_REFERENCING.has(url) && canonical !== `${ORIGIN}${url}`) fail(`canonical ${canonical} is not this page`)
  const alternates = linkHrefs(html, 'alternate').filter((link) => link.hreflang)
  if (alternates.length === 0) return
  for (const { href, hreflang } of alternates) {
    if (!href.startsWith(`${ORIGIN}/`)) fail(`hreflang ${hreflang} has a foreign or relative URL ${href}`)
    else if (!targetExists(href.slice(ORIGIN.length))) fail(`hreflang ${hreflang} points at a missing page ${href}`)
  }
  if (!alternates.some((link) => link.hreflang === 'x-default')) fail('hreflang set has no x-default')
  if (!NOT_SELF_REFERENCING.has(url) && !alternates.some((link) => link.href === `${ORIGIN}${url}`)) fail('hreflang set does not include the page itself')
}

async function checkRobots(fail) {
  const file = path.join(DIST, 'robots.txt')
  if (!existsSync(file)) return fail('robots.txt: missing')
  const disallowsAll = /^Disallow: \/\s*$/m.test(await readFile(file, 'utf8'))
  if (!PUBLIC_RELEASE && !disallowsAll) fail('robots.txt: Stage A must disallow everything')
  if (PUBLIC_RELEASE && disallowsAll) fail('robots.txt: a public release must not disallow everything')
}

async function listHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) return listHtml(full)
      return entry.name === 'index.html' ? [full] : []
    }),
  )
  return nested.flat()
}

function pageUrl(file) {
  const rel = path.relative(DIST, path.dirname(file)).split(path.sep).join('/')
  return rel === '' ? '/' : `/${rel}/`
}

function targetExists(href) {
  const clean = href.split('#')[0].split('?')[0]
  if (clean === '') return true
  if (STATIC_PREFIXES.some((prefix) => clean.startsWith(prefix)) || /\.\w+$/.test(clean)) {
    return existsSync(path.join(DIST, clean))
  }
  return existsSync(path.join(DIST, clean, 'index.html'))
}

async function main() {
  const files = await listHtml(DIST)
  const failures = []
  let linkCount = 0

  for (const file of files) {
    const url = pageUrl(file)
    const html = await readFile(file, 'utf8')
    const fail = (message) => failures.push(`${url}: ${message}`)

    const charsetAt = Buffer.from(html).indexOf('<meta charset="UTF-8">')
    if (charsetAt < 0 || charsetAt > 1024) fail(`charset at byte ${charsetAt} (must be within 1024)`)
    if (!/<html lang="[a-z]{2}(-[A-Z]{2})?"/.test(html)) fail('missing <html lang>')
    const noindex = html.includes('name="robots" content="noindex,nofollow"')
    if (!PUBLIC_RELEASE && !noindex) fail('missing noindex (Stage A sample content)')
    if (!PUBLIC_RELEASE && !html.includes('data-sample-banner')) fail('missing sample-content banner')
    for (const tag of externalLoads(html)) fail(`loads from another origin: ${tag.slice(0, 120)}`)
    // deferAppScript (vite.config.ts) must have replaced the blocking app script on every page,
    // and the bundle its loader appends must exist and be preloaded (the loader's URL is inside JS, not an href).
    const bundle = /s\.src="(\/assets\/[^"]+\.js)"/.exec(html)?.[1]
    if (html.includes('<script type="module"') || !html.includes('s.type="module"') || !bundle) fail('app script is not deferred until after the first paint')
    else if (!targetExists(bundle)) fail(`deferred app script ${bundle} does not exist`)
    else if (!html.includes(`<link rel="modulepreload" crossorigin href="${bundle}" fetchpriority="low">`)) fail(`no low-priority modulepreload for ${bundle}`)
    if (!NO_CANONICAL.has(url) && !/<link[^>]+rel="canonical"/.test(html)) fail('missing canonical')
    checkHead(url, html, fail)

    for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
      linkCount += 1
      if (!targetExists(match[1])) fail(`broken internal link ${match[1]}`)
    }
  }

  await checkRobots((message) => failures.push(message))
  await checkStylesheets((message) => failures.push(message))
  await checkContentStaysServerSide((message) => failures.push(message))

  console.log(`Checked ${files.length} pages and ${linkCount} internal links.`)
  if (failures.length > 0) {
    console.error(`${failures.length} problem(s):\n${[...new Set(failures)].join('\n')}`)
    process.exit(1)
  }
  console.log('All dist checks passed.')
}

main().catch((error) => {
  console.error('check-dist failed to run:', error)
  process.exit(1)
})
