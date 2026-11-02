import { Head } from 'vite-react-ssg'
import { LOCALE_TAG, LOCALES } from '../../i18n/locales'
import type { LocalizedPaths } from '../../i18n/pages'
import { useLocale } from '../../i18n/LocaleContext'
import { isPublicRelease } from '../../lib/env'
import { pageGraph, serializeJsonLd, type JsonLdNode } from '../../lib/jsonLd/graph'
import { siteConfig } from '../../lib/siteConfig'
import { socialImage, type SocialImage } from '../../lib/socialImage'

interface PageHeadProps {
  title: string
  description: string
  alternates: LocalizedPaths
  /** Personal/process pages (forms with links) stay out of the index even after launch (SEO-05). */
  alwaysNoindex?: boolean
  /** Share image; defaults to the brand image (lib/socialImage.ts). */
  image?: SocialImage
  /** Blog posts: og:type article with their dates. */
  article?: { published: string; modified: string }
  /** RSS feed of the blog in this language (absolute URL). */
  feed?: { href: string; title: string }
  /** Page-specific schema.org nodes; the organization and site nodes are added around them. */
  jsonLd?: readonly JsonLdNode[]
}

export function PageHead({ title, description, alternates, alwaysNoindex = false, image, article, feed, jsonLd }: PageHeadProps) {
  const locale = useLocale()
  const pageUrl = `${siteConfig.origin}${alternates[locale]}`
  const noindex = alwaysNoindex || !isPublicRelease
  const share = image ?? socialImage(null, locale)
  const { siteName } = siteConfig

  return (
    <Head>
      <html lang={LOCALE_TAG[locale]} />
      <title>{`${title} | ${siteName}`}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {/* A page kept out of the index for good (404, participant forms) claims no canonical URL. */}
      {!alwaysNoindex && <link rel="canonical" href={pageUrl} />}
      {LOCALES.map((alt) => (
        <link key={alt} rel="alternate" hrefLang={LOCALE_TAG[alt]} href={`${siteConfig.origin}${alternates[alt]}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${siteConfig.origin}${alternates.en}`} />
      {feed && <link rel="alternate" type="application/rss+xml" title={feed.title} href={feed.href} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:locale" content={LOCALE_TAG[locale].replace('-', '_')} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      {article && <meta property="article:published_time" content={article.published} />}
      {article && <meta property="article:modified_time" content={article.modified} />}
      <meta property="og:image" content={share.url} />
      <meta property="og:image:width" content={String(share.width)} />
      <meta property="og:image:height" content={String(share.height)} />
      <meta property="og:image:alt" content={share.alt} />
      {/* No twitter:site: Dragoman has no X account. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={share.url} />
      <meta name="twitter:image:alt" content={share.alt} />
      {/* A data block, not a script: CSP hashes only runnable types (lib/contentSecurityPolicy.ts). */}
      {jsonLd && <script type="application/ld+json">{serializeJsonLd(pageGraph(jsonLd))}</script>}
    </Head>
  )
}
