import { get, type FieldErrors, type UseFormRegisterReturn } from 'react-hook-form'
import type { CustomFieldType, CustomFormField, FormDefinition } from '../../shared/requests/forms.ts'
import { pick } from '../../content/localize'
import { useLocale } from '../../i18n/LocaleContext'
import { describedBy, FieldShell, inputClass, TextAreaField, TextField } from './Field'

/**
 * A field the panel added to a form (dalga2-sozlesme §8). The answer goes to `values.custom[key]`
 * and is validated by the same customValuesSchema on the site and in submit-request.
 */

interface CustomFieldProps {
  field: CustomFormField
  id: string
  label: string
  hint?: string
  error?: string
  registration: UseFormRegisterReturn
}

const blankToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value)

/** How each type's input value becomes the answer: blanks are "no answer", numbers are numbers. */
export function customRegisterOptions(type: CustomFieldType): { setValueAs?: (value: unknown) => unknown } {
  switch (type) {
    case 'number':
      return { setValueAs: (value: unknown) => (value === '' || value === null || value === undefined ? undefined : Number(value)) }
    case 'select':
    case 'date':
      return { setValueAs: blankToUndefined }
    default:
      return {}
  }
}

/** The answers a form starts with: unticked boxes, empty texts, no choice. */
export function customDefaults(definition: FormDefinition): Record<string, string | boolean | undefined> {
  const values: Record<string, string | boolean | undefined> = {}
  for (const field of definition.fields) {
    if (field.kind !== 'custom' || field.hidden) continue
    values[field.key] = field.type === 'checkbox' ? false : field.type === 'text' || field.type === 'textarea' ? '' : undefined
  }
  return values
}

/** The message filed under `custom.<key>`, if any. */
export function customError(errors: FieldErrors, key: string): string | undefined {
  const error: unknown = get(errors, `custom.${key}`)
  const message = typeof error === 'object' && error !== null && 'message' in error ? error.message : undefined
  return typeof message === 'string' ? message : undefined
}

/** Textareas and checkboxes take a whole row; the rest sit in the grid. */
export const isWideCustom = (field: CustomFormField): boolean => field.type === 'textarea' || field.type === 'checkbox'

export function CustomField({ field, id, label, hint, error, registration }: CustomFieldProps) {
  const locale = useLocale()
  const optional = !field.required
  switch (field.type) {
    case 'textarea':
      return <TextAreaField id={id} label={label} hint={hint} optional={optional} error={error} {...registration} />
    case 'checkbox':
      return (
        <div className="rounded-card border border-line p-4">
          <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
            <input
              id={id}
              type="checkbox"
              className="size-5 accent-brand-green"
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy(id, error, hint)}
              aria-required={field.required || undefined}
              {...registration}
            />
            {label}
          </label>
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
    case 'select':
      return (
        <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
          <select
            id={id}
            className={inputClass}
            defaultValue=""
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, error, hint)}
            aria-required={field.required || undefined}
            {...registration}
          >
            <option value="">—</option>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {pick(option.label, locale).value}
              </option>
            ))}
          </select>
        </FieldShell>
      )
    case 'number':
      return (
        <TextField
          id={id}
          label={label}
          hint={hint}
          optional={optional}
          error={error}
          type="number"
          step={1}
          inputMode="numeric"
          min={field.min}
          max={field.max}
          {...registration}
        />
      )
    case 'date':
      return <TextField id={id} label={label} hint={hint} optional={optional} error={error} type="date" {...registration} />
    case 'text':
      return <TextField id={id} label={label} hint={hint} optional={optional} error={error} {...registration} />
  }
}
