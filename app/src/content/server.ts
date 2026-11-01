import { contentData } from './data'
import { pageContent, type PageContentRequest } from './pageContent'
import type { ContentRepository } from './repository'
import { createStaticRepository, type ContentData } from './staticRepository'

/**
 * Build-time entry to the full content set. Import it only dynamically behind
 * `import.meta.env.SSR`, so the content data never reaches the browser bundle.
 */
export function loadPageContent(request: PageContentRequest): ContentData {
  return pageContent(contentData, request)
}

/** The repository over the complete content set (route generation, tests). Stage B replaces this binding. */
export const content: ContentRepository = createStaticRepository(contentData)

export { contentData }
