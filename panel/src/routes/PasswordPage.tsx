import { useId, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeading } from '../components/PageHeading'
import { Button, Card, fieldClass, labelClass, Notice } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { MIN_PASSWORD_LENGTH, validateNewPassword, type NewPasswordErrors } from '../lib/passwordForm'
import { db } from '../lib/supabase'

/**
 * "Şifre belirle / değiştir" for the signed-in person, so someone who signed in with Google can
 * also sign in with e-mail + password. Only the person's own account is changed (updateUser).
 */
export function PasswordPage() {
  const { session } = useAuth()
  const passwordId = useId()
  const confirmId = useId()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState<NewPasswordErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaved(false)
    const checked = validateNewPassword({ password, confirm })
    if (!checked.ok) {
      setFieldErrors(checked.errors)
      return
    }
    setFieldErrors({})
    setError(null)
    setBusy(true)
    try {
      const { error: updateError } = await db().auth.updateUser({ password: checked.value })
      if (updateError) throw updateError
      setPassword('')
      setConfirm('')
      setSaved(true)
    } catch (updateError) {
      setError(friendlyError(updateError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeading title="Şifre belirle / değiştir" description="E-posta ve şifreyle giriş için şifrenizi belirleyin." help="giris-ve-sifre" />
      <Card className="space-y-4">
        <p className="text-sm text-ink-muted">
          Bu şifreyle giriş sayfasında {session?.user.email ?? 'e-posta adresiniz'} ile de giriş yapabilirsiniz. En az{' '}
          {MIN_PASSWORD_LENGTH} karakter kullanın.
        </p>
        {error && <Notice tone="error">{error}</Notice>}
        {saved && <Notice tone="success">Şifreniz kaydedildi.</Notice>}
        <form onSubmit={(event) => void submit(event)} className="space-y-3" noValidate>
          <div>
            <label htmlFor={passwordId} className={labelClass}>
              Yeni şifre
            </label>
            <input
              id={passwordId}
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? `${passwordId}-error` : undefined}
              disabled={busy}
              className={fieldClass}
            />
            {fieldErrors.password && (
              <p id={`${passwordId}-error`} className="mt-1 text-sm text-red-800">
                {fieldErrors.password}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={confirmId} className={labelClass}>
              Yeni şifre (tekrar)
            </label>
            <input
              id={confirmId}
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              aria-invalid={fieldErrors.confirm ? true : undefined}
              aria-describedby={fieldErrors.confirm ? `${confirmId}-error` : undefined}
              disabled={busy}
              className={fieldClass}
            />
            {fieldErrors.confirm && (
              <p id={`${confirmId}-error`} className="mt-1 text-sm text-red-800">
                {fieldErrors.confirm}
              </p>
            )}
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? 'Kaydediliyor…' : 'Şifreyi kaydet'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
