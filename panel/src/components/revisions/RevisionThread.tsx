import { useId, useState } from 'react'
import { editComment } from '../../data/revisions'
import type { StaffNamer } from '../../lib/activity'
import { formatDateTime } from '../../lib/format'
import { revisionErrorMessage } from '../../lib/revisions/messages'
import {
  commentProblem,
  describeStatusChange,
  TEXT_MAX,
  type RevisionAttachment,
  type RevisionComment,
  type ThreadEntry,
} from '../../lib/revisions/model'
import { Button, fieldClass, Notice } from '../ui'
import { Screenshots } from './Screenshots'

interface RevisionThreadProps {
  entries: readonly ThreadEntry[]
  urls: Readonly<Record<string, string>> | undefined
  urlsFailed: boolean
  name: StaffNamer
  myId: string
  onEdited: (message: string) => void
}

/** Comments with their screenshots and the status changes, oldest first. */
export function RevisionThread({ entries, urls, urlsFailed, name, myId, onEdited }: RevisionThreadProps) {
  if (entries.length === 0) return <p className="text-sm text-ink-muted">Henüz yorum yok.</p>
  return (
    <ol className="space-y-3">
      {entries.map((entry) =>
        entry.kind === 'status' ? (
          <li key={`durum-${entry.change.id}`} className="flex flex-wrap gap-x-2 px-1 text-sm text-ink-muted">
            <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
            <span>{describeStatusChange(entry.change, name)}</span>
          </li>
        ) : (
          <CommentItem
            key={`yorum-${entry.comment.id}`}
            comment={entry.comment}
            attachments={entry.attachments}
            urls={urls}
            urlsFailed={urlsFailed}
            author={name(entry.comment.author_id)}
            mine={entry.comment.author_id === myId}
            onEdited={onEdited}
          />
        ),
      )}
    </ol>
  )
}

interface CommentItemProps {
  comment: RevisionComment
  attachments: readonly RevisionAttachment[]
  urls: Readonly<Record<string, string>> | undefined
  urlsFailed: boolean
  author: string
  /** Only the author may change the text (the database refuses everyone else). */
  mine: boolean
  onEdited: (message: string) => void
}

function CommentItem({ comment, attachments, urls, urlsFailed, author, mine, onEdited }: CommentItemProps) {
  const fieldId = useId()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.body)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    const problem = commentProblem(draft)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await editComment(comment.id, draft.trim())
      setEditing(false)
      onEdited('Yorumunuz güncellendi.')
    } catch (saveError) {
      setError(revisionErrorMessage(saveError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="space-y-2 rounded-card border border-line/70 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{author}</span>
        <span className="text-xs text-ink-muted">
          <time dateTime={comment.created_at}>{formatDateTime(comment.created_at)}</time>
          {comment.edited_at ? ` · düzenlendi ${formatDateTime(comment.edited_at)}` : ''}
        </span>
      </div>
      {editing ? (
        <div className="space-y-2">
          <label htmlFor={fieldId} className="sr-only">
            Yorumu düzenle
          </label>
          <textarea
            id={fieldId}
            rows={4}
            maxLength={TEXT_MAX}
            value={draft}
            readOnly={busy}
            onChange={(event) => setDraft(event.target.value)}
            className={`${fieldClass} min-h-24 read-only:bg-canvas`}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save()} disabled={busy || draft.trim() === comment.body}>
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
        <p className="whitespace-pre-wrap break-words text-sm text-ink">{comment.body}</p>
      )}
      <Screenshots attachments={attachments} urls={urls} failed={urlsFailed} label={`${author} yorumunun ekran görüntüleri`} />
      {mine && !editing && (
        <button
          type="button"
          onClick={() => {
            setDraft(comment.body)
            setEditing(true)
          }}
          className="text-sm font-semibold text-brand-green-dark underline"
        >
          Düzenle
        </button>
      )}
      {error && <Notice tone="error">{error}</Notice>}
    </li>
  )
}
