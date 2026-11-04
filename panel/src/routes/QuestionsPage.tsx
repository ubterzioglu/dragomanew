import { useCallback, useMemo, useState } from 'react'
import { useStaff } from '../auth/AuthProvider'
import { PageHeading } from '../components/PageHeading'
import { QuestionCard } from '../components/questions/QuestionCard'
import { Button, Loading, Notice } from '../components/ui'
import { listEntries, type AnswerEntry } from '../data/questions'
import { listStaffDirectory } from '../data/staff'
import { ALL_QUESTIONS, answeredCount, QUESTION_GROUPS } from '../lib/questions/catalog'
import { mergeEntries } from '../lib/questions/entries'
import { useAsyncData } from '../lib/useAsyncData'

interface Loaded {
  entries: AnswerEntry[]
  names: Map<string, string>
}

const NO_ENTRIES: readonly AnswerEntry[] = []

/** Questions are numbered straight through the groups. */
const QUESTION_NUMBERS = new Map(ALL_QUESTIONS.map((question, index) => [question.id, index + 1]))

async function loadAll(): Promise<Loaded> {
  // Names only decorate the answers; without them the answers must still show.
  const [entries, staff] = await Promise.all([listEntries(), listStaffDirectory().catch(() => [])])
  return { entries, names: new Map(staff.map((person) => [person.id, person.full_name])) }
}

/** /sorular: the open questions for Dragoman; any staff member adds answers under each. */
export function QuestionsPage() {
  const me = useStaff()
  const { state, reload } = useAsyncData('client-answer-entries', loadAll)
  // Entries saved on this screen, by id, so the card and the counter update at once.
  const [savedHere, setSavedHere] = useState<ReadonlyMap<string, AnswerEntry>>(new Map())

  const byQuestion = useMemo(() => mergeEntries(state.value?.entries ?? [], savedHere), [state.value, savedHere])
  const texts = useMemo(
    () => new Map([...byQuestion].map(([id, entries]) => [id, entries.map((entry) => entry.body).join('\n')])),
    [byQuestion],
  )
  const onSaved = useCallback((entry: AnswerEntry) => {
    setSavedHere((current) => new Map(current).set(entry.id, entry))
  }, [])

  const names = state.value?.names
  const authorName = useCallback(
    (staffId: string | null) => (staffId ? (names?.get(staffId) ?? null) : null),
    [names],
  )

  return (
    <div className="space-y-6">
      <PageHeading
        title="Dragoman soruları"
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
              {group.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  number={QUESTION_NUMBERS.get(question.id) ?? 0}
                  question={question}
                  entries={byQuestion.get(question.id) ?? NO_ENTRIES}
                  authorName={authorName}
                  myId={me.id}
                  onSaved={onSaved}
                />
              ))}
            </section>
          ))}
        </>
      )}
    </div>
  )
}
