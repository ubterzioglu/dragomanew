import { useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, PenLine } from 'lucide-react'
import { PageHead } from '../../components/seo/PageHead'
import { Badge } from '../../components/ui/Badge'
import { buttonClass } from '../../components/ui/Button'
import type { LocalizedPaths } from '../../i18n/pages'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { TextField } from '../forms/Field'
import { DemoResult, useDemoSubmission } from '../forms/submission'
import type { SourceQuestion } from './healthFormSource'
import { healthAnswersSchema, healthForms, needsReview, type HealthFormKind } from './healthForms'

interface HealthFormPageProps {
  kind: HealthFormKind
  alternates: LocalizedPaths
}

/**
 * Sample view of the participant health form (V6 §6.1). In real use each
 * participant opens it from their own secure link after the activity/date is
 * confirmed. Here nothing is stored, sent or logged, and the page is noindex.
 */
export function HealthFormPage({ kind, alternates }: HealthFormPageProps) {
  const locale = useLocale()
  const ui = useUi()
  const idPrefix = useId()
  const form = healthForms[kind]
  const schema = useMemo(() => healthAnswersSchema(ui, form), [ui, form])
  const [reviewFlag, setReviewFlag] = useState(false)
  const { canSubmit, result, submissions, submit } = useDemoSubmission('health')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    // No answer is preselected: a blank is never treated as "No".
    defaultValues: { participantName: '', guardianName: '', answers: {} },
  })

  const onValid = async (values: { answers: Record<string, 'yes' | 'no' | null | undefined> }) => {
    setReviewFlag(needsReview(values.answers))
    await submit(values)
  }
  const title = `${ui.titles.participantForm} — ${ui.health.formKind[kind]}`
  const isTranslation = locale !== 'tr'

  // A render function, not a nested component: a component defined here would be
  // recreated on every render and remount the radios, losing keyboard focus.
  const renderQuestion = (question: SourceQuestion) => {
    const error = errors.answers?.[question.code]?.message
    const id = `${idPrefix}-${question.code}`
    return (
      <fieldset
        key={question.code}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`rounded-lg border px-4 py-3 ${question.parent ? 'ml-6 border-dashed' : ''} ${error ? 'border-red-700' : 'border-line'}`}
      >
        <legend className="sr-only">{question.text[locale]}</legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p aria-hidden="true" className="font-semibold">
            {question.text[locale]}
          </p>
          <div className="flex shrink-0 gap-2">
            {(['yes', 'no'] as const).map((answer) => (
              <label
                key={answer}
                className="flex min-h-11 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line-strong px-3 has-[:checked]:border-brand-green has-[:checked]:bg-brand-green-soft has-[:checked]:font-semibold"
              >
                <input type="radio" value={answer} className="size-4 accent-brand-green focus-visible:outline-brand-green" {...register(`answers.${question.code}`)} />
                {ui.health[answer]}
              </label>
            ))}
          </div>
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
      </fieldset>
    )
  }

  return (
    <>
      <PageHead title={title} description={ui.health.sampleNotice} alternates={alternates} alwaysNoindex />
      <div className="container-page max-w-4xl py-10">
        <div className="flex flex-wrap gap-2">
          <Badge tone="sample">{ui.sample.badge}</Badge>
          {isTranslation && <Badge tone="sample">{ui.sample.sampleTranslation}</Badge>}
        </div>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-2 text-lg text-ink-muted">{form.title[locale]}</p>
        <p className="mt-6 rounded-card bg-brand-orange-soft p-4 text-brand-orange-ink">{ui.health.sampleNotice}</p>

        <div className="mt-8 space-y-3 text-ink">
          {form.intro.map((paragraph, index) => (
            <p key={paragraph.tr} className={index === 0 ? 'font-semibold' : ''}>
              {paragraph[locale]}
            </p>
          ))}
        </div>

        <form method="post" noValidate onSubmit={handleSubmit(onValid)} className="mt-10 space-y-8">
          <h2 className="text-3xl font-bold">{form.sectionHeading[locale]}</h2>
          {form.groups.map((group) => (
            <section key={group.heading.tr} className="space-y-3">
              <h3 className="text-2xl font-semibold text-brand-green">{group.heading[locale]}</h3>
              {group.questions.map(renderQuestion)}
            </section>
          ))}

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id={`${idPrefix}-participant`} label={ui.health.participantName} error={errors.participantName?.message} {...register('participantName')} />
            <TextField id={`${idPrefix}-guardian`} label={ui.health.guardianName} optional {...register('guardianName')} />
          </div>

          <p className="flex gap-3 rounded-card border border-line bg-sand p-4">
            <PenLine aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-green" />
            <span>{ui.health.signatureNotice}</span>
          </p>

          <button type="submit" disabled={!canSubmit} className={buttonClass('primary', 'w-full sm:w-auto')}>
            {ui.health.submit}
          </button>
          {result && (
            <DemoResult key={submissions}>
              {reviewFlag && (
                <p className="mt-3 flex gap-3 rounded-card border border-brand-orange/40 bg-white p-4 text-ink">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-orange-ink" />
                  <span>{ui.health.reviewNotice}</span>
                </p>
              )}
              <p className="mt-3 text-sm">{ui.health.completeNotice}</p>
            </DemoResult>
          )}
        </form>
      </div>
    </>
  )
}
