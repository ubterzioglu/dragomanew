import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { FieldEditor, type EditorContext } from '../../components/content/FieldEditor'
import { PublishActions } from '../../components/content/PublishActions'
import { TranslateControls } from '../../components/content/TranslateControls'
import { PageHeading } from '../../components/PageHeading'
import { useCan } from '../../components/Shell'
import { Button, Card, Loading, Notice } from '../../components/ui'
import { createEntry, getEntry, listDrafts, saveDraft } from '../../data/content/entries'
import { listMedia } from '../../data/media/media'
import { setIn, isRecord, type DocPath } from '../../lib/content/docPath'
import { draftIssues, draftTitle, emptyDraft, normalizeDraft, withNewKey } from '../../lib/content/draft'
import {
  EDITOR_LOCALES,
  GROUP_LABELS,
  isEditableType,
  TYPE_CONFIG,
  type EditableType,
  type EditorLocale,
  type FieldGroup,
} from '../../lib/content/editorConfig'
import { STATUS_LABELS } from '../../lib/content/listView'
import { contentErrorMessage } from '../../lib/content/messages'
import { parseMeta, statesByPointer, summarize } from '../../lib/content/translationView'
import type { ContentEntryRow } from '../../lib/types'
import { useAsyncData } from '../../lib/useAsyncData'
import { canonicalJson } from '../../shared/content/release.ts'
import { markManualEdits, type TranslationMeta } from '../../shared/content/translation.ts'

const NEW = 'yeni'
const ARCHIVABLE = new Set<EditableType>(['event', 'post', 'product'])

const titleOf = (draft: unknown, key: string): string => {
  if (!isRecord(draft)) return key
  const title = draft.title
  if (isRecord(title) && typeof title.tr === 'string' && title.tr) return title.tr
  return typeof draft.name === 'string' && draft.name ? draft.name : key
}

async function loadEditor(id: string): Promise<{ entry: ContentEntryRow | null; context: EditorContext }> {
  const [entry, media, drafts] = await Promise.all([id === NEW ? null : getEntry(id), listMedia(), listDrafts(['subgroup', 'event'])])
  const altOf = (alt: unknown) => (isRecord(alt) && typeof alt.tr === 'string' ? alt.tr : '')
  const docs = drafts.filter((row) => isRecord(row.draft))
  return {
    entry,
    context: {
      media: media.map((item) => ({ id: item.id, label: `${item.id} — ${altOf(item.alt)}` })),
      subgroups: docs
        .filter((row) => row.type === 'subgroup')
        .map((row) => {
          const draft = row.draft as Record<string, unknown>
          return { id: String(draft.id ?? row.key), label: titleOf(draft, row.key), category: String(draft.category ?? '') }
        }),
      events: docs.filter((row) => row.type === 'event').map((row) => ({ id: String((row.draft as Record<string, unknown>).id ?? row.key), label: titleOf(row.draft, row.key) })),
    },
  }
}

/** /panel/icerik/:type/(yeni|:id) */
export function ContentEditorPage() {
  const { type: typeParam = '', id = '' } = useParams()
  const allowed = useCan()
  const load = useCallback(() => loadEditor(id), [id])
  const { state, reload } = useAsyncData(`content-editor:${id}`, load, contentErrorMessage)
  // Publish/archive results outlive the Editor: the reload changes its key and remounts it.
  const [remoteNotice, setRemoteNotice] = useState<{ id: string; message: string } | null>(null)
  const afterRemote = useCallback(
    (message: string) => {
      setRemoteNotice({ id, message })
      reload()
    },
    [id, reload],
  )

  if (!isEditableType(typeParam)) return <Missing text="Bu içerik türü panelde düzenlenmiyor." />
  const type = typeParam
  if (!allowed('content.edit') && !allowed('content.publish')) return <Missing text="Rolünüz içerik düzenlemeyi kapsamıyor." />
  if (id === NEW && (!TYPE_CONFIG[type].creatable || !allowed('content.edit'))) return <Missing text="Bu türde yeni kayıt eklenemiyor." />

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <PageHeading title="İçerik" help="icerik" />
        <Notice tone="error">{state.message}</Notice>
        <Button variant="secondary" onClick={reload}>
          Tekrar dene
        </Button>
      </div>
    )
  }
  if (state.status === 'loading' && !state.value) return <Loading label="İçerik yükleniyor…" />
  const value = state.value
  if (!value) return null
  if (value.entry && value.entry.type !== type) return <Missing text="Kayıt bu türde değil." />

  const entry = value.entry
  return (
    <Editor
      key={entry ? `${entry.id}:${entry.draft_revision}:${entry.status}` : NEW}
      type={type}
      entry={entry}
      context={value.context}
      notice={remoteNotice?.id === id ? remoteNotice.message : null}
      onRemoteDone={afterRemote}
    />
  )
}

function Missing({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      <PageHeading title="İçerik" help="icerik" />
      <Notice tone="info">{text}</Notice>
      <Link to="/icerik" className="text-sm font-semibold text-brand-green-dark underline">
        İçerik listesine dön
      </Link>
    </div>
  )
}

interface Saved {
  draft: unknown
  meta: TranslationMeta
  revision: number
}

interface EditorProps {
  type: EditableType
  entry: ContentEntryRow | null
  context: EditorContext
  /** The last publish/archive result for this entry, shown after the remount. */
  notice: string | null
  /** Called after a publish, archive or unpublish: shows the message and reloads the entry. */
  onRemoteDone: (message: string) => void
}

function Editor({ type, entry, context, notice, onRemoteDone }: EditorProps) {
  const navigate = useNavigate()
  const allowed = useCan()
  const config = TYPE_CONFIG[type]
  const [saved, setSaved] = useState<Saved>(() =>
    entry
      ? { draft: entry.draft, meta: parseMeta(entry.translation_meta), revision: entry.draft_revision }
      : { draft: emptyDraft(type, '', new Date().toISOString().slice(0, 10)), meta: {}, revision: 0 },
  )
  const [draft, setDraft] = useState<unknown>(saved.draft)
  const [locale, setLocale] = useState<EditorLocale>('tr')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState<string | null>(notice)

  const dirty = entry === null || canonicalJson(draft) !== canonicalJson(saved.draft)
  const issues = useMemo(() => draftIssues(type, draft), [type, draft])
  const issueMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const issue of issues) map.set(issue.path, [...(map.get(issue.path) ?? []), issue.message])
    return map
  }, [issues])
  const states = useMemo(() => statesByPointer(draft, saved.meta), [draft, saved.meta])
  const summary = useMemo(() => summarize(saved.draft, saved.meta), [saved])

  useEffect(() => {
    if (!dirty || entry === null) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, entry])

  const change = (path: DocPath, value: unknown) => {
    setDraft((current: unknown) => {
      const next = setIn(current, path, value)
      // While a new entry is unsaved, its key follows the Turkish title (§9).
      const isTitle = path[0] === config.titleKey && (path.length === 1 || path[1] === 'tr')
      return entry === null && isTitle && isRecord(next) && typeof value === 'string' ? withNewKey(next, value) : next
    })
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    setAnnouncement(null)
    const normalized = normalizeDraft(type, draft)
    try {
      if (entry === null) {
        const key = isRecord(normalized) && typeof normalized.id === 'string' ? normalized.id : ''
        if (!key) {
          setError('Önce Türkçe başlığı yazın; kısa ad ondan oluşur.')
          return
        }
        const created = await createEntry(type, key, normalized)
        navigate(`/icerik/${type}/${created.id}`, { replace: true })
        return
      }
      const meta = markManualEdits(saved.draft, normalized, saved.meta, new Date().toISOString())
      const revision = await saveDraft(entry.id, saved.revision, normalized, meta)
      setSaved({ draft: normalized, meta, revision })
      setDraft(normalized)
      setAnnouncement(issues.length > 0 ? 'Taslak kaydedildi. Yayından önce listelenen sorunları düzeltin.' : 'Taslak kaydedildi.')
    } catch (saveError) {
      setError(contentErrorMessage(saveError))
    } finally {
      setBusy(false)
    }
  }

  const afterRemote = (message: string) => {
    setAnnouncement(message)
    onRemoteDone(message)
  }

  const title = draftTitle(type, draft) || (entry ? entry.key : `Yeni ${config.singular}`)
  const groups: FieldGroup[] = ['main', 'details', 'seo']

  return (
    <div className="space-y-5">
      <Link to={`/icerik?tur=${type}`} className="text-sm font-semibold text-brand-green-dark underline">
        ← {config.tab}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <PageHeading title={title} help="icerik" />
        {entry && (
          <span className="rounded bg-line px-2 py-0.5 text-xs font-semibold">
            {STATUS_LABELS[entry.status]}
            {entry.status === 'published' && canonicalJson(entry.published) !== canonicalJson(saved.draft) ? ' · değişiklik var' : ''}
          </span>
        )}
        {entry === null && isRecord(draft) && typeof draft.id === 'string' && draft.id && (
          <span className="text-sm text-ink-muted">Kısa ad: {draft.id}</span>
        )}
      </div>

      {announcement && <Notice tone="success">{announcement}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Dil">
        {EDITOR_LOCALES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={locale === item}
            onClick={() => setLocale(item)}
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${locale === item ? 'border-brand-green bg-brand-green text-white' : 'border-line-strong bg-white'}`}
          >
            {item.toUpperCase()}
          </button>
        ))}
        {locale !== 'tr' && <span className="text-sm text-ink-muted">Türkçe kaynak salt okunur; yalnız bu dilin metnini düzenleyin.</span>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <fieldset disabled={!allowed('content.edit')} className="space-y-5">
            {groups.map((group) => {
              const fields = config.fields.filter((field) => (field.group ?? 'main') === group)
              if (fields.length === 0) return null
              const body = fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  path={[field.key]}
                  doc={draft}
                  locale={locale}
                  states={states}
                  issues={issueMap}
                  context={context}
                  onChange={change}
                />
              ))
              return group === 'main' ? (
                <Card key={group} className="space-y-5">
                  {body}
                </Card>
              ) : (
                <details key={group} className="rounded-card border border-line bg-white p-5">
                  <summary className="cursor-pointer text-base font-semibold">{GROUP_LABELS[group]}</summary>
                  <div className="mt-4 space-y-5">{body}</div>
                </details>
              )
            })}
          </fieldset>
          {allowed('content.edit') && (
            <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-line bg-[#f6f5f1] py-3">
              <Button type="submit" disabled={busy || !dirty}>
                {busy ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
              {dirty && entry !== null && <span className="text-sm text-ink-muted">Kaydedilmemiş değişiklikler var.</span>}
            </div>
          )}
        </form>

        <aside className="space-y-4">
          <Card className="space-y-2">
            <h2 className="text-base font-semibold">Yayını engelleyenler</h2>
            <div aria-live="polite">
              {issues.length === 0 ? (
                <p className="text-sm text-brand-green-dark">Sorun yok.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-red-800">
                  {issues.map((issue, index) => (
                    <li key={index}>
                      {issue.label}: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
          {entry && allowed('content.publish') && (
            <Card className="space-y-3">
              <h2 className="text-base font-semibold">Yayın</h2>
              <PublishActions
                entryId={entry.id}
                revision={saved.revision}
                status={entry.status}
                issues={issues}
                summary={summary}
                dirty={dirty}
                canArchive={ARCHIVABLE.has(type)}
                canUnpublish={config.creatable}
                onDone={afterRemote}
              />
            </Card>
          )}
          {entry && (
            <details className="rounded-card border border-line bg-white p-5" open={locale !== 'tr'}>
              <summary className="cursor-pointer text-base font-semibold">Çeviri</summary>
              <div className="mt-3 space-y-3 text-sm">
                <ul>
                  {(['en', 'fr', 'de'] as const).map((item) => (
                    <li key={item}>
                      {item.toUpperCase()}: {summary[item].missing} eksik, {summary[item].stale} güncellenmeli, {summary[item].manual} elle düzeltildi
                    </li>
                  ))}
                </ul>
                {allowed('content.translate') ? (
                  <TranslateControls
                    doc={saved.draft}
                    meta={saved.meta}
                    revision={saved.revision}
                    target={{ kind: 'content', id: entry.id }}
                    dirty={dirty}
                    onDone={afterRemote}
                  />
                ) : (
                  <p className="text-ink-muted">Çeviri yetkiniz yok.</p>
                )}
              </div>
            </details>
          )}
        </aside>
      </div>
    </div>
  )
}
