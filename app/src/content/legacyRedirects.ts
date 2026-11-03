import type { Locale } from '../i18n/locales'
import { localePath, type PageKey } from '../i18n/pages'
import type { Post, Product } from './schema'
import { postPath, productPath } from './urls'

/**
 * Addresses of the old WordPress site (tmp/cloner/analysis/redirect-candidates.csv) and what took
 * each one over (SEO-02, E14). Targets name a page or a record rather than a path, so a later slug
 * change moves the redirect with it. fetch-content adds them to the release build's nginx map next
 * to the slug redirects; addresses the new site still serves are left alone, and a record that is
 * not published leaves its old address answering 404 instead of pointing somewhere unrelated.
 * The old site had no German pages, and its English pages had no language prefix.
 */
type Target = { page: PageKey } | { post: string } | { product: string }

export interface LegacyAddress {
  from: string
  to: Target
}

export interface LegacyRedirect {
  from: string
  to: string
}

const page = (key: PageKey): Target => ({ page: key })
const post = (id: string): Target => ({ post: id })
const product = (id: string): Target => ({ product: id })

const WEBINAR = 'the-replay-of-the-webinar-and-if-you-came-back-to-kas-this-summer-is-now-online'

export const LEGACY_ADDRESSES: readonly LegacyAddress[] = [
  // Fixed pages; most kept their WordPress slug and stay live.
  { from: '/diving/', to: page('diving') },
  { from: '/tr/diving/', to: page('diving') },
  { from: '/fr/plongee/', to: page('diving') },
  { from: '/sea-kayak/', to: page('seaKayak') },
  { from: '/tr/deniz-kanosu/', to: page('seaKayak') },
  { from: '/fr/kayak-de-mer/', to: page('seaKayak') },
  { from: '/outdoor-activities/', to: page('outdoor') },
  { from: '/tr/doga-etkinlikleri/', to: page('outdoor') },
  { from: '/fr/activites-pleine-nature/', to: page('outdoor') },
  { from: '/transportation-and-accomodation/', to: page('transport') },
  { from: '/tr/ulasim-konaklama/', to: page('transport') },
  { from: '/fr/transport-et-hebergement/', to: page('transport') },
  { from: '/dragoman/', to: page('about') },
  { from: '/tr/dragoman/', to: page('about') },
  { from: '/fr/dragoman/', to: page('about') },
  { from: '/contact/', to: page('contact') },
  { from: '/tr/rezervasyon-ve-iletisim/', to: page('contact') },
  { from: '/fr/contact/', to: page('contact') },
  { from: '/blog/', to: page('blog') },
  { from: '/tr/blog/', to: page('blog') },
  { from: '/fr/blog/', to: page('blog') },
  { from: '/kas-dive-sites/', to: page('diveSites') },
  { from: '/tr/kas-dalis-noktalari/', to: page('diveSites') },
  { from: '/fr/sites-de-plongee-a-kas/', to: page('diveSites') },
  { from: '/tr/cankurtarma-merkezi/', to: page('lifeguard') },
  { from: '/privacy-policy/', to: page('privacy') },
  { from: '/tr/gizlilik-politikasi/', to: page('privacy') },
  { from: '/fr/politique-de-confidentialite/', to: page('privacy') },
  { from: '/tr/sartlar-ve-kosullar/', to: page('terms') },
  { from: '/fr/conditions-generales-dutilisation/', to: page('terms') },
  { from: '/refund_returns/', to: page('terms') },
  // The shop had cart, checkout and account pages; there is no online payment yet (V6 §5).
  { from: '/shop/', to: page('shop') },
  { from: '/cart/', to: page('shop') },
  { from: '/checkout/', to: page('shop') },
  { from: '/my-account/', to: page('shop') },
  { from: '/tr/dukkan/', to: page('shop') },
  { from: '/tr/sepet/', to: page('shop') },
  { from: '/tr/odeme/', to: page('shop') },
  { from: '/tr/hesabim/', to: page('shop') },
  { from: '/fr/boutique/', to: page('shop') },
  { from: '/fr/panier/', to: page('shop') },
  { from: '/fr/paiement/', to: page('shop') },
  { from: '/fr/mon-compte/', to: page('shop') },
  // The old booking form page: the form now sits on the contact page and on every event.
  { from: '/i-want-to-join/', to: page('contact') },
  { from: '/tr/katilmak-istiyorum/', to: page('contact') },
  { from: '/fr/je-veux-participer/', to: page('contact') },
  // "Sample page" held the old home page's content; "Hello world" was WordPress's own first post.
  { from: '/tr/sample-page/', to: page('home') },
  { from: '/fr/sample-page/', to: page('home') },
  { from: '/dragoman-blog/hello-world/', to: page('blog') },
  // Posts. The 2027 Raja Ampat post carries the old Raja Ampat post's text.
  { from: '/dragoman-blog/raja-ampat/', to: post('raja-ampat-2027') },
  { from: '/tr/dragoman-blog-tr/raja-ampat/', to: post('raja-ampat-2027') },
  { from: '/tr/dragoman-blog-tr/raja-ampat-2027/', to: post('raja-ampat-2027') },
  {
    from: '/dragoman-blog/we-are-heading-back-to-raja-ampat-one-of-the-worlds-most-spectacular-diving-destinations-for-christmas-2027-from-18-to-27-december/',
    to: post('raja-ampat-2027'),
  },
  {
    from: '/fr/non-categorise/nous-retournons-a-raja-ampat-lune-des-destinations-de-plongee-les-plus-spectaculaires-au-monde-pour-noel-2027-du-18-au-27-decembre/',
    to: post('raja-ampat-2027'),
  },
  { from: '/dragoman-blog/sea-kayak-kekova-classic-tour/', to: post('kekova-klasik-turu') },
  { from: '/tr/dragoman-blog-tr/sea-kayak-kekova-classic-tour/', to: post('kekova-klasik-turu') },
  { from: '/fr/non-categorise/sea-kayak-kekova-classic-tour/', to: post('kekova-klasik-turu') },
  { from: '/dragoman-blog/sea-kayak-kekova-west-tour/', to: post('kekova-bati-turu') },
  { from: '/tr/dragoman-blog-tr/sea-kayak-kekova-west-tour/', to: post('kekova-bati-turu') },
  { from: '/fr/non-categorise/sea-kayak-kekova-west-tour/', to: post('kekova-bati-turu') },
  { from: '/dragoman-blog/sea-kayak-kekova-east-tour/', to: post('kekova-dogu-turu') },
  { from: '/tr/dragoman-blog-tr/sea-kayak-kekova-east-tour/', to: post('kekova-dogu-turu') },
  { from: '/fr/non-categorise/sea-kayak-kekova-east-tour/', to: post('kekova-dogu-turu') },
  { from: '/dragoman-blog/lycian-kayak-comfort-escape-tour/', to: post('likya-kayak-konfor-turu') },
  { from: '/tr/dragoman-blog-tr/lycian-kayak-comfort-escape-tour/', to: post('likya-kayak-konfor-turu') },
  { from: '/fr/non-categorise/lycian-kayak-comfort-escape-tour/', to: post('likya-kayak-konfor-turu') },
  { from: '/dragoman-blog/dragoman-maldives-diving-trip-2026/', to: post('maldivler-2026') },
  { from: '/tr/dragoman-blog-tr/dragoman-maldives-diving-trip-2026/', to: post('maldivler-2026') },
  { from: '/fr/non-categorise/dragoman-maldives-diving-trip-2026/', to: post('maldivler-2026') },
  { from: `/dragoman-blog/${WEBINAR}/`, to: post('web-semineri-kas') },
  { from: `/tr/dragoman-blog-tr/${WEBINAR}/`, to: post('web-semineri-kas') },
  { from: `/fr/non-categorise/${WEBINAR}/`, to: post('web-semineri-kas') },
  { from: '/tr/dragoman-blog/dragoman-sharm-el-sheikh-dalis-turu-2026/', to: post('sharm-el-sheikh-2026') },
  // Books.
  { from: '/product/the-diving-guide-kas/', to: product('the-diving-guide-kas') },
  { from: '/tr/urun/dalis-rehberi-kas/', to: product('the-diving-guide-kas') },
  { from: '/product/tropical-mediterranean-english/', to: product('tropical-mediterranean-english') },
  { from: '/tr/urun/tropikal-akdeniz-ingilizce/', to: product('tropical-mediterranean-english') },
  { from: '/fr/produit/tropical-mediterranean/', to: product('tropical-mediterranean-english') },
  { from: '/product/tropical-mediterranean-turkish/', to: product('tropical-mediterranean-turkish') },
  { from: '/tr/urun/tropikal-akdeniz-turkce/', to: product('tropical-mediterranean-turkish') },
  { from: '/fr/produit/tropikal-akdeniz/', to: product('tropical-mediterranean-turkish') },
  { from: '/product/tropical-mediterranean-french/', to: product('tropical-mediterranean-french') },
  { from: '/tr/urun/tropikal-akdeniz-fransizca/', to: product('tropical-mediterranean-french') },
  { from: '/fr/produit/mediterranee-tropicale/', to: product('tropical-mediterranean-french') },
]

const localeOf = (from: string): Locale => (from.startsWith('/tr/') ? 'tr' : from.startsWith('/fr/') ? 'fr' : 'en')

function targetPath(to: Target, locale: Locale, content: LegacyContent): string | { missing: string } {
  if ('page' in to) return localePath(locale, to.page)
  if ('post' in to) {
    const record = content.posts.find((candidate) => candidate.id === to.post)
    return record?.status === 'published' ? postPath(locale, record) : { missing: `post "${to.post}"` }
  }
  const record = content.products.find((candidate) => candidate.id === to.product)
  return record?.status === 'published' ? productPath(locale, record) : { missing: `product "${to.product}"` }
}

export interface LegacyContent {
  posts: readonly Post[]
  products: readonly Product[]
}

/** The old addresses that need a 301 in this build, and the ones left to answer 404. */
export function legacyRedirects(
  content: LegacyContent,
  liveRoutes: ReadonlySet<string>,
): { redirects: LegacyRedirect[]; skipped: { from: string; reason: string }[] } {
  const results = LEGACY_ADDRESSES.filter(({ from }) => !liveRoutes.has(from)).map(({ from, to }) => ({ from, to: targetPath(to, localeOf(from), content) }))
  return {
    redirects: results.flatMap(({ from, to }) => (typeof to === 'string' ? [{ from, to }] : [])),
    skipped: results.flatMap(({ from, to }) => (typeof to === 'string' ? [] : [{ from, reason: `${to.missing} is not published` }])),
  }
}
