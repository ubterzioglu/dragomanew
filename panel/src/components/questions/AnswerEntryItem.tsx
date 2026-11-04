import { useEffect, useId, useRef, useState } from 'react'
import { ANSWER_MAX, editEntry, type AnswerEntry } from '../../data/questions'
import { friendlyError } from '../../lib/errors'
import { formatDateTime } from '../../lib/format'
import { Button, fieldClass, Notice } from '../ui'

interface AnswerEntryItemProps {
  entry: AnswerEntry
  /** Null when the name is not known (the staff list could not be read). */
  author: string | null
  /** Only the author may change the text (the database refuses everyone else). */
  mine: boolean
  onEdited: (entry: AnswerEntry) => void
}

/** One saved answer under a question: the text, when and by whom, and "Düzenle" for its author. */
export function AnswerEntryItem({ entry, author, mine, onEdited }: AnswerEntryItemProps) {
  const fieldId = useId()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.body)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unchanged = draft.trim() === entry.body.trim()
  // Keyboard focus follows the switch: into the box when editing opens, back to "Düzenle" after.
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  useEffect(() => {
    if (editing) fieldRef.current?.focus()
    else if (wasEditing.current) editButtonRef.current?.focus()
    wasEditing.current = editing
  }, [editing])

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      onEdited(await editEntry(entry.id, draft.trim()))
      setEditing(false)
    } catch (saveError: unknown) {
      setError(friendlyError(saveError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="space-y-2 rounded-lg border border-line/70 bg-canvas px-3 py-2">
      {editing ? (
        <div className="space-y-2">
          <label htmlFor={fieldId} className="sr-only">
            Yanıtı düzenle
          </label>
          <textarea
            ref={fieldRef}
            id={fieldId}
            rows={4}
            maxLength={ANSWER_MAX}
            value={draft}
            readOnly={busy}
            onChange={(event) => setDraft(event.target.value)}
            className={`${fieldClass} min-h-24 read-only:bg-canvas`}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save()} disabled={busy || unchanged || draft.trim() === ''}>
              {busy ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setEditing(false)
                setError(null)
              }}
            >
              Vazgeç
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm text-ink">{entry.body}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        <span>
          <time dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time>
          {author ? ` · ${author}` : ''}
          {entry.edited_at ? ` · düzenlendi ${formatDateTime(entry.edited_at)}` : ''}
        </span>
        {mine && !editing && (
          <button
            ref={editButtonRef}
            type="button"
            onClick={() => {
              setDraft(entry.body)
              setEditing(true)
            }}
            className="font-semibold text-brand-green-dark underline"
          >
            Düzenle<span className="sr-only">: {formatDateTime(entry.created_at)} tarihli yanıt</span>
          </button>
        )}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </li>
  )
}
