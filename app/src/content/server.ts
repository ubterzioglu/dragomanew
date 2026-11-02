import { contentData as fixtureData } from './data'
import { pageContent, type PageContentRequest } from './pageContent'
import type { ContentRepository } from './repository'
import { createStaticRepository, type ContentData, type FullContentData } from './staticRepository'

/** src/content/release/release.json as scripts/fetch-content.mjs writes it (already validated there). */
interface ReleaseFile {
  format: 1
  releaseId: number
  createdAt: string
  content: Omit<FullContentData, 'forms' | 'translationGaps'>
  forms: FullContentData['forms']
}

// Present only after `CONTENT_SOURCE=release node scripts/fetch-content.mjs`; a fixture run deletes it.
const releaseFiles = import.meta.glob<ReleaseFile>('./release/release.json', { eager: true, import: 'default' })
const release = releaseFiles['./release/release.json']

/** Which data this build renders: the published release, or the Stage A fixture. */
export const contentSource: { kind: 'release'; releaseId: number } | { kind: 'fixture' } = release
  ? { kind: 'release', releaseId: release.releaseId }
  : { kind: 'fixture' }

/** The complete active content set (release or fixture). Build time only. */
export const contentData: FullContentData = release ? { ...release.content, forms: release.forms, translationGaps: {} } : fixtureData

/**
 * Build-time entry to the full content set. Import it only dynamically behind
 * `import.meta.env.SSR`, so the content data never reaches the browser bundle.
 */
export function loadPageContent(request: PageContentRequest): ContentData {
  return pageContent(contentData, request)
}

/** The repository over the complete active content set (route generation, tests). */
export const content: ContentRepository = createStaticRepository(contentData)
