import { useCallback } from 'react'
import { getRequestFormVersion } from '../../data/forms/forms'
import { customAnswers } from '../../lib/forms/editor'
import { useAsyncData } from '../../lib/useAsyncData'

/**
 * A request's answers to fields added in the panel, labelled as in the form version the visitor
 * filled in (dalga2-sozlesme §8). Renders nothing when the request has none.
 */
export function CustomAnswers({ requestId, payload }: { requestId: string; payload: unknown }) {
  const hasAnswers = customAnswers(payload, null).length > 0
  const load = useCallback(() => (hasAnswers ? getRequestFormVersion(requestId) : Promise.resolve(null)), [requestId, hasAnswers])
  const { state } = useAsyncData(`${requestId}:${hasAnswers}`, load)
  if (!hasAnswers) return null

  const version = state.value ?? null
  const answers = customAnswers(payload, version?.definition ?? null)
  return (
    <section aria-labelledby="detail-custom" className="space-y-2">
      <h3 id="detail-custom" className="font-semibold">
        Ek sorular{version ? ` (form sürümü ${version.version})` : ''}
      </h3>
      {state.status === 'error' && <p className="text-sm text-ink-muted">Form sürümü okunamadı; alanlar anahtarlarıyla gösteriliyor.</p>}
      <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1 text-sm">
        {answers.map((answer) => (
          <div key={answer.key} className="contents">
            <dt className="text-ink-muted">{answer.label}</dt>
            <dd className="break-words">{answer.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
