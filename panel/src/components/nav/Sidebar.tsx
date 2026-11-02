import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Brand, NavLinks, UserBox } from './NavMenu'
import { useCollapsed } from './useCollapsed'

/** Desktop (lg and up): a fixed left column, collapsible to icons; the choice is remembered. */
export function Sidebar() {
  const [collapsed, toggle] = useCollapsed()
  const label = collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-sidebar transition-[width] duration-200 lg:flex ${
        collapsed ? 'w-[4.75rem]' : 'w-64'
      }`}
    >
      <div className={`flex items-center gap-2 px-4 pb-2 pt-5 ${collapsed ? 'flex-col' : 'justify-between'}`}>
        <Brand collapsed={collapsed} />
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-expanded={!collapsed}
          title={label}
          className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-brand-green-soft hover:text-brand-green-dark"
        >
          <Icon aria-hidden="true" className="size-4" />
        </button>
      </div>
      <NavLinks collapsed={collapsed} />
      <UserBox collapsed={collapsed} />
    </aside>
  )
}
