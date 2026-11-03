// Slug-change redirects for nginx (dalga2-sozlesme §2 SEO-02, §7): a published event, post or product
// whose slug (or event category) changed answers its old addresses with a 301 to the current one.
// Removed or archived records are not redirected (they answer 404). The URL builders are passed in
// (src/content/urls.ts), so this module stays plain JavaScript and testable on its own.

/**
 * The only shape a map line may have on either side: a lowercase site path with a trailing slash
 * (the underscore is for old WordPress addresses such as /refund_returns/).
 */
export const REDIRECT_PATH = /^\/[a-z0-9/_-]+\/$/

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/**
 * @param {object} input
 * @param {{ events: readonly any[], posts: readonly any[], products: readonly any[] }} input.content
 * @param {readonly { type: 'event'|'post'|'product', id: string, locale: string, slug: string, category?: string }[]} input.slugHistory
 * @param {{ eventPath: Function, postPath: Function, productPath: Function }} input.paths
 * @param {Iterable<string>} input.liveRoutes every path the build renders (never redirected away)
 * @returns {{ redirects: { from: string, to: string }[], skipped: { from: string, reason: string }[] }}
 */
export function buildRedirects({ content, slugHistory, paths, liveRoutes }) {
  const live = new Set(liveRoutes)
  const collections = { event: content.events, post: content.posts, product: content.products }
  const pathOf = {
    event: (locale, record) => paths.eventPath(locale, record),
    post: (locale, record) => paths.postPath(locale, record),
    product: (locale, record) => paths.productPath(locale, record),
  }
  const skipped = []
  const candidates = new Map()
  for (const item of slugHistory) {
    const record = collections[item.type]?.find((candidate) => candidate.id === item.id)
    // Only visitor-visible records move; an archived or missing one answers 404.
    if (!record || record.status !== 'published') continue
    const to = pathOf[item.type](item.locale, record)
    const former = { ...record, ...(item.type === 'event' && item.category ? { category: item.category } : {}), slug: { ...record.slug, [item.locale]: item.slug } }
    const from = pathOf[item.type](item.locale, former)
    if (from === to) continue
    if (!REDIRECT_PATH.test(from) || !REDIRECT_PATH.test(to)) {
      skipped.push({ from, reason: `not a plain site path (${from} -> ${to})` })
      continue
    }
    if (live.has(from)) {
      skipped.push({ from, reason: 'is a live page' })
      continue
    }
    const targets = candidates.get(from) ?? new Set()
    targets.add(to)
    candidates.set(from, targets)
  }
  const redirects = []
  for (const [from, targets] of candidates) {
    // Two records once used this address: no target is right, so it stays a 404.
    if (targets.size > 1) skipped.push({ from, reason: `ambiguous (${[...targets].toSorted(compare).join(', ')})` })
    else redirects.push({ from, to: [...targets][0] })
  }
  return { redirects: redirects.toSorted((a, b) => compare(a.from, b.from)), skipped: skipped.toSorted((a, b) => compare(a.from, b.from)) }
}

/** nginx `map` include: one `<old> <new>;` line each (deploy/nginx/dragoman.conf). */
export function renderRedirectMap(redirects, header) {
  const lines = redirects.map(({ from, to }) => {
    if (!REDIRECT_PATH.test(from) || !REDIRECT_PATH.test(to)) throw new Error(`refusing redirect line ${from} -> ${to}`)
    return `${from} ${to};`
  })
  return `# ${header}\n${lines.join('\n')}${lines.length > 0 ? '\n' : ''}`
}
