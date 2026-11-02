import { useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buttonClass } from '../../components/ui/Button'
import { useUi } from '../../i18n/LocaleContext'
import { TextAreaField, TextField } from './Field'
import { FormResult } from './FormResult'
import { HoneypotField } from './HoneypotField'
import { contactSchema } from './schemas'
import { DemoFormFields } from './FormParts'
import { useFormSubmission } from './submission'

export function ContactForm() {
  const ui = useUi()
  const idPrefix = useId()
  const schema = useMemo(() => contactSchema(ui), [ui])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', subject: '', message: '' },
  })
  const { ready, sending, canSubmit, result, submissions, submit, edited, honeypotRef } = useFormSubmission('contact', { onSent: reset })
  const field = (name: string) => `${idPrefix}-${name}`

  return (
    <form method="post" noValidate aria-busy={sending || undefined} onSubmit={handleSubmit(submit)} onChange={edited}>
      <DemoFormFields ready={ready} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id={field('name')} label={ui.forms.fullName} autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
          <TextField id={field('email')} label={ui.forms.email} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <TextField id={field('phone')} label={ui.forms.phone} type="tel" autoComplete="tel" optional {...register('phone')} />
          <TextField id={field('subject')} label={ui.forms.subject} optional {...register('subject')} />
        </div>
        <TextAreaField id={field('message')} label={ui.forms.message} error={errors.message?.message} {...register('message')} />
        <HoneypotField ref={honeypotRef} />
        <button type="submit" disabled={!canSubmit} className={buttonClass('primary', 'w-full sm:w-auto')}>
          {sending ? ui.forms.sending : ui.forms.submit}
        </button>
        {result && <FormResult key={submissions} result={result} />}
      </DemoFormFields>
    </form>
  )
}
