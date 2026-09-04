/**
 * The canonical URL set, derived from the catalogue rather than hand-listed.
 *
 * This is where the route fan-out becomes discoverable. Nothing links to most
 * of the 552 city pairs, so without a sitemap they exist in the router and
 * nowhere a crawler can reach.
 *
 * `scripts/gen-sitemap.mjs` writes public/sitemap.xml from this, and
 * sitemap.test.ts fails if the committed file has drifted — so adding a city
 * or an operator can never silently leave the sitemap behind.
 */

import { CITIES, OPERATORS } from '@/shared/api/catalog'
import { BLOG_POSTS } from '@/shared/config/blog'
import { CAMPAIGNS } from '@/shared/config/campaigns'

export const SITE_ORIGIN = 'https://buslinker.vercel.app'

export interface SitemapEntry {
  readonly path: string
  /** Relative importance only. No lastmod: inventing one would be a claim about content that never changed. */
  readonly priority: string
}

/**
 * Pages a crawler should index.
 *
 * Deliberately absent: anything behind a login (/hesabim/*, /seferlerim),
 * anything transient (/sefer/:tripId, /koltuk/:tripId, /odeme/*, /bilet/:pnr),
 * the password-recovery pair, and dated result pages — those multiply without
 * limit and are stale the day after.
 */
const STATIC_PATHS: readonly SitemapEntry[] = [
  { path: '/', priority: '1.0' },
  { path: '/populer-seferler', priority: '0.9' },
  { path: '/otobus-firmalari', priority: '0.8' },
  { path: '/terminaller', priority: '0.8' },
  { path: '/blog', priority: '0.7' },
  { path: '/yardim', priority: '0.6' },
  { path: '/sss', priority: '0.6' },
  { path: '/bilet-sorgula', priority: '0.6' },
  { path: '/bilet-iptal', priority: '0.6' },
  { path: '/hakkimizda', priority: '0.5' },
  { path: '/iletisim', priority: '0.5' },
  { path: '/hediye-kart', priority: '0.5' },
  { path: '/giris', priority: '0.4' },
  { path: '/kayit', priority: '0.4' },
  { path: '/kariyer', priority: '0.4' },
  { path: '/basinda-biz', priority: '0.4' },
  { path: '/firma-girisi', priority: '0.4' },
  { path: '/site-haritasi', priority: '0.3' },
  { path: '/erisilebilirlik', priority: '0.3' },
  { path: '/kvkk', priority: '0.3' },
  { path: '/gizlilik-politikasi', priority: '0.3' },
  { path: '/kullanim-kosullari', priority: '0.3' },
  { path: '/cerez-politikasi', priority: '0.3' },
]

export function buildSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [...STATIC_PATHS]

  // The date-less landing for every ordered city pair — the highest-value
  // surface the app has, and the one nothing links to.
  for (const from of CITIES) {
    for (const to of CITIES) {
      if (from.slug === to.slug) continue
      entries.push({ path: `/otobus-bileti/${from.slug}-${to.slug}`, priority: '0.8' })
    }
  }

  for (const city of CITIES) entries.push({ path: `/sehir/${city.slug}`, priority: '0.7' })
  for (const operator of OPERATORS)
    entries.push({ path: `/otobus-firmalari/${operator.id}`, priority: '0.6' })
  // Terminals hang off their city rather than living in a flat export.
  for (const city of CITIES)
    for (const terminal of city.terminals)
      entries.push({ path: `/terminaller/${terminal.id}`, priority: '0.5' })
  for (const post of BLOG_POSTS) entries.push({ path: `/blog/${post.slug}`, priority: '0.5' })
  for (const campaign of CAMPAIGNS)
    entries.push({ path: `/kampanya/${campaign.id}`, priority: '0.5' })

  return entries
}

/** Serialises to sitemap 0.9. Paths are already URL-safe: every slug is ASCII by slugifyTr. */
export function renderSitemap(origin = SITE_ORIGIN): string {
  const urls = buildSitemapEntries()
    .map(
      (e) =>
        `  <url>\n    <loc>${origin}${e.path}</loc>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
