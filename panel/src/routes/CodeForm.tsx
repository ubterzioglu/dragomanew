import { useId, useState, type FormEvent } from 'react'
import { Button, fieldClass, labelClass } from '../components/ui'

const SIX_DIGITS = /^\d{6}$/

/** The 6-digit TOTP code field; `onSubmit` resolves to an error message or null. */
export function CodeForm({ onSubmit }: { onSubmit: (code: string) => Promise<string | null> }) {
  const id = useId()
  const errorId = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const digits = code.replace(/\s/g, '')
    if (!SIX_DIGITS.test(digits)) {
      setError('Kod 6 rakamdan oluşur.')
      return
    }
    setBusy(true)
    setError(null)
    const failure = await onSubmit(digits)
    setBusy(false)
    if (failure) {
      setError(failure)
      setCode('')
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3" noValidate>
      <div>
        <label htmlFor={id} className={labelClass}>
          Doğrulama kodu
        </label>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${fieldClass} font-mono tracking-widest`}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? 'Doğrulanıyor…' : 'Doğrula'}
      </Button>
    </form>
  )
}
