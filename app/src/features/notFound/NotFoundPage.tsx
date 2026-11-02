import { Link } from 'react-router-dom'
import { PageHead } from '../../components/seo/PageHead'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { localePath, pageAlternates } from '../../i18n/pages'

export function NotFoundPage() {
  const locale = useLocale()
  const ui = useUi()
  return (
    <>
      <PageHead title={ui.seo.notFoundTitle} description={ui.seo.notFoundDescription} alternates={pageAlternates('home')} alwaysNoindex />
      <div className="container-page py-20 text-center">
        <p className="font-display text-7xl font-bold text-brand-orange-ink">404</p>
        <h1 className="mt-4 text-4xl font-bold">{ui.notFound.title}</h1>
        <p className="mt-3 text-ink-muted">{ui.notFound.body}</p>
        <Link
          to={localePath(locale, 'home')}
          className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-brand-green px-6 font-semibold text-white hover:bg-brand-green-dark"
        >
          {ui.notFound.backHome}
        </Link>
      </div>
    </>
  )
}
