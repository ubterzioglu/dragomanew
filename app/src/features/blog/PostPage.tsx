import { EventCard } from '../../components/cards/EventCard'
import { PageHead } from '../../components/seo/PageHead'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { ButtonLink } from '../../components/ui/Button'
import { PHONE_CONTENT_WIDTH, Picture } from '../../components/ui/Picture'
import { RichText } from '../../components/ui/RichText'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import type { Post } from '../../content/schema'
import { eventPath, postAlternates } from '../../content/urls'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'
import { formatDate } from '../../lib/format'

export function PostPage({ post }: { post: Post }) {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const title = pick(post.title, locale).value
  const related = post.relatedEvents.flatMap((id) => {
    const event = content.eventById(id)
    return event ? [event] : []
  })

  return (
    <>
      <PageHead title={title} description={pick(post.excerpt, locale).value} alternates={postAlternates(post)} />
      <article>
        <header className="container-page max-w-4xl pt-8 md:pt-12">
          <Breadcrumbs
            items={[
              { label: ui.nav.home, href: localePath(locale, 'home') },
              { label: ui.nav.blog, href: localePath(locale, 'blog') },
              { label: title },
            ]}
          />
          <time dateTime={post.date} className="mt-6 block text-ink-muted">
            {formatDate(post.date, locale)}
          </time>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">{title}</h1>
          <p className="mt-4 text-xl text-ink-muted">{pick(post.excerpt, locale).value}</p>
        </header>
        {post.cover && (
          <div className="container-page mt-8 max-w-5xl">
            <div className="aspect-[16/9] overflow-hidden rounded-card bg-sand">
              <Picture asset={content.media(post.cover)} sizes={`(min-width: 64rem) 64rem, ${PHONE_CONTENT_WIDTH}`} boxAspect={16 / 9} priority className="size-full object-cover" />
            </div>
          </div>
        )}
        <div className="container-page max-w-3xl py-10">
          <RichText blocks={pick(post.body, locale).value} />
          <div className="mt-10">
            <ButtonLink to={localePath(locale, 'blog')} variant="ghost">
              ← {ui.pages.backToBlog}
            </ButtonLink>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-sand">
          <div className="container-page py-12">
            <h2 id="related-title" className="text-3xl font-bold">
              {ui.pages.relatedEvents}
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((event) => (
                <li key={event.id} className="flex">
                  <EventCard event={event} cover={content.media(event.cover)} href={eventPath(locale, event)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
