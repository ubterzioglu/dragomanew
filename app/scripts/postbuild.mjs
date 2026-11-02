// Runs after vite-react-ssg in `npm run build` (plan §4) and writes the crawler files into dist/:
//  - robots.txt: Stage A shuts everything out; a public release (VITE_PUBLIC_RELEASE=true) opens it
//  - sitemap.xml: every indexable page (no noindex, has a canonical), read from the prerendered HTML;
//    Stage A has none, so no file is written there
//  - feed.xml per language (/blog/feed.xml, /tr/blog/feed.xml, …), from the posts content
// The file builders are in src/lib/crawl/ (unit tested); this script only gathers their input.
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { runnerImport } from 'vite'
import { APP, DIST, ORIGIN, PUBLIC_RELEASE, distFile, isNoindex, linkTags, listHtml, metaContent, pageUrl } from './lib/dist.mjs'

// configFile: false keeps the SSG build options (and their env checks) out of a plain data load.
const load = async (file) => (await runnerImport(path.join(APP, file), { configFile: false, root: APP })).module

async function readPages() {
  const files = await listHtml()
  return Promise.all(files.map(async (file) => ({ url: pageUrl(file), html: await readFile(file, 'utf8') })))
}

function sitemapPages(pages) {
  return pages.flatMap(({ html }) => {
    const loc = linkTags(html, 'canonical')[0]?.href
    if (!loc || isNoindex(html)) return []
    const alternates = linkTags(html, 'alternate').filter((link) => link.hreflang).map(({ hreflang, href }) => ({ hreflang, href }))
    const lastmod = metaContent(html, 'article:modified_time') ?? metaContent(html, 'article:published_time')
    return [{ loc, alternates, ...(lastmod ? { lastmod } : {}) }]
  })
}

async function writeSitemap(pages, buildSitemap) {
  const file = path.join(DIST, 'sitemap.xml')
  const entries = sitemapPages(pages)
  if (entries.length === 0) {
    await rm(file, { force: true })
    return 'sitemap.xml: not written (no indexable page)'
  }
  await writeFile(file, buildSitemap(entries), 'utf8')
  return `sitemap.xml: ${entries.length} URLs`
}

// Channel title, description and link come from each language's blog page, so the feed matches its head.
async function writeFeeds(pages) {
  const { LOCALES, LOCALE_TAG } = await load('src/i18n/locales.ts')
  const { localePath } = await load('src/i18n/pages.ts')
  const { contentData } = await load('src/content/data/index.ts')
  const { createStaticRepository } = await load('src/content/staticRepository.ts')
  const { buildRssFeed, postFeedItems } = await load('src/lib/crawl/rssFeed.ts')
  const posts = createStaticRepository(contentData).posts()
  const lines = []
  for (const locale of LOCALES) {
    const blogUrl = localePath(locale, 'blog')
    const blog = pages.find((page) => page.url === blogUrl)
    if (!blog) throw new Error(`${blogUrl}: blog page missing from dist/, cannot write its feed`)
    const feedLink = linkTags(blog.html, 'alternate').find((link) => link.type === 'application/rss+xml')
    if (!feedLink) throw new Error(`${blogUrl}: no RSS <link> in the head`)
    const channel = {
      title: feedLink.title ?? 'Blog',
      description: metaContent(blog.html, 'description') ?? '',
      link: metaContent(blog.html, 'og:url') ?? `${ORIGIN}${blogUrl}`,
      self: feedLink.href,
      language: LOCALE_TAG[locale],
    }
    const urlPath = new URL(feedLink.href).pathname
    await mkdir(path.dirname(distFile(urlPath)), { recursive: true })
    await writeFile(distFile(urlPath), buildRssFeed(channel, postFeedItems(posts, locale, ORIGIN)), 'utf8')
    lines.push(`${urlPath}: ${posts.length} posts`)
  }
  return lines
}

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/ has no build; run vite-react-ssg build first')
  const pages = await readPages()
  const { buildRobotsTxt } = await load('src/lib/crawl/robotsTxt.ts')
  const { buildSitemap } = await load('src/lib/crawl/sitemap.ts')
  await writeFile(path.join(DIST, 'robots.txt'), buildRobotsTxt({ publicRelease: PUBLIC_RELEASE, origin: ORIGIN }), 'utf8')
  const report = [`robots.txt: ${PUBLIC_RELEASE ? 'public release' : 'Stage A, disallow all'}`, await writeSitemap(pages, buildSitemap), ...(await writeFeeds(pages))]
  console.log(`postbuild (${ORIGIN}):\n  ${report.join('\n  ')}`)
}

main().catch((error) => {
  console.error('postbuild failed:', error)
  process.exit(1)
})
