import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { HEALTH_FORM_KINDS, staticRouteSpecs } from '../../app/routePaths'
import { Badge } from '../../components/ui/Badge'
import { useContent } from '../../content/ContentContext'
import type { Origin } from '../../content/schema'
import { eventPath, postPath, productPath } from '../../content/urls'
import { LOCALES, type Locale } from '../../i18n/locales'
import { localePath, type PageKey } from '../../i18n/pages'
import { pageTitle } from '../../i18n/pageTitles'
import { getUi } from '../../i18n/ui'
import { cardPrice } from '../../lib/price'

/**
 * Stage A only (never built for a public release): one screen linking every
 * page in all four languages, with where each record's text came from.
 */
const ORIGIN_LABEL: Record<Origin, string> = { cloner: 'Eski site', 'kayak-site': 'dragomanseakayak.com', mockup: 'Örnek (mockup)', panel: 'Panel' }
const ORIGIN_TONE: Record<Origin, 'source' | 'green' | 'sample'> = { cloner: 'source', 'kayak-site': 'green', mockup: 'sample', panel: 'green' }

function LocaleLinks({ build }: { build: (locale: Locale) => string }) {
  return (
    <span className="flex gap-1.5">
      {LOCALES.map((locale) => (
        <Link key={locale} to={build(locale)} className="rounded bg-brand-green-soft px-1.5 text-xs font-semibold uppercase text-brand-green hover:bg-brand-green hover:text-white">
          {locale}
        </Link>
      ))}
    </span>
  )
}

function Table({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-3 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </section>
  )
}

export function DemoIndexPage() {
  const content = useContent()
  const ui = getUi('tr')
  const fixedPages = [...new Set(staticRouteSpecs().filter((s) => s.page !== 'participantForm').map((s) => s.page))] as PageKey[]
  const categoryOrder = ['diving', 'seaKayak', 'outdoor'] as const
  const events = categoryOrder.flatMap((category) => content.events().filter((event) => event.category === category))

  return (
    <>
      <Head>
        <title>Gösterim dizini | Dragoman</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="container-page py-10">
        <h1 className="text-4xl font-bold">Aşama A — gösterim dizini</h1>
        <p className="mt-3 max-w-3xl text-ink-muted">
          Bu sayfa yalnızca değerlendirme içindir ve yayında üretilmez. Her sayfa dört dilde açılabilir. Rozetler metnin kaynağını gösterir:
        </p>
        <p className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(ORIGIN_LABEL) as Origin[]).map((origin) => (
            <Badge key={origin} tone={ORIGIN_TONE[origin]}>
              {ORIGIN_LABEL[origin]}
            </Badge>
          ))}
        </p>

        <Table title="Sabit sayfalar">
          {fixedPages.map((key) => (
            <tr key={key}>
              <td className="px-4 py-2 font-semibold">{pageTitle(ui, key)}</td>
              <td className="px-4 py-2">
                <LocaleLinks build={(locale) => localePath(locale, key)} />
              </td>
            </tr>
          ))}
          {HEALTH_FORM_KINDS.map((kind) => (
            <tr key={kind}>
              <td className="px-4 py-2 font-semibold">
                {ui.titles.participantForm} — {ui.health.formKind[kind]}
              </td>
              <td className="px-4 py-2">
                <LocaleLinks build={(locale) => localePath(locale, 'participantForm', [kind])} />
              </td>
            </tr>
          ))}
          <tr>
            <td className="px-4 py-2 font-semibold">404</td>
            <td className="px-4 py-2">
              <LocaleLinks build={(locale) => `${localePath(locale, 'home')}404/`} />
            </td>
          </tr>
        </Table>

        <Table title={`Etkinlikler (${events.length})`}>
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-4 py-2 font-semibold">{event.title.tr}</td>
              <td className="px-4 py-2 text-ink-muted">{ui.nav[event.category]}</td>
              <td className="px-4 py-2">
                <Badge tone={ORIGIN_TONE[event.origin]}>{ORIGIN_LABEL[event.origin]}</Badge>
              </td>
              <td className="px-4 py-2 text-ink-muted">
                {cardPrice(event).kind} · {event.options.length} seçenek · {event.faq.length} SSS · {event.itinerary.length} gün
              </td>
              <td className="px-4 py-2">
                <LocaleLinks build={(locale) => eventPath(locale, event)} />
              </td>
            </tr>
          ))}
        </Table>

        <Table title={`Blog yazıları (${content.posts().length})`}>
          {content.posts().map((post) => (
            <tr key={post.id}>
              <td className="px-4 py-2 font-semibold">{post.title.tr}</td>
              <td className="px-4 py-2">
                <Badge tone={ORIGIN_TONE[post.origin]}>{ORIGIN_LABEL[post.origin]}</Badge>
              </td>
              <td className="px-4 py-2">
                <LocaleLinks build={(locale) => postPath(locale, post)} />
              </td>
            </tr>
          ))}
        </Table>

        <Table title={`Kitaplar (${content.products().length})`}>
          {content.products().map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-2 font-semibold">{product.title.tr}</td>
              <td className="px-4 py-2">
                <Badge tone={ORIGIN_TONE[product.origin]}>{ORIGIN_LABEL[product.origin]}</Badge>
              </td>
              <td className="px-4 py-2">
                <LocaleLinks build={(locale) => productPath(locale, product)} />
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </>
  )
}
