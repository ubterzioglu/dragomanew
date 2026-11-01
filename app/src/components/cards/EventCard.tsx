import { Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DragomanEvent, MediaAsset } from '../../content/schema'
import { pick } from '../../content/localize'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { Badge } from '../ui/Badge'
import { buttonClass } from '../ui/Button'
import { PHONE_CONTENT_WIDTH, Picture } from '../ui/Picture'
import { PriceTag } from '../ui/PriceTag'

interface EventCardProps {
  event: DragomanEvent
  cover: MediaAsset
  href: string
  headingLevel?: 'h3' | 'h4'
}

/** Category card (V6 §4.3): photo, name, short text, duration, price, "Explore". */
export function EventCard({ event, cover, href, headingLevel = 'h3' }: EventCardProps) {
  const locale = useLocale()
  const ui = useUi()
  const title = pick(event.title, locale)
  const summary = pick(event.summary, locale)
  const duration = event.duration ? pick(event.duration, locale) : null
  const Heading = headingLevel

  return (
    // The focus ring moves from the stretched link to the card frame so keyboard users see the whole card selected.
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-sm transition-shadow hover:shadow-md has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand-orange-ink">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <Picture
          asset={cover}
          sizes={`(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, ${PHONE_CONTENT_WIDTH}`}
          boxAspect={4 / 3}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {event.origin === 'mockup' && (
          <Badge tone="sample" className="absolute top-3 left-3">
            {ui.sample.badge}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Heading className="text-2xl font-bold" data-i18n-fallback={title.isFallback ? 'title' : undefined}>
          {/* The stretched link makes the whole card clickable; "Explore" stays a real link too. */}
          <Link to={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {title.value}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-ink-muted" data-i18n-fallback={summary.isFallback ? 'summary' : undefined}>
          {summary.value}
        </p>
        {duration && (
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Clock aria-hidden="true" className="size-4 text-brand-orange" />
            {duration.value}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <PriceTag event={event} />
          <span aria-hidden="true" className={buttonClass('secondary', 'pointer-events-none min-h-10 px-4 text-sm')}>
            {ui.actions.explore}
          </span>
        </div>
      </div>
    </article>
  )
}
