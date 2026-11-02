/**
 * The user guide is one Markdown file per section (src/docs/kilavuz/<id>.md): `# Title`, then a
 * first paragraph that says what the screen is for (shown in the in-screen help), then the rest.
 * Pure parsing only; the files are loaded by lib/docs/content.ts (Vite) or by tests (fs).
 */

export interface GuideSection {
  id: string
  title: string
  /** The first paragraph, as Markdown. */
  summary: string
  /** Everything after the title line, as Markdown (summary included). */
  body: string
}

const TITLE = /^#\s+(.+?)\s*#*\s*$/

/** Parses one section file; an empty title or summary stays empty so a test can catch it. */
export function parseGuideSection(id: string, raw: string): GuideSection {
  const lines = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')
  const titleIndex = lines.findIndex((line) => TITLE.test(line))
  const title = titleIndex >= 0 ? (TITLE.exec(lines[titleIndex] ?? '')?.[1] ?? '').trim() : ''
  const rest = titleIndex >= 0 ? lines.slice(titleIndex + 1) : lines
  const start = rest.findIndex((line) => line.trim() !== '')
  const summaryLines: string[] = []
  if (start >= 0 && !/^\s*#/.test(rest[start] ?? '')) {
    for (const line of rest.slice(start)) {
      if (line.trim() === '' || /^\s*#/.test(line)) break
      summaryLines.push(line.trim())
    }
  }
  return { id, title, summary: summaryLines.join(' ').trim(), body: rest.join('\n').trim() }
}

/** `../docs/kilavuz/talepler.md` → `talepler`. */
export function sectionIdFromPath(path: string): string {
  const name = path.split(/[\\/]/).pop() ?? ''
  return name.replace(/\.md$/i, '')
}

/**
 * Sections from a path → raw map, in the given order; files not in the order follow
 * alphabetically, so a new file shows up instead of vanishing.
 */
export function buildGuide(files: Readonly<Record<string, string>>, order: readonly string[]): GuideSection[] {
  const sections = Object.entries(files).map(([path, raw]) => parseGuideSection(sectionIdFromPath(path), raw))
  const rank = (id: string): number => {
    const index = order.indexOf(id)
    return index === -1 ? order.length : index
  }
  return [...sections].sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id))
}
