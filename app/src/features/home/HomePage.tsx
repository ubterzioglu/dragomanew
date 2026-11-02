import { Anchor, Leaf, ShieldCheck, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EventCard } from '../../components/cards/EventCard'
import { PostCard } from '../../components/cards/PostCard'
import { PageHead } from '../../components/seo/PageHead'
import { ButtonLink, buttonClass } from '../../components/ui/Button'
import { PHONE_CONTENT_WIDTH, Picture } from '../../components/ui/Picture'
import { Section } from '../../components/ui/Section'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import { pageSeo, shareImageId } from '../../content/seo'
import { eventPath, postPath } from '../../content/urls'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, pageAlternates } from '../../i18n/pages'
import { pageNodes } from '../../lib/jsonLd/pageNodes'
import { siteConfig } from '../../lib/siteConfig'
import { socialImage } from '../../lib/socialImage'
import { HeroTriptych } from './HeroTriptych'

const WHY_ICONS = [Anchor, ShieldCheck, Users, Leaf] as const

export function HomePage() {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const home = content.home()

  const featured = home.featured.flatMap((ref) => {
    if (ref.kind === 'event') {
      const event = content.eventById(ref.id)
      return event ? [{ key: `e-${event.id}`, node: <EventCard event={event} cover={content.media(event.cover)} href={eventPath(locale, event)} /> }] : []
    }
    const post = content.postById(ref.id)
    return post
      ? [{ key: `p-${post.id}`, node: <PostCard post={post} cover={post.cover ? content.media(post.cover) : null} href={postPath(locale, post)} /> }]
      : []
  })
  const latestPosts = content.posts().slice(0, 3)
  const realReviews = content.testimonials().filter((review) => !review.sample)
  const { title, description } = pageSeo(home.seo, locale, { title: ui.titles.home, description: pick(home.hero.subheading, locale).value })
  const imageId = shareImageId(home.seo, home.hero.tiles[0]?.media)
  const image = socialImage(imageId ? content.media(imageId) : null, locale)
  const jsonLd = pageNodes({ path: localePath(locale, 'home'), name: ui.titles.home, description, locale, image })

  return (
    <>
      <PageHead title={title} description={description} alternates={pageAlternates('home')} image={image} jsonLd={jsonLd} />

      {/* 1. Three-photo opening */}
      <HeroTriptych hero={home.hero} />

      {/* 2. Transport/accommodation and shop */}
      <Section id="more" title={ui.pages.moreTitle}>
        <ul className="grid gap-4 md:grid-cols-2">
          {home.quickLinks.map((link) => (
            <li key={link.page}>
              <Link
                to={localePath(locale, link.page)}
                className="group flex items-center gap-4 overflow-hidden rounded-card border border-line bg-white pr-4 shadow-sm hover:shadow-md"
              >
                <div className="aspect-square w-28 shrink-0 overflow-hidden bg-sand md:w-36">
                  <Picture asset={content.media(link.media)} sizes="144px" boxAspect={1} className="size-full object-cover" />
                </div>
                <div className="py-3">
                  <p className="font-display text-2xl font-bold text-brand-green">{ui.nav[link.page]}</p>
                  <p className="mt-1 text-ink-muted">{pick(link.text, locale).value}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. Featured tours, activities and announcements */}
      {featured.length > 0 && (
        <Section id="featured" title={ui.pages.featuredTitle}>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <li key={item.key} className="flex">
                {item.node}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 4. Why Dragoman? */}
      <Section id="why" title={ui.pages.whyTitle}>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {home.why.map((item, index) => {
            const Icon = WHY_ICONS[index % WHY_ICONS.length] ?? Anchor
            return (
              <li key={pick(item.title, 'tr').value} className="rounded-card border border-line p-6">
                <Icon aria-hidden="true" className="size-8 text-brand-orange" />
                <h3 className="mt-4 text-2xl font-bold">{pick(item.title, locale).value}</h3>
                <p className="mt-2 text-ink-muted">{pick(item.text, locale).value}</p>
              </li>
            )
          })}
        </ul>
      </Section>

      {/* 5. Google reviews: links to the listing; sample cards never show, real ones appear once added */}
      <Section id="reviews" title={ui.pages.reviewsTitle}>
        <p className="max-w-2xl text-ink-muted">{ui.pages.reviewsIntro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={siteConfig.googleReviews.readUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('primary')}>
            <Star aria-hidden="true" className="size-5" />
            {ui.pages.reviewsRead}
          </a>
          <a href={siteConfig.googleReviews.writeUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary')}>
            {ui.pages.reviewsWrite}
          </a>
        </div>
        {realReviews.length > 0 && (
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {realReviews.map((review) => (
              <li key={review.id} className="rounded-card border border-line bg-white p-6 shadow-sm">
                <p role="img" className="flex gap-0.5 text-brand-orange" aria-label={`${review.rating}/5`}>
                  {Array.from({ length: review.rating }, (_, i) => (
                    <Star key={i} aria-hidden="true" className="size-4 fill-current" />
                  ))}
                </p>
                <blockquote className="mt-3 text-ink">{ui.typography.quoteOpen}{pick(review.text, locale).value}{ui.typography.quoteClose}</blockquote>
                <p className="mt-3 text-sm font-semibold text-ink-muted">{review.author}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 6. Latest blog posts */}
      {latestPosts.length > 0 && (
        <Section
          id="latest-posts"
          title={ui.pages.latestPostsTitle}
          action={
            <ButtonLink to={localePath(locale, 'blog')} variant="ghost">
              {ui.actions.allPosts} →
            </ButtonLink>
          }
        >
          <ul className="grid gap-6 md:grid-cols-3">
            {latestPosts.map((post) => (
              <li key={post.id} className="flex">
                <PostCard
                  post={post}
                  cover={post.cover ? content.media(post.cover) : null}
                  href={postPath(locale, post)}
                  sizes={`(min-width: 48rem) 33vw, ${PHONE_CONTENT_WIDTH}`}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}
      {/* 7. Contact details and footer menu: the shared <Footer>. */}
    </>
  )
}
