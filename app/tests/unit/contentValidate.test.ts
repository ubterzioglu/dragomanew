import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import type { ContentSet } from '../../src/shared/content/schema'
import { validateContent, type ContentIssueCode } from '../../src/shared/content/validate'

/** validateContent on the fixture and on one mutation per rule (dalga2-sozlesme §4, §11 A). */
const d = contentData
const [first, second] = d.events
const [post, otherPost] = d.posts
const archived = d.events.find((event) => event.status === 'archived')
if (!first || !second || !post || !otherPost || !archived) throw new Error('fixture changed: need two events, two posts and an archived event')

const withEvents = (events: ContentSet['events']): ContentSet => ({ ...d, events })
const replaceFirst = (patch: Partial<(typeof d.events)[number]>): ContentSet => withEvents([{ ...first, ...patch }, ...d.events.slice(1)])
const replacePost = (patch: Partial<typeof post>): ContentSet => ({ ...d, posts: [{ ...post, ...patch }, ...d.posts.slice(1)] })

const MUTATIONS: readonly [ContentIssueCode, ContentSet][] = [
  ['schema', replaceFirst({ title: { ...first.title, tr: '' } })],
  ['duplicate_id', withEvents([...d.events, first])],
  ['duplicate_slug', replacePost({ slug: otherPost.slug })],
  ['missing_subgroup', replaceFirst({ subgroup: 'no-such-subgroup' })],
  ['missing_media', replaceFirst({ cover: 'no-such-image' })],
  ['invisible_reference', replacePost({ relatedEvents: [archived.id] })],
  ['missing_page', { ...d, richPages: d.richPages.filter((page) => page.key !== 'terms') }],
  ['html_in_text', replaceFirst({ summary: { ...first.summary, tr: 'Bir <b>kalın</b> özet' } })],
  ['email_in_text', replacePost({ excerpt: { ...post.excerpt, en: 'Write to ali.veli@example.com' } })],
]

describe('validateContent', () => {
  it('finds nothing in the fixture', () => {
    expect(validateContent(d)).toEqual([])
  })

  it('has a mutation for every issue code', () => {
    const codes: Record<ContentIssueCode, true> = {
      schema: true,
      duplicate_id: true,
      duplicate_slug: true,
      missing_subgroup: true,
      missing_media: true,
      invisible_reference: true,
      missing_page: true,
      html_in_text: true,
      email_in_text: true,
    }
    expect(MUTATIONS.map(([code]) => code).toSorted()).toEqual(Object.keys(codes).toSorted())
  })

  it.each(MUTATIONS)('reports %s', (code, set) => {
    const issues = validateContent(set)
    expect(issues.map((issue) => issue.code)).toContain(code)
    for (const issue of issues) expect(issue.message.length).toBeGreaterThan(0)
  })

  it('names the record and the place of the problem', () => {
    expect(validateContent(replaceFirst({ cover: 'no-such-image' }))).toEqual([
      { code: 'missing_media', recordType: 'event', recordId: first.id, path: '/cover', message: 'no media "no-such-image"' },
    ])
    expect(validateContent(replaceFirst({ title: { ...first.title, tr: '' } }))[0]).toMatchObject({ code: 'schema', recordType: 'event', recordId: first.id, path: '/title/tr' })
  })

  it('allows the same event slug in another category, not in the same one', () => {
    const elsewhere = d.events.find((event) => event.category !== first.category)
    if (!elsewhere) throw new Error('fixture changed')
    expect(validateContent(withEvents(d.events.map((event) => (event.id === elsewhere.id ? { ...event, slug: first.slug } : event))))).toEqual([])
    const sibling = d.events.find((event) => event.category === first.category && event.id !== first.id)
    if (!sibling) throw new Error('fixture changed')
    const issues = validateContent(withEvents(d.events.map((event) => (event.id === sibling.id ? { ...event, slug: { ...event.slug, fr: first.slug.fr } } : event))))
    expect(issues.map((issue) => [issue.code, issue.path])).toEqual([
      ['duplicate_slug', '/slug/fr'],
      ['duplicate_slug', '/slug/fr'],
    ])
  })

  it('treats a subgroup of another category as missing', () => {
    const foreign = d.subgroups.find((group) => group.category !== first.category)
    if (!foreign) throw new Error('fixture changed')
    expect(validateContent(replaceFirst({ subgroup: foreign.id })).map((issue) => issue.code)).toEqual(['missing_subgroup'])
  })

  it('refuses placeholder share images and duplicate option ids', () => {
    const placeholder = d.media.find((media) => media.placeholder)
    if (placeholder) {
      expect(validateContent(replaceFirst({ seo: { ...first.seo, ogImage: placeholder.id } })).map((issue) => issue.code)).toEqual(['missing_media'])
    }
    const option = { id: 'same', name: { tr: 'Seçenek' }, price: 10, currency: 'EUR' as const, basis: 'person' as const }
    expect(validateContent(replaceFirst({ options: [option, option] }))).toEqual([
      { code: 'duplicate_id', recordType: 'event', recordId: first.id, path: '/options', message: 'option id "same" used more than once' },
    ])
  })

  it('allows the info@ address only', () => {
    expect(validateContent(replacePost({ excerpt: { ...post.excerpt, en: 'Write to info@dragoman-turkey.com' } }))).toEqual([])
  })

  it('reports a missing home page', () => {
    const { home: _home, ...rest } = d
    expect(validateContent(rest as unknown as ContentSet).map((issue) => [issue.code, issue.recordId])).toEqual([['missing_page', 'home']])
  })

  it('checks uploaded media in a release set', () => {
    const upload = { id: 'panel-photo', storage: 'upload' as const, objectPath: `panel-photo/${'a'.repeat(64)}.jpg`, sha256: 'a'.repeat(64), width: 2000, height: 1500, alt: { tr: 'Foto' }, topic: 'kas', rights: 'confirmed' as const, placeholder: false as const }
    expect(validateContent({ ...d, media: [...d.media, upload] })).toEqual([])
    expect(validateContent({ ...d, media: [...d.media, { ...upload, sha256: 'b'.repeat(64) }] }).map((issue) => [issue.code, issue.path])).toEqual([['schema', '/objectPath']])
  })

  it('never mutates its input', () => {
    const before = JSON.stringify(d)
    validateContent(d)
    expect(JSON.stringify(d)).toBe(before)
  })
})
