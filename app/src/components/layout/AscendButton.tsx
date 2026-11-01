import { ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { useUi } from '../../i18n/LocaleContext'
import { useDiveScroll } from './useDiveScroll'

/**
 * "Going up" button above the depth gauge (UBT, 01.11.2026): the divers' thumbs-up, which under
 * water means "ascend", takes the page back to the top. Shown once the page is a screen down; focus
 * moves to the logo so keyboard users carry on from the top.
 */
export function AscendButton() {
  const ui = useUi()
  const [shown, setShown] = useState(false)
  useDiveScroll(() => setShown(window.scrollY > document.documentElement.clientHeight))

  if (!shown) return null

  const ascend = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    document.querySelector<HTMLElement>('header a')?.focus({ preventScroll: true })
  }

  return (
    <button
      type="button"
      onClick={ascend}
      aria-label={ui.a11y.ascend}
      title={ui.a11y.ascend}
      className="dive-ascend group fixed right-3 bottom-36 z-20 flex size-12 items-center justify-center rounded-full text-white md:right-6 md:bottom-16"
    >
      <ThumbsUp aria-hidden="true" className="size-6 transition-transform group-hover:-translate-y-1" />
    </button>
  )
}
