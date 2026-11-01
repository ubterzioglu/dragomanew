import { ChevronDown } from 'lucide-react'

export interface FaqEntry {
  question: string
  answer: string
}

interface FaqListProps {
  items: readonly FaqEntry[]
}

/**
 * Native <details>: opens with keyboard (Enter/Space) and touch without
 * JavaScript, and the answers are part of the prerendered HTML (V6 §4.7).
 */
export function FaqList({ items }: FaqListProps) {
  if (items.length === 0) return null
  return (
    <div className="divide-y divide-line rounded-card border border-line bg-white">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-brand-green transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5 text-ink-muted">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
