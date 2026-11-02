import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { AuthProvider } from './auth/AuthProvider'
import { configProblem } from './lib/supabase'
import { router } from './router'

/** Shown instead of the panel when the build has no Supabase settings (names only, never values). */
function SetupNeeded({ missing }: { missing: readonly string[] }) {
  return (
    <main className="mx-auto max-w-xl space-y-3 px-4 py-10">
      <h1 className="text-2xl font-bold">Panel ayarları eksik</h1>
      <p className="text-sm">
        Şu ortam değişkenleri tanımlı değil ya da geçersiz: <strong>{missing.join(', ')}</strong>. panel/.env.example
        dosyasına bakın.
      </p>
    </main>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

createRoot(root).render(
  <StrictMode>
    {configProblem ? (
      <SetupNeeded missing={configProblem} />
    ) : (
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    )}
  </StrictMode>,
)
