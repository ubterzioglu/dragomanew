import { useState } from 'react'
import { issueTemporaryPassword } from '../../data/staff'
import { staffAccountErrorMessage } from '../../lib/staffAccount'
import type { StaffAdminRow } from '../../lib/types'
import { Dialog } from '../Dialog'
import { Button } from '../ui'
import { TempPasswordDialog, type ShownPassword } from './TempPasswordDialog'

interface IssuePasswordActionProps {
  row: StaffAdminRow
  disabled: boolean
  onIssued: (message: string) => void
}

/** "Geçici şifre ver" on a staff row: asks first, because any current password stops working at once. */
export function IssuePasswordAction({ row, disabled, onIssued }: IssuePasswordActionProps) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issued, setIssued] = useState<ShownPassword | null>(null)

  const issue = async () => {
    setConfirming(false)
    setBusy(true)
    setError(null)
    try {
      const result = await issueTemporaryPassword(row.id)
      setIssued({ ...result, name: row.full_name })
    } catch (issueError) {
      setError(staffAccountErrorMessage(issueError))
    } finally {
      setBusy(false)
    }
  }

  const closeResult = () => {
    setIssued(null)
    onIssued(`${row.full_name} için geçici şifre oluşturuldu.`)
  }

  return (
    <div>
      <Button variant="secondary" disabled={disabled || busy} onClick={() => setConfirming(true)}>
        {busy ? 'Oluşturuluyor…' : 'Geçici şifre ver'}
        <span className="sr-only">: {row.full_name}</span>
      </Button>
      {error && (
        <p role="alert" className="mt-1 max-w-56 text-sm text-red-800">
          {error}
        </p>
      )}
      <Dialog open={confirming} title="Geçici şifre ver" onClose={() => setConfirming(false)}>
        <div className="space-y-4">
          <p className="text-sm">
            {row.full_name} için yeni bir geçici şifre oluşturulacak. Varsa eski şifresi hemen geçersiz olur ve açık oturumları
            kapanır; kaydedilmemiş işleri kaybolabilir. Google ile yeniden girebilir. Kişi ilk girişte kendi şifresini belirler.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirming(false)} autoFocus>
              Vazgeç
            </Button>
            <Button onClick={() => void issue()}>Şifre oluştur</Button>
          </div>
        </div>
      </Dialog>
      <TempPasswordDialog issued={issued} onClose={closeResult} />
    </div>
  )
}
