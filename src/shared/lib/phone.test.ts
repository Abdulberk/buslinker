import { describe, expect, it } from 'vitest'
import {
  DEFAULT_COUNTRY,
  acceptTyped,
  formatAsTyped,
  formatPhoneDisplay,
  fromE164,
  isValidPhone,
  matchesCountry,
  phoneCountries,
  toE164,
} from './phone'

describe('formatAsTyped', () => {
  it('groups a Turkish mobile the way Türkiye groups it', () => {
    expect(formatAsTyped('5321234567', 'TR')).toBe('532 123 45 67')
  })

  it('groups the same digits differently elsewhere', () => {
    // The UK's national format keeps its trunk zero, and without it the
    // library cannot tell which plan the digits belong to.
    expect(formatAsTyped('07911123456', 'GB')).toBe('07911 123456')
  })

  it('formats progressively, so the field is legible while half-typed', () => {
    expect(formatAsTyped('532', 'TR')).toBe('532')
    expect(formatAsTyped('53212', 'TR')).toBe('532 12')
  })

  it('drops anything that is not a digit', () => {
    expect(formatAsTyped('(532) 123-45-67', 'TR')).toBe('532 123 45 67')
    expect(formatAsTyped('abc', 'TR')).toBe('')
  })

  it('regroups as digits are removed rather than keeping the old spacing', () => {
    // Türkiye groups 3-3-2-2, so nine digits end mid-group.
    expect(formatAsTyped('532 123 45 6', 'TR')).toBe('532 123 45 6')
    expect(formatAsTyped('532 1', 'TR')).toBe('532 1')
  })
})

describe('validation', () => {
  it('accepts a complete Turkish mobile', () => {
    expect(isValidPhone('532 123 45 67', 'TR')).toBe(true)
  })

  it('rejects a number that is too short', () => {
    expect(isValidPhone('532 123', 'TR')).toBe(false)
  })

  it('rejects a landline area code used as a mobile prefix', () => {
    // 212 is İstanbul's landline code, valid as a fixed line but not 11 digits.
    expect(isValidPhone('212 123', 'TR')).toBe(false)
  })

  it('rejects letters', () => {
    expect(isValidPhone('abcdefghij', 'TR')).toBe(false)
  })
})

describe('E.164 round trip', () => {
  it('stores one canonical form no matter how it was typed', () => {
    const forms = ['5321234567', '0532 123 45 67', '532 123 45 67', '+90 532 123 45 67']
    for (const form of forms) {
      expect(toE164(form, 'TR')).toBe('+905321234567')
    }
  })

  it('returns null while the number is still incomplete', () => {
    expect(toE164('532 12', 'TR')).toBeNull()
  })

  it('reads a stored number back into a country and a national string', () => {
    expect(fromE164('+905321234567')).toEqual({ country: 'TR', national: '532 123 45 67' })
    // A London landline, not a +44 mobile: those fall in a range shared with
    // Guernsey, and the library answers GG for them.
    expect(fromE164('+442071838750')).toEqual({ country: 'GB', national: '20 7183 8750' })
  })

  it('falls back to the default country for an unparseable stored value', () => {
    expect(fromE164('').country).toBe(DEFAULT_COUNTRY)
    expect(fromE164('532').country).toBe(DEFAULT_COUNTRY)
  })
})

describe('formatPhoneDisplay', () => {
  it('renders a stored number in its international form', () => {
    expect(formatPhoneDisplay('+905321234567')).toBe('+90 532 123 45 67')
  })

  it('passes anything unparseable through untouched', () => {
    expect(formatPhoneDisplay('bilinmiyor')).toBe('bilinmiyor')
  })
})

describe('phoneCountries', () => {
  it('names countries in the reader’s language', () => {
    const tr = phoneCountries('tr').find((c) => c.code === 'DE')
    const en = phoneCountries('en').find((c) => c.code === 'DE')
    expect(tr?.name).toBe('Almanya')
    expect(en?.name).toBe('Germany')
    expect(tr?.dial).toBe('49')
  })

  it('puts Türkiye first and keeps the rest alphabetical in that language', () => {
    const list = phoneCountries('tr')
    expect(list[0]?.code).toBe('TR')
    const rest = list.slice(8).map((c) => c.name)
    const collator = new Intl.Collator('tr')
    const sorted = [...rest].sort((x, y) => collator.compare(x, y))
    expect(rest).toEqual(sorted)
  })

  it('covers every country libphonenumber knows, so nobody is locked out', () => {
    expect(phoneCountries('tr').length).toBeGreaterThan(200)
  })
})

describe('acceptTyped', () => {
  it('keeps the chosen country for a plain national number', () => {
    expect(acceptTyped('5321234567', 'TR')).toEqual({ country: 'TR', national: '532 123 45 67' })
  })

  it('switches country when an international number is pasted, and strips the prefix', () => {
    // The bug this exists for: read as a national number, +90 532… becomes
    // 90 532…, a different and invalid number.
    expect(acceptTyped('+90 532 123 45 67', 'TR')).toEqual({
      country: 'TR',
      national: '532 123 45 67',
    })
    expect(acceptTyped('+49 151 23456789', 'TR').country).toBe('DE')
  })

  it('holds the current country while the prefix is still too short to place', () => {
    expect(acceptTyped('+3', 'TR')).toEqual({ country: 'TR', national: '+3' })
  })
})

describe('matchesCountry', () => {
  const germany = { code: 'DE' as const, name: 'Almanya', dial: '49' }
  const turkiye = { code: 'TR' as const, name: 'Türkiye', dial: '90' }

  it('matches on the name in the reader’s language, ignoring diacritics', () => {
    expect(matchesCountry(germany, 'alman')).toBe(true)
    expect(matchesCountry(turkiye, 'turkiye')).toBe(true)
    expect(matchesCountry(turkiye, 'TÜRK')).toBe(true)
  })

  it('matches on the dial code', () => {
    expect(matchesCountry(germany, '49')).toBe(true)
    expect(matchesCountry(germany, '+49')).toBe(true)
  })

  it('does not match every country once the query has no digits', () => {
    // The bug: 'alman' reduces to '' as digits, and every dial code starts
    // with '', so the list stayed at 245 entries however you searched.
    expect(matchesCountry(turkiye, 'alman')).toBe(false)
  })

  it('matches everything on an empty query', () => {
    expect(matchesCountry(turkiye, '')).toBe(true)
  })
})

describe('pasted international numbers keep their country’s grouping', () => {
  it('groups a German mobile, which needs the trunk prefix to be grouped at all', () => {
    expect(acceptTyped('+49 151 23456789', 'TR')).toEqual({
      country: 'DE',
      national: '1512 3456789',
    })
  })
})
