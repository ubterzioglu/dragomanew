import { useId, useState } from 'react'
import { ANSWER_CHANGED, getAnswer, saveAnswer, type ClientAnswer } from '../../data/questions'
import { friendlyError } from '../../lib/errors'
import { formatDateTime } from '../../lib/format'
import { isAnswered, type Question } from '../../lib/questions/catalog'
import { Button, Card, fieldClass, Notice } from '../ui'

interface QuestionCardProps {
  number: number
  question: Question
  saved: ClientAnswer | undefined
  /** Name of the person who saved last, when known. */
  savedByName: string | null
  onSaved: (row: ClientAnswer) => void
}

type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'done' }
  | { status: 'conflict'; theirs: string }
  | { status: 'error'; message: string }

const isCode = (error: unknown, code: string): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: unknown }).code === code

/**
 * One question with its answer box. The draft stays local until "Kaydet" and the box is read-only
 * while saving. When someone else saved in between, the newer answer is shown and the draft kept,
 * so nothing is overwritten without the user seeing it first.
 */
export function QuestionCard({ number, question, saved, savedByName, onSaved }: QuestionCardProps) {
  const baseId = useId()
  const titleId = `${baseId}-baslik`
  const fieldId = `${baseId}-yanit`
  const storedAnswer = saved?.answer ?? ''
  const [draft, setDraft] = useState(storedAnswer)
  const [save, setSave] = useState<SaveState>({ status: 'idle' })
  const dirty = draft !== storedAnswer
  const saving = save.status === 'saving'

  const submit = async () => {
    setSave({ status: 'saving' })
    try {
      onSaved(await saveAnswer(question.id, draft, saved?.updated_at ?? null))
      setSave({ status: 'done' })
    } catch (error: unknown) {
      if (!isCode(error, ANSWER_CHANGED)) {
        setSave({ status: 'error', message: friendlyError(error) })
        return
      }
      try {
        const current = await getAnswer(question.id)
        if (current) onSaved(current)
        setSave({ status: 'conflict', theirs: current?.answer ?? '' })
      } catch (reloadError: unknown) {
        setSave({ status: 'error', message: friendlyError(reloadError) })
      }
    }
  }

  const statusText = saving
    ? 'Kaydediliyor…'
    : save.status === 'done' && !dirty
      ? 'Kaydedildi.'
      : dirty
        ? 'Kaydedilmemiş değişiklik var.'
        : ''

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={titleId} className="text-base font-semibold text-ink">
          {number}. {question.title}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isAnswered(storedAnswer) ? 'bg-brand-green-soft text-brand-green-dark' : 'bg-amber-50 text-amber-900'
          }`}
        >
          {isAnswered(storedAnswer) ? 'Yanıtlandı' : 'Yanıt bekliyor'}
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
      <label id={`${fieldId}-etiket`} htmlFor={fieldId} className="mt-4 block text-sm font-medium text-ink">
        Yanıtınız
      </label>
      <textarea
        id={fieldId}
        aria-labelledby={`${fieldId}-etiket ${titleId}`}
        rows={4}
        maxLength={20000}
        value={draft}
        readOnly={saving}
        onChange={(event) => {
          setDraft(event.target.value)
          if (save.status === 'done') setSave({ status: 'idle' })
        }}
        className={`${fieldClass} min-h-24 read-only:bg-canvas`}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={!dirty || saving} aria-label={`Kaydet: ${question.title}`}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
        <span role="status" className={`text-sm ${dirty && !saving ? 'text-amber-900' : 'text-brand-green-dark'}`}>
          {statusText}
        </span>
        {saved && (
          <span className="text-xs text-ink-muted">
            Son kayıt: {formatDateTime(saved.updated_at)}
            {savedByName ? ` · ${savedByName}` : ''}
          </span>
        )}
      </div>
      {save.status === 'conflict' && (
        <div className="mt-3">
          <Notice tone="error">
            <p>Bu soruyu siz yazarken başka biri yanıt kaydetti. Kayıtlı yanıt şu an:</p>
            <p className="mt-1 whitespace-pre-wrap italic">{save.theirs.trim() || '(boş)'}</p>
            <p className="mt-1">Sizin metniniz kutuda duruyor. İkisini karşılaştırıp kutudaki son hali kaydedin.</p>
          </Notice>
        </div>
      )}
      {save.status === 'error' && (
        <div className="mt-3">
          <Notice tone="error">{save.message}</Notice>
        </div>
      )}
    </Card>
  )
}
