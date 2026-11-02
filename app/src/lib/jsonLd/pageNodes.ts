import { breadcrumb, type BreadcrumbItem } from './breadcrumb'
import type { JsonLdNode } from './graph'
import { webPage, type WebPageInput } from './webPage'

export interface PageNodesInput extends Omit<WebPageInput, 'hasBreadcrumb' | 'mainEntityId'> {
  /** The visible breadcrumb trail; the home page has none. */
  crumbs?: readonly BreadcrumbItem[]
  /** What the page is about (a trip, post or book node with an @id). */
  mainEntity?: JsonLdNode
}

/** The usual set for one page: WebPage, its BreadcrumbList and its main entity, linked by @id. */
export function pageNodes({ crumbs, mainEntity, ...page }: PageNodesInput): JsonLdNode[] {
  const mainEntityId = typeof mainEntity?.['@id'] === 'string' ? mainEntity['@id'] : undefined
  const hasBreadcrumb = crumbs !== undefined && crumbs.length > 0
  return [
    webPage({ ...page, hasBreadcrumb, mainEntityId }),
    ...(hasBreadcrumb ? [breadcrumb(crumbs, page.path)] : []),
    ...(mainEntity ? [mainEntity] : []),
  ]
}
