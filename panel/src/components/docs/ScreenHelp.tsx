import { ArrowRight, ChevronDown, CircleQuestionMark } from 'lucide-react'
import { Link } from 'react-router'
import type { GuideId } from '../nav/navItems'
import { guideSection } from '../../lib/docs/content'
import { Markdown } from './Markdown'

/**
 * "Bu ekran ne işe yarar?": the guide section's first paragraph in a native <details>, so it
 * opens with keyboard and screen readers without any script, plus a link to the full section.
 */
export function ScreenHelp({ id }: { id: GuideId }) {
  const section = guideSection(id)
  return (
    <details className="group mt-3 max-w-3xl rounded-lg border border-transparent open:border-line open:bg-white open:shadow-soft">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-brand-green hover:text-brand-green-dark group-open:px-4 group-open:pt-3 [&::-webkit-details-marker]:hidden">
        <CircleQuestionMark aria-hidden="true" className="size-4" />
        Bu ekran ne işe yarar?
        <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 px-4 pb-4 pt-2">
        {section?.summary ? (
          <Markdown>{section.summary}</Markdown>
        ) : (
          <p className="text-sm text-ink-muted">Bu ekranın kılavuz metni henüz yazılmadı.</p>
        )}
        <Link
          to={`/kilavuz#${id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-sea underline-offset-2 hover:underline"
        >
          Kılavuzun tamamı
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </details>
  )
}
