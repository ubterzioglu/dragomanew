import { describe, expect, it } from 'vitest'
import { can, canClaim, canHandOver, canReassign, handoverCandidates, parsePermissions } from '../src/lib/permissions'
import type { RequestRow, StaffMember } from '../src/lib/types'

const staff = (id: string, role: StaffMember['role'], active = true): StaffMember => ({
  id,
  full_name: `Kişi ${id}`,
  role,
  active,
})

const request = (overrides: Partial<RequestRow> = {}): RequestRow => ({
  id: 'r1',
  reference: 'DRG-000001',
  kind: 'contact',
  status: 'pending',
  locale: 'tr',
  full_name: 'Ayşe',
  email: 'ayse@example.com',
  phone: null,
  event_id: null,
  assignee_id: null,
  claimed_at: null,
  created_at: '2026-11-01T10:00:00Z',
  ...overrides,
})

describe('can', () => {
  it('follows the database role matrix', () => {
    expect(can(staff('a', 'main_admin'), 'staff.manage')).toBe(true)
    expect(can(staff('a', 'main_admin'), 'requests.reassign')).toBe(true)
    expect(can(staff('r', 'reservations'), 'requests.work')).toBe(true)
    expect(can(staff('r', 'reservations'), 'requests.reassign')).toBe(false)
    expect(can(staff('m', 'accounting'), 'requests.read')).toBe(true)
    expect(can(staff('m', 'accounting'), 'requests.work')).toBe(false)
    expect(can(staff('c', 'content'), 'requests.read')).toBe(false)
  })

  it('adds extra permissions on top of the role', () => {
    expect(can({ role: 'accounting', extra_permissions: ['requests.work'] }, 'requests.work')).toBe(true)
  })

  it('grants nothing to an inactive or missing staff member', () => {
    expect(can({ role: 'main_admin', active: false }, 'requests.read')).toBe(false)
    expect(can(null, 'requests.read')).toBe(false)
  })
})

describe('content permissions (dalga2-sozlesme §5)', () => {
  it('mirrors the matrix: main_admin all, content edits and translates but does not publish', () => {
    for (const permission of ['content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy'] as const) {
      expect(can(staff('a', 'main_admin'), permission)).toBe(true)
    }
    expect(can(staff('c', 'content'), 'content.edit')).toBe(true)
    expect(can(staff('c', 'content'), 'content.translate')).toBe(true)
    expect(can(staff('c', 'content'), 'content.publish')).toBe(false)
    expect(can(staff('c', 'content'), 'site.deploy')).toBe(false)
    for (const role of ['reservations', 'accounting'] as const) {
      expect(can(staff('r', role), 'content.edit')).toBe(false)
      expect(can(staff('r', role), 'content.translate')).toBe(false)
    }
  })

  it('opens publishing per person through extra_permissions (Q1)', () => {
    expect(can({ role: 'content', extra_permissions: ['content.publish'] }, 'content.publish')).toBe(true)
  })

  it('lets my_permissions() decide once it has answered', () => {
    expect(can({ role: 'content', permissions: ['content.edit', 'content.publish'] }, 'content.publish')).toBe(true)
    expect(can({ role: 'main_admin', permissions: [] }, 'staff.manage')).toBe(false)
    expect(can({ role: 'content', active: false, permissions: ['content.edit'] }, 'content.edit')).toBe(false)
  })

  it('parses the RPC answer defensively', () => {
    expect(parsePermissions(['content.edit', 'x', 3, 'site.deploy'])).toEqual(['content.edit', 'site.deploy'])
    expect(parsePermissions(null)).toEqual([])
  })
})

describe('request actions', () => {
  const me = staff('me', 'reservations')
  const admin = staff('boss', 'main_admin')
  const viewer = staff('acc', 'accounting')

  it('lets staff who work requests claim pending ones only', () => {
    expect(canClaim(me, request())).toBe(true)
    expect(canClaim(viewer, request())).toBe(false)
    expect(canClaim(me, request({ status: 'in_progress', assignee_id: 'x' }))).toBe(false)
  })

  it('lets only the current assignee hand a request over, if they can work requests', () => {
    const mine = request({ status: 'in_progress', assignee_id: 'me' })
    expect(canHandOver(me, mine)).toBe(true)
    expect(canHandOver(admin, mine)).toBe(false)
    expect(canHandOver(me, request({ status: 'in_progress', assignee_id: 'other' }))).toBe(false)
    expect(canHandOver(viewer, request({ status: 'in_progress', assignee_id: 'acc' }))).toBe(false)
  })

  it('lets main_admin change the assignee of a request in progress', () => {
    const taken = request({ status: 'in_progress', assignee_id: 'me' })
    expect(canReassign(admin, taken)).toBe(true)
    expect(canReassign(me, taken)).toBe(false)
    expect(canReassign(admin, request())).toBe(false)
  })
})

describe('handoverCandidates', () => {
  it('lists active staff who can work requests (assert_assignable), without the current assignee', () => {
    const people = [
      staff('me', 'reservations'),
      staff('b', 'main_admin'),
      staff('c', 'content'),
      staff('d', 'reservations', false),
      staff('e', 'accounting'),
      staff('f', 'reservations'),
    ]
    const ids = handoverCandidates(people, request({ status: 'in_progress', assignee_id: 'me' })).map((p) => p.id)
    expect(ids).toEqual(['b', 'f'])
  })
})
