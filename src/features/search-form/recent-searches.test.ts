import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { lastSearch, readRecentSearches, recentCities, rememberSearch } from './recent-searches'

const KEY = 'bl-recent-searches'

describe('recent searches', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('keeps the newest first, moves a repeated pair up and stops at five', () => {
    rememberSearch({ from: '34', to: '6', date: '2026-10-12' })
    rememberSearch({ from: '35', to: '7', date: '2026-10-12' })
    rememberSearch({ from: '34', to: '6', date: '2026-10-14' })
    expect(readRecentSearches().map((s) => `${s.from}-${s.to}`)).toEqual(['34-6', '35-7'])

    for (const plate of ['1', '16', '27', '42', '55']) {
      rememberSearch({ from: plate, to: '34', date: '2026-10-12' })
    }
    expect(readRecentSearches()).toHaveLength(5)
    expect(readRecentSearches()[0]?.from).toBe('55')
  })

  it('drops entries it cannot use instead of trusting them', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify([{ from: '34', to: '34', date: '2026-10-12' }, { from: 'x' }, 'junk', null]),
    )
    expect(readRecentSearches()).toEqual([])

    window.localStorage.setItem(KEY, '{not json')
    expect(readRecentSearches()).toEqual([])
  })

  it('moves a date that has passed up to today when prefilling', () => {
    rememberSearch({ from: '34', to: '6', date: '2026-10-01' })
    expect(lastSearch('2026-10-12')?.date).toBe('2026-10-12')

    rememberSearch({ from: '34', to: '6', date: '2026-10-20' })
    const last = lastSearch('2026-10-12')
    expect(last?.date).toBe('2026-10-20')
    expect(last?.from.name).toBe('İstanbul')
    expect(last?.to.name).toBe('Ankara')
  })

  it('lists distinct cities per end of the trip', () => {
    rememberSearch({ from: '34', to: '6', date: '2026-10-12' })
    rememberSearch({ from: '34', to: '35', date: '2026-10-12' })
    rememberSearch({ from: '7', to: '6', date: '2026-10-12' })
    expect(recentCities('from').map((c) => c.id)).toEqual(['7', '34'])
    expect(recentCities('to').map((c) => c.id)).toEqual(['6', '35'])
  })

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => rememberSearch({ from: '34', to: '6', date: '2026-10-12' })).not.toThrow()
    expect(lastSearch()).toBeNull()
  })
})
