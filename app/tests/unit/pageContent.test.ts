import { createElement, type ComponentType, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import type { RouteObject } from 'react-router-dom'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server'
import type { RouteRecord } from 'vite-react-ssg'
import { describe, expect, it } from 'vitest'
import { routes } from '../../src/app/routes'
import { contentData } from '../../src/content/data'
import { pageContent } from '../../src/content/pageContent'

// Head (vite-react-ssg) reads its own nested copy of react-helmet-async (main: lib/index.js), so the provider
// must be that instance. Its typings are an ambient module declaration, hence the explicit type.
const helmetUrl = new URL('../../node_modules/vite-react-ssg/node_modules/react-helmet-async/lib/index.js', import.meta.url).href
const { HelmetProvider } = (await import(/* @vite-ignore */ helmetUrl)) as {
  HelmetProvider: ComponentType<{ children?: ReactNode; context?: object }>
}

/** Every path the build prerenders, from the same route table. */
async function prerenderPaths(records: readonly RouteRecord[]): Promise<string[]> {
  const paths: string[] = []
  for (const record of records) {
    if (record.getStaticPaths) paths.push(...(await record.getStaticPaths()).map((p) => `/${p}`))
    else if (record.index) paths.push('/')
    else if (record.path && record.path !== '*' && record.path !== '/') paths.push(`/${record.path}`)
    if (record.children) paths.push(...(await prerenderPaths(record.children)))
  }
  return paths
}

/** The same route table with every loader returning the complete content set. */
function withFullContent(records: readonly RouteRecord[]): RouteObject[] {
  return records.map((record) => {
    const { getStaticPaths: _paths, entry: _entry, ...route } = record as RouteRecord & { entry?: string }
    return {
      ...route,
      ...(record.loader ? { loader: () => contentData } : {}),
      ...(record.children ? { children: withFullContent(record.children) } : {}),
    } as RouteObject
  })
}

/** The real route table; each slice goes through JSON as it does on its way to the browser. */
function withSlicesAsJson(records: readonly RouteRecord[]): RouteObject[] {
  return records.map((record) => {
    const { getStaticPaths: _paths, entry: _entry, ...route } = record as RouteRecord & { entry?: string }
    const { loader } = record
    return {
      ...route,
      ...(typeof loader === 'function'
        ? { loader: async (args: Parameters<typeof loader>[0]) => JSON.parse(JSON.stringify(await loader(args))) as unknown }
        : {}),
      ...(record.children ? { children: withSlicesAsJson(record.children) } : {}),
    } as RouteObject
  })
}

interface HelmetStrings {
  helmet?: Record<'title' | 'meta' | 'link' | 'script' | 'htmlAttributes', { toString(): string }>
}

/** Body HTML plus the head tags (title, description, canonical, hreflang, JSON-LD) of one page. */
async function render(routeTable: RouteObject[], path: string): Promise<string> {
  const handler = createStaticHandler(routeTable)
  const context = await handler.query(new Request(`http://localhost${path}`))
  if (context instanceof Response) throw new Error(`${path}: unexpected redirect`)
  // An error page would render the same with either content set, so it must not pass as "equal".
  if (context.errors) throw new Error(`${path}: loader error ${JSON.stringify(context.errors)}`)
  const router = createStaticRouter(handler.dataRoutes, context)
  const helmetContext: HelmetStrings = {}
  const body = renderToString(
    createElement(HelmetProvider, { context: helmetContext }, createElement(StaticRouterProvider, { router, context, hydrate: false })),
  )
  if (!body.includes('<main')) throw new Error(`${path}: rendered without the page layout`)
  const head = helmetContext.helmet
  if (!head) throw new Error(`${path}: no head tags`)
  return [head.htmlAttributes, head.title, head.meta, head.link, head.script].map(String).join('\n') + body
}

describe('per-page content slices', () => {
  // A slice that misses a record would render less (a card, a review, a cover), so the page would differ.
  it('render every prerendered page exactly as the complete content does', async () => {
    const paths = await prerenderPaths(routes)
    expect(paths.length).toBeGreaterThan(190)
    const sliced = withSlicesAsJson(routes)
    const full = withFullContent(routes)
    const different: string[] = []
    for (const path of paths) {
      if ((await render(sliced, path)) !== (await render(full, path))) different.push(path)
    }
    expect(different).toEqual([])
  }, 120_000)

  it('keep source bookkeeping out of the slices', () => {
    const slice = pageContent(contentData, { kind: 'category', category: 'seaKayak', locale: 'tr' })
    expect(slice.events.length).toBeGreaterThan(0)
    expect(slice.events.every((event) => event.sourceRefs.length === 0)).toBe(true)
    expect(slice.media.every((asset) => asset.sourceFile === '')).toBe(true)
    expect(slice.posts).toEqual([])
  })

  it('never ship drafts or archived records to a page', () => {
    const hidden = contentData.events.filter((event) => event.status !== 'published')
    expect(hidden.length).toBeGreaterThan(0)
    for (const category of ['diving', 'seaKayak', 'outdoor'] as const) {
      const ids = pageContent(contentData, { kind: 'category', category, locale: 'tr' }).events.map((event) => event.id)
      expect(ids.filter((id) => hidden.some((event) => event.id === id))).toEqual([])
    }
  })

  it('send each page far less than the whole content set', () => {
    const whole = JSON.stringify(contentData).length
    const event = contentData.events.find((e) => e.status === 'published')
    if (!event) throw new Error('no published event')
    const detail = JSON.stringify(pageContent(contentData, { kind: 'event', category: event.category, locale: 'tr', slug: event.slug.tr })).length
    const home = JSON.stringify(pageContent(contentData, { kind: 'home', locale: 'tr' })).length
    expect(detail).toBeLessThan(whole / 10)
    expect(home).toBeLessThan(whole / 3)
  })
})
