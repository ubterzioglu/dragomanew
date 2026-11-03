import { KeyRound, LogOut } from 'lucide-react'
import { useId } from 'react'
import { Link, NavLink } from 'react-router'
import { useAuth } from '../../auth/AuthProvider'
import { roleLabel } from '../../lib/labels'
import { useCan } from '../permissionsContext'
import { LOGO_SRC, LOGO_SRCSET } from './branding'
import { NAV_ICONS } from './icons'
import { visibleNav } from './navItems'

interface NavMenuProps {
  /** Icons only (desktop, collapsed): labels stay for screen readers and as tooltips. */
  collapsed?: boolean
  /** Called after a link is followed (the mobile drawer closes). */
  onNavigate?: () => void
}

const itemClass = (collapsed: boolean) =>
  ({ isActive }: { isActive: boolean }): string =>
    [
      'group flex min-h-10 items-center gap-3 rounded-lg text-sm font-medium transition-colors',
      collapsed ? 'justify-center px-0' : 'px-3',
      isActive
        ? 'bg-brand-green text-white shadow-soft'
        : 'text-ink-muted hover:bg-brand-green-soft hover:text-brand-green-dark',
    ].join(' ')

/** The grouped links; shared by the desktop sidebar and the mobile drawer. */
export function NavLinks({ collapsed = false, onNavigate }: NavMenuProps) {
  const { staff } = useAuth()
  const can = useCan()
  const groups = visibleNav({ can, role: staff?.role ?? null })
  const uid = useId()

  return (
    <nav aria-label="Panel menüsü" className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.id} className="mb-5 last:mb-0">
          <p
            id={`${uid}-${group.id}`}
            className={
              collapsed
                ? 'sr-only'
                : 'mb-1.5 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted/80'
            }
          >
            {group.label}
          </p>
          {collapsed && <div aria-hidden="true" className="mx-auto mb-2 h-px w-6 bg-line" />}
          <ul aria-labelledby={`${uid}-${group.id}`} className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = NAV_ICONS[item.icon]
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={itemClass(collapsed)}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon aria-hidden="true" className="size-[1.125rem] shrink-0" strokeWidth={2} />
                    <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Name, role, password link and sign-out at the foot of the menu. */
export function UserBox({ collapsed = false, onNavigate }: NavMenuProps) {
  const { staff, signOut } = useAuth()
  if (!staff) return null
  const initials = staff.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr') ?? '')
    .join('')
  const action =
    'flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-brand-green-soft hover:text-brand-green-dark'

  return (
    <div className="border-t border-line px-3 py-3">
      <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-1'}`}>
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-orange-soft text-xs font-bold text-brand-orange-ink"
        >
          {initials || '?'}
        </span>
        <div className={collapsed ? 'sr-only' : 'min-w-0'}>
          <p className="truncate text-sm font-semibold text-ink">{staff.full_name}</p>
          <p className="truncate text-xs text-ink-muted">{roleLabel(staff.role)}</p>
        </div>
      </div>
      <div className={`mt-2 flex gap-1 ${collapsed ? 'flex-col items-center' : ''}`}>
        <NavLink
          to="/sifre"
          onClick={onNavigate}
          title={collapsed ? 'Şifre' : undefined}
          className={({ isActive }) => `${action} ${collapsed ? 'justify-center px-0 w-10' : 'flex-1'} ${isActive ? 'bg-brand-green-soft text-brand-green-dark' : ''}`}
        >
          <KeyRound aria-hidden="true" className="size-4 shrink-0" />
          <span className={collapsed ? 'sr-only' : ''}>Şifre</span>
        </NavLink>
        <button
          type="button"
          onClick={() => void signOut()}
          title={collapsed ? 'Çıkış yap' : undefined}
          className={`${action} ${collapsed ? 'justify-center px-0 w-10' : 'flex-1'}`}
        >
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
          <span className={collapsed ? 'sr-only' : ''}>Çıkış yap</span>
        </button>
      </div>
    </div>
  )
}

/** The logo (or the "D" tile when the sidebar is collapsed); it leads back to the overview. */
export function Brand({ collapsed = false, onNavigate }: NavMenuProps) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      aria-label="Dragoman Panel: Genel bakış"
      title={collapsed ? 'Genel bakış' : undefined}
      className={`flex items-center gap-2.5 rounded-lg ${collapsed ? 'justify-center' : ''}`}
    >
      {collapsed ? (
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-green text-base font-bold text-white shadow-soft"
        >
          D
        </span>
      ) : (
        <>
          <img src={LOGO_SRC} srcSet={LOGO_SRCSET} sizes="83px" width={240} height={104} alt="" className="h-9 w-auto" />
          <span className="rounded-md bg-brand-orange-soft px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-brand-orange-ink">
            Panel
          </span>
        </>
      )}
    </Link>
  )
}
