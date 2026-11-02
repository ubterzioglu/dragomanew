import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { PageHeading } from '../components/PageHeading'

export function NotFoundPage() {
  return (
    <div className="space-y-4">
      <PageHeading title="Sayfa bulunamadı" />
      <Link to="/" className="text-sea underline">
        Genel bakışa dön
      </Link>
    </div>
  )
}

/** Last-resort screen for render errors; never shows the error itself. */
export function RouteErrorPage() {
  const error = useRouteError()
  const missing = isRouteErrorResponse(error) && error.status === 404
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-10">
      <PageHeading title={missing ? 'Sayfa bulunamadı' : 'Bir sorun oluştu'} />
      <p className="text-sm">Sayfayı yenileyin. Sorun sürerse yöneticiye haber verin.</p>
      <a href={import.meta.env.BASE_URL} className="text-sea underline">
        Panele dön
      </a>
    </main>
  )
}
