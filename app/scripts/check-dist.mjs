// Checks the prerendered site in dist/ without a browser (SEO-01/05, E01, E13):
//  - charset declared within the first 1024 bytes
//  - <html lang>, canonical and noindex present on every page (no canonical on always-noindex pages)
//  - every internal link points at a page that exists in dist/
//  - canonical is the page's own URL; hreflang targets exist, include x-default and the page itself
//  - every language has its own 404 page for the host to serve (deploy/nginx/dragoman.conf)
//  - robots.txt keeps the Stage A preview out of search indexes; a release lets the named crawlers in
//  - one parseable JSON-LD block (one organization node) per indexable page; share images exist;
//    blog posts carry article:published_time; per-language feed.xml; sitemap.xml only in a release,
//    with every indexable canonical; llms.txt links exist (scripts/lib/seoChecks.mjs)
//  - Stage A pages show the sample-content banner
//  - nothing is loaded from another origin (scripts, styles, fonts, media, preconnects, CSS url())
//  - content data is not in the JS bundle; per-page loader JSON carries no source details
//  - the app script starts after the first paint (no blocking module script left)
//  - one Content-Security-Policy meta tag ahead of every script, allowing exactly the page's inline scripts
//  - a release build serves /release.json with the release it was built from (scripts/fetch-content.mjs)
// Exit code 1 when anything fails.  Usage: node scripts/check-dist.mjs
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { APP, DIST, ORIGIN, PUBLIC_RELEASE, isNoindex, isTranslationFallback, listHtml, pageUrl } from './lib/dist.mjs'
import { checkFeeds, checkLlmsTxt, checkPageSeo, checkRobotsForCrawlers, checkSitemap } from './lib/seoChecks.mjs'

const STATIC_PREFIXES = ['/assets/', '/brand/', '/media/', '/fonts/']
// The 404 pages (one per language, served by the host under that prefix) point hreflang at the home pages.
const NOT_FOUND_PAGES = ['/404/', '/tr/404/', '/fr/404/', '/de/404/']
const NOT_SELF_REFERENCING = new Set(NOT_FOUND_PAGES)
// Participant form slugs (src/i18n/pages.ts, participantForm): process pages, noindex even after launch.
const PARTICIPANT_FORM = /^\/(?:(?:tr|fr|de)\/)?(?:katilimci-formu|participant-form|formulaire-participant|teilnehmerformular)\//
// Pages that claim no canonical URL: the Stage A review index (never built for a public release) and every
// page PageHead keeps out of the index for good (alwaysNoindex: 404 pages, participant forms).
const hasNoCanonical = (url) => url === '/__demo/' || NOT_SELF_REFERENCING.has(url) || PARTICIPANT_FORM.test(url)

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
  // A Turkish-fallback page leaves the hreflang set of its own record, itself included.
  if (!NOT_SELF_REFERENCING.has(url) && !isTranslationFallback(html) && !alternates.some((link) => link.href === `${ORIGIN}${url}`)) fail('hreflang set does not include the page itself')
}

// Recomputed here rather than imported from src/lib/contentSecurityPolicy.ts, so a bug there or an
// edit to the HTML after hashing shows up as a mismatch instead of a blocked script in the browser.
function checkContentSecurityPolicy(html, fail) {
  const metas = [...html.matchAll(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/g)]
  if (metas.length !== 1) return fail(`${metas.length} Content-Security-Policy meta tags (expected 1)`)
  const [meta] = metas
  const firstScript = html.indexOf('<script')
  if (firstScript >= 0 && meta.index > firstScript) fail('Content-Security-Policy comes after a script, which it then does not cover')
  const policy = meta[1]
  if (/unsafe-inline|unsafe-eval/.test(policy)) fail('Content-Security-Policy allows unsafe-inline or unsafe-eval')
  const allowed = new Set((/script-src ([^;]*)/.exec(policy)?.[1] ?? '').split(' ').filter((source) => source.startsWith("'sha256-")))
  const inline = new Set()
  for (const [, attributes, body] of html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const type = /\stype="([^"]*)"/i.exec(attributes)?.[1]
    if (type !== undefined && !/^(?:module|text\/javascript)$/i.test(type)) continue
    inline.add(`'sha256-${createHash('sha256').update(body.replace(/\r\n?/g, '\n'), 'utf8').digest('base64')}'`)
  }
  for (const hash of inline) if (!allowed.has(hash)) fail(`inline script ${hash} is blocked by the page's Content-Security-Policy`)
  for (const hash of allowed) if (!inline.has(hash)) fail(`Content-Security-Policy allows ${hash}, which matches no inline script`)
}

async function checkRobots(fail) {
  const file = path.join(DIST, 'robots.txt')
  if (!existsSync(file)) return fail('robots.txt: missing')
  const disallowsAll = /^Disallow: \/\s*$/m.test(await readFile(file, 'utf8'))
  if (!PUBLIC_RELEASE && !disallowsAll) fail('robots.txt: Stage A must disallow everything')
  if (PUBLIC_RELEASE && disallowsAll) fail('robots.txt: a public release must not disallow everything')
}


function targetExists(href) {
  const clean = href.split('#')[0].split('?')[0]
  if (clean === '') return true
  if (STATIC_PREFIXES.some((prefix) => clean.startsWith(prefix)) || /\.\w+$/.test(clean)) {
    return existsSync(path.join(DIST, clean))
  }
  return existsSync(path.join(DIST, clean, 'index.html'))
}

// The panel reads the live release from /release.json; it must name the release this build rendered.
async function checkReleaseFile(fail) {
  const source = path.join(APP, 'src', 'content', 'release', 'release.json')
  const served = path.join(DIST, 'release.json')
  if (!existsSync(source)) {
    if (existsSync(served)) fail('release.json: present in a fixture build')
    return
  }
  if (!existsSync(served)) return fail('release.json: missing from a release build')
  const built = JSON.parse(await readFile(source, 'utf8'))
  const live = JSON.parse(await readFile(served, 'utf8'))
  if (live.releaseId !== built.releaseId) fail(`release.json: names release ${live.releaseId}, the pages are release ${built.releaseId}`)
}

async function main() {
  const files = await listHtml(DIST)
  const failures = []
  const indexable = new Set()
  let linkCount = 0

  for (const file of files) {
    const url = pageUrl(file)
    const html = await readFile(file, 'utf8')
    const fail = (message) => failures.push(`${url}: ${message}`)

    const charsetAt = Buffer.from(html).indexOf('<meta charset="UTF-8">')
    if (charsetAt < 0 || charsetAt > 1024) fail(`charset at byte ${charsetAt} (must be within 1024)`)
    if (!/<html lang="[a-z]{2}(-[A-Z]{2})?"/.test(html)) fail('missing <html lang>')
    const noindex = isNoindex(html)
    if (!PUBLIC_RELEASE && !noindex) fail('missing noindex (Stage A sample content)')
    if (!PUBLIC_RELEASE && !html.includes('data-sample-banner')) fail('missing sample-content banner')
    for (const tag of externalLoads(html)) fail(`loads from another origin: ${tag.slice(0, 120)}`)
    // deferAppScript (vite.config.ts) must have replaced the blocking app script on every page,
    // and the bundle its loader appends must exist and be preloaded (the loader's URL is inside JS, not an href).
    const bundle = /s\.src="(\/assets\/[^"]+\.js)"/.exec(html)?.[1]
    if (html.includes('<script type="module"') || !html.includes('s.type="module"') || !bundle) fail('app script is not deferred until after the first paint')
    else if (!targetExists(bundle)) fail(`deferred app script ${bundle} does not exist`)
    else if (!html.includes(`<link rel="modulepreload" crossorigin href="${bundle}" fetchpriority="low">`)) fail(`no low-priority modulepreload for ${bundle}`)
    const canonicalTag = /<link[^>]+rel="canonical"/.test(html)
    if (!hasNoCanonical(url) && !canonicalTag) fail('missing canonical')
    if (hasNoCanonical(url) && canonicalTag) fail('has a canonical, but the page is kept out of the index for good')
    checkHead(url, html, fail)
    checkContentSecurityPolicy(html, fail)
    checkPageSeo(url, html, !hasNoCanonical(url), fail)
    const canonical = linkHrefs(html, 'canonical')[0]?.href
    if (canonical && !noindex) indexable.add(canonical)

    for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
      linkCount += 1
      if (!targetExists(match[1])) fail(`broken internal link ${match[1]}`)
    }
  }

  for (const url of NOT_FOUND_PAGES) if (!targetExists(url)) failures.push(`${url}: missing (the host's 404 page for that language)`)
  const siteFail = (message) => failures.push(message)
  await checkRobots(siteFail)
  await checkRobotsForCrawlers(siteFail)
  await checkSitemap(indexable, siteFail)
  await checkFeeds(siteFail)
  await checkLlmsTxt(siteFail)
  await checkStylesheets(siteFail)
  await checkContentStaysServerSide(siteFail)
  await checkReleaseFile(siteFail)

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
