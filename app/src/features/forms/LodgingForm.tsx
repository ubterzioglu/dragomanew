import { useEffect, useId, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buttonClass } from '../../components/ui/Button'
import { useUi } from '../../i18n/LocaleContext'
import { formatTemplate } from '../../i18n/ui'
import { customDefaults, customError, CustomField, customRegisterOptions, isWideCustom } from './CustomField'
import { TextAreaField, TextField } from './Field'
import { FieldFlow, useFormDefinition, type FieldItem, type SiteForm } from './formDefinition'
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

/**
 * Accommodation request (guide §1): separate from transfers; asks each child's age.
 * `form` is the page's published lodging form; without it the built-in form is shown.
 */
export function LodgingForm({ form }: { form?: SiteForm } = {}) {
  const ui = useUi()
  const idPrefix = useId()
  const definition = useFormDefinition('lodging', form)
  const schema = useMemo(() => lodgingSchema(ui, definition.definition), [ui, definition.definition])
  const custom = customDefaults(definition.definition)
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    shouldUnregister: true,
    defaultValues: { ...LODGING_DEFAULTS, ...(Object.keys(custom).length > 0 ? { custom } : {}) },
  })
  const { ready, sending, canSubmit, result, submissions, submit, edited, honeypotRef } = useFormSubmission('lodging', {
    onSent: reset,
    formVersion: definition.formVersion,
  })
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
  const { label, hint, core } = definition

  const items = definition.fields.map((entry): FieldItem => {
    if (entry.kind === 'custom') {
      return {
        key: entry.key,
        wide: isWideCustom(entry),
        node: (
          <CustomField
            field={entry}
            id={field(entry.key)}
            label={label(entry.key, entry.label.tr)}
            hint={hint(entry.key)}
            error={customError(errors, entry.key)}
            registration={register(`custom.${entry.key}`, customRegisterOptions(entry.type))}
          />
        ),
      }
    }
    switch (entry.key) {
      case 'checkIn':
        return { key: entry.key, node: <TextField id={field('in')} label={label('checkIn', ui.forms.checkIn)} hint={hint('checkIn')} type="date" error={errors.checkIn?.message} {...register('checkIn')} /> }
      case 'checkOut':
        return { key: entry.key, node: <TextField id={field('out')} label={label('checkOut', ui.forms.checkOut)} hint={hint('checkOut')} type="date" error={errors.checkOut?.message} {...register('checkOut')} /> }
      case 'adults':
        return { key: entry.key, node: <TextField id={field('adults')} label={label('adults', ui.forms.adults)} hint={hint('adults')} min={1} {...number} error={errors.adults?.message} defaultValue={LODGING_DEFAULTS.adults} {...register('adults', { valueAsNumber: true })} /> }
      case 'children':
        // The ages follow once the row holding the child count has closed.
        return {
          key: entry.key,
          node: <TextField id={field('children')} label={label('children', ui.forms.children)} hint={hint('children')} min={0} max={MAX_CHILDREN} {...number} error={errors.children?.message} defaultValue={LODGING_DEFAULTS.children} {...register('children', { valueAsNumber: true })} />,
          after: visibleChildren > 0 && (
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
          ),
        }
      case 'rooms':
        return { key: entry.key, node: <TextField id={field('rooms')} label={label('rooms', ui.forms.rooms)} hint={hint('rooms')} min={1} {...number} error={errors.rooms?.message} defaultValue={LODGING_DEFAULTS.rooms} {...register('rooms', { valueAsNumber: true })} /> }
      case 'fullName':
        return { key: entry.key, node: <TextField id={field('name')} label={label('fullName', ui.forms.fullName)} hint={hint('fullName')} autoComplete="name" error={errors.fullName?.message} {...register('fullName')} /> }
      case 'email':
        return { key: entry.key, node: <TextField id={field('email')} label={label('email', ui.forms.email)} hint={hint('email')} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} /> }
      case 'phone':
        return { key: entry.key, node: <TextField id={field('phone')} label={label('phone', ui.forms.phone)} hint={hint('phone')} type="tel" autoComplete="tel" optional={!core('phone').required} error={errors.phone?.message} {...register('phone')} /> }
      case 'preferences':
        return { key: entry.key, wide: true, node: <TextAreaField id={field('prefs')} label={label('preferences', ui.forms.lodgingPreferences)} hint={hint('preferences')} optional={!core('preferences').required} error={errors.preferences?.message} {...register('preferences')} /> }
      default:
        return { key: entry.key, node: null }
    }
  })

  return (
    <form method="post" noValidate aria-busy={sending || undefined} onSubmit={handleSubmit(submit)} onChange={edited}>
      <DemoFormFields ready={ready} className="space-y-5">
        <FieldFlow items={items} />
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
