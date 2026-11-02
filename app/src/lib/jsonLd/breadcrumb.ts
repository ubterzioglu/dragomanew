import { absoluteUrl } from '../socialImage'
import type { JsonLdNode } from './graph'

/** Same shape as the visible breadcrumbs (components/ui/Breadcrumbs): the last item is the page itself. */
export interface BreadcrumbItem {
  label: string
  href?: string
}

/** The visible trail as a BreadcrumbList; an item without a link is the current page. */
export function breadcrumb(items: readonly BreadcrumbItem[], currentPath: string): JsonLdNode {
  const url = absoluteUrl(currentPath)
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href ?? currentPath),
    })),
  }
}
