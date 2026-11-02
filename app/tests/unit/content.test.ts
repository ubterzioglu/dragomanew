import { describe, expect, it } from 'vitest'
import { content, contentData, contentSource } from '../../src/content/server'
import { pageContent } from '../../src/content/pageContent'
import { validateContent } from '../../src/shared/content/validate'
import { REQUEST_KINDS } from '../../src/shared/requests/payload'
import { validateDefinition } from '../../src/shared/requests/forms'

/**
 * Build gate (`npm run build` runs this file before rendering): the content the build is about to
 * render, a release or the fixture, passes the same whole-set rules as Yayınla (dalga2-sozlesme §7).
 * Facts about the Stage A sample data are in contentFixture.test.ts.
 */
const source = contentSource.kind === 'release' ? `release ${contentSource.releaseId}` : 'fixture'

describe(`active content (${source})`, () => {
  it('passes validateContent', () => {
    expect(validateContent(contentData)).toEqual([])
  })

  it('has a valid published definition for every request form', () => {
    for (const kind of REQUEST_KINDS) {
      const form = content.form(kind)
      expect(form.version, kind).toBeGreaterThanOrEqual(0)
      expect(validateDefinition(kind, form.definition), kind).toEqual([])
    }
  })

  it('gives each page slice only the forms it renders', () => {
    const event = content.events()[0]
    if (event) expect(Object.keys(pageContent(contentData, { kind: 'event', category: event.category, locale: 'en', slug: event.slug.en }).forms)).toEqual(['event'])
    expect(Object.keys(pageContent(contentData, { kind: 'category', category: 'transport', locale: 'en' }).forms).toSorted()).toEqual(['lodging', 'transport'])
    expect(Object.keys(pageContent(contentData, { kind: 'rich', page: 'contact', locale: 'en' }).forms)).toEqual(['contact'])
    expect(pageContent(contentData, { kind: 'home', locale: 'en' }).forms).toEqual({})
  })
})
