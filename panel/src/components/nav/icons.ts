import {
  BookOpen,
  FileText,
  Image,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Rocket,
  Sparkles,
  SquareTerminal,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { NavIcon } from './navItems'

/** lucide icons are plain SVG elements (no inline style), so they fit the panel's CSP. */
export const NAV_ICONS: Readonly<Record<NavIcon, LucideIcon>> = {
  overview: LayoutDashboard,
  requests: Inbox,
  content: FileText,
  media: Image,
  publish: Rocket,
  forms: ListChecks,
  staff: Users,
  guide: BookOpen,
  changelog: Sparkles,
  developer: SquareTerminal,
}
