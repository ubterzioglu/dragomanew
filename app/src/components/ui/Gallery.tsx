import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MediaAsset } from '../../content/schema'
import { useUi } from '../../i18n/LocaleContext'
import { PHONE_CONTENT_WIDTH, Picture } from './Picture'

interface GalleryProps {
  images: readonly MediaAsset[]
  label: string
  /** Slide `sizes` for the column the gallery sits in; the default fits the event page's 2fr/1fr grid. */
  sizes?: string
}

const WIDE_COLUMN_SIZES = `(min-width: 64rem) 66vw, ${PHONE_CONTENT_WIDTH}`

/**
 * Scroll-snap gallery: works without JavaScript (swipe/scroll), the region is
 * keyboard-scrollable, and the arrow buttons only add convenience.
 */
export function Gallery({ images, label, sizes = WIDE_COLUMN_SIZES }: GalleryProps) {
  const ui = useUi()
  const track = useRef<HTMLUListElement>(null)
  if (images.length === 0) return null

  // Wraps at either end instead of disabling the button, so keyboard focus never drops to the page.
  const scroll = (direction: 1 | -1) => {
    const el = track.current
    if (!el) return
    const end = el.scrollWidth - el.clientWidth
    const atEdge = direction > 0 ? el.scrollLeft >= end - 1 : el.scrollLeft <= 1
    if (atEdge) el.scrollTo({ left: direction > 0 ? 0 : end, behavior: 'smooth' })
    else el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <section aria-label={`${ui.pages.gallery}${ui.typography.labelSeparator}${label}`} className="relative">
      <ul
        ref={track}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-card [scrollbar-width:none] focus-visible:outline-offset-4"
      >
        {images.map((image, index) => (
          <li key={image.id} className="aspect-[16/10] w-full shrink-0 snap-start overflow-hidden rounded-card bg-sand">
            <Picture asset={image} sizes={sizes} boxAspect={16 / 10} priority={index === 0} className="size-full object-cover" />
          </li>
        ))}
      </ul>
      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
          {([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => scroll(direction)}
              aria-label={direction < 0 ? ui.a11y.previousImage : ui.a11y.nextImage}
              className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white"
            >
              {direction < 0 ? <ChevronLeft aria-hidden="true" className="size-6" /> : <ChevronRight aria-hidden="true" className="size-6" />}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
