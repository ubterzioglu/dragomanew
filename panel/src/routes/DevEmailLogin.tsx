import { useId, useState, type FormEvent } from 'react'
import { Button, Card, fieldClass, labelClass, Notice } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { db } from '../lib/supabase'
import { authRedirectUrl } from '../auth/redirect'

/**
 * Local development only (VITE_PANEL_DEV_EMAIL_LOGIN): signs in with the e-mail link read in
 * Mailpit. The local GoTrue templates carry only a link, no code, so there is no code field. The
 * auth hook still refuses non-staff addresses.
 */
export function DevEmailLogin() {
  const emailId = useId()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const sendLink = async (event: FormEvent) => {
    event.preventDefault()
    const address = email.trim().toLowerCase()
    setBusy(true)
    setError(null)
    try {
      const { error: sendError } = await db().auth.signInWithOtp({
        email: address,
        options: { emailRedirectTo: authRedirectUrl() },
      })
      if (sendError) throw sendError
      setSentTo(address)
    } catch (sendError) {
      setError(friendlyError(sendError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="space-y-4 border-dashed">
      <h2 className="font-semibold">Geliştirme girişi (e-posta)</h2>
      <p className="text-sm text-ink-muted">
        Yalnızca yerel ortamda görünür. Giriş e-postası Mailpit’e düşer (http://127.0.0.1:54324).
      </p>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={(event) => void sendLink(event)} className="space-y-3" noValidate>
        <div>
          <label htmlFor={emailId} className={labelClass}>
            E-posta
          </label>
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={busy || !email.trim()}>
          Giriş bağlantısı gönder
        </Button>
      </form>
      {sentTo && (
        <Notice tone="success">
          {sentTo} adresine giriş e-postası gönderildi. E-postanızdaki bağlantıya tıklayın.
        </Notice>
      )}
    </Card>
  )
}
