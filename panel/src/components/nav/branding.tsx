/**
 * Brand pieces shared by the sidebar, the mobile drawer and the top bar. The logo files belong to
 * the visitor site (app/public/brand); nginx serves them on the same host as /panel/, and the
 * panel's dev server reads them from the site's folder (vite.config.ts).
 */

export const LOGO_SRC = '/brand/dragoman-logo-240.webp'
export const LOGO_SRCSET = '/brand/dragoman-logo-240.webp 240w, /brand/dragoman-logo-480.webp 480w'

/** The visitor site's home page: the same host in production, the site's dev server locally. */
export const SITE_HOME = import.meta.env.DEV ? 'http://localhost:5173/' : '/'

/** The brand slogan, kept in English as written (owner's decision of 29 Oct 2026; never translated). */
export const SLOGAN = { first: 'Once a Dragoman,', second: 'always a Dragoman.' } as const

interface SloganProps {
  /** `dark` sits on the green top bar; `light` on the sand drawer. */
  tone: 'dark' | 'light'
  className?: string
}

export function Slogan({ tone, className = '' }: SloganProps) {
  const first = tone === 'dark' ? 'text-white/90' : 'text-brand-green-dark'
  const second = tone === 'dark' ? 'text-brand-orange-light' : 'text-brand-orange-ink'
  return (
    <p lang="en" className={`font-serif italic tracking-wide ${className}`}>
      <span className={first}>{SLOGAN.first}</span> <span className={second}>{SLOGAN.second}</span>
    </p>
  )
}
