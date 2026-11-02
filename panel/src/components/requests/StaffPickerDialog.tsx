import { useId, useState, type FormEvent } from 'react'
import { roleLabel } from '../../lib/labels'
import type { StaffMember } from '../../lib/types'
import { Dialog } from '../Dialog'
import { Button, fieldClass, labelClass, Notice } from '../ui'

interface StaffPickerDialogProps {
  open: boolean
  title: string
  submitLabel: string
  candidates: readonly StaffMember[]
  onClose: () => void
  /** Resolves to an error message, or null when done (the dialog then closes). */
  onConfirm: (staffId: string) => Promise<string | null>
}

/** Picks the staff member a request goes to (hand over or reassign). */
export function StaffPickerDialog({ open, title, submitLabel, candidates, onClose, onConfirm }: StaffPickerDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onClose}>
      <PickerForm submitLabel={submitLabel} candidates={candidates} onCancel={onClose} onConfirm={onConfirm} />
    </Dialog>
  )
}

function PickerForm({
  submitLabel,
  candidates,
  onCancel,
  onConfirm,
}: Omit<StaffPickerDialogProps, 'open' | 'title' | 'onClose'> & { onCancel: () => void }) {
  const selectId = useId()
  const [choice, setChoice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!choice) {
      setError('Bir kişi seçin.')
      return
    }
    setBusy(true)
    setError(null)
    const failure = await onConfirm(choice)
    setBusy(false)
    if (failure) setError(failure)
  }

  if (candidates.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Talebi alabilecek başka etkin kullanıcı yok.</p>
        <Button variant="secondary" onClick={onCancel} autoFocus>
          Kapat
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4" noValidate>
      {error && <Notice tone="error">{error}</Notice>}
      <div>
        <label htmlFor={selectId} className={labelClass}>
          Yeni sorumlu
        </label>
        <select
          id={selectId}
          value={choice}
          onChange={(event) => setChoice(event.target.value)}
          className={fieldClass}
          autoFocus
        >
          <option value="">Seçin…</option>
          {candidates.map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name} ({roleLabel(person.role)})
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Vazgeç
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Kaydediliyor…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
