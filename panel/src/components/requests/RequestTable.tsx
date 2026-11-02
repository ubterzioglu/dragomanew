import { Link } from 'react-router'
import type { StaffNamer } from '../../lib/activity'
import { formatDateTime } from '../../lib/format'
import { kindLabel, statusLabel } from '../../lib/labels'
import type { RequestRow } from '../../lib/types'

interface RequestTableProps {
  caption: string
  rows: readonly RequestRow[]
  selectedId: string | null
  linkFor: (id: string) => string
  name: StaffNamer
}

const cell = 'border-b border-line px-3 py-2 text-left align-top'

export function RequestTable({ caption, rows, selectedId, linkFor, name }: RequestTableProps) {
  if (rows.length === 0) return <p className="py-6 text-sm text-ink-muted">Bu sekmede talep yok.</p>

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-white">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-brand-green-soft text-ink">
          <tr>
            <th scope="col" className={cell}>Referans</th>
            <th scope="col" className={cell}>Tür</th>
            <th scope="col" className={cell}>Ad soyad</th>
            <th scope="col" className={cell}>Geliş</th>
            <th scope="col" className={cell}>Sorumlu</th>
            <th scope="col" className={cell}>Durum</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const selected = row.id === selectedId
            return (
              <tr key={row.id} className={selected ? 'bg-brand-orange-soft' : undefined}>
                <th scope="row" className={`${cell} font-semibold`}>
                  <Link
                    to={linkFor(row.id)}
                    aria-current={selected ? 'true' : undefined}
                    className="text-sea underline underline-offset-2"
                  >
                    {row.reference}
                  </Link>
                </th>
                <td className={cell}>{kindLabel(row.kind)}</td>
                <td className={cell}>{row.full_name}</td>
                <td className={cell}>{formatDateTime(row.created_at)}</td>
                <td className={cell}>{name(row.assignee_id)}</td>
                <td className={cell}>{statusLabel(row.status)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
