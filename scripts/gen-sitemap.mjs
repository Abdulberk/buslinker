/**
 * Writes public/sitemap.xml from the catalogue.
 *
 *   node scripts/gen-sitemap.mjs
 *
 * Deliberately NOT wired into `npm run build`. The build is what Vercel runs to
 * deploy; a generator that throws there turns a content change into a failed
 * deploy. Instead the output is committed, and src/shared/config/sitemap.test.ts
 * fails the suite if it has drifted from the catalogue — so the file cannot go
 * stale unnoticed, and it cannot break a deploy either.
 *
 * Node strips the types itself; the only thing it cannot do is resolve the `@/`
 * alias, which the hook below handles.
 */

import fs from 'node:fs'
import path from 'node:path'
import { registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'

const SRC = path.resolve('src')

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('@/')) {
      const target = path.join(SRC, specifier.slice(2))
      // The alias is written without an extension, as TypeScript expects.
      const resolved = ['', '.ts', '.tsx', '/index.ts']
        .map((ext) => target + ext)
        .find(fs.existsSync)
      if (!resolved) throw new Error(`cannot resolve ${specifier}`)
      return next(pathToFileURL(resolved).href, context)
    }
    return next(specifier, context)
  },
})

const { renderSitemap, buildSitemapEntries } = await import(
  pathToFileURL(path.join(SRC, 'shared/config/sitemap.ts')).href
)

const out = path.resolve('public/sitemap.xml')
fs.writeFileSync(out, renderSitemap())

const entries = buildSitemapEntries()
console.log(`${out}  ${entries.length} urls  ${(fs.statSync(out).size / 1024).toFixed(0)} kB`)
