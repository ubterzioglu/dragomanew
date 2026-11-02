// Shared by check-dist.mjs, postbuild.mjs and seo-report.mjs: where dist/ is, which build it is,
// and the few head tags they read from the prerendered HTML (plain regexes: one fixed renderer wrote it).
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

export const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DIST = path.join(APP, 'dist')

// Read like the production build does: process.env first, then app/.env* files.
const env = loadEnv('production', APP, 'VITE_')
// Same flag as src/lib/env.ts: a public release must be indexable, Stage A must not be.
export const PUBLIC_RELEASE = env.VITE_PUBLIC_RELEASE === 'true'
// Same origin as siteConfig.origin (src/lib/siteOrigin.ts); the build has already rejected malformed values.
export const ORIGIN = env.VITE_SITE_ORIGIN?.trim() ? new URL(env.VITE_SITE_ORIGIN.trim()).origin : 'https://dragoman-turkey.com'

export async function listHtml(dir = DIST) {
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

export function pageUrl(file) {
  const rel = path.relative(DIST, path.dirname(file)).split(path.sep).join('/')
  return rel === '' ? '/' : `/${rel}/`
}

/** A dist path for a URL path, e.g. /tr/blog/feed.xml -> dist/tr/blog/feed.xml. */
export const distFile = (urlPath) => path.join(DIST, ...urlPath.split('/').filter(Boolean))

// React escapes these five in attribute values.
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'" }
export const decodeAttribute = (value) => value.replace(/&(?:amp|lt|gt|quot|#x27);/g, (entity) => ENTITIES[entity])

const attribute = (tag, name) => {
  const raw = new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]
  return raw === undefined ? undefined : decodeAttribute(raw)
}

export function linkTags(html, rel) {
  return [...html.matchAll(/<link[^>]+>/g)]
    .map((match) => match[0])
    .filter((tag) => tag.includes(`rel="${rel}"`))
    .map((tag) => ({ href: attribute(tag, 'href') ?? '', hreflang: attribute(tag, 'hreflang'), type: attribute(tag, 'type'), title: attribute(tag, 'title') }))
}

/** content of <meta property="…"> or <meta name="…">. */
export function metaContent(html, key) {
  const tag = [...html.matchAll(/<meta[^>]+>/g)].map((match) => match[0]).find((candidate) => candidate.includes(`property="${key}"`) || candidate.includes(`name="${key}"`))
  return tag ? attribute(tag, 'content') : undefined
}

export const isNoindex = (html) => html.includes('name="robots" content="noindex,nofollow"')

/** A page showing the Turkish fallback (TranslationNote): noindex and outside hreflang on purpose (dalga2-sozlesme §7, Q2). */
export const isTranslationFallback = (html) => html.includes('data-translation-fallback')
