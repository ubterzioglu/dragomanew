import { describe, expect, it } from 'vitest'
import { ALL_NAV_ITEMS, canSeeDeveloperGuide, NAV_GROUPS, visibleNav, type NavAccess } from '../src/components/nav/navItems'
import { can, type Permission } from '../src/lib/permissions'
import type { StaffRole } from '../src/lib/types'

const forRole = (role: StaffRole, extra: readonly Permission[] = []): NavAccess => ({
  role,
  can: (permission) => can({ role, extra_permissions: extra }, permission),
})

const paths = (access: NavAccess): string[] => visibleNav(access).flatMap((group) => group.items.map((item) => item.to))

describe('visibleNav', () => {
  it('shows the main admin every item, the developer guide included, in group order', () => {
    expect(paths(forRole('main_admin'))).toEqual([
      '/',
      '/talepler',
      '/icerik',
      '/medya',
      '/yayin',
      '/formlar',
      '/kullanicilar',
      '/kilavuz',
      '/guncellemeler',
      '/gelistirici',
    ])
    expect(visibleNav(forRole('main_admin')).map((group) => group.label)).toEqual(['Genel', 'İçerik', 'Ayarlar', 'Yardım'])
  })

  it('gives request roles the overview, requests and help only, and drops the empty groups', () => {
    for (const role of ['reservations', 'accounting'] as const) {
      expect(paths(forRole(role))).toEqual(['/', '/talepler', '/kilavuz', '/guncellemeler'])
      expect(visibleNav(forRole(role)).map((group) => group.id)).toEqual(['genel', 'yardim'])
    }
  })

  it('gives the content role İçerik, Medya and Yayın but not Formlar or Kullanıcılar', () => {
    expect(paths(forRole('content'))).toEqual(['/', '/talepler', '/icerik', '/medya', '/yayin', '/kilavuz', '/guncellemeler'])
  })

  it('follows the permissions, not the role name (extra permissions, my_permissions)', () => {
    expect(paths(forRole('reservations', ['site.deploy']))).toContain('/yayin')
    expect(paths(forRole('reservations', ['site.deploy']))).not.toContain('/icerik')
    expect(paths(forRole('accounting', ['forms.manage']))).toContain('/formlar')
    const onlyPublish: NavAccess = { role: 'content', can: (permission) => permission === 'content.publish' }
    expect(paths(onlyPublish)).toEqual(expect.arrayContaining(['/icerik', '/medya', '/yayin']))
  })

  it('shows the developer guide to the main admin only, whatever the permissions', () => {
    const everything: NavAccess = { role: 'content', can: () => true }
    expect(paths(everything)).not.toContain('/gelistirici')
    expect(canSeeDeveloperGuide('main_admin')).toBe(true)
    for (const role of ['reservations', 'accounting', 'content'] as const) expect(canSeeDeveloperGuide(role)).toBe(false)
    expect(canSeeDeveloperGuide(null)).toBe(false)
  })

  it('shows nothing but the always-on items without permissions or a role', () => {
    expect(paths({ role: null, can: () => false })).toEqual(['/', '/talepler', '/kilavuz', '/guncellemeler'])
  })
})

describe('NAV_GROUPS', () => {
  it('has unique paths, a label, an icon and a description on every item', () => {
    const all = ALL_NAV_ITEMS.map((item) => item.to)
    expect(new Set(all).size).toBe(all.length)
    for (const item of ALL_NAV_ITEMS) {
      expect(item.label.trim()).not.toBe('')
      expect(item.description.trim()).not.toBe('')
      expect(item.icon).toBeTruthy()
    }
    expect(NAV_GROUPS.every((group) => group.items.length > 0)).toBe(true)
  })

  it('matches only the exact path for the overview, so it is not active on every page', () => {
    expect(ALL_NAV_ITEMS.find((item) => item.to === '/')?.end).toBe(true)
  })
})
