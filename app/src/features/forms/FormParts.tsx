import { useEffect, useRef, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, type LucideIcon } from 'lucide-react'
import { useUi } from '../../i18n/LocaleContext'

/**
 * Holds a form's contents, disabled until hydration (useFormSubmission's `ready`).
 * Disabled rather than inert: questions and labels stay readable, also to screen readers,
 * find-in-page and visitors without JavaScript; only the controls take no input yet.
 */
export function DemoFormFields({ ready, className, children }: { ready: boolean; className: string; children: ReactNode }) {
  return (
    <fieldset disabled={!ready} className={`min-w-0 ${className}`}>
      {children}
    </fieldset>
  )
}

export type ResultTone = 'notice' | 'success' | 'error'

const RESULT_TONES: Readonly<Record<ResultTone, { box: string; Icon: LucideIcon }>> = {
  notice: { box: 'border-brand-orange bg-brand-orange-soft text-brand-orange-ink', Icon: Info },
  success: { box: 'border-brand-green bg-brand-green-soft text-ink', Icon: CircleCheck },
  error: { box: 'border-red-700 bg-red-50 text-red-800', Icon: CircleAlert },
}

/**
 * Announces a form's result and moves focus to it so screen readers hear it.
 * Extra notices go in as children so they are read together with the title.
 */
export function ResultMessage({ tone, title, children }: { tone: ResultTone; title: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [])
  const { box, Icon } = RESULT_TONES[tone]
  return (
    <div ref={ref} role="status" tabIndex={-1} className={`flex gap-3 rounded-card border-2 p-4 outline-none ${box}`}>
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-bold">{title}</p>
        {children}
      </div>
    </div>
  )
}

/** The clearly labelled sample result (Stage A, and the health form). */
export function DemoResult({ children }: { children?: ReactNode }) {
  const ui = useUi()
  return (
    <ResultMessage tone="notice" title={ui.forms.demoResult}>
      <p className="mt-1 text-sm">{ui.forms.demoResultDetail}</p>
      {children}
    </ResultMessage>
  )
}
