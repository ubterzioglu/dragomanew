import type { ReactNode } from 'react'

type BadgeTone = 'sample' | 'source' | 'neutral' | 'green'

const TONES: Record<BadgeTone, string> = {
  sample: 'bg-brand-orange-soft text-brand-orange-ink',
  source: 'bg-sand text-ink-muted ring-1 ring-line',
  neutral: 'bg-white/90 text-ink ring-1 ring-line',
  green: 'bg-brand-green-soft text-brand-green',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}
