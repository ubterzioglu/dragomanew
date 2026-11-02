// Search and share checks for check-dist.mjs (plan §5): structured data, share images, article dates,
// the RSS feeds, sitemap.xml, robots.txt for crawlers and llms.txt. Each check reports through fail().
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import { DIST, ORIGIN, PUBLIC_RELEASE, distFile, isNoindex, metaContent } from './dist.mjs'

// Kept apart from src/lib/crawl/robotsTxt.ts on purpose: an edit there that drops a crawler shows up here.
const NAMED_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Bingbot', 'Applebot']
const LOCALE_PREFIXES = ['', '/tr', '/fr', '/de']
const ORGANIZATION_ID = `${ORIGIN}/#organization`
const BLOG_POST = /^\/(?:(?:tr|fr|de)\/)?blog\/[^/]+\/$/

const existsOnSite = (url) => url.startsWith(`${ORIGIN}/`) && existsSync(distFile(new URL(url).pathname))

function parseXml(xml) {
  try {
    return new JSDOM(xml, { contentType: 'application/xml' }).window.document
  } catch {
    return null
  }
}

function checkJsonLd(html, fail) {
  const blocks = [...html.matchAll(/<script[^>]*\stype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  if (blocks.length !== 1) return fail(`${blocks.length} JSON-LD blocks (expected 1)`)
  let data
  try {
    data = JSON.parse(blocks[0][1])
  } catch (error) {
    return fail(`JSON-LD does not parse: ${error.message}`)
  }
  const nodes = Array.isArray(data['@graph']) ? data['@graph'] : []
  const organizations = nodes.filter((node) => node['@id'] === ORGANIZATION_ID && node['@type'])
  if (organizations.length !== 1) fail(`JSON-LD defines the organization ${organizations.length} times (expected once, @id ${ORGANIZATION_ID})`)
}

/** Per page; `indexable` pages are those with a canonical (not the 404 pages, forms or review index). */
export function checkPageSeo(url, html, indexable, fail) {
  for (const key of ['og:image', 'twitter:image']) {
    const image = metaContent(html, key)
    // The review index has no share tags; every page that has them must point at a real file.
    if (!image) {
      if (indexable) fail(`missing ${key}`)
    } else if (!existsOnSite(image)) fail(`${key} ${image} is not a file of this build`)
  }
  if (BLOG_POST.test(url) && !metaContent(html, 'article:published_time')) fail('blog post without article:published_time')
  if (!indexable) return
  checkJsonLd(html, fail)
  if (PUBLIC_RELEASE && isNoindex(html)) fail('noindex on a public page of a public release')
}

export async function checkFeeds(fail) {
  for (const prefix of LOCALE_PREFIXES) {
    const urlPath = `${prefix}/blog/feed.xml`
    if (!existsSync(distFile(urlPath))) {
      fail(`${urlPath}: missing (the blog pages link to it)`)
      continue
    }
    const doc = parseXml(await readFile(distFile(urlPath), 'utf8'))
    if (!doc || doc.documentElement.nodeName !== 'rss' || doc.documentElement.getAttribute('version') !== '2.0') {
      fail(`${urlPath}: not an RSS 2.0 document`)
      continue
    }
    const links = [...doc.querySelectorAll('item > link')].map((link) => link.textContent.trim())
    if (links.length === 0) fail(`${urlPath}: no items`)
    for (const link of links) if (!existsSync(path.join(distFile(new URL(link).pathname), 'index.html'))) fail(`${urlPath}: item ${link} is not a page of this build`)
  }
}

/** `canonicals`: canonical URLs of every page without noindex. */
export async function checkSitemap(canonicals, fail) {
  const file = path.join(DIST, 'sitemap.xml')
  if (!PUBLIC_RELEASE) {
    if (existsSync(file)) fail('sitemap.xml: present in a Stage A build (every page is noindex)')
    return
  }
  if (!existsSync(file)) return fail('sitemap.xml: missing (required for a public release)')
  const doc = parseXml(await readFile(file, 'utf8'))
  if (!doc) return fail('sitemap.xml: does not parse')
  const locs = new Set([...doc.getElementsByTagName('loc')].map((loc) => loc.textContent.trim()))
  for (const canonical of canonicals) if (!locs.has(canonical)) fail(`sitemap.xml: lacks ${canonical}`)
  for (const loc of locs) if (!canonicals.has(loc)) fail(`sitemap.xml: lists ${loc}, which is not an indexable page`)
}

// Groups as RFC 9309 reads them: consecutive User-agent lines share the rules that follow.
function robotsGroups(text) {
  const groups = []
  let current = null
  for (const line of text.split(/\r?\n/).map((raw) => raw.replace(/#.*/, '').trim()).filter(Boolean)) {
    const [field, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (/^user-agent$/i.test(field)) {
      if (!current || current.rules.length > 0) groups.push((current = { agents: [], rules: [] }))
      current.agents.push(value.toLowerCase())
    } else if (current && /^(allow|disallow)$/i.test(field)) current.rules.push(`${field.toLowerCase()}:${value}`)
  }
  return groups
}

/** Release only; Stage A's "Disallow: /" is checked by check-dist.mjs itself. */
export async function checkRobotsForCrawlers(fail) {
  const file = path.join(DIST, 'robots.txt')
  if (!PUBLIC_RELEASE || !existsSync(file)) return
  const text = await readFile(file, 'utf8')
  const groups = robotsGroups(text)
  for (const crawler of ['*', ...NAMED_CRAWLERS]) {
    const group = groups.find((candidate) => candidate.agents.includes(crawler.toLowerCase()))
    if (!group) fail(`robots.txt: no group for ${crawler}`)
    else if (!group.rules.includes('allow:/') || group.rules.includes('disallow:/')) fail(`robots.txt: ${crawler} is not allowed to crawl the site`)
  }
  if (!text.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail(`robots.txt: no Sitemap: ${ORIGIN}/sitemap.xml line`)
}

// public/llms.txt is static, so its links could fall behind a slug change.
export async function checkLlmsTxt(fail) {
  const file = path.join(DIST, 'llms.txt')
  if (!existsSync(file)) return fail('llms.txt: missing')
  const links = [...(await readFile(file, 'utf8')).matchAll(/\]\((\/[^)]*)\)/g)].map((match) => match[1])
  if (links.length === 0) fail('llms.txt: no links')
  for (const link of links) if (!existsSync(path.join(distFile(link), 'index.html'))) fail(`llms.txt: ${link} is not a page of this build`)
}
