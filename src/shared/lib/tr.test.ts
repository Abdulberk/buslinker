import { describe, expect, it } from 'vitest'
import {
  ablativeTr,
  compareTr,
  dativeTr,
  foldTr,
  formatDuration,
  formatPrice,
  formatTime,
  isValidISODate,
  locativeTr,
  lowerTr,
  slugifyTr,
  upperTr,
} from './tr'
import { CITIES } from '@/shared/api/catalog'

describe('formatPrice', () => {
  it('puts the symbol after the number, as Turkish does', () => {
    expect(formatPrice(959)).toBe('959 TL')
  })

  it('groups thousands with a dot', () => {
    expect(formatPrice(1099)).toBe('1.099 TL')
    expect(formatPrice(12500)).toBe('12.500 TL')
  })

  it('rounds to whole lira for display', () => {
    expect(formatPrice(959.4)).toBe('959 TL')
    expect(formatPrice(959.6)).toBe('960 TL')
  })
})

describe('formatDuration', () => {
  it('uses the Turkish short form', () => {
    expect(formatDuration(419)).toBe('6s 59dk')
  })

  it('drops the empty half', () => {
    expect(formatDuration(360)).toBe('6s')
    expect(formatDuration(45)).toBe('45dk')
  })

  it('never renders a negative duration', () => {
    expect(formatDuration(-10)).toBe('0dk')
  })
})

describe('formatTime', () => {
  it('is 24-hour and zero-padded', () => {
    const morning = new Date('2026-09-04T08:30:00+03:00')
    expect(formatTime(morning)).toBe('08:30')
    const evening = new Date('2026-09-04T23:15:00+03:00')
    expect(formatTime(evening)).toBe('23:15')
  })

  it('is pinned to Istanbul, not the viewer time zone', () => {
    // The same instant must read the same for every user of a Turkish product.
    expect(formatTime('2026-09-04T05:30:00Z')).toBe('08:30')
  })
})

describe('Turkish casing', () => {
  // This is the bug the whole module exists to prevent: the default locale
  // lowercases İ to "i̇" (i plus a combining dot), which then matches nothing.
  it('lowercases İ to ı-less i, not i-plus-combining-dot', () => {
    expect(lowerTr('İSTANBUL')).toBe('istanbul')
    expect(lowerTr('İstanbul')).toBe('istanbul')
  })

  it('uppercases i to İ and ı to I', () => {
    expect(upperTr('istanbul')).toBe('İSTANBUL')
    expect(upperTr('ısparta')).toBe('ISPARTA')
  })

  it('differs from the default locale, which is the entire point', () => {
    expect(lowerTr('İstanbul')).not.toBe('İstanbul'.toLowerCase())
  })
})

describe('foldTr', () => {
  it('folds every Turkish diacritic for search', () => {
    expect(foldTr('Çanakkale')).toBe('canakkale')
    expect(foldTr('Nevşehir')).toBe('nevsehir')
    expect(foldTr('Muğla')).toBe('mugla')
    expect(foldTr('İstanbul')).toBe('istanbul')
    expect(foldTr('Şanlıurfa')).toBe('sanliurfa')
    expect(foldTr('Diyarbakır')).toBe('diyarbakir')
  })

  it('lets an unaccented query match an accented city', () => {
    expect(foldTr('canakkale')).toBe(foldTr('Çanakkale'))
    expect(foldTr('AYDIN')).toBe(foldTr('Aydın'))
  })
})

describe('compareTr', () => {
  it('orders ç after c and ı before i', () => {
    const sorted = ['İzmir', 'Çanakkale', 'Ankara', 'Isparta'].sort(compareTr)
    expect(sorted[0]).toBe('Ankara')
    expect(sorted.indexOf('Çanakkale')).toBeLessThan(sorted.indexOf('Isparta'))
  })
})

describe('slugifyTr', () => {
  it('produces URL-safe slugs that survive Turkish characters', () => {
    expect(slugifyTr('İstanbul')).toBe('istanbul')
    expect(slugifyTr('Nevşehir')).toBe('nevsehir')
    expect(slugifyTr('Çanakkale')).toBe('canakkale')
    expect(slugifyTr('Şanlıurfa')).toBe('sanliurfa')
  })
})

describe('isValidISODate', () => {
  it('accepts a real calendar day', () => {
    expect(isValidISODate('2026-09-04')).toBe(true)
  })

  it('rejects malformed or impossible dates', () => {
    expect(isValidISODate('2026-9-4')).toBe(false)
    expect(isValidISODate('2026-13-01')).toBe(false)
    expect(isValidISODate('2026-02-30')).toBe(false)
    expect(isValidISODate('yarin')).toBe(false)
  })
})

describe('Turkish case suffixes', () => {
  // These read as a spelling mistake to every Turkish speaker when wrong, and
  // they are wrong on most of the catalogue if you just append a fixed suffix.
  it('harmonises the ablative to the last vowel', () => {
    expect(ablativeTr('İstanbul')).toBe("İstanbul'dan")
    expect(ablativeTr('İzmir')).toBe("İzmir'den")
    expect(ablativeTr('Bursa')).toBe("Bursa'dan")
    expect(ablativeTr('Nevşehir')).toBe("Nevşehir'den")
  })

  it('devoices the ablative consonant after a voiceless final', () => {
    expect(ablativeTr('Gaziantep')).toBe("Gaziantep'ten")
    expect(ablativeTr('Sinop')).toBe("Sinop'tan")
    expect(ablativeTr('Uşak')).toBe("Uşak'tan")
  })

  it('buffers the dative with y after a vowel', () => {
    expect(dativeTr('Ankara')).toBe("Ankara'ya")
    expect(dativeTr('Muğla')).toBe("Muğla'ya")
    expect(dativeTr('Kayseri')).toBe("Kayseri'ye")
  })

  it('takes the dative without a buffer after a consonant', () => {
    expect(dativeTr('İstanbul')).toBe("İstanbul'a")
    expect(dativeTr('İzmir')).toBe("İzmir'e")
    expect(dativeTr('Trabzon')).toBe("Trabzon'a")
  })

  it('harmonises and devoices the locative', () => {
    expect(locativeTr('İstanbul')).toBe("İstanbul'da")
    expect(locativeTr('İzmir')).toBe("İzmir'de")
    expect(locativeTr('Gaziantep')).toBe("Gaziantep'te")
  })

  it('produces a plausible suffix for every city in the catalogue', () => {
    for (const city of CITIES) {
      expect(ablativeTr(city.name)).toMatch(/'(d|t)(an|en)$/)
      expect(dativeTr(city.name)).toMatch(/'y?(a|e)$/)
      expect(locativeTr(city.name)).toMatch(/'(d|t)(a|e)$/)
    }
  })
})
