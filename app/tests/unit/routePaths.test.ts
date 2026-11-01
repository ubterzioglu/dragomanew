import { describe, expect, it } from 'vitest'
import { participantFormAlternates, staticRouteSpecs, toRoutePath } from '../../src/app/routePaths'
import { LOCALES } from '../../src/i18n/locales'

describe('toRoutePath', () => {
  it('turns a site path into a React Router child path', () => {
    expect(toRoutePath('/')).toBe('')
    expect(toRoutePath('/tr/')).toBe('tr')
    expect(toRoutePath('/tr/deniz-kanosu/')).toBe('tr/deniz-kanosu')
  })
})

describe('staticRouteSpecs', () => {
  const specs = staticRouteSpecs()

  it('creates every fixed page in all four languages', () => {
    expect(specs.filter((s) => s.page === 'home')).toHaveLength(LOCALES.length)
    expect(specs.filter((s) => s.page === 'lifeguard')).toHaveLength(LOCALES.length)
    expect(specs.find((s) => s.locale === 'tr' && s.page === 'lifeguard')?.path).toBe('tr/cankurtarma-merkezi')
  })

  it('never produces two routes with the same path', () => {
    const paths = specs.map((s) => s.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('gives the transport page its own mobile action', () => {
    expect(specs.find((s) => s.locale === 'en' && s.page === 'transport')?.cta).toBe('transport')
  })

  it('creates two separate participant forms per language (diving, outdoor)', () => {
    const forms = specs.filter((s) => s.page === 'participantForm')
    expect(forms).toHaveLength(LOCALES.length * 2)
    expect(forms.find((s) => s.locale === 'tr' && s.formKind === 'outdoor')?.path).toBe('tr/katilimci-formu/outdoor')
  })
})

describe('participantFormAlternates', () => {
  it('links the same form kind across languages', () => {
    expect(participantFormAlternates('diving').en).toBe('/participant-form/diving/')
    expect(participantFormAlternates('diving').de).toBe('/de/teilnehmerformular/diving/')
  })
})
