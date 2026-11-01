import type { ReactNode } from 'react'
import { Check, MapPin, X } from 'lucide-react'
import { PageHead } from '../../components/seo/PageHead'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { FaqList } from '../../components/ui/FaqList'
import { RichText } from '../../components/ui/RichText'
import { useContent } from '../../content/ContentContext'
import { pick } from '../../content/localize'
import type { DragomanEvent } from '../../content/schema'
import { eventAlternates } from '../../content/urls'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath } from '../../i18n/pages'
import { EventRequestForm } from '../forms/EventRequestForm'
import { EventInfoBox } from './EventInfoBox'
import { Gallery } from '../../components/ui/Gallery'

function DetailSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line pt-8">
      <h2 id={id} className="text-3xl font-bold">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function CheckList({ items, kind }: { items: readonly string[]; kind: 'yes' | 'no' }) {
  const Icon = kind === 'yes' ? Check : X
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Icon aria-hidden="true" className={`mt-1 size-5 shrink-0 ${kind === 'yes' ? 'text-brand-green' : 'text-ink-muted'}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Shared detail template for diving, sea kayak and outdoor (V6 §4.4). Every
 * optional section is omitted entirely when the event has no content for it.
 */
export function EventDetailPage({ event }: { event: DragomanEvent }) {
  const locale = useLocale()
  const ui = useUi()
  const content = useContent()
  const title = pick(event.title, locale).value
  const summary = pick(event.summary, locale).value
  const images = [event.cover, ...event.gallery.filter((id) => id !== event.cover)].map((id) => content.media(id))
  const includes = event.includes ? pick(event.includes, locale).value : []
  const excludes = event.excludes ? pick(event.excludes, locale).value : []
  const conditions = event.conditions ? pick(event.conditions, locale).value : []
  const faq = event.faq.map((item) => ({ question: pick(item.question, locale).value, answer: pick(item.answer, locale).value }))

  return (
    <>
      <PageHead title={title} description={summary} alternates={eventAlternates(event)} />
      <div>
        <div className="container-page py-8 md:py-10">
          <Breadcrumbs
            items={[
              { label: ui.nav.home, href: localePath(locale, 'home') },
              { label: ui.nav[event.category], href: localePath(locale, event.category) },
              { label: title },
            ]}
          />
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-lg text-ink-muted md:text-xl">{summary}</p>
        </div>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* First in the DOM so phones see price/duration right below the title; desktop puts it on the right. */}
        <aside className="lg:sticky lg:top-32 lg:col-start-2 lg:row-start-1 lg:self-start">
          <EventInfoBox event={event} />
        </aside>

        <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-1">
          <Gallery images={images} label={title} />

          <DetailSection id="overview" title={ui.pages.overview}>
            <RichText blocks={pick(event.body, locale).value} />
          </DetailSection>

          {event.itinerary.length > 0 && (
            <DetailSection id="itinerary" title={ui.pages.itinerary}>
              <ol className="space-y-4 border-l-2 border-brand-orange/40 pl-6">
                {event.itinerary.map((day) => (
                  <li key={pick(day.title, 'tr').value}>
                    <h3 className="text-xl font-bold text-brand-green">{pick(day.title, locale).value}</h3>
                    <p className="mt-1 text-ink-muted">{pick(day.description, locale).value}</p>
                  </li>
                ))}
              </ol>
            </DetailSection>
          )}

          {(includes.length > 0 || excludes.length > 0) && (
            <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-2">
              {includes.length > 0 && (
                <section aria-labelledby="includes">
                  <h2 id="includes" className="text-2xl font-bold">
                    {ui.pages.includes}
                  </h2>
                  <div className="mt-3">
                    <CheckList items={includes} kind="yes" />
                  </div>
                </section>
              )}
              {excludes.length > 0 && (
                <section aria-labelledby="excludes">
                  <h2 id="excludes" className="text-2xl font-bold">
                    {ui.pages.excludes}
                  </h2>
                  <div className="mt-3">
                    <CheckList items={excludes} kind="no" />
                  </div>
                </section>
              )}
            </div>
          )}

          {conditions.length > 0 && (
            <DetailSection id="conditions" title={ui.pages.conditions}>
              <ul className="list-disc space-y-1.5 pl-6 marker:text-brand-orange">
                {conditions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailSection>
          )}

          {event.meetingPoint && (
            <DetailSection id="meeting" title={ui.pages.meetingPoint}>
              <p className="flex gap-2">
                <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-orange" />
                {pick(event.meetingPoint, locale).value}
              </p>
            </DetailSection>
          )}

          {faq.length > 0 && (
            <DetailSection id="faq" title={ui.pages.faq}>
              <FaqList items={faq} />
            </DetailSection>
          )}

          <section id="request" aria-labelledby="request-title" className="border-t border-line pt-8">
            <h2 id="request-title" className="text-3xl font-bold">
              {ui.pages.requestTitle}
            </h2>
            <div className="mt-6">
              <EventRequestForm event={event} />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
