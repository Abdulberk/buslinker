import { describe, expect, it } from 'vitest'
import { MORPH_NAV, QUIET_NAV, isMorphNav, isQuietNav, morphFrom, morphedFrom } from './quiet-nav'

describe('isMorphNav', () => {
  it('recognises the state a trip card navigates with', () => {
    expect(isMorphNav(MORPH_NAV)).toBe(true)
  })

  it('survives the structured clone that history state goes through', () => {
    expect(isMorphNav(structuredClone(MORPH_NAV))).toBe(true)
  })

  // Navigation state is whatever the caller passed, or nothing at all on a
  // first load or a pasted link.
  it.each([null, undefined, 'morph', 1, true, {}, { morph: 'true' }, { morph: 1 }])(
    'refuses %j',
    (state) => {
      expect(isMorphNav(state)).toBe(false)
    },
  )

  // A morph is a new page, so focus must still move to <main>; a quiet
  // navigation keeps it on the control. Neither mark may imply the other.
  it('is not mistaken for a quiet navigation, nor the other way round', () => {
    expect(isQuietNav(MORPH_NAV)).toBe(false)
    expect(isMorphNav(QUIET_NAV)).toBe(false)
  })
})

describe('morphFrom / morphedFrom', () => {
  it('remembers the page a morph left from, filters and all', () => {
    const state = morphFrom('/otobus-bileti/istanbul-ankara/2026-10-14?op=metro')
    expect(isMorphNav(state)).toBe(true)
    expect(morphedFrom(state)).toBe('/otobus-bileti/istanbul-ankara/2026-10-14?op=metro')
  })

  it('finds no origin on a morph that did not record one, or on any other state', () => {
    expect(morphedFrom(MORPH_NAV)).toBeNull()
    expect(morphedFrom(QUIET_NAV)).toBeNull()
    expect(morphedFrom({ back: '/x' })).toBeNull()
    expect(morphedFrom(null)).toBeNull()
    expect(morphedFrom({ morph: true, back: 42 })).toBeNull()
  })
})
