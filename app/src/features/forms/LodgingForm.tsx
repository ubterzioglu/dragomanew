import { useEffect, useId, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buttonClass } from '../../components/ui/Button'
import { useUi } from '../../i18n/LocaleContext'
import { formatTemplate } from '../../i18n/ui'
import { TextAreaField, TextField } from './Field'
import { FormResult } from './FormResult'
import { HoneypotField } from './HoneypotField'
import { lodgingSchema, MAX_CHILDREN } from './schemas'
import { DemoFormFields } from './FormParts'
import { useFormSubmission } from './submission'

// Also written into the markup, so the prerendered form shows what react-hook-form sets on hydration.
const LODGING_DEFAULTS = {
  fullName: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  adults: 2,
  children: 0,
  childAges: [] as number[],
  rooms: 1,
  preferences: '',
}

/** Accommodation request (guide §1): separate from transfers; asks each child's age. */
export function LodgingForm() {
  const ui = useUi()
  const idPrefix = useId()
  const schema = useMemo(() => lodgingSchema(ui), [ui])
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), shouldUnregister: true, defaultValues: LODGING_DEFAULTS })
  const { ready, sending, canSubmit, result, submissions, submit, edited, honeypotRef } = useFormSubmission('lodging', { onSent: reset })
  const childCount = useWatch({ control, name: 'children' })
  const visibleChildren = Number.isInteger(childCount) ? Math.min(Math.max(childCount, 0), MAX_CHILDREN) : 0
  const field = (name: string) => `${idPrefix}-${name}`
  // With childAges.N fields registered, the resolver files the array-level error under .root.
  const childAgesError = errors.childAges?.root?.message ?? errors.childAges?.message
  // Hidden age fields are unregistered slot by slot, which leaves holes; trim the array to what is shown.
  useEffect(() => {
    const ages = getValues('childAges') ?? []
    if (ages.length > visibleChildren) setValue('childAges', ages.slice(0, visibleChildren))
  }, [visibleChildren, getValues, setValue])
  const number = { type: 'number', step: 1, inputMode: 'numeric' } as const

  return (
    <form method="post" noValidate aria-busy={sending || undefined} onSubmit={handleSubmit(submit)} onChange={edited}>
      <DemoFormFields ready={ready} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id={field('in')} label={ui.forms.checkIn} type="date" error={errors.checkIn?.message} {...register('checkIn')} />
          <TextField id={field('out')} label={ui.forms.checkOut} type="date" error={errors.checkOut?.message} {...register('checkOut')} />
          <TextField id={field('adults')} label={ui.forms.adults} min={1} {...number} error={errors.adults?.message} defaultValue={LODGING_DEFAULTS.adults} {...register('adults', { valueAsNumber: true })} />
          <TextField id={field('children')} label={ui.forms.children} min={0} max={MAX_CHILDREN} {...number} error={errors.children?.message} defaultValue={LODGING_DEFAULTS.children} {...register('children', { valueAsNumber: true })} />
          <TextField id={field('rooms')} label={ui.forms.rooms} min={1} {...number} error={errors.rooms?.message} defaultValue={LODGING_DEFAULTS.rooms} {...register('rooms', { valueAsNumber: true })} />
        </div>

        {visibleChildren > 0 && (
          <div className="grid gap-4 rounded-card border border-line p-4 sm:grid-cols-3">
            {Array.from({ length: visibleChildren }, (_, index) => (
              <TextField
                key={index}
                id={field(`age-${index}`)}
                label={formatTemplate(ui.forms.childAge, { n: index + 1 })}
                min={0}
                max={17}
                {...number}
                error={errors.childAges?.[index]?.message}
                {...register(`childAges.${index}`, { valueAsNumber: true })}
              />
            ))}
            {childAgesError && <p className="text-sm font-semibold text-red-700 sm:col-span-3">{childAgesError}</p>}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id={field('name')} label={ui.forms.fullName} autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
          <TextField id={field('email')} label={ui.forms.email} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <TextField id={field('phone')} label={ui.forms.phone} type="tel" autoComplete="tel" optional {...register('phone')} />
        </div>
        <TextAreaField id={field('prefs')} label={ui.forms.lodgingPreferences} optional {...register('preferences')} />
        <HoneypotField ref={honeypotRef} />

        <p className="text-sm text-ink-muted">{ui.forms.lodgingNote}</p>
        <button type="submit" disabled={!canSubmit} className={buttonClass('primary', 'w-full sm:w-auto')}>
          {sending ? ui.forms.sending : ui.forms.submitRequest}
        </button>
        {result && <FormResult key={submissions} result={result} />}
      </DemoFormFields>
    </form>
  )
}
