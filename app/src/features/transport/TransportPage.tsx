import { PageHero } from '../../components/layout/PageHero'
import { PageHead } from '../../components/seo/PageHead'
import { Badge } from '../../components/ui/Badge'
import { PHONE_CONTENT_WIDTH, Picture } from '../../components/ui/Picture'
import { RichText } from '../../components/ui/RichText'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import { pageSeo, shareImageId } from '../../content/seo'
import type { ServiceOffer } from '../../content/schema'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, pageAlternates } from '../../i18n/pages'
import { jumpToTarget } from '../../lib/inPageLink'
import { pageNodes } from '../../lib/jsonLd/pageNodes'
import { socialImage } from '../../lib/socialImage'
import { LodgingForm } from '../forms/LodgingForm'
import { TransportForm } from '../forms/TransportForm'

function OfferList({ offers }: { offers: readonly ServiceOffer[] }) {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {offers.map((offer) => {
        const cover = content.media(offer.cover)
        return (
          <li key={offer.id} className="overflow-hidden rounded-card border border-line bg-white">
            <div className="relative aspect-[16/9] bg-sand">
              <Picture asset={cover} sizes={`(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, ${PHONE_CONTENT_WIDTH}`} boxAspect={16 / 9} className="size-full object-cover" />
              {cover.placeholder && (
                <Badge tone="sample" className="absolute top-3 left-3">
                  {ui.pages.sampleImage}
                </Badge>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold">{pick(offer.title, locale).value}</h3>
              <p className="mt-1 text-ink-muted">{pick(offer.summary, locale).value}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Transportation and Accommodation (V6 §4.1): two separate sections, each with
 * its own request form — two forms, two separate requests (guide §1).
 */
export function TransportPage() {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const page = content.categoryPage('transport')
  const firstParagraph = pick(page.intro, locale).value.find((block) => block.type === 'p')
  const { title, description } = pageSeo(page.seo, locale, {
    title: ui.nav.transport,
    description: firstParagraph?.type === 'p' ? firstParagraph.text : ui.brand.tagline,
  })
  const cover = content.media(page.cover)
  const image = socialImage(content.media(shareImageId(page.seo, page.cover)), locale)
  const crumbs = [{ label: ui.nav.home, href: localePath(locale, 'home') }, { label: ui.nav.transport }]
  const jsonLd = pageNodes({ type: 'CollectionPage', path: localePath(locale, 'transport'), name: ui.nav.transport, description, locale, image, crumbs })
  const sections = [
    { id: 'transport', title: ui.pages.transferTitle, offers: content.serviceOffers('transfer'), form: <TransportForm form={content.form('transport')} /> },
    { id: 'lodging', title: ui.pages.lodgingTitle, offers: content.serviceOffers('lodging'), form: <LodgingForm form={content.form('lodging')} /> },
  ]

  return (
    <>
      <PageHead title={title} description={description} alternates={pageAlternates('transport')} image={image} jsonLd={jsonLd} />
      <PageHero
        title={ui.nav.transport}
        cover={cover}
        breadcrumbs={crumbs}
      >
        <RichText blocks={pick(page.intro, locale).value} className="!text-lg text-ink-muted" />
        <ul className="mt-5 flex flex-wrap gap-3">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} onClick={jumpToTarget} className="inline-flex min-h-11 items-center rounded-full bg-white px-5 font-semibold text-brand-green shadow-sm hover:bg-brand-green-soft">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </PageHero>

      {sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
          <div className="container-page grid gap-10 py-12 lg:grid-cols-2">
            <div>
              <h2 id={`${section.id}-title`} className="text-3xl font-bold md:text-4xl">
                {section.title}
              </h2>
              <div className="mt-6">
                <OfferList offers={section.offers} />
              </div>
            </div>
            {/* Target of the mobile "Transfer Request" button: straight to the form (UBT, 31.10). */}
            <div id={`${section.id}-request`} className="rounded-card border border-line bg-white p-6">
              <h3 className="mb-5 text-2xl font-bold">
                {ui.pages.requestTitle}{ui.typography.labelSeparator}{section.title}
              </h3>
              {section.form}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
