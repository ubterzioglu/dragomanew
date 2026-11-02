import { useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buttonClass } from '../../components/ui/Button'
import { useUi } from '../../i18n/LocaleContext'
import { customDefaults, customError, CustomField, customRegisterOptions, isWideCustom } from './CustomField'
import { TextAreaField, TextField } from './Field'
import { FieldFlow, useFormDefinition, type FieldItem, type SiteForm } from './formDefinition'
import { FormResult } from './FormResult'
import { HoneypotField } from './HoneypotField'
import { contactSchema } from './schemas'
import { DemoFormFields } from './FormParts'
import { useFormSubmission } from './submission'

/** `form` is the page's published contact form; without it the built-in form is shown. */
export function ContactForm({ form }: { form?: SiteForm } = {}) {
  const ui = useUi()
  const idPrefix = useId()
  const definition = useFormDefinition('contact', form)
  const schema = useMemo(() => contactSchema(ui, definition.definition), [ui, definition.definition])
  const custom = customDefaults(definition.definition)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', subject: '', message: '', ...(Object.keys(custom).length > 0 ? { custom } : {}) },
  })
  const { ready, sending, canSubmit, result, submissions, submit, edited, honeypotRef } = useFormSubmission('contact', {
    onSent: reset,
    formVersion: definition.formVersion,
  })
  const field = (name: string) => `${idPrefix}-${name}`
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
      case 'phone':
        return { key: entry.key, node: <TextField id={field('phone')} label={label('phone', ui.forms.phone)} hint={hint('phone')} type="tel" autoComplete="tel" optional={!core('phone').required} error={errors.phone?.message} {...register('phone')} /> }
      case 'subject':
        return { key: entry.key, node: <TextField id={field('subject')} label={label('subject', ui.forms.subject)} hint={hint('subject')} optional={!core('subject').required} error={errors.subject?.message} {...register('subject')} /> }
      case 'message':
        return { key: entry.key, wide: true, node: <TextAreaField id={field('message')} label={label('message', ui.forms.message)} hint={hint('message')} error={errors.message?.message} {...register('message')} /> }
      default:
        return { key: entry.key, node: null }
    }
  })

  return (
    <form method="post" noValidate aria-busy={sending || undefined} onSubmit={handleSubmit(submit)} onChange={edited}>
      <DemoFormFields ready={ready} className="space-y-5">
        <FieldFlow items={items} />
        <HoneypotField ref={honeypotRef} />
        <button type="submit" disabled={!canSubmit} className={buttonClass('primary', 'w-full sm:w-auto')}>
          {sending ? ui.forms.sending : ui.forms.submit}
        </button>
        {result && <FormResult key={submissions} result={result} />}
      </DemoFormFields>
    </form>
  )
}
