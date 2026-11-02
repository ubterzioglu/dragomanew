import { useState } from 'react'
import { Link } from 'react-router'
import { PageHeading } from '../../components/PageHeading'
import { useCan } from '../../components/Shell'
import { Button, Card, Loading, Notice } from '../../components/ui'
import { listDrafts, reorderEntries } from '../../data/content/entries'
import { contentErrorMessage } from '../../lib/content/messages'
import {
  itemsInGroup,
  moveWithinGroup,
  orderChanged,
  orderItems,
  ORDER_TYPES,
  scopeKeys,
  type OrderItem,
  type OrderType,
} from '../../lib/content/ordering'
import { useAsyncData } from '../../lib/useAsyncData'

const CATEGORY_NAMES: Readonly<Record<string, string>> = { diving: 'Dalış', seaKayak: 'Deniz kanosu', outdoor: 'Doğa' }
const KIND_NAMES: Readonly<Record<string, string>> = { transfer: 'Ulaşım', lodging: 'Konaklama' }
const SECTION_TITLES: Readonly<Record<OrderType, string>> = {
  subgroup: 'Alt gruplar (kategori içinde)',
  event: 'Etkinlikler (alt grup içinde)',
  product: 'Kitaplar',
  team_member: 'Ekip',
  service_offer: 'Ulaşım ve konaklama',
}

type Lists = Record<OrderType, OrderItem[]>

async function loadOrder(): Promise<Lists> {
  const rows = await listDrafts(ORDER_TYPES)
  return Object.fromEntries(ORDER_TYPES.map((type) => [type, orderItems(type, rows)])) as Lists
}

/** /panel/icerik/siralama: Yukarı/Aşağı buttons (keyboard, no drag), sent as one `reorder` per type. */
export function OrderingPage() {
  const allowed = useCan()
  if (!allowed('content.publish')) {
    return (
      <div className="space-y-4">
        <PageHeading title="Sıralama" />
        <Notice tone="info">Sıralamayı yayın yetkisi olan kişiler değiştirir.</Notice>
      </div>
    )
  }
  return <Ordering />
}

function Ordering() {
  const { state, reload } = useAsyncData('content-order', loadOrder, contentErrorMessage)
  if (state.status === 'error') return <Notice tone="error">{state.message}</Notice>
  if (!state.value) return <Loading label="Sıralama yükleniyor…" />
  return <OrderEditor key={JSON.stringify(state.value)} saved={state.value} onSaved={reload} />
}

function OrderEditor({ saved, onSaved }: { saved: Lists; onSaved: () => void }) {
  const [lists, setLists] = useState<Lists>(saved)
  const [busy, setBusy] = useState<OrderType | null>(null)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)

  const subgroupTitles = Object.fromEntries(lists.subgroup.map((item) => [item.key, item.title]))
  const groupName = (type: OrderType, group: string): string => {
    if (type === 'subgroup') return CATEGORY_NAMES[group] ?? group
    if (type === 'event') return subgroupTitles[group] ?? (group || 'Alt grubu yok')
    if (type === 'service_offer') return KIND_NAMES[group] ?? group
    return ''
  }
  /** Event groups follow the subgroup order; others keep first-seen order. */
  const groupsOf = (type: OrderType): string[] => {
    const seen = [...new Set(lists[type].map((item) => item.group))]
    if (type !== 'event') return seen
    const bySubgroup = lists.subgroup.map((item) => item.key).filter((key) => seen.includes(key))
    return [...bySubgroup, ...seen.filter((group) => !bySubgroup.includes(group))]
  }

  const move = (type: OrderType, key: string, direction: -1 | 1) => {
    setLists((current) => ({ ...current, [type]: moveWithinGroup(current[type], key, direction) }))
    setFocusKey(`${type}:${key}:${direction}`)
  }

  const save = async (type: OrderType) => {
    setBusy(type)
    setMessage(null)
    try {
      const result = await reorderEntries(type, scopeKeys(lists[type]))
      setMessage({ tone: 'success', text: `${SECTION_TITLES[type]} sırası kaydedildi (yayın #${result.releaseId}). Site birkaç dakika içinde güncellenir.` })
      onSaved()
    } catch (error) {
      setMessage({ tone: 'error', text: contentErrorMessage(error) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/icerik" className="text-sm font-semibold text-brand-green-dark underline">
        ← İçerik
      </Link>
      <PageHeading title="Sıralama" />
      <p className="max-w-3xl text-sm text-ink-muted">
        Sıra her dilde aynıdır. Kaydet, sırayı hemen yayınlar; yeni sıra birkaç dakika içinde sitede görünür.
      </p>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {ORDER_TYPES.map((type) => {
        const changed = orderChanged(lists[type], saved[type])
        return (
          <Card key={type} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{SECTION_TITLES[type]}</h2>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={!changed || busy !== null} onClick={() => setLists((current) => ({ ...current, [type]: saved[type] }))}>
                  Geri al
                </Button>
                <Button disabled={!changed || busy !== null} onClick={() => void save(type)}>
                  {busy === type ? 'Kaydediliyor…' : 'Sırayı kaydet'}
                </Button>
              </div>
            </div>
            {lists[type].length === 0 && <p className="text-sm text-ink-muted">Kayıt yok.</p>}
            {groupsOf(type).map((group) => {
              const items = itemsInGroup(lists[type], group)
              const name = groupName(type, group)
              return (
                <div key={group || '-'} className="space-y-2">
                  {name && <h3 className="text-sm font-semibold text-ink-muted">{name}</h3>}
                  <ol className="space-y-1">
                    {items.map((item, index) => (
                      <li key={item.key} className="flex flex-wrap items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
                        <span className="w-6 text-ink-muted">{index + 1}.</span>
                        <span className="min-w-48 flex-1">{item.title}</span>
                        <OrderButton
                          label={`${item.title}: yukarı taşı`}
                          disabled={index === 0}
                          autoFocus={focusKey === `${type}:${item.key}:-1`}
                          onClick={() => move(type, item.key, -1)}
                        >
                          Yukarı
                        </OrderButton>
                        <OrderButton
                          label={`${item.title}: aşağı taşı`}
                          disabled={index === items.length - 1}
                          autoFocus={focusKey === `${type}:${item.key}:1`}
                          onClick={() => move(type, item.key, 1)}
                        >
                          Aşağı
                        </OrderButton>
                      </li>
                    ))}
                  </ol>
                </div>
              )
            })}
          </Card>
        )
      })}
    </div>
  )
}

/** Keeps keyboard focus on the moved item's button after the list re-renders. */
function OrderButton({
  label,
  disabled,
  autoFocus,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  autoFocus: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      ref={(node) => {
        if (autoFocus && node && document.activeElement !== node) node.focus()
      }}
      onClick={onClick}
      className="rounded border border-line-strong bg-white px-3 py-1 text-xs font-semibold disabled:opacity-50"
    >
      {children}
    </button>
  )
}
