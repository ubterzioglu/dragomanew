import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeading } from '../components/PageHeading'
import { Button, Card, Loading, Notice } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { qrImageSrc } from '../lib/qr'
import { db } from '../lib/supabase'
import { useAsyncData } from '../lib/useAsyncData'
import { CodeForm } from './CodeForm'

interface Enrolment {
  factorId: string
  qr: string
  secret: string
}

/** The verified TOTP factor, if any. listFactors() puts only verified ones under `totp`. */
async function verifiedFactorId(): Promise<string | null> {
  const { data, error } = await db().auth.mfa.listFactors()
  if (error) throw error
  return data.totp[0]?.id ?? null
}

/**
 * Starts a fresh TOTP enrolment. Earlier unfinished ones are removed first, so a reload never
 * piles up factors. It runs on a click, never in an effect (StrictMode would enrol twice).
 */
async function startEnrolment(): Promise<Enrolment> {
  const mfa = db().auth.mfa
  const listed = await mfa.listFactors()
  if (listed.error) throw listed.error
  const stale = listed.data.all.filter((factor) => factor.factor_type === 'totp' && factor.status === 'unverified')
  for (const factor of stale) {
    const removed = await mfa.unenroll({ factorId: factor.id })
    if (removed.error) throw removed.error
  }
  const { data, error } = await mfa.enroll({ factorType: 'totp', friendlyName: 'Dragoman Panel', issuer: 'Dragoman Panel' })
  if (error) throw error
  return { factorId: data.id, qr: qrImageSrc(data.totp.qr_code), secret: data.totp.secret }
}

export function TwoFactorPage() {
  const { signOut } = useAuth()
  const { state, reload } = useAsyncData('factors', verifiedFactorId)
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const begin = async () => {
    setBusy(true)
    setError(null)
    try {
      setEnrolment(await startEnrolment())
    } catch (enrolError) {
      setError(friendlyError(enrolError))
    } finally {
      setBusy(false)
    }
  }

  /** Success emits MFA_CHALLENGE_VERIFIED with an aal2 session; the gate then opens the panel. */
  const verify = async (factorId: string, code: string): Promise<string | null> => {
    try {
      const { error: verifyError } = await db().auth.mfa.challengeAndVerify({ factorId, code })
      return verifyError ? friendlyError(verifyError) : null
    } catch (verifyError) {
      return friendlyError(verifyError)
    }
  }

  const factorId = state.status === 'ready' ? state.value : null

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeading title="İki adımlı doğrulama" />
      {state.status === 'loading' && <Loading />}
      {state.status === 'error' && (
        // Without the factor list neither card can show, so the way out is a retry, not a reload.
        <div className="space-y-3">
          <Notice tone="error">{state.message}</Notice>
          <Button onClick={reload}>Tekrar dene</Button>
        </div>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      {factorId && (
        <Card className="space-y-4">
          <p className="text-sm">Doğrulama uygulamanızdaki (Google Authenticator, 1Password vb.) 6 haneli kodu girin.</p>
          <CodeForm onSubmit={(code) => verify(factorId, code)} />
        </Card>
      )}

      {state.status === 'ready' && !factorId && !enrolment && (
        <Card className="space-y-4">
          <p className="text-sm">
            Panel verilerine erişmek için hesabınıza bir doğrulama uygulaması bağlamanız gerekir. Bu işlem bir kez yapılır.
          </p>
          <Button onClick={() => void begin()} disabled={busy}>
            {busy ? 'Hazırlanıyor…' : 'Kurulumu başlat'}
          </Button>
        </Card>
      )}

      {enrolment && (
        <Card className="space-y-4">
          <h2 className="font-semibold">Uygulamayı bağlayın</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Doğrulama uygulamanızda yeni hesap ekleyin ve bu QR kodunu okutun.</li>
            <li>Okutamıyorsanız aşağıdaki anahtarı elle girin.</li>
            <li>Uygulamanın gösterdiği 6 haneli kodu girin.</li>
          </ol>
          <img
            src={enrolment.qr}
            alt="Doğrulama uygulaması için QR kodu"
            width={200}
            height={200}
            className="mx-auto size-50 bg-white"
          />
          <p className="text-sm">
            Anahtar: <code className="break-all rounded bg-brand-green-soft px-1 font-mono">{enrolment.secret}</code>
          </p>
          <CodeForm onSubmit={(code) => verify(enrolment.factorId, code)} />
        </Card>
      )}

      <Button variant="secondary" onClick={() => void signOut()}>
        Başka bir hesapla giriş yap
      </Button>
    </div>
  )
}
