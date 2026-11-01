import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import type { HomeContent } from '../../content/schema'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'
import { PHONE_CONTENT_WIDTH, Picture } from '../../components/ui/Picture'

/**
 * Accepted first screen (V6 §4.2): short heading + one sentence, then Diving,
 * Sea Kayak and Outdoor as three photo tiles. Desktop: side by side. Mobile:
 * a swipeable row where the next tile peeks in, so all three are discoverable.
 */
export function HeroTriptych({ hero }: { hero: HomeContent['hero'] }) {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()

  return (
    <section aria-labelledby="hero-title">
      <div className="container-page pt-10 pb-6 md:pt-14">
        <h1 id="hero-title" className="max-w-3xl text-4xl font-bold text-ink md:text-6xl">
          {pick(hero.heading, locale).value}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-muted md:text-xl">{pick(hero.subheading, locale).value}</p>
      </div>
      <ul className="container-page flex scroll-px-4 snap-x snap-mandatory gap-4 overflow-x-auto pb-10 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:pb-14">
        {hero.tiles.map((tile, index) => (
          <li key={tile.category} className="w-[82%] shrink-0 snap-start md:w-auto">
            <Link
              to={localePath(locale, tile.category)}
              className="group relative block aspect-[4/5] overflow-hidden rounded-card bg-ink md:aspect-[3/4]"
            >
              <Picture
                asset={content.media(tile.media)}
                sizes={`(min-width: 48rem) 33vw, calc(${PHONE_CONTENT_WIDTH} * 0.82)`}
                // Phone tile is 4:5. The md+ tile is 3:4, but 33vw overstates its width enough to make up for that.
                boxAspect={4 / 5}
                priority={index === 0}
                lowPriority={index > 0}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 via-60% to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
                <p className="font-display text-3xl font-bold uppercase tracking-wide [text-shadow:0_1px_6px_rgb(0_0_0/0.6)] lg:text-4xl">{ui.nav[tile.category]}</p>
                <p className="mt-1 text-white/90 [text-shadow:0_1px_6px_rgb(0_0_0/0.6)]">{pick(tile.tagline, locale).value}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand-orange-soft">
                  {ui.actions.viewCategory}
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
