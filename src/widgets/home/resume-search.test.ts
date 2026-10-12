import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cityById, type City } from '@/shared/api/catalog'
import {
  dismissResume,
  isResumeDismissed,
  resumeKey,
  resumeSummary,
  type ResumeSummary,
} from './resume-search'

const istanbul = cityById('34') as City
const ankara = cityById('6') as City
const TODAY = '2026-10-12'

function stats(departures: number, cheapest: number | null) {
  return { from: istanbul, to: ankara, departures, cheapest }
}

/** The facts line as it reads on screen. */
function line(summary: ResumeSummary): string {
  return summary.facts.map((f) => (f.lead ? `${f.lead} ${f.text}` : f.text)).join(' · ')
}

describe('resume card summary', () => {
  it('names today as "Bugün" and gives the count and the floor fare', () => {
    const summary = resumeSummary(stats(23, 605), TODAY, TODAY)
    expect(line(summary)).toBe('Bugün · 23 sefer · En düşük 605 TL')
    expect(summary.label).toBe(
      'Kaldığınız yerden devam edin: İstanbul Ankara, bugün, 23 sefer, en düşük ücret 605 TL',
    )
  })

  it('names a later day by its date, and spells the weekday out for the ear', () => {
    const summary = resumeSummary(stats(23, 605), '2026-10-14', TODAY)
    expect(line(summary)).toBe('14 Ekim Çar · 23 sefer · En düşük 605 TL')
    expect(summary.label).toContain('14 Ekim 2026 Çarşamba, 23 sefer')
  })

  it('says nothing is left today without naming the day twice', () => {
    const summary = resumeSummary(stats(0, null), TODAY, TODAY)
    expect(line(summary)).toBe('Bugün sefer kalmadı')
    expect(summary.label).toBe('Kaldığınız yerden devam edin: İstanbul Ankara, bugün sefer kalmadı')
  })

  it('quotes no fare for a later day with no departures', () => {
    expect(line(resumeSummary(stats(0, null), '2026-10-14', TODAY))).toBe('14 Ekim Çar · Sefer yok')
  })
})

describe('resume card dismissal', () => {
  beforeEach(() => window.sessionStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('hides the dismissed search only, so a new search is offered again', () => {
    const closed = resumeKey({ from: istanbul, to: ankara, date: '2026-10-14' })
    expect(isResumeDismissed(closed)).toBe(false)
    dismissResume(closed)
    expect(isResumeDismissed(closed)).toBe(true)
    expect(isResumeDismissed(resumeKey({ from: istanbul, to: ankara, date: '2026-10-15' }))).toBe(
      false,
    )
    expect(isResumeDismissed(resumeKey({ from: ankara, to: istanbul, date: '2026-10-14' }))).toBe(
      false,
    )
  })

  it('treats blocked storage as "not dismissed" and never throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => dismissResume('34>6@2026-10-14')).not.toThrow()
    expect(isResumeDismissed('34>6@2026-10-14')).toBe(false)
  })
})
