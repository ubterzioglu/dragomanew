import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import { useUi } from '../../i18n/LocaleContext'

export type FormKind = 'event-request' | 'transport' | 'lodging' | 'contact' | 'health'

export type SubmitResult = { kind: 'demo' }

/** Stage B replaces the demo implementation with the real (server-validated) one. */
export interface FormSubmitter {
  submit(kind: FormKind, values: unknown): Promise<SubmitResult>
}

/**
 * Stage A: no network request, no storage (not even localStorage), no analytics.
 * The form only shows a clearly labelled sample result (guide §5).
 */
export const demoSubmitter: FormSubmitter = {
  submit: async () => ({ kind: 'demo' }),
}

const subscribeNever = () => () => {}

/** false in the prerendered HTML and during hydration, true once the client has taken over. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
}

/**
 * Submit state shared by all sample forms. The button stays disabled until
 * hydration: a prerendered form submitted without JS would do a native GET and
 * put names, e-mails and health answers into the URL. `ready` keeps the fields
 * disabled until then (DemoFormFields), because react-hook-form writes its default
 * values back as it hydrates and would silently drop anything typed or picked earlier.
 */
export function useDemoSubmission(kind: FormKind, submitter: FormSubmitter = demoSubmitter) {
  const hydrated = useHydrated()
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  // Used as the result's key so every submission remounts it and moves focus again.
  const [submissions, setSubmissions] = useState(0)

  const submit = async (values: unknown): Promise<void> => {
    if (sending || !hydrated) return
    setSending(true)
    try {
      setResult(await submitter.submit(kind, values))
      setSubmissions((n) => n + 1)
    } finally {
      setSending(false)
    }
  }
  return { ready: hydrated, sending, canSubmit: hydrated && !sending, result, submissions, submit, reset: () => setResult(null) }
}

/**
 * Holds a sample form's contents, disabled until hydration (useDemoSubmission's `ready`).
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

/**
 * Announces the sample result and moves focus to it so screen readers hear it.
 * Extra notices go in as children so they are read together with the result.
 */
export function DemoResult({ children }: { children?: ReactNode }) {
  const ui = useUi()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className="flex gap-3 rounded-card border-2 border-brand-orange bg-brand-orange-soft p-4 text-brand-orange-ink outline-none"
    >
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-bold">{ui.forms.demoResult}</p>
        <p className="mt-1 text-sm">{ui.forms.demoResultDetail}</p>
        {children}
      </div>
    </div>
  )
}
