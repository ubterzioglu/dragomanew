import { useCallback, useMemo, useState } from 'react'
import { PageHeading } from '../components/PageHeading'
import { QuestionCard } from '../components/questions/QuestionCard'
import { Button, Loading, Notice } from '../components/ui'
import { listAnswers, type ClientAnswer } from '../data/questions'
import { listStaffDirectory } from '../data/staff'
import { ALL_QUESTIONS, answeredCount, QUESTION_GROUPS } from '../lib/questions/catalog'
import { useAsyncData } from '../lib/useAsyncData'

interface Loaded {
  answers: ClientAnswer[]
  names: Map<string, string>
}

/** Questions are numbered straight through the groups. */
const QUESTION_NUMBERS = new Map(ALL_QUESTIONS.map((question, index) => [question.id, index + 1]))

async function loadAll(): Promise<Loaded> {
  // Names only decorate "Son kayıt"; without them the answers must still show.
  const [answers, staff] = await Promise.all([listAnswers(), listStaffDirectory().catch(() => [])])
  return { answers, names: new Map(staff.map((person) => [person.id, person.full_name])) }
}

/** /sorular: the open questions for Dragoman, each with an answer box any staff member can save. */
export function QuestionsPage() {
  const { state, reload } = useAsyncData('client-answers', loadAll)
  // Rows saved on this screen win over the loaded ones, so the card and the counter update at once.
  const [savedHere, setSavedHere] = useState<ReadonlyMap<string, ClientAnswer>>(new Map())

  const rows = useMemo(() => {
    const merged = new Map((state.value?.answers ?? []).map((row) => [row.question_id, row]))
    for (const [id, row] of savedHere) merged.set(id, row)
    return merged
  }, [state.value, savedHere])

  const texts = useMemo(() => new Map([...rows].map(([id, row]) => [id, row.answer])), [rows])
  const onSaved = useCallback((row: ClientAnswer) => {
    setSavedHere((current) => new Map(current).set(row.question_id, row))
  }, [])

  const names = state.value?.names

  return (
    <div className="space-y-6">
      <PageHeading
        title="Müşteri soruları"
        description="Sitenin yayına hazırlanması için Dragoman'dan beklenen bilgiler. Yanıtı bilen herkes yazıp kaydedebilir."
        help="musteri-sorulari"
      />
      {state.status === 'error' && (
        <div className="space-y-2">
          <Notice tone="error">{state.message}</Notice>
          <Button variant="secondary" onClick={reload}>
            Tekrar dene
          </Button>
        </div>
      )}
      {!state.value ? (
        state.status === 'loading' && <Loading label="Sorular yükleniyor…" />
      ) : (
        <>
          <Notice tone="info">
            {answeredCount(ALL_QUESTIONS, texts)} / {ALL_QUESTIONS.length} soru yanıtlandı. Şifre ya da kart bilgisi yazmayın.
          </Notice>
          {QUESTION_GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`grup-${group.id}`} className="space-y-3">
              <div>
                <h2 id={`grup-${group.id}`} className="text-lg font-bold text-ink">
                  {group.title}{' '}
                  <span className="text-sm font-normal text-ink-muted">
                    ({answeredCount(group.questions, texts)} / {group.questions.length})
                  </span>
                </h2>
                <p className="text-sm text-ink-muted">{group.note}</p>
              </div>
              {group.questions.map((question) => {
                const saved = rows.get(question.id)
                return (
                  <QuestionCard
                    key={question.id}
                    number={QUESTION_NUMBERS.get(question.id) ?? 0}
                    question={question}
                    saved={saved}
                    savedByName={saved?.updated_by ? (names?.get(saved.updated_by) ?? null) : null}
                    onSaved={onSaved}
                  />
                )
              })}
            </section>
          ))}
        </>
      )}
    </div>
  )
}
