import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SORT,
  blogPath,
  campaignPath,
  checkoutSuccessPath,
  cityPath,
  countActiveFilters,
  parseRouteParam,
  parseSearchState,
  resultsPath,
  routePath,
  serializeSearchState,
  toggleFacet,
  tripPath,
} from './search-params'

const parse = (query: string) => parseSearchState(new URLSearchParams(query))

describe('parseSearchState', () => {
  it('reads repeated keys as a multi-value facet', () => {
    const state = parse('op=metro&op=varan&op=ulusoy')
    expect(state.filters.operators).toEqual(['metro', 'varan', 'ulusoy'])
  })

  it('decodes the seat-layout token rather than a raw plus sign', () => {
    // `seat=2+1` would arrive as "2 1": a literal + in a query string decodes
    // to a space. The token is what makes the layout filter survive a URL.
    expect(parse('seat=2p1').filters.layouts).toEqual(['2+1'])
    expect(parse('seat=2p1&seat=2p2').filters.layouts).toEqual(['2+1', '2+2'])
  })

  it('drops a layout token it does not recognise instead of throwing', () => {
    expect(parse('seat=3p3').filters.layouts).toBeUndefined()
  })

  it('falls back to the default sort on a bad value', () => {
    expect(parse('sort=nonsense').sort).toBe(DEFAULT_SORT)
    expect(parse('').sort).toBe(DEFAULT_SORT)
    expect(parse('sort=price_asc').sort).toBe('price_asc')
  })

  it('ignores a non-numeric or negative price bound', () => {
    expect(parse('pmin=abc').filters.priceMin).toBeUndefined()
    expect(parse('pmin=-5').filters.priceMin).toBeUndefined()
    expect(parse('pmin=250').filters.priceMin).toBe(250)
  })

  it('omits empty groups entirely rather than storing empty arrays', () => {
    expect(parse('').filters).toEqual({})
    expect(parse('op=').filters.operators).toBeUndefined()
  })
})

describe('serializeSearchState', () => {
  it('round-trips', () => {
    const query = 'dep=morning&op=metro&op=varan&seat=2p1&pmin=200&pmax=900&sort=price_asc'
    const state = parse(query)
    expect(parseSearchState(serializeSearchState(state))).toEqual(state)
  })

  it('omits the default sort so the canonical URL stays short', () => {
    const params = serializeSearchState({ sort: DEFAULT_SORT, filters: {} })
    expect(params.toString()).toBe('')
  })

  // Two identical filter sets must produce one identical URL, or they become
  // two cache entries for one request.
  it('is canonical: value order in does not affect the URL out', () => {
    const a = serializeSearchState({ sort: 'dep_asc', filters: { operators: ['varan', 'metro'] } })
    const b = serializeSearchState({ sort: 'dep_asc', filters: { operators: ['metro', 'varan'] } })
    expect(a.toString()).toBe(b.toString())
  })

  it('emits keys in a fixed order regardless of insertion order', () => {
    const params = serializeSearchState({
      sort: 'price_asc',
      filters: { amenities: ['wifi'], bands: ['morning'], operators: ['metro'] },
    })
    expect(params.toString()).toBe('sort=price_asc&dep=morning&op=metro&amen=wifi')
  })
})

describe('toggleFacet', () => {
  it('adds a value and keeps the group sorted', () => {
    const next = toggleFacet({ operators: ['varan'] }, 'operators', 'metro')
    expect(next.operators).toEqual(['metro', 'varan'])
  })

  it('removes a value that is already selected', () => {
    const next = toggleFacet({ operators: ['metro', 'varan'] }, 'operators', 'metro')
    expect(next.operators).toEqual(['varan'])
  })

  it('deletes the group once it is empty, so the URL stays clean', () => {
    const next = toggleFacet({ operators: ['metro'] }, 'operators', 'metro')
    expect('operators' in next).toBe(false)
  })

  it('leaves other groups untouched', () => {
    const next = toggleFacet({ operators: ['metro'], bands: ['morning'] }, 'operators', 'varan')
    expect(next.bands).toEqual(['morning'])
  })
})

describe('countActiveFilters', () => {
  it('counts every selected value across groups', () => {
    expect(
      countActiveFilters({ operators: ['metro', 'varan'], bands: ['morning'], layouts: ['2+1'] }),
    ).toBe(4)
  })

  it('counts a price range as one filter, not two', () => {
    expect(countActiveFilters({ priceMin: 200, priceMax: 900 })).toBe(1)
    expect(countActiveFilters({ priceMin: 200 })).toBe(1)
  })

  it('is zero for an empty filter set', () => {
    expect(countActiveFilters({})).toBe(0)
  })
})

describe('parseRouteParam', () => {
  const KNOWN = new Set(['istanbul', 'ankara', 'afyon-karahisar', 'kahramanmaras'])
  const resolve = (slug: string) => (KNOWN.has(slug) ? slug : undefined)

  it('splits a simple pair', () => {
    expect(parseRouteParam('istanbul-ankara', resolve)).toEqual({
      from: 'istanbul',
      to: 'ankara',
    })
  })

  // The whole reason this is not `raw.split('-')`: a slug can contain a hyphen,
  // so the first boundary is usually the wrong one.
  it('finds the boundary when a slug itself contains a hyphen', () => {
    expect(parseRouteParam('afyon-karahisar-ankara', resolve)).toEqual({
      from: 'afyon-karahisar',
      to: 'ankara',
    })
    expect(parseRouteParam('istanbul-afyon-karahisar', resolve)).toEqual({
      from: 'istanbul',
      to: 'afyon-karahisar',
    })
  })

  it('handles a hyphenated slug on both sides', () => {
    expect(parseRouteParam('afyon-karahisar-kahramanmaras', resolve)).toEqual({
      from: 'afyon-karahisar',
      to: 'kahramanmaras',
    })
  })

  it('returns null when either half is unknown', () => {
    expect(parseRouteParam('istanbul-atlantis', resolve)).toBeNull()
    expect(parseRouteParam('atlantis-ankara', resolve)).toBeNull()
    expect(parseRouteParam('istanbul', resolve)).toBeNull()
    expect(parseRouteParam('', resolve)).toBeNull()
  })
})

describe('path builders', () => {
  it('builds the date-less route landing', () => {
    expect(routePath('istanbul', 'ankara')).toBe('/otobus-bileti/istanbul-ankara')
  })

  it('keeps the dated results path a strict extension of it', () => {
    const landing = routePath('istanbul', 'ankara')
    expect(resultsPath('istanbul', 'ankara', '2026-09-12')).toBe(`${landing}/2026-09-12`)
  })

  it('builds the remaining paths', () => {
    expect(cityPath('izmir')).toBe('/sehir/izmir')
    expect(tripPath('34-6-2026-09-12-0')).toBe('/sefer/34-6-2026-09-12-0')
    expect(campaignPath('ilk-bilet')).toBe('/kampanya/ilk-bilet')
    expect(blogPath('2-1-nedir')).toBe('/blog/2-1-nedir')
    expect(checkoutSuccessPath('t1')).toBe('/odeme/t1/onay')
  })

  // A landing path must survive its own parser, or the fan-out links 404.
  it('round-trips through parseRouteParam', () => {
    const resolve = (s: string) => (['istanbul', 'ankara'].includes(s) ? s : undefined)
    const path = routePath('istanbul', 'ankara')
    const param = path.replace('/otobus-bileti/', '')
    expect(parseRouteParam(param, resolve)).toEqual({ from: 'istanbul', to: 'ankara' })
  })
})
