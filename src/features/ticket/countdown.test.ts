import { describe, expect, it } from 'vitest'
import { departureCountdown } from './countdown'

const NOW = new Date('2026-10-12T09:00:00Z')
const later = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000)

describe('departureCountdown', () => {
  it('reads days and hours above a day, without minutes', () => {
    expect(departureCountdown(later(2 * 1440 + 4 * 60 + 35), NOW)?.text).toBe(
      'Kalkışa 2 gün 4 saat',
    )
    expect(departureCountdown(later(3 * 1440), NOW)?.text).toBe('Kalkışa 3 gün')
  })

  it('reads hours and minutes inside a day', () => {
    expect(departureCountdown(later(3 * 60 + 20), NOW)?.text).toBe('Kalkışa 3 saat 20 dakika')
    expect(departureCountdown(later(5 * 60), NOW)?.text).toBe('Kalkışa 5 saat')
  })

  it('reads minutes under an hour and flags the last half hour', () => {
    expect(departureCountdown(later(45), NOW)).toEqual({ text: 'Kalkışa 45 dakika', soon: false })
    expect(departureCountdown(later(30), NOW)).toEqual({ text: 'Kalkışa 30 dakika', soon: true })
  })

  it('rounds a part-minute up, so it never says zero minutes', () => {
    expect(departureCountdown(new Date(NOW.getTime() + 40_000), NOW)?.text).toBe('Kalkışa 1 dakika')
  })

  it('returns null at and after departure', () => {
    expect(departureCountdown(NOW, NOW)).toBeNull()
    expect(departureCountdown(later(-5), NOW)).toBeNull()
  })

  it('accepts an ISO string', () => {
    expect(departureCountdown(later(90).toISOString(), NOW)?.text).toBe('Kalkışa 1 saat 30 dakika')
  })
})
