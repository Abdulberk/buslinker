/**
 * Builds public/fonts/InterVariable-latin-tr.woff2 from the official Inter.
 *
 *   curl -L -o InterVariable.woff2 https://rsms.me/inter/font-files/InterVariable.woff2
 *   npm i --no-save harfbuzzjs@0.4.12 wawoff2@2.0.1
 *   node scripts/subset-inter.mjs InterVariable.woff2
 *
 * Why self-host at all: the Inter that Google Fonts serves has no cv05 or cv08.
 * With both switched on, `Il1` still renders as three identical strokes, so the
 * I / l / ı / İ separation README.md calls a correctness requirement for Turkish
 * never reached the screen. The official file has them.
 *
 * Why subset: the full variable font is 352 kB. Latin, Latin-1, Latin
 * Extended-A, punctuation, currency and arrows cover every string this app
 * shows, in both languages, at 154 kB.
 *
 * The one setting that matters: hb-subset keeps only a short default list of
 * OpenType features unless told otherwise, and cvXX / ssXX are not on it — a
 * default subset would quietly reproduce the very bug this file exists to fix.
 * The feature and script sets are therefore cleared and inverted, which keeps
 * every feature and every script's lookups (Turkish `locl` included). Both
 * variation axes, wght and opsz, are kept as they are.
 *
 * The two tools are installed with --no-save on purpose: they run once, by
 * hand, and the output is committed. Nothing here is part of the build.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const wawoff2 = require('wawoff2')

const SOURCE = process.argv[2] ?? 'InterVariable.woff2'
const OUT = path.resolve('public/fonts/InterVariable-latin-tr.woff2')

/** Inclusive code-point ranges. */
const RANGES = [
  [0x0020, 0x007e], // Basic Latin
  [0x00a0, 0x00ff], // Latin-1: Ç Ö Ü â î û, nbsp, « » · ×
  [0x0100, 0x017f], // Latin Extended-A: Ğ ğ İ ı Ş ş
  [0x0218, 0x021b], // Ș ș Ț ț
  [0x02bb, 0x02bc],
  [0x02c6, 0x02c7],
  [0x02d8, 0x02dd], // spacing accents
  [0x0300, 0x0308],
  [0x030a, 0x030c],
  [0x0327, 0x0328], // combining marks that İ, Ş and Ç decompose into
  [0x2000, 0x206f], // General Punctuation: – — ‘ ’ “ ” … and thin spaces
  [0x2070, 0x209f], // super- and subscripts: the overnight "+1"
  [0x20a0, 0x20cf], // currency: ₺ € £
  [0x2100, 0x214f], // letterlike: № ™
  [0x2190, 0x21ff], // arrows
  [0x2200, 0x22ff], // operators: − × ≈ ≤ ≥
  [0x2300, 0x23ff],
  [0x25a0, 0x25ff], // geometric shapes
  [0x2600, 0x26ff], // ♂ ♀
  [0x2700, 0x27bf], // ✓ ✕
  [0xfeff, 0xfeff],
  [0xfffd, 0xfffd],
]

// hb_subset_sets_t
const LAYOUT_FEATURE_TAG = 6
const LAYOUT_SCRIPT_TAG = 7

const woff2 = await readFile(SOURCE)
const ttf = Buffer.from(await wawoff2.decompress(woff2))

const { instance } = await WebAssembly.instantiate(
  await readFile(require.resolve('harfbuzzjs/hb-subset.wasm')),
)
const hb = instance.exports

const ptr = hb.malloc(ttf.byteLength)
new Uint8Array(hb.memory.buffer).set(ttf, ptr)
const blob = hb.hb_blob_create(ptr, ttf.byteLength, 2 /* writable */, 0, 0)
const face = hb.hb_face_create(blob, 0)
hb.hb_blob_destroy(blob)

const input = hb.hb_subset_input_create_or_fail()
const unicodes = hb.hb_subset_input_unicode_set(input)
for (const [from, to] of RANGES) {
  for (let cp = from; cp <= to; cp++) hb.hb_set_add(unicodes, cp)
}
for (const kind of [LAYOUT_FEATURE_TAG, LAYOUT_SCRIPT_TAG]) {
  const set = hb.hb_subset_input_set(input, kind)
  hb.hb_set_clear(set)
  hb.hb_set_invert(set)
}

const subset = hb.hb_subset_or_fail(face, input)
hb.hb_subset_input_destroy(input)
if (!subset) throw new Error('hb_subset_or_fail returned nothing')

const result = hb.hb_face_reference_blob(subset)
const offset = hb.hb_blob_get_data(result, 0)
const length = hb.hb_blob_get_length(result)
// Copied out before anything else touches the wasm heap.
const sfnt = Buffer.from(new Uint8Array(hb.memory.buffer).slice(offset, offset + length))
hb.hb_blob_destroy(result)
hb.hb_face_destroy(subset)
hb.hb_face_destroy(face)
hb.free(ptr)

const out = Buffer.from(await wawoff2.compress(sfnt))
await writeFile(OUT, out)
console.log(`${SOURCE}: ${woff2.length} B -> ${path.relative(process.cwd(), OUT)}: ${out.length} B`)
