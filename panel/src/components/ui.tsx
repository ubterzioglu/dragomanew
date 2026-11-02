import type { ButtonHTMLAttributes, ReactNode } from 'react'

/** Small shared pieces so every screen looks and announces the same way. */

type Variant = 'primary' | 'secondary' | 'danger'

const VARIANTS: Readonly<Record<Variant, string>> = {
  primary: 'bg-brand-green text-white hover:bg-brand-green-dark',
  secondary: 'border border-line-strong bg-white text-ink hover:bg-brand-green-soft',
  danger: 'border border-red-700 bg-white text-red-800 hover:bg-red-50',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

/** Errors interrupt (role="alert"); successes are announced politely. */
export function Notice({ tone, children }: { tone: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles = {
    error: 'border-red-700 bg-red-50 text-red-900',
    success: 'border-brand-green bg-brand-green-soft text-brand-green-dark',
    info: 'border-line-strong bg-white text-ink',
  }[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border-l-4 px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  )
}

export function Loading({ label = 'Yükleniyor…' }: { label?: string }) {
  return (
    <p role="status" className="py-6 text-sm text-ink-muted">
      {label}
    </p>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card border border-line bg-white p-5 ${className}`}>{children}</section>
}

export const fieldClass =
  'mt-1 block w-full rounded-md border border-line-strong bg-white px-3 py-2 text-sm text-ink aria-[invalid=true]:border-red-700'

export const labelClass = 'block text-sm font-medium text-ink'
