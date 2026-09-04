/**
 * Step 2 of the campaign artwork pipeline: paint the copy onto the photograph.
 *
 *   node scripts/compose-campaign-art.mjs            # every campaign
 *   node scripts/compose-campaign-art.mjs ogrenci    # just these ids
 *
 * The card is laid out as HTML and screenshotted with headless Chrome, so the
 * Turkish is set by a real font engine in the app's own typeface and tone
 * colours. That is the whole point: the image model spells İ/ş/ğ/ı correctly
 * only by luck, a browser gets them right every time.
 *
 * Layout follows the retail-promo convention — audience chip, big headline,
 * offer ribbon — but in BusLinker's own ramps rather than any other site's.
 *
 * Costs nothing to re-run: it reads the photos already in .campaign-src/.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, execSync } from 'node:child_process'
import { CAMPAIGN_ART, OUT_DIR, RAW_DIR } from './campaign-art.mjs'

// 6:5, matching the window the carousel gives the image, at 2x the widest the
// card is ever shown (sm:w-88 = 352px). Composed at the display ratio on
// purpose: cropping a square card in CSS would slice off the chip and ribbon.
const WIDTH = 800
const HEIGHT = 667

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]

// One accent across all five, so the set reads as a family. Gold rather than
// each campaign’s own tone: it is the one hue that stays legible on every
// photograph these prompts produce, warm or cool.
const GOLD = 'oklch(83% 0.155 85)'
const INK = 'oklch(22% 0.02 60)'
const shade = (alpha) => `oklch(20% 0.02 250 / ${alpha})`

/** Turkish upper-casing, done here rather than in CSS so i -> İ is guaranteed. */
const upperTr = (s) => s.toLocaleUpperCase('tr-TR')

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => fs.existsSync(p))
  if (!found) throw new Error(`no Chrome found; looked in:\n  ${CHROME_CANDIDATES.join('\n  ')}`)
  return found
}

function cardHtml(art, photoDataUri) {
  const codeChip = art.code ? `<div class="code">KOD: ${escapeHtml(art.code)}</div>` : ''

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..800&family=Inter:opsz,wght@14..32,100..900&display=block">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  .card { position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; font-family: 'Archivo','Inter',system-ui,sans-serif; }
  .photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

  /* The photo is generated, so it can come back brighter or busier than the
     prompt asked for. The veil means the copy never depends on it. */
  .veil {
    position: absolute; inset: 0;
    background: linear-gradient(180deg,
      ${shade(0.86)} 0%,
      ${shade(0.55)} 26%,
      ${shade(0.06)} 46%,
      ${shade(0.48)} 70%,
      ${shade(0.88)} 100%);
  }

  /* No plates, chips or ribbons: the copy sits straight on the photograph, so
     the veil above and the shadow below are the only things holding it legible. */
  .top { position: absolute; top: 46px; left: 46px; right: 46px; }
  .kicker {
    font-size: 25px; font-weight: 700; letter-spacing: 0.14em;
    color: ${GOLD};
    text-shadow: 0 2px 12px ${shade(0.75)};
  }
  .headline {
    margin-top: 14px;
    font-size: 66px; font-weight: 800; line-height: 1.04; letter-spacing: -0.025em;
    color: #fff; max-width: 94%;
    text-shadow: 0 3px 20px ${shade(0.75)}, 0 1px 3px ${shade(0.5)};
  }

  .bottom { position: absolute; left: 46px; right: 46px; bottom: 46px; }
  .offer {
    font-size: 58px; font-weight: 800; letter-spacing: -0.02em; line-height: 1;
    color: #fff;
    text-shadow: 0 3px 20px ${shade(0.8)}, 0 1px 3px ${shade(0.55)};
  }
  .code {
    margin-top: 12px;
    font-size: 24px; font-weight: 700; letter-spacing: 0.1em;
    color: ${GOLD};
    text-shadow: 0 2px 12px ${shade(0.8)};
  }
</style>
</head>
<body>
  <div class="card">
    <img class="photo" src="${photoDataUri}" alt="">
    <div class="veil"></div>
    <div class="top">
      <div class="kicker">${escapeHtml(upperTr(art.kicker))}</div>
      <div class="headline">${escapeHtml(art.headline)}</div>
    </div>
    <div class="bottom">
      <div class="offer">${escapeHtml(art.offer)}</div>
      ${codeChip}
    </div>
  </div>
</body>
</html>`
}

const chrome = findChrome()
const wanted = process.argv.slice(2)
const todo = wanted.length ? CAMPAIGN_ART.filter((c) => wanted.includes(c.id)) : CAMPAIGN_ART
if (!todo.length) throw new Error(`no campaign matched: ${wanted.join(', ')}`)

fs.mkdirSync(OUT_DIR, { recursive: true })
const workDir = path.join(RAW_DIR, '.compose')
fs.mkdirSync(workDir, { recursive: true })

for (const art of todo) {
  process.stdout.write(`${art.id} ... `)
  const photo = path.join(RAW_DIR, `${art.id}.png`)
  if (!fs.existsSync(photo)) {
    console.log(`SKIPPED  no photo at ${photo} — run gen-campaign-art.mjs first`)
    continue
  }

  // Inlined rather than referenced: Chrome restricts file:// subresources, and
  // a silently missing background would still screenshot "successfully".
  const dataUri = `data:image/png;base64,${fs.readFileSync(photo).toString('base64')}`
  // Chrome needs absolute paths: a relative file:// URL resolves against the
  // drive root, not the working directory.
  const html = path.resolve(workDir, `${art.id}.html`)
  const shot = path.resolve(workDir, `${art.id}.png`)
  fs.writeFileSync(html, cardHtml(art, dataUri))

  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      `--window-size=${WIDTH},${HEIGHT}`,
      // Long enough for the webfont to arrive. `display=block` holds the text
      // invisible until it does, so a short budget would shoot empty copy.
      '--virtual-time-budget=15000',
      `--user-data-dir=${path.resolve(workDir, `prof-${art.id}`)}`,
      `--screenshot=${shot}`,
      `file:///${html.replace(/\\/g, '/')}`,
    ],
    { stdio: 'ignore' },
  )

  if (!fs.existsSync(shot)) {
    console.log('FAILED  chrome produced no screenshot')
    continue
  }

  // Node refuses to spawn a .cmd without a shell on Windows, so this goes
  // through execSync. sharp stays an npx one-off rather than a devDependency:
  // it is a native binary Vercel would then install on every deploy build.
  execSync(`npx --yes sharp-cli -i "${shot}" -o "${path.resolve(OUT_DIR)}" -f webp -q 82`, {
    stdio: 'ignore',
  })

  const out = path.join(OUT_DIR, `${art.id}.webp`)
  const bytes = fs.existsSync(out) ? fs.statSync(out).size : 0
  console.log(bytes ? `ok  ${out}  ${(bytes / 1024).toFixed(0)} kB` : 'FAILED  no webp written')
}
