import { useCallback, useEffect, useRef } from 'react'
import { getRequest, listActivity } from '../../data/requests'
import { describeActivity, type StaffNamer } from '../../lib/activity'
import { describePriceSummary, describeSnapshot, formatDateTime, payloadEntries } from '../../lib/format'
import { kindLabel, localeLabel, statusLabel } from '../../lib/labels'
import type { RequestDetail, StaffMember } from '../../lib/types'
import { useAsyncData } from '../../lib/useAsyncData'
import { Card, Loading, Notice } from '../ui'
import { RequestActions } from './RequestActions'

interface RequestDetailViewProps {
  requestId: string
  people: readonly StaffMember[]
  name: StaffNamer
  /** Lets the page refresh the list after an action. */
  onChanged: (message: string) => void
}

function Facts({ items }: { items: readonly { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1 text-sm">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-ink-muted">{item.label}</dt>
          <dd className="break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function EventSection({ request }: { request: RequestDetail }) {
  const snapshot = describeSnapshot(request.event_snapshot)
  const price = describePriceSummary(request.price_summary)
  if (!snapshot && price.kind === 'none') return null
  return (
    <section aria-labelledby="detail-event" className="space-y-2">
      <h3 id="detail-event" className="font-semibold">
        Etkinlik (talep anındaki hâli)
      </h3>
      {snapshot?.title && <p className="text-sm font-medium">{snapshot.title}</p>}
      {snapshot && snapshot.options.length > 0 && (
        <Facts items={snapshot.options.map((option) => ({ label: option.name, value: option.detail }))} />
      )}
      <h4 className="pt-2 text-sm font-semibold">Tahmini fiyat (Dragoman teyit eder)</h4>
      {price.kind === 'none' && <p className="text-sm text-ink-muted">Fiyat özeti yok.</p>}
      {price.kind === 'note' && <p className="text-sm">{price.text}</p>}
      {price.kind === 'total' && (
        <>
          <Facts
            items={price.lines.map((line) => ({
              label: snapshot?.options.find((option) => option.id === line.optionId)?.name ?? line.optionId,
              value: line.text,
            }))}
          />
          <p className="text-sm font-semibold">Tahmini toplam: {price.total}</p>
        </>
      )}
    </section>
  )
}

export function RequestDetailView({ requestId, people, name, onChanged }: RequestDetailViewProps) {
  const load = useCallback(
    () => Promise.all([getRequest(requestId), listActivity(requestId)]),
    [requestId],
  )
  const { state, reload } = useAsyncData(requestId, load)
  const heading = useRef<HTMLHeadingElement>(null)
  // True until the next load settles: on first open, and after an action, whose button may be
  // gone once the request changes (İşleme Al, Devret), which would drop focus to the page body.
  const focusWhenSettled = useRef(true)

  // Moves focus to the request heading, as a route change would (the parent remounts this view
  // per request). Runs when a load settles, ready or failed; the heading is there either way
  // once a value exists.
  useEffect(() => {
    if (state.status === 'loading' || !focusWhenSettled.current) return
    focusWhenSettled.current = false
    heading.current?.focus()
  }, [state.status])

  const changed = (message: string) => {
    focusWhenSettled.current = true
    reload()
    onChanged(message)
  }

  if (state.status === 'error' && !state.value) return <Notice tone="error">{state.message}</Notice>
  if (!state.value) return <Loading label="Talep yükleniyor…" />

  const [request, activity] = state.value
  const fields = payloadEntries(request.payload)

  return (
    <Card className="space-y-5">
      <div className="space-y-1">
        <h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">
          {request.reference}
        </h2>
        <p className="text-sm text-ink-muted">
          {kindLabel(request.kind)} · {statusLabel(request.status)}
        </p>
      </div>
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}

      <RequestActions request={request} people={people} onChanged={changed} />

      <Facts
        items={[
          { label: 'Ad soyad', value: request.full_name },
          { label: 'E-posta', value: request.email },
          { label: 'Telefon', value: request.phone ?? '—' },
          { label: 'Dil', value: localeLabel(request.locale) },
          { label: 'Geliş', value: formatDateTime(request.created_at) },
          { label: 'Sorumlu', value: name(request.assignee_id) },
          { label: 'İşleme alınma', value: formatDateTime(request.claimed_at) },
        ]}
      />

      <section aria-labelledby="detail-fields" className="space-y-2">
        <h3 id="detail-fields" className="font-semibold">
          Talep bilgileri
        </h3>
        {fields.length > 0 ? (
          <Facts items={fields} />
        ) : (
          <p className="text-sm text-ink-muted">Ek bilgi yok.</p>
        )}
      </section>

      <EventSection request={request} />

      <section aria-labelledby="detail-activity" className="space-y-2">
        <h3 id="detail-activity" className="font-semibold">
          Geçmiş
        </h3>
        <ol className="space-y-1 text-sm">
          {activity.map((entry) => (
            <li key={entry.id}>
              <time dateTime={entry.created_at} className="text-ink-muted">
                {formatDateTime(entry.created_at)}
              </time>{' '}
              — {describeActivity(entry, name)}
            </li>
          ))}
        </ol>
      </section>
    </Card>
  )
}
