import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EventCard } from '../../components/cards/EventCard'
import { PageHero } from '../../components/layout/PageHero'
import { PageHead } from '../../components/seo/PageHead'
import { RichText } from '../../components/ui/RichText'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import type { CategoryKey } from '../../content/schema'
import { eventPath } from '../../content/urls'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, pageAlternates } from '../../i18n/pages'

/** Extra pages listed under a category (Lifeguard sits under Diving, V6 §4.5). */
const RELATED_PAGES: Partial<Record<CategoryKey, readonly ('lifeguard' | 'diveSites')[]>> = {
  diving: ['lifeguard', 'diveSites'],
}

/**
 * Accepted category layout (V6 §4.3): title, short intro and cover photo, then
 * activities grouped under sub-headings as photo cards in the managed order.
 */
export function CategoryPage({ category }: { category: CategoryKey }) {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const page = content.categoryPage(category)
  const intro = pick(page.intro, locale).value
  const firstParagraph = intro.find((block) => block.type === 'p')
  const groups = content
    .subgroups(category)
    .map((group) => ({ group, events: content.eventsInSubgroup(group.id) }))
    .filter(({ events }) => events.length > 0)

  return (
    <>
      <PageHead
        title={ui.nav[category]}
        description={firstParagraph?.type === 'p' ? firstParagraph.text : ui.brand.tagline}
        alternates={pageAlternates(category)}
      />
      <PageHero
        title={ui.nav[category]}
        cover={content.media(page.cover)}
        breadcrumbs={[{ label: ui.nav.home, href: localePath(locale, 'home') }, { label: ui.nav[category] }]}
      >
        <RichText blocks={intro} className="!text-lg text-ink-muted" />
      </PageHero>

      {groups.map(({ group, events }) => (
        <section key={group.id} aria-labelledby={`group-${group.id}`} className="even:bg-sand">
          <div className="container-page py-10 md:py-14">
            <h2 id={`group-${group.id}`} className="text-3xl font-bold md:text-4xl">
              {pick(group.title, locale).value}
            </h2>
            {group.intro && <p className="mt-2 max-w-2xl text-lg text-ink-muted">{pick(group.intro, locale).value}</p>}
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <li key={event.id} className="flex">
                  <EventCard event={event} cover={content.media(event.cover)} href={eventPath(locale, event)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {RELATED_PAGES[category] && (
        <section className="border-t border-line">
          <ul className="container-page grid gap-4 py-10 md:grid-cols-2">
            {RELATED_PAGES[category].map((key) => (
              <li key={key}>
                <Link
                  to={localePath(locale, key)}
                  className="group flex min-h-16 items-center justify-between rounded-card border border-line px-6 py-4 hover:border-brand-green"
                >
                  <span className="font-display text-2xl font-bold text-brand-green">{ui.nav[key]}</span>
                  <ArrowRight aria-hidden="true" className="size-5 text-brand-green transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
