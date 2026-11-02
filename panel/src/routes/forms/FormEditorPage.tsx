import { useCallback, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useStaff } from '../../auth/AuthProvider'
import { PageHeading } from '../../components/PageHeading'
import { FieldRow } from '../../components/forms/FieldRow'
import { NewFieldForm } from '../../components/forms/NewFieldForm'
import { Button, Card, Loading, Notice, fieldClass, labelClass } from '../../components/ui'
import { getForm, publishForm, saveFormDraft, translateForm, type FormDetail, type TranslateMode } from '../../data/forms/forms'
import { formatDateTime } from '../../lib/format'
import {
  addCustomField,
  canManageForms,
  customCount,
  FORM_KINDS,
  hasUnpublishedChanges,
  isPublishedKey,
  metaForSave,
  moveField,
  removeCustomField,
  setHidden,
  setRequired,
  setText,
} from '../../lib/forms/editor'
import { functionErrorMessage, functionIssues } from '../../lib/forms/messages'
import { kindLabel } from '../../lib/labels'
import { useAsyncData } from '../../lib/useAsyncData'
import { translationStatus } from '../../shared/content/translation.ts'
import { validateDefinition, type FormDefinition } from '../../shared/requests/forms.ts'
import type { RequestKind } from '../../shared/requests/payload.ts'

const isKind = (value: string | undefined): value is RequestKind => FORM_KINDS.includes(value as RequestKind)

/** /panel/formlar/:kind (forms.manage). */
export function FormEditorPage() {
  const me = useStaff()
  const { kind } = useParams()
  if (!canManageForms(me)) return <Navigate to="/" replace />
  if (!isKind(kind)) return <Navigate to="/formlar" replace />
  return <FormEditorLoader kind={kind} />
}

function FormEditorLoader({ kind }: { kind: RequestKind }) {
  const load = useCallback(() => getForm(kind), [kind])
  const { state, reload } = useAsyncData(`form:${kind}`, load)
  // Kept here: a save or translation remounts the editor below, and the result must stay visible.
  const [message, setMessage] = useState<Message | null>(null)

  return (
    <div className="space-y-5">
      <p className="text-sm">
        <Link to="/formlar" className="underline">
          ← Formlar
        </Link>
      </p>
      <PageHeading title={`${kindLabel(kind)} formu`} />
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {state.status === 'ready' && state.value === null && <Notice tone="error">Form bulunamadı ya da görme yetkiniz yok.</Notice>}
      {!state.value && state.status === 'loading' && <Loading label="Form yükleniyor…" />}
      {/* A new key per draft revision: the editor starts again from what the database holds. */}
      {state.value && (
        <FormEditor key={state.value.definition.draft_revision} kind={kind} detail={state.value} message={message} setMessage={setMessage} onReload={reload} />
      )}
    </div>
  )
}

interface Message {
  tone: 'success' | 'error' | 'info'
  text: string
  issues?: string[]
}

interface FormEditorProps {
  kind: RequestKind
  detail: FormDetail
  message: Message | null
  setMessage: (message: Message | null) => void
  onReload: () => void
}

function FormEditor({ kind, detail, message, setMessage, onReload }: FormEditorProps) {
  const saved = detail.definition
  const latest = detail.versions[0] ?? null
  const [draft, setDraft] = useState<FormDefinition>(saved.draft)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<TranslateMode>('missing')

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved.draft)
  const issues = validateDefinition(kind, draft, latest?.definition)
  const unpublished = hasUnpublishedChanges(saved.draft, latest?.definition ?? null)
  const status = translationStatus(saved.draft, saved.translation_meta)
  const missing = status.filter((item) => item.state === 'missing').length
  const stale = status.filter((item) => item.state === 'stale').length

  const run = async (action: () => Promise<string>) => {
    setBusy(true)
    setMessage(null)
    try {
      setMessage({ tone: 'success', text: await action() })
      onReload()
    } catch (error) {
      setMessage({ tone: 'error', text: functionErrorMessage(error), issues: functionIssues(error) })
    } finally {
      setBusy(false)
    }
  }

  const save = () =>
    run(async () => {
      const meta = metaForSave(saved.draft, saved.translation_meta, draft, new Date().toISOString())
      await saveFormDraft(kind, draft, meta, saved.draft_revision)
      return 'Taslak kaydedildi.'
    })
  const translate = () =>
    run(async () => {
      const result = await translateForm(kind, saved.draft_revision, mode)
      return `Çeviri tamamlandı: ${result.translated} metin çevrildi${result.skippedManual > 0 ? `, elle düzeltilen ${result.skippedManual} metne dokunulmadı` : ''}.`
    })
  const publish = () =>
    run(async () => {
      await publishForm(kind, saved.draft_revision)
      return 'Form yayınlandı. Yeni sürüm site yeniden kurulunca görünür.'
    })

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <p className="text-sm">
          {latest ? `Yayındaki sürüm: ${latest.version}` : 'Henüz yayınlanmış sürüm yok.'}
          {unpublished && <span className="ml-2 font-semibold text-brand-orange-ink">Yayınlanmamış değişiklik var.</span>}
        </p>
        <p className="text-sm text-ink-muted">
          Çeviri (kaydedilmiş taslak): {missing} eksik, {stale} güncellenmeli.
        </p>
        {message && (
          <Notice tone={message.tone}>
            {message.text}
            {message.issues && message.issues.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {message.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
          </Notice>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <Button onClick={save} disabled={busy || !dirty || issues.length > 0}>
            Kaydet
          </Button>
          <Button variant="secondary" onClick={() => setDraft(saved.draft)} disabled={busy || !dirty}>
            Değişiklikleri geri al
          </Button>
          <div>
            <label htmlFor="translate-mode" className={labelClass}>
              DeepL ile çevir
            </label>
            <div className="flex gap-2">
              <select id="translate-mode" className={fieldClass} value={mode} onChange={(event) => setMode(event.target.value as TranslateMode)}>
                <option value="missing">Eksik olanlar</option>
                <option value="stale">Güncellenmesi gerekenler</option>
                <option value="all">Tümü (elle düzeltilenler hariç)</option>
              </select>
              <Button variant="secondary" onClick={translate} disabled={busy || dirty}>
                Çevir
              </Button>
            </div>
          </div>
          <Button onClick={publish} disabled={busy || dirty || issues.length > 0 || !unpublished}>
            Yayınla
          </Button>
        </div>
        {dirty && <p className="text-sm text-ink-muted">Çevirmek ve yayınlamak için önce kaydedin.</p>}
        {issues.length > 0 && (
          <Notice tone="error">
            Kaydetmeden önce düzeltin:
            <ul className="mt-2 list-disc pl-5">
              {issues.map((issue) => (
                <li key={`${issue.code}:${issue.key ?? ''}`}>
                  {issue.key ? `${issue.key}: ` : ''}
                  {issue.message}
                </li>
              ))}
            </ul>
          </Notice>
        )}
      </Card>

      <section aria-labelledby="form-fields" className="space-y-3">
        <h2 id="form-fields" className="text-lg font-semibold">
          Alanlar (sitedeki sırayla)
        </h2>
        <ol className="space-y-3">
          {draft.fields.map((field, index) => (
            <FieldRow
              key={field.key}
              kind={kind}
              field={field}
              position={index}
              count={draft.fields.length}
              actions={{
                move: (delta) => setDraft((current) => moveField(current, field.key, delta)),
                setHidden: (hidden) => setDraft((current) => setHidden(kind, current, field.key, hidden)),
                setRequired: (required) => setDraft((current) => setRequired(kind, current, field.key, required)),
                setText: (part, locale, text) => setDraft((current) => setText(current, field.key, part, locale, text)),
                ...(field.kind === 'custom' && !isPublishedKey(field.key, latest?.definition ?? null)
                  ? { remove: () => setDraft((current) => removeCustomField(current, field.key, latest?.definition ?? null)) }
                  : {}),
              }}
            />
          ))}
        </ol>
      </section>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Yeni alan</h2>
        <p className="text-sm text-ink-muted">
          Yayınlanan bir alanın anahtarı ve türü değişmez; artık istenmiyorsa gizlenir. Eski talepler kendi sürümlerinin etiketleriyle görünür.
        </p>
        <NewFieldForm
          count={customCount(draft)}
          onAdd={(input) => setDraft((current) => addCustomField(current, input) ?? current)}
        />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Sürüm geçmişi</h2>
        {detail.versions.length === 0 ? (
          <p className="text-sm text-ink-muted">Henüz sürüm yok.</p>
        ) : (
          <ol className="space-y-1 text-sm">
            {detail.versions.map((version) => (
              <li key={version.version}>
                <span className="font-semibold">Sürüm {version.version}</span> — {formatDateTime(version.published_at)} ·{' '}
                {version.definition.fields.filter((field) => !field.hidden).length} görünür alan,{' '}
                {version.definition.fields.filter((field) => field.kind === 'custom').length} ek alan
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}
