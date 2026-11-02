import { describe, expect, it } from 'vitest'
import { validateNewStaff } from '../src/lib/staffForm'

describe('validateNewStaff', () => {
  it('trims and lower-cases the e-mail, as the database stores it', () => {
    expect(validateNewStaff({ email: '  Ali@Example.COM ', fullName: ' Ali Veli ', role: 'reservations' })).toEqual({
      ok: true,
      value: { email: 'ali@example.com', full_name: 'Ali Veli', role: 'reservations' },
    })
  })

  it('reports each problem in Turkish', () => {
    expect(validateNewStaff({ email: 'not-an-email', fullName: '', role: 'boss' })).toEqual({
      ok: false,
      errors: {
        email: 'Geçerli bir e-posta adresi girin.',
        fullName: 'Ad soyad gerekli.',
        role: 'Bir rol seçin.',
      },
    })
  })
})
