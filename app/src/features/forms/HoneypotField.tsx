import { useId, type Ref } from 'react'

/**
 * Bot trap: the `website` field of the request envelope; any value marks the sender as a bot.
 * - Moved off screen by a utility class: a style attribute would break the pages' CSP
 *   (style-src 'self'), and `hidden` (display: none) is skipped by many bots, which would then
 *   not take the bait. sr-only alone would leave it to screen readers and the Tab key.
 * - aria-hidden on the wrapper keeps it from screen readers, tabIndex -1 out of the keyboard
 *   order, autoComplete off away from autofill.
 * - Its label is never shown to or read out to a person, so it is not translated.
 * Rendered before the submit button, never first: e2e checks pick the form's first field and label.
 * Its value is read on submit (useFormSubmission's honeypotRef), outside react-hook-form.
 */
export function HoneypotField({ ref }: { ref: Ref<HTMLInputElement> }) {
  const id = useId()
  return (
    <div aria-hidden="true" className="absolute -left-[9999px]">
      <label htmlFor={id}>Website</label>
      <input ref={ref} id={id} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  )
}
