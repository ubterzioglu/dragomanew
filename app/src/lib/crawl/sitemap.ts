import { escapeXml } from './xml'

export interface SitemapPage {
  /** Absolute canonical URL. */
  loc: string
  /** hreflang alternates as the page's head lists them, x-default included. */
  alternates: readonly { hreflang: string; href: string }[]
  /** YYYY-MM-DD; only pages with a real date (blog posts) have one. */
  lastmod?: string
}

function urlEntry({ loc, alternates, lastmod }: SitemapPage): string {
  const lines = [`    <loc>${escapeXml(loc)}</loc>`]
  if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`)
  for (const { hreflang, href } of alternates) {
    lines.push(`    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`)
  }
  return ['  <url>', ...lines, '  </url>'].join('\n')
}

/** sitemap.xml (SEO-04) with hreflang alternates, sorted by URL so rebuilds give the same file. */
export function buildSitemap(pages: readonly SitemapPage[]): string {
  // Code-unit order, not localeCompare: the result must not depend on the build machine's locale.
  const sorted = pages.toSorted((a, b) => (a.loc < b.loc ? -1 : a.loc > b.loc ? 1 : 0))
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...sorted.map(urlEntry),
    '</urlset>',
    '',
  ].join('\n')
}
