import { Link, Navigate } from 'react-router'
import { useStaff } from '../../auth/AuthProvider'
import { PageHeading } from '../../components/PageHeading'
import { Card, Loading, Notice } from '../../components/ui'
import { listForms } from '../../data/forms/forms'
import { formatDateTime } from '../../lib/format'
import { canManageForms, hasUnpublishedChanges } from '../../lib/forms/editor'
import { functionErrorMessage } from '../../lib/forms/messages'
import { kindLabel } from '../../lib/labels'
import { useAsyncData } from '../../lib/useAsyncData'

/** /panel/formlar: the four request forms, each with its version and an unpublished-changes badge. */
export function FormsPage() {
  const me = useStaff()
  if (!canManageForms(me)) return <Navigate to="/" replace />
  return <FormList />
}

function FormList() {
  const { state } = useAsyncData('forms', listForms, functionErrorMessage)

  return (
    <div className="space-y-5">
      <PageHeading title="Formlar" description="Sitedeki talep formlarının alanlarını yönetin." help="formlar" />
      <p className="max-w-3xl text-sm text-ink-muted">
        Sitedeki talep formlarının alanları, sırası ve metinleri. Değişiklikler taslakta kalır; Yayınla ile yeni bir form sürümü olur
        ve site yeniden kurulunca görünür. Gelen her talep, doldurulduğu sürümü saklar.
      </p>
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {!state.value && state.status === 'loading' && <Loading label="Formlar yükleniyor…" />}
      {state.value && state.value.length === 0 && <Notice tone="info">Görebileceğiniz form yok.</Notice>}
      {state.value && state.value.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {state.value.map(({ definition, latest }) => {
            const changed = hasUnpublishedChanges(definition.draft, latest?.definition ?? null)
            return (
              <li key={definition.kind}>
                <Card className="space-y-2">
                  <h2 className="text-lg font-semibold">
                    <Link to={`/formlar/${definition.kind}`} className="underline-offset-2 hover:underline">
                      {kindLabel(definition.kind)} formu
                    </Link>
                  </h2>
                  <p className="text-sm">
                    {latest ? `Yayındaki sürüm: ${latest.version} (${formatDateTime(latest.published_at)})` : 'Henüz yayınlanmış sürüm yok.'}
                  </p>
                  {changed && (
                    <p>
                      <span className="inline-block rounded-full bg-brand-orange-soft px-2.5 py-0.5 text-xs font-semibold text-brand-orange-ink">
                        Yayınlanmamış değişiklik var
                      </span>
                    </p>
                  )}
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
