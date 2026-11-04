import { describe, expect, it } from 'vitest'
import {
  EXTRA_PERMISSION_OPTIONS,
  extraPermissionSummary,
  grantedElsewhere,
  initiallyTicked,
  nextExtraPermissions,
  roleIncludes,
  samePermissions,
} from '../src/lib/extraPermissions'

describe('EXTRA_PERMISSION_OPTIONS', () => {
  it('offers only what every screen reads from my_permissions(), never request or administrator rights', () => {
    expect(EXTRA_PERMISSION_OPTIONS.map((option) => option.permission)).toEqual([
      'revisions.use',
      'content.edit',
      'content.translate',
      'content.publish',
      'site.deploy',
      'forms.manage',
    ])
  })

  it('explains every box in a sentence', () => {
    for (const option of EXTRA_PERMISSION_OPTIONS) expect(option.description).toMatch(/\.$/)
  })
})

describe('roleIncludes', () => {
  it('follows the role matrix', () => {
    expect(roleIncludes('content', 'content.edit')).toBe(true)
    expect(roleIncludes('content', 'content.publish')).toBe(false)
    expect(roleIncludes('reservations', 'revisions.use')).toBe(false)
    expect(roleIncludes('main_admin', 'forms.manage')).toBe(true)
  })
})

describe('nextExtraPermissions', () => {
  it('adds what is ticked and drops what is unticked', () => {
    expect(nextExtraPermissions('reservations', ['content.publish'], ['revisions.use'])).toEqual(['revisions.use'])
  })

  it('keeps an extra given elsewhere while its box stays ticked, and takes it back when unticked', () => {
    expect(nextExtraPermissions('content', ['requests.work'], ['requests.work', 'content.publish'])).toEqual([
      'requests.work',
      'content.publish',
    ])
    expect(nextExtraPermissions('content', ['requests.work'], ['content.publish'])).toEqual(['content.publish'])
  })

  it('never adds a value that has no box', () => {
    expect(nextExtraPermissions('content', [], ['staff.manage', 'settings.manage', 'x.y'])).toEqual([])
  })

  it('leaves a permission the role already brings as it was stored', () => {
    expect(nextExtraPermissions('content', ['content.edit'], [])).toEqual(['content.edit'])
    expect(nextExtraPermissions('content', [], ['content.edit'])).toEqual([])
    expect(nextExtraPermissions('reservations', ['requests.work'], [])).toEqual(['requests.work'])
  })

  it('lists each permission once, in the order of the matrix', () => {
    expect(nextExtraPermissions('accounting', ['forms.manage', 'forms.manage'], ['forms.manage', 'content.edit'])).toEqual([
      'content.edit',
      'forms.manage',
    ])
  })

  it('does not change the stored list', () => {
    const stored = ['site.deploy', 'content.edit']
    nextExtraPermissions('reservations', stored, ['revisions.use'])
    expect(stored).toEqual(['site.deploy', 'content.edit'])
  })
})

describe('grantedElsewhere', () => {
  it('lists stored extras without a box that the role does not bring', () => {
    expect(grantedElsewhere('accounting', ['revisions.use', 'staff.manage', 'requests.read', 'requests.work', 'x.y'])).toEqual([
      'requests.work',
      'staff.manage',
      'x.y',
    ])
    expect(grantedElsewhere('reservations', ['content.publish'])).toEqual([])
  })
})

describe('initiallyTicked', () => {
  it('ticks every stored value a box decides, and none the role brings', () => {
    expect(initiallyTicked('reservations', ['revisions.use', 'requests.work', 'staff.manage', 'content.edit'])).toEqual([
      'revisions.use',
      'staff.manage',
      'content.edit',
    ])
  })

  it('saving the dialog untouched keeps the stored list', () => {
    const stored = ['requests.reassign', 'content.publish', 'requests.work']
    expect(samePermissions(nextExtraPermissions('reservations', stored, initiallyTicked('reservations', stored)), stored)).toBe(true)
  })
})

describe('samePermissions', () => {
  it('ignores order and repeats', () => {
    expect(samePermissions(['content.edit', 'revisions.use'], ['revisions.use', 'content.edit', 'content.edit'])).toBe(true)
    expect(samePermissions(['content.edit'], ['content.edit', 'revisions.use'])).toBe(false)
    expect(samePermissions([], [])).toBe(true)
  })
})

describe('extraPermissionSummary', () => {
  it('names every extra, also ones the screen does not offer, and shows unknown values as they are', () => {
    expect(extraPermissionSummary(['content.publish', 'requests.work', 'x.y'])).toBe('Talepler üzerinde çalışma, Yayınlama, x.y')
  })

  it('is empty without extras', () => {
    expect(extraPermissionSummary([])).toBe('')
  })
})
