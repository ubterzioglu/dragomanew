import { Link } from 'react-router-dom'
import type { MediaAsset, Product } from '../../content/schema'
import { pick } from '../../content/localize'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { formatMoney } from '../../lib/format'
import { Badge } from '../ui/Badge'
import { Picture } from '../ui/Picture'

interface ProductCardProps {
  product: Product
  cover: MediaAsset
  href: string
  /** h2 when the card sits directly under the page h1 (shop page). */
  headingLevel?: 'h2' | 'h3'
}

export function ProductCard({ product, cover, href, headingLevel = 'h3' }: ProductCardProps) {
  const locale = useLocale()
  const ui = useUi()
  const title = pick(product.title, locale)
  const Heading = headingLevel

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-sm hover:shadow-md">
      <div className="flex aspect-[3/4] items-center justify-center bg-sand p-6">
        <Picture asset={cover} sizes="(min-width: 64rem) 25vw, 50vw" className="max-h-full w-auto object-contain drop-shadow-md" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-sm text-ink-muted">{pick(product.edition, locale).value}</p>
        <Heading className="text-xl font-bold">
          <Link to={href} className="after:absolute after:inset-0 after:content-['']">
            {title.value}
          </Link>
        </Heading>
        {product.price !== null && (
          <div className="mt-auto pt-2">
            <p className="font-display text-xl font-bold text-brand-green">{formatMoney(product.price, product.currency, locale)}</p>
            <Badge tone="sample">{ui.sample.priceUnverified}</Badge>
          </div>
        )}
      </div>
    </article>
  )
}
