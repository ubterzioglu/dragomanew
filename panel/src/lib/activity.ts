import { actionLabel } from './labels'
import type { ActivityRow, StaffMember } from './types'

export type StaffNamer = (id: string | null) => string

/** Activity keeps staff ids; this turns them into names, flagging people who left. */
export function staffNamer(people: readonly StaffMember[]): StaffNamer {
  const byId = new Map(people.map((person) => [person.id, person]))
  return (id) => {
    if (!id) return '—'
    const person = byId.get(id)
    if (!person) return 'Bilinmeyen kullanıcı'
    return person.active ? person.full_name : `${person.full_name} (pasif)`
  }
}

export function describeActivity(row: ActivityRow, name: StaffNamer): string {
  switch (row.action) {
    case 'created':
      return 'Talep oluşturuldu'
    case 'claimed':
      return `${name(row.actor_id ?? row.to_staff)} talebi işleme aldı`
    case 'handed_over':
      return `${name(row.from_staff ?? row.actor_id)} talebi ${name(row.to_staff)} kişisine devretti`
    case 'reassigned':
      return `${name(row.actor_id)} sorumluyu değiştirdi: ${name(row.from_staff)} → ${name(row.to_staff)}`
    default:
      return actionLabel(row.action)
  }
}
