import { useId, useState } from 'react'
import { attachScreenshots, createRevision } from '../../data/revisions'
import { revisionErrorMessage } from '../../lib/revisions/messages'
import { DEFAULT_URGENCY, newRequestProblem, TEXT_MAX, URGENCIES, type RevisionRequest } from '../../lib/revisions/model'
import { Button, Card, fieldClass, labelClass, Notice } from '../ui'
import { ScreenshotPicker } from './ScreenshotPicker'

interface NewRevisionFormProps {
  onCancel: () => void
  /** The request is saved; `problem` names what did not make it (a screenshot), if anything. */
  onCreated: (request: RevisionRequest, problem: string | null) => void
}

const urgencyText = (value: number): string => (value === 1 ? '1 (beklesin)' : value === 10 ? '10 (hemen)' : String(value))

/** "Yeni istek": description, urgency 1–10 and optional screenshots. The requester is the database's. */
export function NewRevisionForm({ onCancel, onCreated }: NewRevisionFormProps) {
  const baseId = useId()
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState(DEFAULT_URGENCY)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const problem = newRequestProblem(description, urgency)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError(null)
    let request: RevisionRequest
    try {
      request = await createRevision(description.trim(), urgency)
    } catch (createError) {
      setError(revisionErrorMessage(createError))
      setBusy(false)
      return
    }
    // The request stands even if a screenshot does not make it.
    let missing: string | null = null
    try {
      await attachScreenshots({ requestId: request.id, commentId: null }, files)
    } catch (uploadError) {
      missing = `İstek kaydedildi, ama ekran görüntülerinden en az biri eklenemedi: ${revisionErrorMessage(uploadError)} İsteği açıp yorumla ekleyebilirsiniz.`
    }
    setBusy(false)
    onCreated(request, missing)
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Yeni revizyon isteği</h2>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div>
          <label htmlFor={`${baseId}-aciklama`} className={labelClass}>
            Açıklama
          </label>
          <textarea
            id={`${baseId}-aciklama`}
            rows={5}
            maxLength={TEXT_MAX}
            value={description}
            readOnly={busy}
            placeholder="Ne değişsin? Hangi sayfada, hangi dilde? Şu an ne görüyorsunuz, ne görmek istiyorsunuz?"
            onChange={(event) => setDescription(event.target.value)}
            className={`${fieldClass} min-h-28 read-only:bg-canvas`}
          />
        </div>
        <div>
          <label htmlFor={`${baseId}-aciliyet`} className={labelClass}>
            Aciliyet
          </label>
          <select
            id={`${baseId}-aciliyet`}
            value={urgency}
            disabled={busy}
            onChange={(event) => setUrgency(Number(event.target.value))}
            className={`${fieldClass} sm:w-56`}
          >
            {URGENCIES.map((value) => (
              <option key={value} value={value}>
                {urgencyText(value)}
              </option>
            ))}
          </select>
        </div>
        <ScreenshotPicker files={files} onChange={setFiles} disabled={busy} />
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            {busy ? 'Gönderiliyor…' : 'İsteği gönder'}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Vazgeç
          </Button>
        </div>
      </form>
    </Card>
  )
}
