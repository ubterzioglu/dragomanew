import type { ReactNode } from 'react'
import type { MediaAsset } from '../../content/schema'
import { Breadcrumbs, type Crumb } from '../ui/Breadcrumbs'
import { PHONE_CONTENT_WIDTH, Picture } from '../ui/Picture'

interface PageHeroProps {
  title: string
  breadcrumbs: readonly Crumb[]
  cover?: MediaAsset | null
  /** Short introduction under the title. */
  children?: ReactNode
}

/** Top area of category and content pages: breadcrumb, title, intro, cover photo. */
export function PageHero({ title, breadcrumbs, cover, children }: PageHeroProps) {
  return (
    <section className="bg-sand">
      <div className={`container-page grid gap-8 py-8 md:py-12 ${cover ? 'lg:grid-cols-2 lg:items-center' : ''}`}>
        <div>
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="mt-4 text-4xl font-bold text-ink md:text-5xl">{title}</h1>
          {children && <div className="mt-4 max-w-2xl text-lg text-ink-muted">{children}</div>}
        </div>
        {cover && (
          <div className="aspect-[16/10] overflow-hidden rounded-card bg-white">
            <Picture asset={cover} sizes={`(min-width: 64rem) 50vw, ${PHONE_CONTENT_WIDTH}`} boxAspect={16 / 10} priority className="size-full object-cover" />
          </div>
        )}
      </div>
    </section>
  )
}
