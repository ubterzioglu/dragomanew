import { useId, useState } from 'react'
import { addEntry, ANSWER_MAX, type AnswerEntry } from '../../data/questions'
import { friendlyError } from '../../lib/errors'
import type { Question } from '../../lib/questions/catalog'
import { Button, Card, fieldClass, Notice } from '../ui'
import { AnswerEntryItem } from './AnswerEntryItem'

interface QuestionCardProps {
  number: number
  question: Question
  /** This question's saved answers, oldest first. */
  entries: readonly AnswerEntry[]
  authorName: (staffId: string | null) => string | null
  myId: string
  /** A new or changed entry, as stored. */
  onSaved: (entry: AnswerEntry) => void
}

type SaveState = { status: 'idle' } | { status: 'saving' } | { status: 'done' } | { status: 'error'; message: string }

/**
 * One question with its saved answers and a box for a new one. "Kaydet" adds the text as a new
 * answer under "Yanıtınız" and empties the box, so anyone can add to a question again and again.
 */
export function QuestionCard({ number, question, entries, authorName, myId, onSaved }: QuestionCardProps) {
  const baseId = useId()
  const titleId = `${baseId}-baslik`
  const headingId = `${baseId}-yanitlar`
  const fieldId = `${baseId}-yeni`
  const addLabelId = `${baseId}-yeni-etiket`
  const [draft, setDraft] = useState('')
  const [save, setSave] = useState<SaveState>({ status: 'idle' })
  const saving = save.status === 'saving'
  const hasDraft = draft.trim() !== ''
  const answered = entries.length > 0

  const submit = async () => {
    setSave({ status: 'saving' })
    try {
      onSaved(await addEntry(question.id, draft.trim()))
      setDraft('')
      setSave({ status: 'done' })
    } catch (error: unknown) {
      setSave({ status: 'error', message: friendlyError(error) })
    }
  }

  const statusText = saving
    ? 'Kaydediliyor…'
    : hasDraft
      ? 'Kaydedilmemiş yanıt var.'
      : save.status === 'done'
        ? 'Kaydedildi.'
        : ''

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={titleId} className="text-base font-semibold text-ink">
          {number}. {question.title}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            answered ? 'bg-brand-green-soft text-brand-green-dark' : 'bg-amber-50 text-amber-900'
          }`}
        >
          {answered ? 'Yanıtlandı' : 'Yanıt bekliyor'}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink">{question.text}</p>
      {question.points && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          {question.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      <p id={headingId} className="mt-4 text-sm font-medium text-ink">
        Yanıtınız
      </p>
      {answered && (
        <ol aria-labelledby={`${headingId} ${titleId}`} className="mt-2 space-y-2">
          {entries.map((entry) => (
            <AnswerEntryItem
              key={entry.id}
              entry={entry}
              author={authorName(entry.author_id)}
              mine={entry.author_id === myId}
              onEdited={onSaved}
            />
          ))}
        </ol>
      )}
      {answered && (
        <label id={addLabelId} htmlFor={fieldId} className="mt-3 block text-sm text-ink-muted">
          Yeni yanıt ekle
        </label>
      )}
      <textarea
        id={fieldId}
        aria-labelledby={`${answered ? addLabelId : headingId} ${titleId}`}
        rows={4}
        maxLength={ANSWER_MAX}
        value={draft}
        readOnly={saving}
        onChange={(event) => {
          setDraft(event.target.value)
          if (save.status !== 'idle' && !saving) setSave({ status: 'idle' })
        }}
        className={`${fieldClass} min-h-24 read-only:bg-canvas`}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={() => void submit()} disabled={!hasDraft || saving} aria-label={`Kaydet: ${question.title}`}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
        <span role="status" className={`text-sm ${hasDraft && !saving ? 'text-amber-900' : 'text-brand-green-dark'}`}>
          {statusText}
        </span>
      </div>
      {save.status === 'error' && (
        <div className="mt-3">
          <Notice tone="error">{save.message}</Notice>
        </div>
      )}
    </Card>
  )
}
