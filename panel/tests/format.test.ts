import { describe, expect, it } from 'vitest'
import { describePriceSummary, describeSnapshot, formatDateTime, formatMoney, payloadEntries } from '../src/lib/format'

const plain = (text: string): string => text.replace(/\s/g, ' ')

describe('formatDateTime', () => {
  it('shows Istanbul time in Turkish', () => {
    expect(plain(formatDateTime('2026-11-01T10:05:00Z'))).toContain('13:05')
    expect(formatDateTime('2026-11-01T10:05:00Z')).toContain('2026')
  })

  it('shows a dash for missing or broken values', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime('not a date')).toBe('—')
  })
})

describe('formatMoney', () => {
  it('formats with two decimals in the Turkish style', () => {
    expect(plain(formatMoney(210, 'EUR'))).toMatch(/210,00/)
    expect(formatMoney(210, 'EUR')).toContain('€')
    expect(formatMoney(1500.5, 'TRY')).toMatch(/1\.500,50/)
  })
})

describe('describePriceSummary', () => {
  it('lists lines and the total for a computed summary', () => {
    const view = describePriceSummary({
      kind: 'total',
      currency: 'EUR',
      total: 210,
      lines: [
        { optionId: 'full', quantity: 2, unitPrice: 60, subtotal: 120 },
        { optionId: 'half', quantity: 2, unitPrice: 45, subtotal: 90 },
      ],
    })
    expect(view.kind).toBe('total')
    if (view.kind !== 'total') return
    expect(view.lines).toHaveLength(2)
    expect(view.lines[0]?.optionId).toBe('full')
    expect(plain(view.lines[0]?.text ?? '')).toMatch(/2 × .*60,00/)
    expect(plain(view.total)).toMatch(/210,00/)
  })

  it('explains summaries that have no total', () => {
    expect(describePriceSummary({ kind: 'on_request' })).toEqual({ kind: 'note', text: 'Fiyat talep üzerine.' })
    expect(describePriceSummary({ kind: 'unpriced' }).kind).toBe('note')
    expect(describePriceSummary({ kind: 'not_combinable' }).kind).toBe('note')
    expect(describePriceSummary({ kind: 'empty' }).kind).toBe('note')
  })

  it('copes with a missing or unexpected summary', () => {
    expect(describePriceSummary(null)).toEqual({ kind: 'none' })
    expect(describePriceSummary({ kind: 'total', total: 'x' })).toEqual({ kind: 'none' })
  })
})

describe('payloadEntries', () => {
  it('labels known fields and formats their values', () => {
    const entries = payloadEntries({
      fullName: 'Ayşe',
      email: 'a@example.com',
      partySize: 3,
      childSeat: true,
      childSeatAges: [2, 5],
      distribution: { full: 2, half: 1 },
      note: '',
      customField: 'x',
    })
    expect(entries).toEqual([
      { key: 'partySize', label: 'Kişi sayısı', value: '3' },
      { key: 'childSeat', label: 'Çocuk koltuğu', value: 'Evet' },
      { key: 'childSeatAges', label: 'Çocuk koltuğu yaşları', value: '2, 5' },
      { key: 'distribution', label: 'Seçenek dağılımı', value: 'full: 2, half: 1' },
      { key: 'note', label: 'Not', value: '—' },
      { key: 'customField', label: 'customField', value: 'x' },
    ])
  })

  it('returns nothing for a payload that is not an object', () => {
    expect(payloadEntries(null)).toEqual([])
    expect(payloadEntries(['a'])).toEqual([])
  })
})

describe('describeSnapshot', () => {
  it('reads the title and chosen options', () => {
    const view = describeSnapshot({
      title: 'Kaş dalış',
      options: [{ id: 'full', name: 'Tam gün', price: 60, currency: 'EUR', quantity: 2 }],
    })
    expect(view?.title).toBe('Kaş dalış')
    expect(view?.options).toHaveLength(1)
    expect(view?.options[0]?.name).toBe('Tam gün')
    expect(plain(view?.options[0]?.detail ?? '')).toMatch(/2 kişi · .*60,00/)
  })

  it('accepts localized names and options without a price', () => {
    const view = describeSnapshot({
      title: { tr: 'Kano', en: 'Kayak' },
      options: [{ id: 'x', name: { en: 'Half day' }, price: null, currency: 'EUR' }],
    })
    expect(view?.title).toBe('Kano')
    expect(view?.options[0]?.name).toBe('Half day')
    expect(view?.options[0]?.detail).toBe('Fiyat yok')
  })

  it('returns null without a snapshot', () => {
    expect(describeSnapshot(null)).toBeNull()
  })
})
