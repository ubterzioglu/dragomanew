import { useId, useState } from 'react'
import {
  EXTRA_PERMISSION_OPTIONS,
  grantedElsewhere,
  initiallyTicked,
  nextExtraPermissions,
  roleIncludes,
  samePermissions,
} from '../../lib/extraPermissions'
import { permissionLabel, roleLabel } from '../../lib/labels'
import type { StaffAdminRow } from '../../lib/types'
import { Dialog } from '../Dialog'
import { Button } from '../ui'

interface ExtraPermissionsActionProps {
  row: StaffAdminRow
  /** The button's id, so the table can give it focus back after the save. */
  buttonId: string
  disabled: boolean
  /**
   * Saves the new extra_permissions, built on the row version the dialog opened on (`seenUpdatedAt`),
   * so a row that changed meanwhile is not overwritten; the table reports the outcome.
   */
  onSave: (extras: string[], seenUpdatedAt: string) => void
}

/** The row as the dialog opened on it, and the boxes ticked since. */
interface Draft {
  role: StaffAdminRow['role']
  stored: readonly string[]
  updatedAt: string
  ticked: readonly string[]
}

/**
 * "Ek yetkiler" on a staff row: a box per offered permission. What the role brings already shows
 * ticked and locked; extras given another way are listed so they can be taken back. Kaydet stays
 * off until something changed.
 */
export function ExtraPermissionsAction({ row, buttonId, disabled, onSave }: ExtraPermissionsActionProps) {
  /** Null while the dialog is closed. A list reload while it is open does not change what it shows. */
  const [draft, setDraft] = useState<Draft | null>(null)
  const idPrefix = useId()
  const introId = `${idPrefix}-intro`
  const elsewhereHintId = `${idPrefix}-elsewhere`

  const open = () =>
    setDraft({
      role: row.role,
      stored: row.extra_permissions,
      updatedAt: row.updated_at,
      ticked: initiallyTicked(row.role, row.extra_permissions),
    })
  const close = () => setDraft(null)
  const toggle = (value: string, on: boolean) =>
    setDraft((current) =>
      current === null
        ? null
        : { ...current, ticked: on ? [...current.ticked, value] : current.ticked.filter((item) => item !== value) },
    )

  const role = draft?.role ?? row.role
  const elsewhere = draft ? grantedElsewhere(draft.role, draft.stored) : []
  const next = draft ? nextExtraPermissions(draft.role, draft.stored, draft.ticked) : null
  const changed = draft !== null && next !== null && !samePermissions(next, draft.stored)
  const isTicked = (value: string) => (draft?.ticked ?? []).includes(value)

  const save = () => {
    if (!draft || !next) return
    close()
    onSave(next, draft.updatedAt)
  }

  return (
    <div>
      <Button id={buttonId} variant="secondary" disabled={disabled} onClick={open}>
        Ek yetkiler<span className="sr-only">: {row.full_name}</span>
      </Button>
      <Dialog open={draft !== null} title={`${row.full_name}: ek yetkiler`} onClose={close} describedBy={introId}>
        <div className="space-y-4">
          <p id={introId} className="text-sm">
            İşaretlediğiniz yetkiler {roleLabel(role)} rolünün verdiklerine eklenir. Kişi değişikliği sayfayı yenileyince
            ya da en geç beş dakika içinde görür.
          </p>
          <fieldset className="space-y-3">
            <legend className="sr-only">Ek yetkiler</legend>
            {EXTRA_PERMISSION_OPTIONS.map(({ permission, description }) => {
              const byRole = roleIncludes(role, permission)
              return (
                <PermissionBox
                  key={permission}
                  id={`${idPrefix}-${permission}`}
                  label={permissionLabel(permission)}
                  note={byRole ? '(rolüyle gelir)' : undefined}
                  hint={description}
                  checked={byRole || isTicked(permission)}
                  disabled={byRole}
                  onChange={(on) => toggle(permission, on)}
                />
              )
            })}
          </fieldset>
          {elsewhere.length > 0 && (
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Başka yoldan verilmiş</legend>
              <p id={elsewhereHintId} className="text-sm text-ink-muted">
                Bunlar bu ekrandan verilemez. İşaretini kaldırıp kaydederseniz geri alınır.
              </p>
              {elsewhere.map((value) => (
                <PermissionBox
                  key={value}
                  id={`${idPrefix}-elsewhere-${value}`}
                  label={permissionLabel(value)}
                  describedBy={elsewhereHintId}
                  checked={isTicked(value)}
                  onChange={(on) => toggle(value, on)}
                />
              ))}
            </fieldset>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={close}>
              Vazgeç
            </Button>
            <Button disabled={!changed} onClick={save}>
              Kaydet
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

interface PermissionBoxProps {
  id: string
  label: string
  /** Muted text after the label, such as "(rolüyle gelir)". */
  note?: string
  /** A line under the label; or `describedBy` points at a shared one. */
  hint?: string
  describedBy?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

function PermissionBox({ id, label, note, hint, describedBy, checked, disabled = false, onChange }: PermissionBoxProps) {
  const hintId = hint ? `${id}-hint` : describedBy
  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={hintId}
        className="mt-0.5 size-4 accent-brand-green"
      />
      <div className="text-sm">
        <label htmlFor={id} className="font-medium">
          {label}
          {note && <span className="font-normal text-ink-muted"> {note}</span>}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}
