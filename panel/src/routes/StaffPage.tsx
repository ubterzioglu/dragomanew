import { useState } from 'react'
import { Navigate } from 'react-router'
import { useStaff } from '../auth/AuthProvider'
import { PageHeading } from '../components/PageHeading'
import { AddStaffForm } from '../components/staff/AddStaffForm'
import { StaffTable } from '../components/staff/StaffTable'
import { Loading, Notice } from '../components/ui'
import { listStaffAdmin } from '../data/staff'
import { can } from '../lib/permissions'
import { useAsyncData } from '../lib/useAsyncData'

/** main_admin only. Others are sent to the inbox; RLS refuses their writes regardless. */
export function StaffPage() {
  const me = useStaff()
  if (!can(me, 'staff.manage')) return <Navigate to="/" replace />
  return <StaffAdmin myId={me.id} />
}

function StaffAdmin({ myId }: { myId: string }) {
  const { state, reload } = useAsyncData('staff', listStaffAdmin)
  const [announcement, setAnnouncement] = useState<string | null>(null)

  const changed = (message: string) => {
    setAnnouncement(message)
    reload()
  }

  return (
    <div className="space-y-5">
      <PageHeading title="Kullanıcılar" description="Panel kullanıcılarını ekleyin, rollerini ve yetkilerini değiştirin." help="kullanicilar" />
      <p className="max-w-3xl text-sm text-ink-muted">
        Panele yalnızca burada etkin olan Google adresleri girebilir. Pasifleştirilen kişinin erişimi hemen kapanır.
      </p>
      {announcement && <Notice tone="success">{announcement}</Notice>}
      <AddStaffForm onAdded={changed} />
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {state.value ? (
        <StaffTable rows={state.value} myId={myId} onChanged={changed} />
      ) : (
        state.status === 'loading' && <Loading label="Kullanıcılar yükleniyor…" />
      )}
    </div>
  )
}
