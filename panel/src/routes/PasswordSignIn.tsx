import { useId, useState, type FormEvent } from 'react'
import { Button, fieldClass, labelClass, Notice } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { validateSignIn, type SignInErrors } from '../lib/passwordForm'
import { db } from '../lib/supabase'

/**
 * E-mail + password sign-in. On success Auth emits SIGNED_IN and the gate takes over (link the
 * account, read the staff row). A wrong address and a wrong password get the same message.
 */
export function PasswordSignIn({ disabled = false }: { disabled?: boolean }) {
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<SignInErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const checked = validateSignIn({ email, password })
    if (!checked.ok) {
      setFieldErrors(checked.errors)
      return
    }
    setFieldErrors({})
    setError(null)
    setBusy(true)
    try {
      const { error: signInError } = await db().auth.signInWithPassword(checked.value)
      if (signInError) throw signInError
    } catch (signInError) {
      setError(friendlyError(signInError))
      setPassword('')
    } finally {
      setBusy(false)
    }
  }

  const locked = busy || disabled

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3" noValidate aria-label="E-posta ve şifreyle giriş">
      {error && <Notice tone="error">{error}</Notice>}
      <div>
        <label htmlFor={emailId} className={labelClass}>
          E-posta
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
          disabled={locked}
          className={fieldClass}
        />
        {fieldErrors.email && (
          <p id={`${emailId}-error`} className="mt-1 text-sm text-red-800">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={passwordId} className={labelClass}>
          Şifre
        </label>
        <input
          id={passwordId}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={fieldErrors.password ? true : undefined}
          aria-describedby={fieldErrors.password ? `${passwordId}-error` : undefined}
          disabled={locked}
          className={fieldClass}
        />
        {fieldErrors.password && (
          <p id={`${passwordId}-error`} className="mt-1 text-sm text-red-800">
            {fieldErrors.password}
          </p>
        )}
      </div>
      <Button type="submit" variant="secondary" className="w-full" disabled={locked}>
        {busy ? 'Giriş yapılıyor…' : 'E-posta ile giriş yap'}
      </Button>
    </form>
  )
}
