import type { Permission } from '../../lib/permissions'
import type { StaffRole } from '../../lib/types'

/**
 * The panel menu as plain data, so who sees what is tested without rendering. Visibility mirrors
 * what each screen allows; the database still decides every query, hiding an item is a convenience.
 */

export type NavIcon =
  | 'overview'
  | 'readme'
  | 'questions'
  | 'requests'
  | 'content'
  | 'media'
  | 'publish'
  | 'forms'
  | 'staff'
  | 'guide'
  | 'changelog'
  | 'developer'

/** File names under src/docs/kilavuz/ (without .md). */
export const GUIDE_IDS = [
  'genel-bakis',
  'talepler',
  'icerik',
  'siralama',
  'medya',
  'yayin',
  'formlar',
  'kullanicilar',
  'giris-ve-sifre',
  'musteri-sorulari',
  'sss',
] as const

export type GuideId = (typeof GUIDE_IDS)[number]

export type NavGroupId = 'genel' | 'icerik' | 'ayarlar' | 'yardim'

export interface NavAccess {
  can: (permission: Permission) => boolean
  role: StaffRole | null
}

export interface NavItem {
  to: string
  label: string
  icon: NavIcon
  /** One line under the label on the overview and in the guide list. */
  description: string
  guide?: GuideId
  /** NavLink `end`: only the exact path counts as active. */
  end?: boolean
  visible: (access: NavAccess) => boolean
}

export interface NavGroup {
  id: NavGroupId
  label: string
  items: readonly NavItem[]
}

const always = (): boolean => true
const contentWork = ({ can }: NavAccess): boolean => can('content.edit') || can('content.publish')

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    id: 'genel',
    label: 'Genel',
    items: [
      {
        to: '/',
        label: 'Genel bakış',
        icon: 'overview',
        description: 'Bekleyen işler ve son durum tek ekranda.',
        guide: 'genel-bakis',
        end: true,
        visible: always,
      },
      {
        to: '/beni-oku',
        label: 'Beni Oku!',
        icon: 'readme',
        description: 'Site, ekip ve çalışma kuralları hakkında bilinmesi gerekenler.',
        visible: always,
      },
      {
        to: '/sorular',
        label: 'Dragoman soruları',
        icon: 'questions',
        description: "Dragoman'dan beklenen bilgiler; yanıtı bilen yazıp kaydeder.",
        guide: 'musteri-sorulari',
        visible: always,
      },
      {
        to: '/talepler',
        label: 'Talepler',
        icon: 'requests',
        description: 'Siteden gelen talepleri işleme alın ve devredin.',
        guide: 'talepler',
        visible: always,
      },
    ],
  },
  {
    id: 'icerik',
    label: 'İçerik',
    items: [
      {
        to: '/icerik',
        label: 'İçerik',
        icon: 'content',
        description: 'Sayfa ve kayıtları düzenleyin, çevirin, yayınlayın.',
        guide: 'icerik',
        visible: contentWork,
      },
      {
        to: '/medya',
        label: 'Medya',
        icon: 'media',
        description: 'Görselleri yükleyin ve açıklamalarını yazın.',
        guide: 'medya',
        visible: contentWork,
      },
      {
        to: '/yayin',
        label: 'Yayın',
        icon: 'publish',
        description: 'Yayın geçmişi ve sitenin yeniden kurulması.',
        guide: 'yayin',
        visible: (access) => contentWork(access) || access.can('site.deploy'),
      },
    ],
  },
  {
    id: 'ayarlar',
    label: 'Ayarlar',
    items: [
      {
        to: '/formlar',
        label: 'Formlar',
        icon: 'forms',
        description: 'Talep formlarının alanlarını yönetin.',
        guide: 'formlar',
        visible: ({ can }) => can('forms.manage'),
      },
      {
        to: '/kullanicilar',
        label: 'Kullanıcılar',
        icon: 'staff',
        description: 'Panel kullanıcılarını ekleyin, rollerini değiştirin.',
        guide: 'kullanicilar',
        visible: ({ can }) => can('staff.manage'),
      },
    ],
  },
  {
    id: 'yardim',
    label: 'Yardım',
    items: [
      {
        to: '/kilavuz',
        label: 'Kullanım kılavuzu',
        icon: 'guide',
        description: 'Her ekranın ne işe yaradığı ve nasıl kullanıldığı.',
        visible: always,
      },
      {
        to: '/guncellemeler',
        label: 'Son güncellemeler',
        icon: 'changelog',
        description: 'Panelde ve sitede neler değişti.',
        visible: always,
      },
      {
        to: '/gelistirici',
        label: 'Geliştirici rehberi',
        icon: 'developer',
        description: 'Kurulum, test ve canlıya alma tarifleri.',
        visible: ({ role }) => canSeeDeveloperGuide(role),
      },
    ],
  },
]

/** The developer cookbook names infrastructure, so only the main admin sees it. */
export function canSeeDeveloperGuide(role: StaffRole | null): boolean {
  return role === 'main_admin'
}

/** The groups and items this person may see; groups left empty are dropped. */
export function visibleNav(access: NavAccess, groups: readonly NavGroup[] = NAV_GROUPS): NavGroup[] {
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.visible(access)) }))
    .filter((group) => group.items.length > 0)
}

/** Every item, flat (for the overview and the guide). */
export const ALL_NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

export interface NavTrail {
  group: NavGroup
  item: NavItem
}

/** A path is on an item when it is the item's path or a screen below it (`/icerik/event/1`). */
function onItem(path: string, item: NavItem): boolean {
  if (item.end || item.to === '/') return path === item.to
  return path === item.to || path.startsWith(`${item.to}/`)
}

/** The menu group and item of the open screen, for the top bar; null outside the menu (`/sifre`). */
export function navTrail(pathname: string, groups: readonly NavGroup[] = NAV_GROUPS): NavTrail | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  for (const group of groups) {
    const item = group.items.find((candidate) => onItem(path, candidate))
    if (item) return { group, item }
  }
  return null
}
