import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-green text-white hover:bg-brand-green-dark',
  secondary: 'border border-brand-green text-brand-green hover:bg-brand-green-soft',
  ghost: 'text-brand-green hover:bg-brand-green-soft',
}

export function buttonClass(variant: Variant = 'primary', extra = ''): string {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${extra}`
}

interface ButtonLinkProps {
  /** Internal path built with localePath(), or an in-page anchor (#request). */
  to: string
  variant?: Variant
  className?: string
  children: ReactNode
}

export function ButtonLink({ to, variant = 'primary', className = '', children }: ButtonLinkProps) {
  const cls = buttonClass(variant, className)
  return to.startsWith('#') ? (
    <a href={to} className={cls}>
      {children}
    </a>
  ) : (
    <Link to={to} className={cls}>
      {children}
    </Link>
  )
}
