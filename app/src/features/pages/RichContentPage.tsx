import { Info, UserRound } from 'lucide-react'
import { PageHero } from '../../components/layout/PageHero'
import { PageHead } from '../../components/seo/PageHead'
import type { Crumb } from '../../components/ui/Breadcrumbs'
import { Badge } from '../../components/ui/Badge'
import { PHONE_CONTENT_WIDTH, Picture } from '../../components/ui/Picture'
import { RichText } from '../../components/ui/RichText'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import { pageSeo, shareImageId } from '../../content/seo'
import type { RichPage } from '../../content/schema'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, pageAlternates } from '../../i18n/pages'
import { pageNodes } from '../../lib/jsonLd/pageNodes'
import { socialImage } from '../../lib/socialImage'

type RichKey = Exclude<RichPage['key'], 'contact'>

function TeamSection() {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const team = content.team()
  if (team.length === 0) return null
  return (
    <section aria-labelledby="team-title">
      <div className="container-page py-12">
        <h2 id="team-title" className="text-3xl font-bold md:text-4xl">
          {ui.pages.teamTitle}
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <li key={member.id} className="rounded-card border border-line bg-white p-5 shadow-sm">
              <div className="aspect-square overflow-hidden rounded-lg bg-brand-green-soft">
                {member.photo ? (
                  <Picture
                    asset={content.media(member.photo)}
                    sizes={`(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, ${PHONE_CONTENT_WIDTH}`}
                    boxAspect={1}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound aria-hidden="true" className="m-auto size-full p-10 text-brand-green/40" />
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
              <p className="text-brand-green">{pick(member.role, locale).value}</p>
              {member.bio && <p className="mt-2 text-sm text-ink-muted">{pick(member.bio, locale).value}</p>}
              {member.origin === 'mockup' && (
                <Badge tone="sample" className="mt-3">
                  {ui.sample.badge}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** About, Kaş dive sites, Lifeguard training and legal pages: title, summary, sections. */
export function RichContentPage({ pageKey }: { pageKey: RichKey }) {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const page = content.richPage(pageKey)
  const title = pick(page.title, locale).value
  const summary = pick(page.summary, locale).value

  const crumbs: Crumb[] = [{ label: ui.nav.home, href: localePath(locale, 'home') }]
  if (pageKey === 'lifeguard' || pageKey === 'diveSites') crumbs.push({ label: ui.nav.diving, href: localePath(locale, 'diving') })
  crumbs.push({ label: title })

  const cover = page.cover ? content.media(page.cover) : null
  const seo = pageSeo(page.seo, locale, { title, description: summary })
  const imageId = shareImageId(page.seo, page.cover)
  const image = socialImage(imageId ? content.media(imageId) : null, locale)
  const type = pageKey === 'about' ? 'AboutPage' : 'WebPage'
  const jsonLd = pageNodes({ type, path: localePath(locale, pageKey), name: title, description: seo.description, locale, image, crumbs })

  const notice =
    page.notice === 'placeholder-legal' ? ui.sample.placeholderLegal : page.notice === 'provisional-scope' ? ui.pages.provisionalScope : null

  return (
    <>
      <PageHead title={seo.title} description={seo.description} alternates={pageAlternates(pageKey)} image={image} jsonLd={jsonLd} />
      <PageHero title={title} breadcrumbs={crumbs} cover={cover}>
        <p>{summary}</p>
      </PageHero>
      <div className="container-page max-w-3xl py-12">
        {notice && (
          <p role="note" className="mb-8 flex gap-3 rounded-card border border-brand-orange bg-brand-orange-soft p-4 text-brand-orange-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <span>{notice}</span>
          </p>
        )}
        <div className="space-y-10">
          {page.sections.map((section, index) => (
            <section key={section.heading?.tr ?? index}>
              {section.heading && <h2 className="mb-4 text-3xl font-bold">{pick(section.heading, locale).value}</h2>}
              <RichText blocks={pick(section.body, locale).value} />
            </section>
          ))}
        </div>
      </div>
      {pageKey === 'about' && <TeamSection />}
    </>
  )
}
