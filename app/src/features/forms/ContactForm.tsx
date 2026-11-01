import { useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buttonClass } from '../../components/ui/Button'
import { useUi } from '../../i18n/LocaleContext'
import { TextAreaField, TextField } from './Field'
import { contactSchema } from './schemas'
import { DemoFormFields, DemoResult, useDemoSubmission } from './submission'

export function ContactForm() {
  const ui = useUi()
  const idPrefix = useId()
  const schema = useMemo(() => contactSchema(ui), [ui])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', subject: '', message: '' },
  })
  const { ready, canSubmit, result, submissions, submit } = useDemoSubmission('contact')
  const field = (name: string) => `${idPrefix}-${name}`

  return (
    <form method="post" noValidate onSubmit={handleSubmit(submit)}>
      <DemoFormFields ready={ready} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id={field('name')} label={ui.forms.fullName} autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
          <TextField id={field('email')} label={ui.forms.email} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <TextField id={field('phone')} label={ui.forms.phone} type="tel" autoComplete="tel" optional {...register('phone')} />
          <TextField id={field('subject')} label={ui.forms.subject} optional {...register('subject')} />
        </div>
        <TextAreaField id={field('message')} label={ui.forms.message} error={errors.message?.message} {...register('message')} />
        <button type="submit" disabled={!canSubmit} className={buttonClass('primary', 'w-full sm:w-auto')}>
          {ui.forms.submit}
        </button>
        {result && <DemoResult key={submissions} />}
      </DemoFormFields>
    </form>
  )
}
