import { z } from 'zod'
import type { UiStrings } from '../../i18n/ui'
import {
  SOURCE_CANDIDATE_QUESTIONS,
  SOURCE_HEADINGS,
  SOURCE_HISTORY_QUESTIONS,
  SOURCE_INTRO,
  SOURCE_TITLE,
  type SourceQuestion,
  type SourceText,
} from './healthFormSource'

export type HealthFormKind = 'diving' | 'outdoor'
export type HealthAnswer = 'yes' | 'no'

export interface HealthQuestionGroup {
  heading: SourceText
  questions: readonly SourceQuestion[]
}

export interface HealthFormDefinition {
  /** Separate record per form (V6 §6.1): editing one never touches the other. */
  id: string
  kind: HealthFormKind
  version: number
  title: SourceText
  intro: readonly SourceText[]
  sectionHeading: SourceText
  groups: readonly HealthQuestionGroup[]
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

function buildForm(kind: HealthFormKind): HealthFormDefinition {
  // structuredClone gives each form its own copy of the shared starting content.
  return deepFreeze(
    structuredClone({
      id: `health-form-${kind}`,
      kind,
      version: 1,
      title: SOURCE_TITLE,
      intro: SOURCE_INTRO,
      sectionHeading: SOURCE_HEADINGS.medicalHistory,
      groups: [
        { heading: SOURCE_HEADINGS.candidate, questions: SOURCE_CANDIDATE_QUESTIONS },
        { heading: SOURCE_HEADINGS.pastOrPresent, questions: SOURCE_HISTORY_QUESTIONS },
      ],
    }),
  )
}

export function createHealthForms(): Readonly<Record<HealthFormKind, HealthFormDefinition>> {
  return { diving: buildForm('diving'), outdoor: buildForm('outdoor') }
}

export const healthForms = createHealthForms()

export function allQuestions(form: HealthFormDefinition): SourceQuestion[] {
  return form.groups.flatMap((group) => group.questions)
}

/**
 * Every question needs the participant's own Yes or No; nothing is preselected
 * and a blank is never read as No. (Whether SF04–SF06 should depend on age is
 * an open decision, so all items are shown and required for now.)
 */
export function healthAnswersSchema(ui: UiStrings, form: HealthFormDefinition) {
  const codes = allQuestions(form).map((question) => question.code)
  return z
    .object({
      participantName: z.string().trim().min(1, ui.forms.errors.required),
      guardianName: z.string().trim().optional(),
      // An unchecked radio group arrives as null (or is absent): both mean "unanswered".
      answers: z.record(z.string(), z.enum(['yes', 'no']).nullable().optional()),
    })
    .superRefine((value, ctx) => {
      for (const code of codes) {
        if (value.answers[code] == null) {
          ctx.addIssue({ code: 'custom', path: ['answers', code], message: ui.health.unanswered })
        }
      }
    })
}

/** Any "Yes" marks the form for review by authorised staff — never an automatic accept or reject. */
export function needsReview(answers: Readonly<Record<string, HealthAnswer | null | undefined>>): boolean {
  return Object.values(answers).includes('yes')
}
