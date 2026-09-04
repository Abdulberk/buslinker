import { describe, expect, it } from 'vitest'
import { CITIES, OPERATORS } from '@/shared/api/catalog'
import { parseRouteParam } from '@/shared/lib/search-params'
import { buildSitemapEntries, renderSitemap, SITE_ORIGIN } from './sitemap'

// Loaded through Vite rather than node:fs, so the app tsconfig does not have
// to pull in Node's types for one test.
import committed from '../../../public/sitemap.xml?raw'

describe('sitemap', () => {
  // The generator is not part of `npm run build` — a throwing generator there
  // would turn a content change into a failed deploy. This is what stops the
  // committed file going stale instead.
  it('matches the committed public/sitemap.xml', () => {
    expect(committed).toBe(renderSitemap())
  })

  it('covers every ordered city pair', () => {
    const entries = buildSitemapEntries()
    const pairs = entries.filter((e) => e.path.startsWith('/otobus-bileti/'))
    expect(pairs).toHaveLength(CITIES.length * (CITIES.length - 1))
  })

  it('gives every city, operator and terminal a URL', () => {
    const paths = new Set(buildSitemapEntries().map((e) => e.path))
    for (const city of CITIES) {
      expect(paths.has(`/sehir/${city.slug}`)).toBe(true)
      for (const terminal of city.terminals) {
        expect(paths.has(`/terminaller/${terminal.id}`)).toBe(true)
      }
    }
    for (const operator of OPERATORS) {
      expect(paths.has(`/otobus-firmalari/${operator.id}`)).toBe(true)
    }
  })

  it('never lists a page that needs a login or expires', () => {
    // A sitemap is a promise that the URL is worth indexing. A seat map for one
    // departure, or a page that redirects to /giris, is neither.
    const forbidden = [
      '/hesabim',
      '/seferlerim',
      '/bilgilerim',
      '/kayitli-yolcular',
      '/bildirimler',
      '/puanlarim',
      '/koltuk/',
      '/odeme/',
      '/sefer/',
      '/bilet/',
      '/sifremi-unuttum',
      '/sifre-sifirla',
    ]
    for (const entry of buildSitemapEntries()) {
      for (const prefix of forbidden) {
        expect(entry.path.startsWith(prefix), `${entry.path} must not be indexed`).toBe(false)
      }
    }
  })

  it('emits absolute, canonical, slash-free URLs', () => {
    for (const entry of buildSitemapEntries()) {
      expect(entry.path.startsWith('/')).toBe(true)
      // vercel.json redirects a trailing slash, so listing one would advertise
      // a URL that answers 308 rather than 200.
      expect(entry.path === '/' || !entry.path.endsWith('/')).toBe(true)
      // Every slug goes through slugifyTr, so anything non-ASCII is a bug.
      expect(entry.path).toMatch(/^[/a-z0-9-]*$/)
    }
    expect(committed).toContain(`<loc>${SITE_ORIGIN}/</loc>`)
  })

  // The sharp edge: a slug can contain a hyphen, so "afyon-karahisar-ankara"
  // has three possible split points. If the route page picks a different pair
  // than the sitemap advertised, the URL is a soft 404 that looks fine in the
  // XML — the worst kind, because nothing reports it.
  it('every advertised city pair resolves back to that same pair', () => {
    const bySlug = new Map(CITIES.map((c) => [c.slug, c]))
    const resolve = (slug: string) => bySlug.get(slug)

    const pairs = buildSitemapEntries().filter((e) => e.path.startsWith('/otobus-bileti/'))
    expect(pairs.length).toBeGreaterThan(0)

    for (const entry of pairs) {
      const param = entry.path.replace('/otobus-bileti/', '')
      const parsed = parseRouteParam(param, resolve)
      expect(parsed, `${entry.path} does not parse`).not.toBeNull()
      expect(`${parsed!.from}-${parsed!.to}`, `${entry.path} resolves to a different pair`).toBe(
        param,
      )
    }
  })

  it('has no duplicate URLs', () => {
    const paths = buildSitemapEntries().map((e) => e.path)
    expect(new Set(paths).size).toBe(paths.length)
  })
})
