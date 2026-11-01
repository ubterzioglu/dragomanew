import { Head } from 'vite-react-ssg'
import { LOCALE_TAG, LOCALES } from '../../i18n/locales'
import type { LocalizedPaths } from '../../i18n/pages'
import { useLocale } from '../../i18n/LocaleContext'
import { isPublicRelease } from '../../lib/env'
import { siteConfig } from '../../lib/siteConfig'

interface PageHeadProps {
  title: string
  description: string
  alternates: LocalizedPaths
  /** Personal/process pages (forms with links) stay out of the index even after launch (SEO-05). */
  alwaysNoindex?: boolean
}

const SITE_NAME = 'Dragoman'

export function PageHead({ title, description, alternates, alwaysNoindex = false }: PageHeadProps) {
  const locale = useLocale()
  const canonical = `${siteConfig.origin}${alternates[locale]}`
  const noindex = alwaysNoindex || !isPublicRelease

  return (
    <Head>
      <html lang={LOCALE_TAG[locale]} />
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonical} />
      {LOCALES.map((alt) => (
        <link key={alt} rel="alternate" hrefLang={LOCALE_TAG[alt]} href={`${siteConfig.origin}${alternates[alt]}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${siteConfig.origin}${alternates.en}`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={LOCALE_TAG[locale].replace('-', '_')} />
      <meta property="og:type" content="website" />
    </Head>
  )
}
