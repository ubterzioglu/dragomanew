import { useId, useState } from 'react'
import { addComment, attachScreenshots } from '../../data/revisions'
import { revisionErrorMessage } from '../../lib/revisions/messages'
import { commentProblem, TEXT_MAX, type RevisionComment } from '../../lib/revisions/model'
import { Button, Card, fieldClass, labelClass, Notice } from '../ui'
import { ScreenshotPicker } from './ScreenshotPicker'

interface CommentFormProps {
  requestId: string
  /** The comment is saved; `problem` names what did not make it (a screenshot), if anything. */
  onPosted: (comment: RevisionComment, problem: string | null) => void
}

/** "Yorum ekle" under the thread, with optional screenshots; the author is the database's. */
export function CommentForm({ requestId, onPosted }: CommentFormProps) {
  const fieldId = useId()
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // A new picker after each post, so its own messages start empty too.
  const [round, setRound] = useState(0)

  const submit = async () => {
    const problem = commentProblem(body)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError(null)
    let comment: RevisionComment
    try {
      comment = await addComment(requestId, body.trim())
    } catch (postError) {
      setError(revisionErrorMessage(postError))
      setBusy(false)
      return
    }
    let missing: string | null = null
    try {
      await attachScreenshots({ requestId, commentId: comment.id }, files)
    } catch (uploadError) {
      missing = `Yorumunuz kaydedildi, ama ekran görüntülerinden en az biri eklenemedi: ${revisionErrorMessage(uploadError)}`
    }
    setBody('')
    setFiles([])
    setRound((current) => current + 1)
    setBusy(false)
    onPosted(comment, missing)
  }

  return (
    <Card className="space-y-3">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <label htmlFor={fieldId} className={`${labelClass} text-base font-semibold`}>
          Yorumunuz
        </label>
        <textarea
          id={fieldId}
          rows={4}
          maxLength={TEXT_MAX}
          value={body}
          readOnly={busy}
          onChange={(event) => setBody(event.target.value)}
          className={`${fieldClass} min-h-24 read-only:bg-canvas`}
        />
        <ScreenshotPicker key={round} files={files} onChange={setFiles} disabled={busy} />
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" disabled={busy}>
          {busy ? 'Ekleniyor…' : 'Yorum ekle'}
        </Button>
      </form>
    </Card>
  )
}
