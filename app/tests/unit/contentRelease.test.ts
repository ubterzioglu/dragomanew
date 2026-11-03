import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import { buildReleaseSnapshot, canonicalJson, mediaRefs, releaseSnapshotSchema, type MediaSource, type ReleaseEntryInput, type ReleaseInput } from '../../src/shared/content/release'
import { validateContent } from '../../src/shared/content/validate'
import { DEFAULT_FORM_DEFINITIONS } from '../../src/shared/requests/forms'

/** buildReleaseSnapshot over the fixture as database rows (dalga2-sozlesme §4, §11 A). */
const d = contentData

const entry = (type: ReleaseEntryInput['type'], key: string, document: object, status: ReleaseEntryInput['status'] = 'published'): ReleaseEntryInput => ({
  type,
  key,
  status,
  published: document as Record<string, unknown>,
  order: 'order' in document && typeof document.order === 'number' ? document.order : null,
})

const fixtureEntries: ReleaseEntryInput[] = [
  entry('home', 'home', d.home),
  ...d.categoryPages.map((page) => entry('category_page', page.key, page)),
  ...d.subgroups.map((group) => entry('subgroup', group.id, group)),
  ...d.events.map((event) => entry('event', event.id, event, event.status)),
  ...d.serviceOffers.map((offer) => entry('service_offer', offer.id, offer)),
  ...d.products.map((product) => entry('product', product.id, product, product.status)),
  ...d.posts.map((post) => entry('post', post.id, post, post.status)),
  ...d.team.map((member) => entry('team_member', member.id, member)),
  ...d.testimonials.map((testimonial) => entry('testimonial', testimonial.id, testimonial)),
  ...d.richPages.map((page) => entry('rich_page', page.key, page)),
]
const repoMedia: MediaSource[] = d.media.map((media) => ({ ...media, storage: 'repo' }))
const forms = Object.fromEntries(Object.entries(DEFAULT_FORM_DEFINITIONS).map(([kind, definition]) => [kind, { version: 0, definition }])) as ReleaseInput['forms']
const input: ReleaseInput = { releaseId: 1, createdAt: '2026-11-02T10:00:00.000Z', entries: fixtureEntries, media: repoMedia, forms }

const keyOf = (record: object): string => ('id' in record && typeof record.id === 'string' ? record.id : 'key' in record && typeof record.key === 'string' ? record.key : '')
const byKey = <T extends object>(list: readonly T[]): T[] => list.toSorted((a, b) => (keyOf(a) < keyOf(b) ? -1 : keyOf(a) > keyOf(b) ? 1 : 0))
const noRefs = <T extends object>(record: T): T => ('sourceRefs' in record ? { ...record, sourceRefs: [] } : record)

describe('buildReleaseSnapshot', () => {
  const snapshot = buildReleaseSnapshot(input)

  it('round-trips the fixture minus sourceRefs', () => {
    const { content } = snapshot
    const collections = ['categoryPages', 'subgroups', 'events', 'serviceOffers', 'products', 'posts', 'team', 'testimonials', 'richPages'] as const
    // Draft events never reach a release (see the draft test below).
    const shipped = (name: (typeof collections)[number]): readonly object[] => (name === 'events' ? d.events.filter((event) => event.status !== 'draft') : d[name])
    for (const name of collections) expect(content[name], name).toEqual(byKey<object>(shipped(name)).map(noRefs))
    expect(content.home).toEqual(noRefs(d.home))
  })

  it('keeps exactly the media the content references, and passes validateContent', () => {
    const used = new Set(fixtureEntries.flatMap((row) => mediaRefs(row.published)))
    expect(snapshot.content.media).toEqual(byKey(repoMedia.filter((media) => used.has(media.id))))
    expect(validateContent(snapshot.content)).toEqual([])
    const [sample] = repoMedia
    if (!sample) throw new Error('fixture changed')
    const extra = buildReleaseSnapshot({ ...input, media: [...repoMedia, { ...sample, id: 'never-used' }] })
    expect(extra.content.media.map((media) => media.id)).not.toContain('never-used')
  })

  it('is a valid snapshot with the forms and an empty history', () => {
    expect(releaseSnapshotSchema.safeParse(snapshot).success).toBe(true)
    expect(snapshot).toMatchObject({ format: 1, releaseId: 1, createdAt: input.createdAt, slugHistory: [] })
    expect(snapshot.forms.contact).toEqual({ version: 0, definition: DEFAULT_FORM_DEFINITIONS.contact })
  })

  it('is deterministic whatever order the rows come in', () => {
    const shuffled = buildReleaseSnapshot({ ...input, entries: fixtureEntries.toReversed(), media: repoMedia.toReversed() })
    expect(canonicalJson(shuffled)).toBe(canonicalJson(snapshot))
  })

  it('leaves out drafts and never-published entries, keeps archived events hidden', () => {
    const [event, other] = d.events
    const [member] = d.team
    if (!event || !other || !member) throw new Error('fixture changed')
    const entries = fixtureEntries.map((row) => {
      if (row.key === event.id) return { ...row, status: 'archived' as const }
      if (row.key === other.id) return { ...row, status: 'draft' as const, published: null }
      return row
    })
    // Types without a status field cannot be hidden, so an archived team member leaves the release.
    const result = buildReleaseSnapshot({ ...input, entries: [...entries, entry('team_member', 'gone', { ...member, id: 'gone' }, 'archived')] })
    expect(result.content.events.find((candidate) => candidate.id === event.id)?.status).toBe('archived')
    expect(result.content.events.some((candidate) => candidate.id === other.id)).toBe(false)
    expect(result.content.team.map((candidate) => candidate.id)).not.toContain('gone')
  })

  it('takes status and order from the columns, not the document', () => {
    const [event] = d.events
    if (!event) throw new Error('fixture changed')
    const entries = fixtureEntries.map((row) => (row.key === event.id && row.type === 'event' ? { ...row, order: 99, published: { ...event, status: 'draft', order: 1 } } : row))
    const released = buildReleaseSnapshot({ ...input, entries }).content.events.find((candidate) => candidate.id === event.id)
    expect(released).toMatchObject({ order: 99, status: event.status })
  })

  it('lists slug history of events, posts and products in a fixed order', () => {
    const entries = fixtureEntries.map((row): ReleaseEntryInput =>
      row.type === 'post' && row.key === d.posts[0]?.id
        ? { ...row, slugHistory: [{ locale: 'tr', slug: 'eski-b' }, { locale: 'en', slug: 'old-a' }] }
        : row.type === 'event' && row.key === d.events[0]?.id
          ? { ...row, slugHistory: [{ locale: 'de', slug: 'alt', category: d.events[0].category }] }
          : row,
    )
    const { slugHistory } = buildReleaseSnapshot({ ...input, entries })
    expect(slugHistory).toEqual([
      { type: 'event', id: d.events[0]?.id, locale: 'de', slug: 'alt', category: d.events[0]?.category },
      { type: 'post', id: d.posts[0]?.id, locale: 'en', slug: 'old-a' },
      { type: 'post', id: d.posts[0]?.id, locale: 'tr', slug: 'eski-b' },
    ])
  })

  it('throws without a published home page', () => {
    expect(() => buildReleaseSnapshot({ ...input, entries: fixtureEntries.filter((row) => row.type !== 'home') })).toThrow()
  })

  it('never mutates its input', () => {
    const before = canonicalJson(input)
    buildReleaseSnapshot(input)
    expect(canonicalJson(input)).toBe(before)
  })
})

describe('canonicalJson', () => {
  it('sorts keys at every level, drops undefined, keeps array order', () => {
    expect(canonicalJson({ b: 1, a: { d: [3, { y: 1, x: 2 }], c: undefined } })).toBe('{"a":{"d":[3,{"x":2,"y":1}]},"b":1}')
    expect(canonicalJson([undefined, 'x'])).toBe('[null,"x"]')
  })
})
