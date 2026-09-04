/**
 * Encodes the hero coach animation to WebM with an alpha channel.
 *
 *   node scripts/encode-hero-video.mjs .media-src/buslinker.mov
 *
 * ffmpeg is not a dependency of this project — it is a ~80 MB native binary and
 * a devDependency would have Vercel download it on every deploy build. Use a
 * system ffmpeg, or install it for the one run:
 *
 *   npm i -D ffmpeg-static && node scripts/encode-hero-video.mjs <input>
 *   npm uninstall ffmpeg-static
 *
 * The master is a CapCut export: H.264 4:2:0, so no alpha at all — the removed
 * background came out flattened to pure black. The transparency is rebuilt here
 * from luminance rather than a colour key, because the coach's own tyres sit
 * near black and a colour key punches them out into holes.
 */

import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

const OUT = 'public/bus.webm'

/**
 * Alpha from the brightest channel: 0 below 8, opaque by 28, ramped between so
 * the antialiased rim stays soft. The background is exactly rgb(0,0,0) and the
 * darkest part of the coach measures rgb(45,38,37), so the gap is wide.
 */
const KEY =
  "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip((max(max(r(X,Y),g(X,Y)),b(X,Y))-8)*13,0,255)'"

// Trims the empty margin the master carries so the coach fills the frame.
const CROP = 'crop=iw*0.80:ih*0.74:iw*0.10:ih*0.15'

// NO flags=lanczos. swscale's lanczos mangles the alpha channel on RGBA input —
// it silently took transparency from 72% of the frame down to 1%. The default
// scaler keeps it intact.
const SCALE = 'scale=768:-2,setsar=1,format=yuva420p'

function findFfmpeg() {
  try {
    const require = createRequire(import.meta.url)
    return require('ffmpeg-static')
  } catch {
    return 'ffmpeg'
  }
}

const input = process.argv[2]
if (!input || !fs.existsSync(input)) {
  throw new Error(`Usage: node scripts/encode-hero-video.mjs <input.mov>`)
}

execFileSync(
  findFfmpeg(),
  [
    '-hide_banner',
    '-i',
    input,
    '-vf',
    `${KEY},fps=24,${CROP},${SCALE}`,
    '-c:v',
    'libvpx-vp9',
    '-pix_fmt',
    'yuva420p',
    // Alt-ref frames are incompatible with the alpha layer in libvpx.
    '-auto-alt-ref',
    '0',
    '-b:v',
    '0',
    '-crf',
    '34',
    '-row-mt',
    '1',
    // The master carries an audio track; a decorative loop has no use for it.
    '-an',
    '-y',
    OUT,
  ],
  { stdio: 'inherit' },
)

console.log(`${OUT}  ${(fs.statSync(OUT).size / 1024).toFixed(0)} kB`)
