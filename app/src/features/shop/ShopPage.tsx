import { ProductCard } from '../../components/cards/ProductCard'
import { PageHero } from '../../components/layout/PageHero'
import { PageHead } from '../../components/seo/PageHead'
import { RichText } from '../../components/ui/RichText'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import { pageSeo, shareImageId } from '../../content/seo'
import { productPath } from '../../content/urls'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, pageAlternates } from '../../i18n/pages'
import { pageNodes } from '../../lib/jsonLd/pageNodes'
import { socialImage } from '../../lib/socialImage'

/** Shop category: book cards (V6 §4.3). No online payment in this phase. */
export function ShopPage() {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const page = content.categoryPage('shop')
  const products = content.products()
  const cover = content.media(page.cover)
  const image = socialImage(content.media(shareImageId(page.seo, page.cover)), locale)
  const crumbs = [{ label: ui.nav.home, href: localePath(locale, 'home') }, { label: ui.nav.shop }]
  const { title, description } = pageSeo(page.seo, locale, { title: ui.nav.shop, description: ui.pages.howToOrderText })
  const jsonLd = pageNodes({ type: 'CollectionPage', path: localePath(locale, 'shop'), name: ui.nav.shop, description, locale, image, crumbs })

  return (
    <>
      <PageHead title={title} description={description} alternates={pageAlternates('shop')} image={image} jsonLd={jsonLd} />
      <PageHero
        title={ui.nav.shop}
        cover={cover}
        breadcrumbs={crumbs}
      >
        <RichText blocks={pick(page.intro, locale).value} className="!text-lg text-ink-muted" />
      </PageHero>
      <div className="container-page py-12">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} cover={content.media(product.cover)} href={productPath(locale, product)} headingLevel="h2" />
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl rounded-card border border-line bg-sand p-5 text-ink-muted">
          <strong className="text-ink">{ui.pages.howToOrder}</strong> {ui.pages.howToOrderText}
        </p>
      </div>
    </>
  )
}
