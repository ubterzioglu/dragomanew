import { describe, expect, it } from 'vitest'
import { contentData } from '../../src/content/data'
import { pick } from '../../src/content/localize'
import { blogPosting } from '../../src/lib/jsonLd/blogPosting'
import { book } from '../../src/lib/jsonLd/book'
import { breadcrumb } from '../../src/lib/jsonLd/breadcrumb'
import { faqPage } from '../../src/lib/jsonLd/faqPage'
import { pageGraph, serializeJsonLd, WEBSITE_ID } from '../../src/lib/jsonLd/graph'
import { organization, ORGANIZATION_ID } from '../../src/lib/jsonLd/organization'
import { pageNodes } from '../../src/lib/jsonLd/pageNodes'
import { touristTrip } from '../../src/lib/jsonLd/touristTrip'
import { webPage } from '../../src/lib/jsonLd/webPage'
import { siteConfig } from '../../src/lib/siteConfig'
import { socialImage } from '../../src/lib/socialImage'

const ORIGIN = siteConfig.origin
const image = { url: `${ORIGIN}/media/x-1000.jpg`, width: 1000, height: 580, alt: 'x' }

/** Every string in a node that looks like a URL or a site path. */
function urls(value: unknown): string[] {
  if (typeof value === 'string') return /^(?:https?:|\/)/.test(value) ? [value] : []
  if (Array.isArray(value)) return value.flatMap(urls)
  if (value && typeof value === 'object') return Object.values(value).flatMap(urls)
  return []
}

const types = (value: unknown): string[] => JSON.stringify(value).match(/"@type":"[^"]+"/g) ?? []

describe('organization', () => {
  it('is one TravelAgency with the shared @id and only the site’s own data', () => {
    const node = organization()
    expect(node['@type']).toBe('TravelAgency')
    expect(node['@id']).toBe(`${ORIGIN}/#organization`)
    // One brand name across schema, title and og:site_name.
    expect(node.name).toBe(siteConfig.siteName)
    expect(node.alternateName).toBe(siteConfig.business.name)
    expect(node.telephone).toBe(siteConfig.contact.phone)
    expect(node.identifier).toMatchObject({ propertyID: 'TÜRSAB', value: 'A4615' })
    expect(node.sameAs).toEqual(Object.values(siteConfig.social))
    // SEO-13: no invented opening hours.
    expect(node).not.toHaveProperty('openingHours')
    expect(node).not.toHaveProperty('openingHoursSpecification')
  })
})

describe('pageGraph', () => {
  it('wraps page nodes with one organization and one website node', () => {
    const graph = pageGraph([webPage({ path: '/tr/diving/', name: 'Dalış', description: 'd', locale: 'tr' })])
    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(graph['@context']).toBe('https://schema.org')
    expect(nodes.filter((node) => node['@id'] === ORGANIZATION_ID)).toHaveLength(1)
    expect(nodes.filter((node) => node['@id'] === WEBSITE_ID)).toHaveLength(1)
  })

  it('serializes to JSON that cannot close its script element', () => {
    const graph = pageGraph([webPage({ path: '/', name: '</script><b>&', description: 'd', locale: 'en' })])
    const text = serializeJsonLd(graph)
    expect(text).not.toMatch(/[<>&]/)
    expect(JSON.parse(text)).toEqual(graph)
  })
})

describe('page generators', () => {
  it('webPage links to the site, breadcrumb and main entity by @id with absolute URLs', () => {
    const [page, crumbs, trip] = pageNodes({
      path: '/tr/diving/deneme/',
      name: 'Deneme',
      description: 'd',
      locale: 'tr',
      image,
      crumbs: [{ label: 'Ana sayfa', href: '/tr/' }, { label: 'Dalış', href: '/tr/diving/' }, { label: 'Deneme' }],
      mainEntity: touristTrip({ path: '/tr/diving/deneme/', name: 'Deneme', description: 'd', itinerary: [] }),
    })
    expect(page).toMatchObject({
      '@type': 'WebPage',
      '@id': `${ORIGIN}/tr/diving/deneme/#webpage`,
      inLanguage: 'tr-TR',
      isPartOf: { '@id': WEBSITE_ID },
      breadcrumb: { '@id': `${ORIGIN}/tr/diving/deneme/#breadcrumb` },
      mainEntity: { '@id': `${ORIGIN}/tr/diving/deneme/#trip` },
    })
    expect(crumbs?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Ana sayfa', item: `${ORIGIN}/tr/` },
      { '@type': 'ListItem', position: 2, name: 'Dalış', item: `${ORIGIN}/tr/diving/` },
      { '@type': 'ListItem', position: 3, name: 'Deneme', item: `${ORIGIN}/tr/diving/deneme/` },
    ])
    expect(trip?.['@type']).toBe('TouristTrip')
  })

  it('webPage carries dateModified only when the page shows an update date', () => {
    const page = (dateModified?: string) => webPage({ path: '/tr/diving/deneme/', name: 'Deneme', description: 'd', locale: 'tr', dateModified })
    expect(page('2026-11-02')).toMatchObject({ dateModified: '2026-11-02' })
    expect(page()).not.toHaveProperty('dateModified')
  })

  it('home page has no breadcrumb', () => {
    const nodes = pageNodes({ path: '/', name: 'Home', description: 'd', locale: 'en' })
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).not.toHaveProperty('breadcrumb')
  })

  it('breadcrumb uses the current page URL for its last item', () => {
    const node = breadcrumb([{ label: 'Home', href: '/' }, { label: 'Blog' }], '/blog/')
    expect(node['@id']).toBe(`${ORIGIN}/blog/#breadcrumb`)
    expect(urls(node).every((url) => url.startsWith(`${ORIGIN}/`))).toBe(true)
  })

  it('blogPosting carries dates, the organization as author and publisher, and its page', () => {
    const node = blogPosting({ path: '/blog/x/', headline: 'X', description: 'd', locale: 'en', published: '2026-05-01', modified: '2026-05-02', image })
    expect(node).toMatchObject({
      '@type': 'BlogPosting',
      '@id': `${ORIGIN}/blog/x/#article`,
      datePublished: '2026-05-01',
      dateModified: '2026-05-02',
      inLanguage: 'en',
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
      mainEntityOfPage: { '@id': `${ORIGIN}/blog/x/#webpage` },
      image: { '@type': 'ImageObject', url: image.url, width: 1000, height: 580 },
    })
  })

  it('faqPage carries the shown questions and answers, tied to the page', () => {
    const node = faqPage('/sea-kayak/kekova/', [{ question: 'Q?', answer: 'A.' }])
    expect(node).toEqual({
      '@type': 'FAQPage',
      '@id': `${ORIGIN}/sea-kayak/kekova/#faq`,
      isPartOf: { '@id': `${ORIGIN}/sea-kayak/kekova/#webpage` },
      mainEntity: [{ '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } }],
    })
  })

  it('touristTrip lists the itinerary, names the provider and never adds an Offer or Event', () => {
    const node = touristTrip({
      path: '/sea-kayak/kekova/',
      name: 'Kekova',
      description: 'd',
      image,
      itinerary: [
        { name: 'Day 1', description: 'a' },
        { name: 'Day 2', description: 'b' },
      ],
    })
    expect(node.provider).toEqual({ '@id': ORGANIZATION_ID })
    expect(node.itinerary).toMatchObject({ '@type': 'ItemList', numberOfItems: 2 })
    expect(types(node)).not.toContain('"@type":"Offer"')
    expect(types(node)).not.toContain('"@type":"Event"')
    expect(node).not.toHaveProperty('offers')
    expect(touristTrip({ path: '/a/', name: 'A', description: 'd', itinerary: [] })).not.toHaveProperty('itinerary')
  })

  it('book has its edition and no Offer', () => {
    const node = book({ path: '/product/x/', name: 'X', description: 'd', edition: 'English edition', image })
    expect(node).toMatchObject({ '@type': 'Book', '@id': `${ORIGIN}/product/x/#book`, bookEdition: 'English edition' })
    expect(node).not.toHaveProperty('offers')
    expect(urls(node).every((url) => url.startsWith(`${ORIGIN}/`))).toBe(true)
  })
})

describe('socialImage', () => {
  it('uses the largest JPEG of a real photo, with its scaled height', () => {
    const asset = contentData.media.find((item) => !item.placeholder)
    if (!asset) throw new Error('no photo')
    const largest = asset.widths[asset.widths.length - 1] ?? 0
    expect(socialImage(asset, 'en')).toEqual({
      url: `${ORIGIN}/media/${asset.id}-${largest}.jpg`,
      width: largest,
      height: Math.round((largest * asset.height) / asset.width),
      alt: pick(asset.alt, 'en').value,
    })
  })

  it('falls back to the brand share image for no photo or a placeholder', () => {
    const asset = contentData.media[0]
    if (!asset) throw new Error('no media')
    const brand = { url: `${ORIGIN}/brand/dragoman-og-1200x630.png`, width: 1200, height: 630, alt: siteConfig.business.name }
    expect(socialImage(null, 'tr')).toEqual(brand)
    expect(socialImage({ ...asset, placeholder: true }, 'tr')).toEqual(brand)
  })
})
