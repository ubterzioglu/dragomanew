import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useCan } from '../../components/Shell'
import { PageHeading } from '../../components/PageHeading'
import { Button, fieldClass, labelClass, Loading, Notice } from '../../components/ui'
import { listDrafts, listEntries } from '../../data/content/entries'
import { EDITABLE_TYPES, isEditableType, TYPE_CONFIG, type EditableType } from '../../lib/content/editorConfig'
import { contentErrorMessage } from '../../lib/content/messages'
import { CHIP_LABELS, filterRows, statusChip, type StatusChip } from '../../lib/content/listView'
import { needsTranslationUpdate, parseMeta } from '../../lib/content/translationView'
import { formatDateTime } from '../../lib/format'
import { useAsyncData } from '../../lib/useAsyncData'

const CHIPS = Object.keys(CHIP_LABELS) as StatusChip[]
const CHIP_STYLES: Readonly<Record<StatusChip, string>> = {
  draft: 'bg-line text-ink',
  published: 'bg-brand-green-soft text-brand-green-dark',
  changed: 'bg-brand-orange-soft text-brand-orange-ink',
  archived: 'bg-white text-ink-muted border border-line-strong',
}

/** The list plus, for the open tab, which entries have a stale translation. */
async function loadList(type: EditableType) {
  const [rows, drafts] = await Promise.all([listEntries(), listDrafts([type])])
  const stale = new Set(drafts.filter((row) => needsTranslationUpdate(row.draft, parseMeta(row.translation_meta))).map((row) => row.id))
  return { type, rows, stale }
}

const cell = 'border-b border-line px-3 py-2 text-left align-middle'

/** /panel/icerik: type tabs, status chips, the "Çeviri güncellenmeli" badge and title search (§9). */
export function ContentListPage() {
  const allowed = useCan()
  if (!allowed('content.edit') && !allowed('content.publish')) {
    return (
      <div className="space-y-4">
        <PageHeading title="İçerik" />
        <Notice tone="info">Rolünüz içerik düzenlemeyi kapsamıyor.</Notice>
      </div>
    )
  }
  return <ContentList canEdit={allowed('content.edit')} canOrder={allowed('content.publish')} />
}

function ContentList({ canEdit, canOrder }: { canEdit: boolean; canOrder: boolean }) {
  const [params] = useSearchParams()
  const typeParam = params.get('tur')
  const type: EditableType = isEditableType(typeParam) ? typeParam : 'event'
  const [search, setSearch] = useState('')
  const [chip, setChip] = useState<StatusChip | null>(null)

  const load = useCallback(() => loadList(type), [type])
  const { state, reload } = useAsyncData(`content-list:${type}`, load, contentErrorMessage)
  const current = state.value && state.value.type === type ? state.value : null
  const rows = useMemo(() => (current ? filterRows(current.rows, type, search, chip) : []), [current, type, search, chip])
  const config = TYPE_CONFIG[type]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading title="İçerik" />
        <div className="flex flex-wrap gap-2">
          {canOrder && (
            <Link to="/icerik/siralama" className="rounded-md border border-line-strong bg-white px-4 py-2 text-sm font-semibold">
              Sıralama
            </Link>
          )}
          {canEdit && config.creatable && (
            <Link to={`/icerik/${type}/yeni`} className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white">
              Yeni {config.singular}
            </Link>
          )}
          <Button variant="secondary" onClick={reload} disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Yenileniyor…' : 'Listeyi yenile'}
          </Button>
        </div>
      </div>

      <nav aria-label="İçerik türleri">
        <ul className="flex flex-wrap gap-2">
          {EDITABLE_TYPES.map((item) => (
            <li key={item}>
              <Link
                to={`?tur=${item}`}
                aria-current={item === type ? 'page' : undefined}
                className={`inline-block rounded-md border px-3 py-2 text-sm font-semibold ${
                  item === type ? 'border-brand-green bg-brand-green text-white' : 'border-line-strong bg-white'
                }`}
              >
                {TYPE_CONFIG[item].tab}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-wrap items-end gap-4">
        <label className={`${labelClass} w-full max-w-sm`}>
          Başlıkta ara
          <input type="search" className={fieldClass} value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Duruma göre süz</legend>
          <ChipButton active={chip === null} onClick={() => setChip(null)}>
            Tümü
          </ChipButton>
          {CHIPS.map((item) => (
            <ChipButton key={item} active={chip === item} onClick={() => setChip(item)}>
              {CHIP_LABELS[item]}
            </ChipButton>
          ))}
        </fieldset>
      </div>

      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {!current && state.status === 'loading' && <Loading label="İçerik yükleniyor…" />}
      {current && rows.length === 0 && <Notice tone="info">Bu görünümde kayıt yok.</Notice>}
      {current && rows.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{config.tab}</caption>
            <thead>
              <tr>
                <th scope="col" className={cell}>Başlık</th>
                <th scope="col" className={cell}>Durum</th>
                <th scope="col" className={cell}>Son değişiklik</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const rowChip = statusChip(row)
                return (
                  <tr key={row.id}>
                    <td className={cell}>
                      <Link to={`/icerik/${type}/${row.id}`} className="font-semibold text-brand-green-dark underline">
                        {row.title_tr || row.key}
                      </Link>
                      <span className="ml-2 text-xs text-ink-muted">{row.key}</span>
                    </td>
                    <td className={cell}>
                      <span className={`mr-2 inline-block rounded px-2 py-0.5 text-xs font-semibold ${CHIP_STYLES[rowChip]}`}>
                        {CHIP_LABELS[rowChip]}
                      </span>
                      {current.stale.has(row.id) && (
                        <span className="inline-block rounded bg-brand-orange-soft px-2 py-0.5 text-xs font-semibold text-brand-orange-ink">
                          Çeviri güncellenmeli
                        </span>
                      )}
                    </td>
                    <td className={cell}>
                      {formatDateTime(row.updated_at)}
                      {row.updated_by_name && <span className="text-ink-muted"> · {row.updated_by_name}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm ${active ? 'border-brand-green bg-brand-green-soft font-semibold' : 'border-line-strong bg-white'}`}
    >
      {children}
    </button>
  )
}
