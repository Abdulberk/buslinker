/**
 * Generates the city photographs used as the hero of every /sehir/ page.
 *
 *   node scripts/gen-city-photos.mjs            # every city listed below
 *   node scripts/gen-city-photos.mjs izmir      # just these slugs
 *
 * Replaces artwork whose sources are 320x200 and visibly soft, since the hero
 * scales them about 3.75x. Output is 16:9 at the model's native size, then
 * converted to WebP by the same step the campaign cards use.
 *
 * Each run costs credits. It prints the balance before and after so the cost
 * per image is never a guess.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { credits, generateTo, loadKey } from './flux.mjs'

const OUT_DIR = 'public'
const RAW_DIR = '.campaign-src/cities'

const HOUSE_STYLE = [
  'Bright, vivid travel photography of a real place, sunlit and inviting.',
  'Saturated natural colour, clear sky, crisp detail edge to edge.',
  'Absolutely no text, letters, signage, captions or watermarks anywhere in frame.',
  'No people in the foreground, no vehicles dominating the shot.',
].join(' ')

/** One recognisable landmark or vista per city — what a traveller pictures. */
export const CITY_SCENES = [
  {
    slug: 'istanbul',
    scene:
      'The Bosphorus at golden hour seen from the European shore, with domes and minarets on the skyline and ferries on the water.',
  },
  {
    slug: 'ankara',
    scene:
      'Ankara castle on its hill above the old town rooftops in warm afternoon light, the modern city spreading behind.',
  },
  {
    slug: 'izmir',
    scene:
      'The Izmir waterfront promenade along the gulf at late afternoon, palm trees, calm sea, hills across the bay.',
  },
  {
    slug: 'antalya',
    scene:
      'The old harbour of Antalya below limestone cliffs, turquoise Mediterranean water, pine-covered mountains behind.',
  },
  {
    slug: 'hatay',
    scene:
      'The green Amanos mountains above the Hatay plain in soft morning light, terraced olive groves in the foreground.',
  },
  {
    slug: 'adana',
    scene:
      'The historic stone bridge over the Seyhan river in Adana at sunset, wide calm water reflecting the sky.',
  },
  {
    slug: 'mugla',
    scene:
      'A turquoise Aegean bay near Mugla seen from a pine-covered hillside, white sailing boats on still water.',
  },
  {
    slug: 'trabzon',
    scene:
      'Steep green tea terraces above the Black Sea coast near Trabzon, mist lifting off the forested slopes.',
  },
  {
    slug: 'gaziantep',
    scene:
      'The ancient citadel of Gaziantep rising above the old stone quarter in warm afternoon light.',
  },
  {
    slug: 'nevsehir',
    scene:
      'The fairy chimneys of Cappadocia at sunrise with hot air balloons over the valley, soft pink light.',
  },
  {
    slug: 'mersin',
    scene:
      'The Mersin coastline along the Mediterranean, long palm-lined shore, clear blue water, mountains inland.',
  },
]

const key = loadKey()
const wanted = process.argv.slice(2)
const todo = wanted.length ? CITY_SCENES.filter((c) => wanted.includes(c.slug)) : CITY_SCENES
if (!todo.length) throw new Error(`no city matched: ${wanted.join(', ')}`)

const before = await credits(key)
console.log(`credits before: ${before}   generating ${todo.length}`)

fs.mkdirSync(RAW_DIR, { recursive: true })

for (const city of todo) {
  process.stdout.write(`${city.slug} ... `)
  try {
    const raw = path.join(RAW_DIR, `${city.slug}.png`)
    // 16:9 to match the hero, which is a wide band rather than a square.
    const bytes = await generateTo(key, `${city.scene} ${HOUSE_STYLE}`, raw, {
      aspectRatio: '16:9',
    })
    execSync(
      `npx --yes sharp-cli -i "${path.resolve(raw)}" -o "${path.resolve(OUT_DIR)}" -f webp -q 82`,
      { stdio: 'ignore' },
    )
    const out = path.join(OUT_DIR, `${city.slug}.webp`)
    const webp = fs.existsSync(out) ? fs.statSync(out).size : 0
    console.log(`ok  ${(bytes / 1024).toFixed(0)} kB png -> ${(webp / 1024).toFixed(0)} kB webp`)
  } catch (error) {
    console.log(`FAILED  ${error.message}`)
  }
}

const after = await credits(key)
console.log(`credits after: ${after}   spent: ${(before - after).toFixed(2)}`)
