import { GUIDE_IDS, type GuideId } from '../../components/nav/navItems'
import { parseChangelog, type ChangelogEntry } from './changelog'
import { buildGuide, type GuideSection } from './guide'

/**
 * The Markdown under src/docs/, bundled at build time as text (no fetch, nothing outside /panel/).
 * The cookbook is a byte-for-byte copy of docs/gelistirici-cookbook.md made by `npm run sync:shared`.
 */

const guideFiles = import.meta.glob<string>('../../docs/kilavuz/*.md', { query: '?raw', import: 'default', eager: true })
const changelogFiles = import.meta.glob<string>('../../docs/guncellemeler.md', { query: '?raw', import: 'default', eager: true })
const cookbookFiles = import.meta.glob<string>('../../docs/gelistirici-cookbook.md', { query: '?raw', import: 'default', eager: true })

export const GUIDE: readonly GuideSection[] = buildGuide(guideFiles, GUIDE_IDS)

export function guideSection(id: GuideId): GuideSection | undefined {
  return GUIDE.find((section) => section.id === id)
}

export const CHANGELOG: readonly ChangelogEntry[] = parseChangelog(Object.values(changelogFiles)[0] ?? '')

/** Null until the cookbook has been synced into the panel. */
export const COOKBOOK: string | null = Object.values(cookbookFiles)[0] ?? null
