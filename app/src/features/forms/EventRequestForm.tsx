import { useId, useMemo } from 'react'
import { useForm, useWatch, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buttonClass } from '../../components/ui/Button'
import type { DragomanEvent } from '../../content/schema'
import { pick } from '../../content/localize'
import { useLocale, useUi } from '../../i18n/LocaleContext'
import { formatTemplate } from '../../i18n/ui'
import { formatMoney } from '../../lib/format'
import { needsDistribution } from '../../lib/options'
import { customDefaults, customError, CustomField, customRegisterOptions, isWideCustom } from './CustomField'
import { describedBy, TextAreaField, TextField } from './Field'
import { FieldFlow, useFormDefinition, type FieldItem, type SiteForm } from './formDefinition'
import { FormResult } from './FormResult'
import { HoneypotField } from './HoneypotField'
import { PriceSummary } from './PriceSummary'
import { eventRequestSchema } from './schemas'
import { DemoFormFields } from './FormParts'
import { useFormSubmission } from './submission'

/**
 * First short booking request (V6 §6): one event only, auto-selected. Name,
 * email, preferred date and party size are required; phone and message are
 * optional; multi-option events add a head count per option. No health data.
 * `form` is the page's published event form; without it the built-in form is shown.
 */
export function EventRequestForm({ event, form }: { event: DragomanEvent; form?: SiteForm }) {
  const ui = useUi()
  const locale = useLocale()
  const idPrefix = useId()
  const multi = needsDistribution(event.options)
  const showPrices = event.priceDisplay === 'numeric'
  const definition = useFormDefinition('event', form)
  const schema = useMemo(() => eventRequestSchema(ui, event.options, definition.definition), [ui, event.options, definition.definition])
  const custom = customDefaults(definition.definition)

  // Also written into the markup, so the prerendered form shows what react-hook-form sets on hydration.
  const defaultValues = {
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    partySize: 2,
    message: '',
    // Every option starts at 0 so the visitor chooses; the sum check asks them to assign the whole party.
    distribution: multi ? Object.fromEntries(event.options.map((option) => [option.id, 0])) : undefined,
    ...(Object.keys(custom).length > 0 ? { custom } : {}),
  }
  const {
    register,
    handleSubmit,
    setFocus,
    control,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues })
  const { ready, sending, canSubmit, result, submissions, submit, edited, honeypotRef } = useFormSubmission('event-request', {
    eventId: event.id,
    onSent: reset,
    formVersion: definition.formVersion,
  })

  const partySize = useWatch({ control, name: 'partySize' })
  const distribution = useWatch({ control, name: 'distribution' })
  const onlyOption = event.options[0]
  const counts = multi
    ? (distribution ?? {})
    : onlyOption && Number.isInteger(partySize)
      ? { [onlyOption.id]: partySize }
      : {}
  const field = (name: string) => `${idPrefix}-${name}`
  // distribution is a record keyed by option id, so its own error message has to be read defensively.
  const rawDistributionError = errors.distribution?.message
  const distributionError = typeof rawDistributionError === 'string' ? rawDistributionError : errors.distribution?.root?.message
  // The sum error belongs to no single input, so react-hook-form cannot focus it; send focus to the first option.
  const focusDistribution = (invalid: FieldErrors) => {
    if (multi && invalid.distribution && onlyOption) setFocus(`distribution.${onlyOption.id}`)
  }

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
      case 'fullName':
        return { key: entry.key, node: <TextField id={field('name')} label={label('fullName', ui.forms.fullName)} hint={hint('fullName')} autoComplete="name" error={errors.fullName?.message} {...register('fullName')} /> }
      case 'email':
        return { key: entry.key, node: <TextField id={field('email')} label={label('email', ui.forms.email)} hint={hint('email')} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} /> }
      case 'preferredDate':
        return { key: entry.key, node: <TextField id={field('date')} label={label('preferredDate', ui.forms.preferredDate)} hint={hint('preferredDate')} type="date" error={errors.preferredDate?.message} {...register('preferredDate')} /> }
      case 'partySize':
        return {
          key: entry.key,
          node: (
            <TextField
              id={field('party')}
              label={label('partySize', ui.forms.partySize)}
              hint={hint('partySize')}
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              error={errors.partySize?.message}
              defaultValue={defaultValues.partySize}
              {...register('partySize', { valueAsNumber: true })}
            />
          ),
        }
      case 'distribution':
        // The price summary follows the head counts, so it moves with them.
        return {
          key: entry.key,
          wide: true,
          node: (
            <>
              {multi && (
                <fieldset aria-describedby={describedBy(field('dist'), distributionError, 'hint')} className="rounded-card border border-line p-4">
                  <legend className="px-1 font-semibold">{label('distribution', ui.forms.distributionLegend)}</legend>
                  <p id={`${field('dist')}-hint`} className="text-sm text-ink-muted">
                    {hint('distribution') ?? formatTemplate(ui.forms.distributionHint, { count: Number.isInteger(partySize) ? partySize : '…' })}
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {event.options.map((option) => (
                      <TextField
                        key={option.id}
                        id={field(`opt-${option.id}`)}
                        label={`${pick(option.name, locale).value}${showPrices && option.price !== null ? ` — ${formatMoney(option.price, option.currency, locale)}` : ''}`}
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        error={errors.distribution?.[option.id]?.message}
                        // The sum error belongs to the group; mark every option so the red border shows where to fix it.
                        aria-invalid={errors.distribution?.[option.id] || distributionError ? true : undefined}
                        defaultValue={defaultValues.distribution?.[option.id]}
                        {...register(`distribution.${option.id}`, { valueAsNumber: true })}
                      />
                    ))}
                  </div>
                  {distributionError && (
                    <p id={`${field('dist')}-error`} role="alert" className="mt-2 text-sm font-semibold text-red-700">
                      {distributionError}
                    </p>
                  )}
                </fieldset>
              )}
              <PriceSummary event={event} counts={counts} />
            </>
          ),
        }
      case 'phone':
        return { key: entry.key, node: <TextField id={field('phone')} label={label('phone', ui.forms.phone)} hint={hint('phone')} type="tel" autoComplete="tel" optional={!core('phone').required} error={errors.phone?.message} {...register('phone')} /> }
      case 'message':
        return { key: entry.key, wide: true, node: <TextAreaField id={field('message')} label={label('message', ui.forms.message)} hint={hint('message')} optional={!core('message').required} error={errors.message?.message} {...register('message')} /> }
      default:
        return { key: entry.key, node: null }
    }
  })

  return (
    <form method="post" noValidate aria-busy={sending || undefined} onSubmit={handleSubmit(submit, focusDistribution)} onChange={edited}>
      <DemoFormFields ready={ready} className="space-y-5">
        <p className="rounded-lg border border-line bg-sand px-4 py-3">
          <span className="text-sm text-ink-muted">{ui.forms.activity}{ui.typography.labelSeparator}</span>
          <span className="font-semibold">{pick(event.title, locale).value}</span>
        </p>

        <FieldFlow items={items} />
        <HoneypotField ref={honeypotRef} />

        <p className="text-sm text-ink-muted">{ui.pages.requestNote}</p>
        <button type="submit" disabled={!canSubmit} className={buttonClass('primary', 'w-full sm:w-auto')}>
          {sending ? ui.forms.sending : ui.forms.submitRequest}
        </button>
        {result && <FormResult key={submissions} result={result} />}
      </DemoFormFields>
    </form>
  )
}
