import { useEffect, useId, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Id of the text that explains the dialog, read out when it opens. */
  describedBy?: string
}

/**
 * A modal on the native <dialog>: showModal() traps focus and Escape closes it. Focus goes back to
 * whatever opened it, so keyboard users continue where they were.
 */
export function Dialog({ open, title, onClose, children, describedBy }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<Element | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      opener.current = document.activeElement
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleClose = () => {
    const target = opener.current
    if (target instanceof HTMLElement) target.focus()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      onClose={handleClose}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-line bg-white p-0 text-ink shadow-xl"
    >
      {open && (
        <div className="p-6">
          <h2 id={titleId} className="mb-4 text-lg font-semibold">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  )
}
