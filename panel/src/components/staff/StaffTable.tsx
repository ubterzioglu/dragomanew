import { useEffect, useRef, useState } from 'react'
import { updateStaff, type StaffPatch } from '../../data/staff'
import { friendlyError } from '../../lib/errors'
import { roleLabel } from '../../lib/labels'
import { tempPasswordNote } from '../../lib/staffAccount'
import { isStaffRole, STAFF_ROLES, type StaffAdminRow, type StaffRole } from '../../lib/types'
import { Dialog } from '../Dialog'
import { Button, Notice } from '../ui'
import { IssuePasswordAction } from './IssuePasswordAction'

interface StaffTableProps {
  rows: readonly StaffAdminRow[]
  myId: string
  onChanged: (message: string) => void
}

const cell = 'border-b border-line px-3 py-2 text-left align-middle'

/**
 * A role draft belongs to the row version it was picked on; once the row is saved (updated_at
 * moves), the old draft no longer applies and the select shows the stored role again.
 */
const draftKey = (row: StaffAdminRow): string => `${row.id}@${row.updated_at}`
const roleFieldId = (row: StaffAdminRow): string => `staff-role-${row.id}`

/**
 * Role change and (de)activation. Your own row is locked so nobody shuts themself out (the
 * database also keeps one active main_admin); deactivation asks first because it cuts access at once.
 * A role is saved with its own button, never on change: arrow keys on a closed select fire a
 * change per step in some browsers.
 */
export function StaffTable({ rows, myId, onChanged }: StaffTableProps) {
  const [confirming, setConfirming] = useState<StaffAdminRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Readonly<Record<string, StaffRole>>>({})
  /** A role field to focus once it is enabled again (it is disabled while its row saves). */
  const refocusId = useRef<string | null>(null)

  useEffect(() => {
    if (!refocusId.current || busyId !== null) return
    document.getElementById(refocusId.current)?.focus()
    refocusId.current = null
  })

  /** Resolves to true when the change was saved. */
  const apply = async (row: StaffAdminRow, patch: StaffPatch, message: string): Promise<boolean> => {
    setBusyId(row.id)
    setError(null)
    try {
      await updateStaff(row.id, patch)
      onChanged(message)
      return true
    } catch (updateError) {
      setError(friendlyError(updateError))
      return false
    } finally {
      setBusyId(null)
    }
  }

  const pickRole = (row: StaffAdminRow, role: string) => {
    if (isStaffRole(role)) setDrafts((current) => ({ ...current, [draftKey(row)]: role }))
  }

  const saveRole = async (row: StaffAdminRow, role: StaffRole) => {
    if (role === row.role) return
    const saved = await apply(row, { role }, `${row.full_name} artık ${roleLabel(role)} rolünde.`)
    // The save button goes away with the reload; keep keyboard focus on the row's role field. The
    // field is still disabled here (busy), so the effect above focuses it after the next render.
    if (saved) refocusId.current = roleFieldId(row)
  }

  const deactivate = async () => {
    if (!confirming) return
    const row = confirming
    setConfirming(null)
    await apply(row, { active: false }, `${row.full_name} pasifleştirildi; panel erişimi kapandı.`)
  }

  return (
    <div className="space-y-3">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="overflow-x-auto rounded-card border border-line bg-white">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Panel kullanıcıları</caption>
          <thead className="bg-brand-green-soft">
            <tr>
              <th scope="col" className={cell}>Ad soyad</th>
              <th scope="col" className={cell}>E-posta</th>
              <th scope="col" className={cell}>Rol</th>
              <th scope="col" className={cell}>Durum</th>
              <th scope="col" className={cell}>Hesap</th>
              <th scope="col" className={cell}><span className="sr-only">İşlem</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const self = row.id === myId
              const busy = busyId === row.id
              const draft = drafts[draftKey(row)] ?? row.role
              return (
                <tr key={row.id} className={row.active ? undefined : 'text-ink-muted'}>
                  <th scope="row" className={`${cell} font-semibold`}>
                    {row.full_name}
                    {self && <span className="ml-1 font-normal text-ink-muted">(siz)</span>}
                  </th>
                  <td className={`${cell} break-all`}>{row.email}</td>
                  <td className={cell}>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        id={roleFieldId(row)}
                        aria-label={`${row.full_name} rolü`}
                        value={draft}
                        disabled={self || busy}
                        onChange={(event) => pickRole(row, event.target.value)}
                        className="rounded-md border border-line-strong bg-white px-2 py-1"
                      >
                        {STAFF_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {roleLabel(role)}
                          </option>
                        ))}
                      </select>
                      {!self && draft !== row.role && (
                        <Button variant="secondary" disabled={busy} onClick={() => void saveRole(row, draft)}>
                          Rolü kaydet<span className="sr-only">: {row.full_name}</span>
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className={cell}>{row.active ? 'Etkin' : 'Pasif'}</td>
                  <td className={cell}>
                    {row.linked ? 'Bağlı' : 'İlk giriş bekleniyor'}
                    {tempPasswordNote(row) && <span className="block text-xs text-ink-muted">{tempPasswordNote(row)}</span>}
                  </td>
                  <td className={cell}>
                    {!self && (
                      <div className="flex flex-wrap items-start gap-2">
                        {row.active && <IssuePasswordAction row={row} disabled={busy} onIssued={onChanged} />}
                        {row.active ? (
                          <Button variant="danger" disabled={busy} onClick={() => setConfirming(row)}>
                            Pasifleştir<span className="sr-only">: {row.full_name}</span>
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            disabled={busy}
                            onClick={() => void apply(row, { active: true }, `${row.full_name} yeniden etkinleştirildi.`)}
                          >
                            Etkinleştir<span className="sr-only">: {row.full_name}</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={confirming !== null} title="Kullanıcıyı pasifleştir" onClose={() => setConfirming(null)}>
        <div className="space-y-4">
          <p className="text-sm">
            {confirming?.full_name} panele artık giremez ve hiçbir talebi göremez. Daha sonra yeniden etkinleştirebilirsiniz.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirming(null)} autoFocus>
              Vazgeç
            </Button>
            <Button variant="danger" onClick={() => void deactivate()}>
              Pasifleştir
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
