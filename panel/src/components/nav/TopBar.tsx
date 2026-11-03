import { ChevronRight, ExternalLink } from 'lucide-react'
import { useLocation } from 'react-router'
import { SITE_HOME, Slogan } from './branding'
import { NAV_ICONS } from './icons'
import { navTrail } from './navItems'

/** Soft wave lines on the right of the bar; decoration only, drawn with SVG (no inline style, CSP). */
function Waves() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 480 56"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-[30rem] text-white opacity-[0.08]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M0 14 C40 4 80 24 120 14 S200 4 240 14 S320 24 360 14 S440 4 480 14" />
      <path d="M0 28 C40 18 80 38 120 28 S200 18 240 28 S320 38 360 28 S440 18 480 28" />
      <path d="M0 42 C40 32 80 52 120 42 S200 32 240 42 S320 52 360 42 S440 32 480 42" />
    </svg>
  )
}

/**
 * Desktop (lg and up): a slim bar over every screen with where you are on the left and the brand
 * slogan and a link to the visitor site on the right. Below lg the mobile header takes its place.
 */
export function TopBar() {
  const { pathname } = useLocation()
  const trail = navTrail(pathname)
  const Icon = trail ? NAV_ICONS[trail.item.icon] : null

  return (
    <header className="sticky top-0 z-20 hidden lg:block">
      <div className="relative flex h-14 items-center justify-between gap-6 overflow-hidden bg-linear-to-r from-sea via-brand-green-dark to-brand-green-dark px-10 text-white">
        <Waves />
        {/* The page heading names the screen for screen readers; the trail is for the eye. */}
        <p aria-hidden="true" className="relative flex min-w-0 items-center gap-2 text-sm">
          {trail && Icon ? (
            <>
              <Icon aria-hidden="true" className="size-4 shrink-0 text-brand-orange-light" />
              <span className="text-white/75">{trail.group.label}</span>
              <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-white/50" />
              <span className="truncate font-semibold">{trail.item.label}</span>
            </>
          ) : (
            <span className="font-semibold">Dragoman Panel</span>
          )}
        </p>
        <div className="relative flex shrink-0 items-center gap-5">
          <Slogan tone="dark" className="text-[0.9375rem]" />
          <a
            href={SITE_HOME}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white transition-colors hover:border-brand-orange-light hover:bg-white/10 focus-visible:outline-white"
          >
            Siteyi aç
            <ExternalLink aria-hidden="true" className="size-3.5" />
            <span className="sr-only">(yeni sekmede açılır)</span>
          </a>
        </div>
      </div>
      <div aria-hidden="true" className="h-0.5 bg-canvas bg-linear-to-r from-brand-orange via-brand-orange-light to-transparent" />
    </header>
  )
}
