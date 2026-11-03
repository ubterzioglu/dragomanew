import { useState } from 'react'
import { setRevisionStatus } from '../../data/revisions'
import { revisionErrorMessage } from '../../lib/revisions/messages'
import { statusActions, type RevisionRequest, type RevisionStatus } from '../../lib/revisions/model'
import { Button, Notice } from '../ui'

interface StatusActionsProps {
  request: RevisionRequest
  isMainAdmin: boolean
  /** After a successful change, with the id of the status-change row. */
  onChanged: (to: RevisionStatus, changeId: string) => void
}

/**
 * main_admin's status buttons, and "Yeniden aç" on a done request for everyone; set_revision_status
 * decides again on the server.
 */
export function StatusActions({ request, isMainAdmin, onChanged }: StatusActionsProps) {
  const [busy, setBusy] = useState<RevisionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const actions = statusActions(isMainAdmin, request.status)

  if (actions.length === 0) {
    return <p className="text-sm text-ink-muted">Durumu ana yönetici değiştirir. İstek tamamlanınca sorun sürüyorsa buradan yeniden açabilirsiniz.</p>
  }

  const change = async (to: RevisionStatus) => {
    setBusy(to)
    setError(null)
    try {
      onChanged(to, await setRevisionStatus(request.id, to))
    } catch (changeError) {
      setError(revisionErrorMessage(changeError))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.to}
            variant={action.to === 'done' || request.status === 'done' ? 'primary' : 'secondary'}
            onClick={() => void change(action.to)}
            disabled={busy !== null}
          >
            {busy === action.to ? 'Kaydediliyor…' : action.label}
          </Button>
        ))}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  )
}
