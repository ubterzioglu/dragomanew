import { useId, useState, type FormEvent } from 'react'
import { addStaff } from '../../data/staff'
import { friendlyError } from '../../lib/errors'
import { roleLabel } from '../../lib/labels'
import { validateNewStaff, type NewStaffErrors, type NewStaffInput } from '../../lib/staffForm'
import { STAFF_ROLES } from '../../lib/types'
import { Button, Card, fieldClass, labelClass, Notice } from '../ui'

const EMPTY: NewStaffInput = { email: '', fullName: '', role: 'reservations' }
const FIELD_ORDER: readonly (keyof NewStaffInput)[] = ['email', 'fullName', 'role']

/** Adds a staff row; the person can then sign in with Google using that address. */
export function AddStaffForm({ onAdded }: { onAdded: (message: string) => void }) {
  const ids = { email: useId(), fullName: useId(), role: useId() }
  const [input, setInput] = useState<NewStaffInput>(EMPTY)
  const [errors, setErrors] = useState<NewStaffErrors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
      await addStaff(result.value)
      setInput(EMPTY)
      onAdded(`${result.value.full_name} eklendi. Google ile ${result.value.email} adresiyle giriş yapabilir.`)
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
            Google e-posta adresi
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
      </form>
    </Card>
  )
}
