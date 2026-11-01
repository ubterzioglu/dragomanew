import { Link } from 'react-router-dom'
import type { MediaAsset, Post } from '../../content/schema'
import { pick } from '../../content/localize'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { formatDate } from '../../lib/format'
import { PHONE_CONTENT_WIDTH, Picture } from '../ui/Picture'

interface PostCardProps {
  post: Post
  cover: MediaAsset | null
  href: string
  /** h2 when the card sits directly under the page h1 (blog page). */
  headingLevel?: 'h2' | 'h3'
  /** Cover `sizes` for the grid the card sits in; the default fits `sm:grid-cols-2 lg:grid-cols-3`. */
  sizes?: string
}

const GRID_SIZES = `(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, ${PHONE_CONTENT_WIDTH}`

export function PostCard({ post, cover, href, headingLevel = 'h3', sizes = GRID_SIZES }: PostCardProps) {
  const locale = useLocale()
  const ui = useUi()
  const title = pick(post.title, locale)
  const Heading = headingLevel
  const excerpt = pick(post.excerpt, locale)

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-sm hover:shadow-md">
      {cover && (
        <div className="aspect-[16/9] overflow-hidden bg-sand">
          <Picture asset={cover} sizes={sizes} boxAspect={16 / 9} className="size-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <time dateTime={post.date} className="text-sm text-ink-muted">
          {formatDate(post.date, locale)}
        </time>
        <Heading className="text-xl font-bold" data-i18n-fallback={title.isFallback ? 'title' : undefined}>
          <Link to={href} className="after:absolute after:inset-0 after:content-['']">
            {title.value}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-ink-muted">{excerpt.value}</p>
        <span aria-hidden="true" className="mt-auto pt-2 font-semibold text-brand-green">
          {ui.actions.readMore} →
        </span>
      </div>
    </article>
  )
}
