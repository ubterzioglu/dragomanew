import { useId, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buttonClass } from '../../components/ui/Button'
import { useUi } from '../../i18n/LocaleContext'
import { formatTemplate } from '../../i18n/ui'
import { TextAreaField, TextField } from './Field'
import { transportSchema } from './schemas'
import { DemoResult, useDemoSubmission } from './submission'

/** Transfer request (guide §1): its own form and its own request record. */
export function TransportForm() {
  const ui = useUi()
  const idPrefix = useId()
  const schema = useMemo(() => transportSchema(ui), [ui])
  const [seatCount, setSeatCount] = useState(1)
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    shouldUnregister: true,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      tripType: 'oneWay' as const,
      from: '',
      to: '',
      dateTime: '',
      returnDateTime: '',
      partySize: 2,
      childSeat: false,
      childSeatAges: [],
      note: '',
    },
  })
  const { canSubmit, result, submissions, submit } = useDemoSubmission('transport')
  const roundTrip = useWatch({ control, name: 'tripType' }) === 'roundTrip'
  const childSeat = useWatch({ control, name: 'childSeat' })
  const field = (name: string) => `${idPrefix}-${name}`
  // With childSeatAges.N fields registered, the resolver files the array-level error under .root.
  const childSeatAgesError = errors.childSeatAges?.root?.message ?? errors.childSeatAges?.message
  // Unregistering the last age field only deletes its slot, leaving a hole that fails validation invisibly.
  const removeSeat = () => {
    setValue('childSeatAges', (getValues('childSeatAges') ?? []).slice(0, seatCount - 1))
    setSeatCount((n) => n - 1)
  }

  return (
    <form method="post" noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
      <fieldset>
        <legend className="font-semibold">{ui.forms.tripType}</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {(['oneWay', 'roundTrip'] as const).map((type) => (
            <label key={type} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line-strong px-4 has-[:checked]:border-brand-green has-[:checked]:bg-brand-green-soft">
              <input type="radio" value={type} className="size-4 accent-brand-green" {...register('tripType')} />
              {ui.forms[type]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id={field('from')} label={ui.forms.from} error={errors.from?.message} {...register('from')} />
        <TextField id={field('to')} label={ui.forms.to} error={errors.to?.message} {...register('to')} />
        <TextField id={field('when')} label={ui.forms.dateTime} type="datetime-local" error={errors.dateTime?.message} {...register('dateTime')} />
        {roundTrip && (
          <TextField
            id={field('return')}
            label={ui.forms.returnDateTime}
            type="datetime-local"
            error={errors.returnDateTime?.message}
            {...register('returnDateTime')}
          />
        )}
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

      <div className="rounded-card border border-line p-4">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
          <input type="checkbox" className="size-5 accent-brand-green" {...register('childSeat')} />
          {ui.forms.childSeat}
        </label>
        {childSeat && (
          <fieldset className="mt-3">
            <legend className="text-sm font-semibold text-ink-muted">{ui.forms.childSeatAges}</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: seatCount }, (_, index) => (
                <TextField
                  key={index}
                  id={field(`seat-${index}`)}
                  label={formatTemplate(ui.forms.childAge, { n: index + 1 })}
                  type="number"
                  min={0}
                  max={17}
                  inputMode="numeric"
                  error={errors.childSeatAges?.[index]?.message}
                  {...register(`childSeatAges.${index}`, { valueAsNumber: true })}
                />
              ))}
            </div>
            <div className="mt-3 flex gap-3">
              <button type="button" className={buttonClass('ghost', 'min-h-10 px-3 text-sm')} onClick={() => setSeatCount((n) => n + 1)}>
                + {ui.forms.addChild}
              </button>
              {seatCount > 1 && (
                <button type="button" className={buttonClass('ghost', 'min-h-10 px-3 text-sm')} onClick={removeSeat}>
                  − {ui.forms.removeChild}
                </button>
              )}
            </div>
            {childSeatAgesError && <p className="mt-2 text-sm font-semibold text-red-700">{childSeatAgesError}</p>}
            <p className="mt-2 text-sm text-ink-muted">{ui.forms.childSeatNote}</p>
          </fieldset>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id={field('name')} label={ui.forms.fullName} autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <TextField id={field('email')} label={ui.forms.email} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField id={field('phone')} label={ui.forms.phone} type="tel" autoComplete="tel" optional {...register('phone')} />
      </div>
      <TextAreaField id={field('note')} label={ui.forms.message} optional {...register('note')} />

      <button type="submit" disabled={!canSubmit} className={buttonClass('primary', 'w-full sm:w-auto')}>
        {ui.forms.submitRequest}
      </button>
      {result && <DemoResult key={submissions} />}
    </form>
  )
}
