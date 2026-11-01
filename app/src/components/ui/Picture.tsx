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
  /**
   * Near or in view on load but not the LCP image: keeps the browser from raising it to high priority, which would
   * count its download toward LCP in Lighthouse. The home hero's other tiles: on phones the next one peeks in; on
   * wider screens all three are visible and tiles 2–3 load just after tile 1 (desktop LCP unchanged, session 8).
   */
  lowPriority?: boolean
}

/** Width of `container-page` content on phones (padding-inline: 1rem, src/styles/app.css), for `sizes`. */
export const PHONE_CONTENT_WIDTH = 'calc(100vw - 2rem)'

const srcSet = (asset: MediaAsset, ext: string): string =>
  asset.widths.map((w) => `/media/${asset.id}-${w}.${ext} ${w}w`).join(', ')

/** AVIF → WebP → JPEG with explicit dimensions so layout never shifts. */
export function Picture({ asset, sizes: boxSizes, boxAspect, className = '', priority = false, lowPriority = false }: PictureProps) {
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
        fetchPriority={priority ? 'high' : lowPriority ? 'low' : undefined}
        // The app loader waits for this image's own paint (Element Timing) before starting the bundle.
        {...(priority ? { elementtiming: 'lcp-image' } : {})}
        className={className}
      />
    </picture>
  )
}
