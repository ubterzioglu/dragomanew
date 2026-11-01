import { Mail, MessageCircle } from 'lucide-react'
import { PageHead } from '../../components/seo/PageHead'
import { Badge } from '../../components/ui/Badge'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { buttonClass } from '../../components/ui/Button'
import { RichText } from '../../components/ui/RichText'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import type { Product } from '../../content/schema'
import { productAlternates } from '../../content/urls'
import { Gallery } from '../../components/ui/Gallery'
import { PHONE_CONTENT_WIDTH } from '../../components/ui/Picture'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'
import { formatMoney } from '../../lib/format'
import { mailHref, siteConfig } from '../../lib/siteConfig'

/** Book detail: edition, description, images, price/stock/delivery (all sample), contact to order. */
export function ProductPage({ product }: { product: Product }) {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const title = pick(product.title, locale).value
  const images = [product.cover, ...product.gallery.filter((id) => id !== product.cover)].map((id) => content.media(id))

  const facts = [
    { label: ui.pages.edition, value: pick(product.edition, locale).value },
    product.stockNote ? { label: ui.pages.stock, value: pick(product.stockNote, locale).value } : null,
    product.deliveryNote ? { label: ui.pages.delivery, value: pick(product.deliveryNote, locale).value } : null,
  ].filter((fact) => fact !== null)

  return (
    <>
      <PageHead title={title} description={pick(product.summary, locale).value} alternates={productAlternates(product)} />
      <div className="container-page py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: ui.nav.home, href: localePath(locale, 'home') },
            { label: ui.nav.shop, href: localePath(locale, 'shop') },
            { label: title },
          ]}
        />
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <Gallery images={images} label={title} sizes={`(min-width: 64rem) 50vw, ${PHONE_CONTENT_WIDTH}`} />
          <div>
            <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
            <p className="mt-3 text-lg text-ink-muted">{pick(product.summary, locale).value}</p>
            {product.price !== null && (
              <div className="mt-6">
                <p className="font-display text-3xl font-bold text-brand-green">{formatMoney(product.price, product.currency, locale)}</p>
                <Badge tone="sample">{ui.sample.priceUnverified}</Badge>
              </div>
            )}
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">{fact.label}</dt>
                  <dd className="text-right font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 rounded-card border border-line bg-sand p-5">
              <p className="font-semibold">{ui.pages.howToOrder}</p>
              <p className="mt-1 text-ink-muted">{ui.pages.howToOrderText}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={siteConfig.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('primary')}>
                  <MessageCircle aria-hidden="true" className="size-5" />
                  {ui.actions.whatsapp}
                </a>
                <a href={mailHref(siteConfig.contact.email)} className={buttonClass('secondary')}>
                  <Mail aria-hidden="true" className="size-5" />
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 max-w-3xl">
          <RichText blocks={pick(product.body, locale).value} />
        </div>
      </div>
    </>
  )
}
