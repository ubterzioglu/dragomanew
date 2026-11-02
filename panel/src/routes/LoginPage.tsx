import { useState } from 'react'
import { useLocation } from 'react-router'
import { callbackErrorMessage } from '../auth/callbackError'
import { authRedirectUrl } from '../auth/redirect'
import { PageHeading } from '../components/PageHeading'
import { Button, Card, Notice } from '../components/ui'
import { devEmailLoginEnabled } from '../lib/env'
import { friendlyError } from '../lib/errors'
import { db } from '../lib/supabase'
import { DevEmailLogin } from './DevEmailLogin'

/**
 * The literal `import.meta.env.DEV` is replaced with `false` in production builds, so the bundler
 * drops the e-mail form entirely; the helper then checks the opt-in flag.
 */
const SHOW_DEV_EMAIL = import.meta.env.DEV && devEmailLoginEnabled(import.meta.env)

export function LoginPage() {
  const { search, hash } = useLocation()
  // A refused sign-in (e.g. an address that is not active staff) comes back with error fields;
  // without this the person would land here with no word of why.
  const [error, setError] = useState<string | null>(() => callbackErrorMessage(search, hash))
  const [busy, setBusy] = useState(false)

  const signInWithGoogle = async () => {
    setBusy(true)
    setError(null)
    try {
      const { error: oauthError } = await db().auth.signInWithOAuth({
        provider: 'google',
        // select_account: someone signed in to Google with the wrong account (the "Erişim yok" case)
        // must be able to pick the registered one instead of being sent straight back.
        options: { redirectTo: authRedirectUrl(), queryParams: { prompt: 'select_account' } },
      })
      // On success the browser is already leaving for Google; only failures land here.
      if (oauthError) throw oauthError
    } catch (oauthError) {
      setError(friendlyError(oauthError))
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeading title="Panel girişi" />
      <Card className="space-y-4">
        <p className="text-sm text-ink-muted">
          Panel yalnızca Dragoman çalışanları içindir. Kayıtlı Google hesabınızla giriş yapın; ardından doğrulama
          uygulamanızdaki kodu girmeniz istenir.
        </p>
        {error && <Notice tone="error">{error}</Notice>}
        <Button className="w-full" onClick={() => void signInWithGoogle()} disabled={busy}>
          {busy ? 'Google’a yönlendiriliyor…' : 'Google ile giriş yap'}
        </Button>
      </Card>
      {SHOW_DEV_EMAIL && <DevEmailLogin />}
    </div>
  )
}
