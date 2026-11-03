import { useId, useState, type FormEvent } from 'react'
import { addStaff, issueTemporaryPassword } from '../../data/staff'
import { friendlyError } from '../../lib/errors'
import { roleLabel } from '../../lib/labels'
import { staffAccountErrorMessage } from '../../lib/staffAccount'
import { validateNewStaff, type NewStaffErrors, type NewStaffInput, type NewStaffRow } from '../../lib/staffForm'
import { STAFF_ROLES } from '../../lib/types'
import { Button, Card, fieldClass, labelClass, Notice } from '../ui'
import { TempPasswordDialog, type ShownPassword } from './TempPasswordDialog'

const EMPTY: NewStaffInput = { email: '', fullName: '', role: 'reservations' }
const FIELD_ORDER: readonly (keyof NewStaffInput)[] = ['email', 'fullName', 'role']

/**
 * Adds a staff row. With "Geçici şifre oluştur" the sign-in account is opened at once and its
 * temporary password shown once; otherwise the person signs in with Google using that address.
 */
export function AddStaffForm({ onAdded }: { onAdded: (message: string) => void }) {
  const ids = { email: useId(), fullName: useId(), role: useId(), password: useId() }
  const [input, setInput] = useState<NewStaffInput>(EMPTY)
  const [withPassword, setWithPassword] = useState(true)
  const [errors, setErrors] = useState<NewStaffErrors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [issued, setIssued] = useState<ShownPassword | null>(null)

  /** The row exists by now; a failed password leaves it in place, to be retried from the list. */
  const issueFor = async (id: string, row: NewStaffRow) => {
    try {
      const result = await issueTemporaryPassword(id)
      setIssued({ ...result, name: row.full_name })
      onAdded(`${row.full_name} eklendi ve geçici şifresi oluşturuldu.`)
    } catch (issueError) {
      setFailure(
        `${row.full_name} eklendi ama geçici şifre oluşturulamadı: ${staffAccountErrorMessage(issueError)} Listede Geçici şifre ver ile tekrar deneyin.`,
      )
      onAdded(`${row.full_name} eklendi.`)
    }
  }

  const update = (key: keyof NewStaffInput) => (value: string) => setInput((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const result = validateNewStaff(input)
    if (!result.ok) {
      setErrors(result.errors)
      // The field errors are not live regions, so take keyboard and screen reader users to the first one.
      const first = FIELD_ORDER.find((key) => result.errors[key])
      if (first) document.getElementById(ids[first])?.focus()
      return
    }
    setErrors({})
    setFailure(null)
    setBusy(true)
    try {
      const id = await addStaff(result.value)
      setInput(EMPTY)
      if (withPassword) await issueFor(id, result.value)
      else onAdded(`${result.value.full_name} eklendi. Google ile ${result.value.email} adresiyle giriş yapabilir.`)
    } catch (addError) {
      setFailure(friendlyError(addError))
    } finally {
      setBusy(false)
    }
  }

  const describe = (key: keyof NewStaffInput) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${ids[key]}-error` : undefined,
  })

  const errorText = (key: keyof NewStaffInput) =>
    errors[key] && (
      <p id={`${ids[key]}-error`} className="mt-1 text-sm text-red-800">
        {errors[key]}
      </p>
    )

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Kullanıcı ekle</h2>
      {failure && <Notice tone="error">{failure}</Notice>}
      <form onSubmit={(event) => void submit(event)} className="grid gap-4 md:grid-cols-[1fr_1fr_12rem_auto] md:items-start" noValidate>
        <div>
          <label htmlFor={ids.email} className={labelClass}>
            E-posta adresi
          </label>
          <input
            id={ids.email}
            type="email"
            autoComplete="off"
            value={input.email}
            onChange={(event) => update('email')(event.target.value)}
            className={fieldClass}
            {...describe('email')}
          />
          {errorText('email')}
        </div>
        <div>
          <label htmlFor={ids.fullName} className={labelClass}>
            Ad soyad
          </label>
          <input
            id={ids.fullName}
            autoComplete="off"
            value={input.fullName}
            onChange={(event) => update('fullName')(event.target.value)}
            className={fieldClass}
            {...describe('fullName')}
          />
          {errorText('fullName')}
        </div>
        <div>
          <label htmlFor={ids.role} className={labelClass}>
            Rol
          </label>
          <select
            id={ids.role}
            value={input.role}
            onChange={(event) => update('role')(event.target.value)}
            className={fieldClass}
            {...describe('role')}
          >
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
          {errorText('role')}
        </div>
        <Button type="submit" disabled={busy} className="md:mt-6">
          {busy ? 'Ekleniyor…' : 'Ekle'}
        </Button>
        <div className="flex items-start gap-2 md:col-span-4">
          <input
            id={ids.password}
            type="checkbox"
            checked={withPassword}
            onChange={(event) => setWithPassword(event.target.checked)}
            aria-describedby={`${ids.password}-hint`}
            className="mt-0.5 size-4 accent-brand-green"
          />
          <div className="text-sm">
            <label htmlFor={ids.password} className="font-medium">
              Geçici şifre oluştur
            </label>
            <p id={`${ids.password}-hint`} className="text-ink-muted">
              Kişi Google ile girmeyecekse işaretli bırakın. Şifre, eklemeden sonra bir kez gösterilir.
            </p>
          </div>
        </div>
      </form>
      <TempPasswordDialog issued={issued} onClose={() => setIssued(null)} />
    </Card>
  )
}
