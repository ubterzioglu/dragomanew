import type { MediaAsset } from '../../content/schema'
import { pick } from '../../content/localize'
import { coverSizes } from '../../lib/imageSizes'
import { useLocale } from '../../i18n/LocaleContext'

interface PictureProps {
  asset: MediaAsset
  /** CSS sizes hint (width of the box), e.g. "(min-width: 64rem) 33vw, 100vw". */
  sizes: string
  /** Width / height of an object-cover box; widens `sizes` for images wider than the box. */
  boxAspect?: number
  className?: string
  /** Above-the-fold images load eagerly with high priority (LCP). */
  priority?: boolean
}

/** Width of `container-page` content on phones (padding-inline: 1rem, src/styles/app.css), for `sizes`. */
export const PHONE_CONTENT_WIDTH = 'calc(100vw - 2rem)'

const srcSet = (asset: MediaAsset, ext: string): string =>
  asset.widths.map((w) => `/media/${asset.id}-${w}.${ext} ${w}w`).join(', ')

/** AVIF → WebP → JPEG with explicit dimensions so layout never shifts. */
export function Picture({ asset, sizes: boxSizes, boxAspect, className = '', priority = false }: PictureProps) {
  const locale = useLocale()
  const alt = pick(asset.alt, locale)
  const largest = asset.widths[asset.widths.length - 1] ?? asset.width
  const sizes = boxAspect ? coverSizes(boxSizes, asset.width / asset.height, boxAspect) : boxSizes

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes={sizes} />
      <img
        src={`/media/${asset.id}-${largest}.jpg`}
        srcSet={srcSet(asset, 'jpg')}
        sizes={sizes}
        width={asset.width}
        height={asset.height}
        alt={alt.value}
        data-i18n-fallback={alt.isFallback ? 'alt' : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={className}
      />
    </picture>
  )
}
