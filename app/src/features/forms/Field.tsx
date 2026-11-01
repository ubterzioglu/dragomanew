import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useUi } from '../../i18n/LocaleContext'

// Focus uses the site-wide orange outline (3:1 on white, distinct from the red error border).
// scroll-mt keeps the label above the field clear of the sticky header when focus moves to an error.
const inputClass =
  'mt-1.5 block w-full scroll-mt-12 rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-base text-ink shadow-sm aria-[invalid=true]:border-red-700'

interface FieldShellProps {
  id: string
  label: string
  optional?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

/** Label + control + hint + error, wired with aria-describedby. */
export function FieldShell({ id, label, optional, error, hint, children }: FieldShellProps) {
  const ui = useUi()
  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-ink">
        {label}
        {optional && <span className="ml-1 text-sm font-normal text-ink-muted">({ui.forms.optional})</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export function describedBy(id: string, error?: string, hint?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; optional?: boolean; error?: string; hint?: string }

export function TextField({ id, label, optional, error, hint, ...input }: InputProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
      <input
        id={id}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        aria-required={!optional || undefined}
        {...input}
      />
    </FieldShell>
  )
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string; optional?: boolean; error?: string }

export function TextAreaField({ id, label, optional, error, ...textarea }: TextAreaProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} error={error}>
      <textarea
        id={id}
        rows={4}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error)}
        aria-required={!optional || undefined}
        {...textarea}
      />
    </FieldShell>
  )
}
