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
import { describedBy, TextAreaField, TextField } from './Field'
import { PriceSummary } from './PriceSummary'
import { eventRequestSchema } from './schemas'
import { DemoResult, useDemoSubmission } from './submission'

/**
 * First short booking request (V6 §6): one event only, auto-selected. Name,
 * email, preferred date and party size are required; phone and message are
 * optional; multi-option events add a head count per option. No health data.
 */
export function EventRequestForm({ event }: { event: DragomanEvent }) {
  const ui = useUi()
  const locale = useLocale()
  const idPrefix = useId()
  const multi = needsDistribution(event.options)
  const showPrices = event.priceDisplay === 'numeric'
  const schema = useMemo(() => eventRequestSchema(ui, event.options), [ui, event.options])

  const {
    register,
    handleSubmit,
    setFocus,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      preferredDate: '',
      partySize: 2,
      message: '',
      // Every option starts at 0 so the visitor chooses; the sum check asks them to assign the whole party.
      distribution: multi ? Object.fromEntries(event.options.map((option) => [option.id, 0])) : undefined,
    },
  })
  const { canSubmit, result, submissions, submit } = useDemoSubmission('event-request')

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

  return (
    <form method="post" noValidate onSubmit={handleSubmit(submit, focusDistribution)} className="space-y-5">
      <p className="rounded-lg bg-sand px-4 py-3">
        <span className="text-sm text-ink-muted">{ui.forms.activity}{ui.typography.labelSeparator}</span>
        <span className="font-semibold">{pick(event.title, locale).value}</span>
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id={field('name')} label={ui.forms.fullName} autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <TextField id={field('email')} label={ui.forms.email} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField id={field('date')} label={ui.forms.preferredDate} type="date" error={errors.preferredDate?.message} {...register('preferredDate')} />
        <TextField
          id={field('party')}
          label={ui.forms.partySize}
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          error={errors.partySize?.message}
          {...register('partySize', { valueAsNumber: true })}
        />
      </div>

      {multi && (
        <fieldset aria-describedby={describedBy(field('dist'), distributionError, 'hint')} className="rounded-card border border-line p-4">
          <legend className="px-1 font-semibold">{ui.forms.distributionLegend}</legend>
          <p id={`${field('dist')}-hint`} className="text-sm text-ink-muted">
            {formatTemplate(ui.forms.distributionHint, { count: Number.isInteger(partySize) ? partySize : '…' })}
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

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id={field('phone')} label={ui.forms.phone} type="tel" autoComplete="tel" optional {...register('phone')} />
      </div>
      <TextAreaField id={field('message')} label={ui.forms.message} optional {...register('message')} />

      <p className="text-sm text-ink-muted">{ui.pages.requestNote}</p>
      <button type="submit" disabled={!canSubmit} className={buttonClass('primary', 'w-full sm:w-auto')}>
        {ui.forms.submitRequest}
      </button>
      {result && <DemoResult key={submissions} />}
    </form>
  )
}
