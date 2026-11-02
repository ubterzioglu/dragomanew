import { useState } from 'react'
import { useStaff } from '../../auth/AuthProvider'
import { claimRequest, handOverRequest, reassignRequest } from '../../data/requests'
import { friendlyError } from '../../lib/errors'
import { canClaim, canHandOver, canReassign, handoverCandidates } from '../../lib/permissions'
import type { RequestRow, StaffMember } from '../../lib/types'
import { Button, Notice } from '../ui'
import { StaffPickerDialog } from './StaffPickerDialog'

interface RequestActionsProps {
  request: RequestRow
  people: readonly StaffMember[]
  /** Called after a successful action with a message to announce. */
  onChanged: (message: string) => void
}

type Picker = 'hand_over' | 'reassign' | null

/** İşleme Al, Devret and Sorumlu değiştir; each shows only when the database would allow it. */
export function RequestActions({ request, people, onChanged }: RequestActionsProps) {
  const me = useStaff()
  const [picker, setPicker] = useState<Picker>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const showClaim = canClaim(me, request)
  const showHandOver = canHandOver(me, request)
  const showReassign = canReassign(me, request)
  if (!showClaim && !showHandOver && !showReassign) return null

  const claim = async () => {
    setBusy(true)
    setError(null)
    try {
      await claimRequest(request.id)
      onChanged(`${request.reference} işleme alındı; sorumlusu sizsiniz.`)
    } catch (claimError) {
      setError(friendlyError(claimError))
    } finally {
      setBusy(false)
    }
  }

  const move = async (staffId: string): Promise<string | null> => {
    try {
      if (picker === 'reassign') await reassignRequest(request.id, staffId)
      else await handOverRequest(request.id, staffId)
      const target = people.find((person) => person.id === staffId)?.full_name ?? 'seçilen kişi'
      setPicker(null)
      onChanged(`${request.reference} artık ${target} sorumluluğunda.`)
      return null
    } catch (moveError) {
      return friendlyError(moveError)
    }
  }

  // main_admin may also pick themself when reassigning; hand-over always goes to someone else.
  const candidates = handoverCandidates(people, request).filter(
    (person) => picker === 'reassign' || person.id !== me.id,
  )

  return (
    <div className="space-y-3">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-3">
        {showClaim && (
          <Button onClick={() => void claim()} disabled={busy}>
            {busy ? 'İşleme alınıyor…' : 'İşleme Al'}
          </Button>
        )}
        {showHandOver && (
          <Button variant="secondary" onClick={() => setPicker('hand_over')}>
            Devret
          </Button>
        )}
        {showReassign && (
          <Button variant="secondary" onClick={() => setPicker('reassign')}>
            Sorumlu değiştir
          </Button>
        )}
      </div>
      <StaffPickerDialog
        open={picker !== null}
        title={picker === 'reassign' ? `Sorumlu değiştir: ${request.reference}` : `Devret: ${request.reference}`}
        submitLabel={picker === 'reassign' ? 'Sorumluyu değiştir' : 'Devret'}
        candidates={candidates}
        onClose={() => setPicker(null)}
        onConfirm={move}
      />
    </div>
  )
}
