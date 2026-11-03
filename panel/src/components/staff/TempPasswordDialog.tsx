import { useState } from 'react'
import type { IssuedPassword } from '../../lib/staffAccount'
import { Dialog } from '../Dialog'
import { Button, Notice } from '../ui'

export type ShownPassword = IssuedPassword & { name: string }

interface TempPasswordDialogProps {
  issued: ShownPassword | null
  onClose: () => void
}

type CopyState = 'idle' | 'done' | 'failed'

const COPY_TEXT: Readonly<Record<CopyState, string>> = {
  idle: '',
  done: 'Kopyalandı.',
  failed: 'Kopyalanamadı; şifreyi seçip elle kopyalayın.',
}

/**
 * Shows a temporary password once. Closing drops it from the page state, so it cannot be shown
 * again; a forgotten one is replaced with "Geçici şifre ver".
 */
export function TempPasswordDialog({ issued, onClose }: TempPasswordDialogProps) {
  const [copied, setCopied] = useState<CopyState>('idle')

  const close = () => {
    setCopied('idle')
    onClose()
  }

  const copy = async () => {
    if (!issued) return
    try {
      await navigator.clipboard.writeText(issued.password)
      setCopied('done')
    } catch {
      setCopied('failed')
    }
  }

  return (
    <Dialog open={issued !== null} title="Geçici şifre" onClose={close}>
      {issued && (
        <div className="space-y-4">
          <p className="text-sm">
            {issued.name} ({issued.email}){' '}
            {issued.created ? 'için giriş hesabı açıldı.' : 'için yeni geçici şifre oluşturuldu. Eski şifresi artık geçmez.'}
          </p>
          <div>
            <p className="text-sm font-medium text-ink-muted">Geçici şifre</p>
            <p className="mt-1 select-all rounded-lg border border-line bg-canvas px-4 py-3 text-center font-mono text-xl font-semibold tracking-wider text-ink">
              {issued.password}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => void copy()} autoFocus>
              Kopyala
            </Button>
            <span role="status" className="text-sm text-ink-muted">
              {COPY_TEXT[copied]}
            </span>
          </div>
          <Notice tone="info">
            Bu şifre bir daha gösterilmez. Kişiye telefonda ya da yüz yüze iletin, e-postayla göndermeyin. Kişi ilk girişte kendi
            şifresini belirler.
          </Notice>
          <div className="flex justify-end">
            <Button onClick={close}>Kapat</Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
