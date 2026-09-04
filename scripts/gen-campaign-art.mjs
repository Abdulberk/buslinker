/**
 * Step 1 of the campaign artwork pipeline: generate the PHOTOGRAPH.
 *
 *   node scripts/gen-campaign-art.mjs            # every campaign
 *   node scripts/gen-campaign-art.mjs ogrenci    # just these ids
 *
 * No text is asked of the model — see the note in campaign-art.mjs for why.
 *
 * The key is read from .env.local (gitignored) as FLUXAPI_KEY. Result URLs
 * expire after 14 days, so every image is downloaded immediately. Raw photos
 * land in .campaign-src/ (gitignored); only the composed cards are committed,
 * so re-composing never costs another API call.
 */

import fs from 'node:fs'
import path from 'node:path'
import { ASPECT_RATIO, CAMPAIGN_ART, RAW_DIR } from './campaign-art.mjs'

const API = 'https://api.fluxapi.ai/api/v1/flux/kontext'
const POLL_INTERVAL_MS = 4000
const POLL_TIMEOUT_MS = 5 * 60_000

// A shared look, so five separately generated photos still read as one set.
const HOUSE_STYLE = [
  'Bright, vivid, high-key commercial travel photography for an advertisement.',
  'Saturated cheerful colour, strong clean sunlight, deep blue sky, crisp and glossy.',
  'Not moody, not muted, not editorial — this is upbeat retail promo imagery.',
  'Absolutely no text, letters, numbers, signage, captions or watermarks anywhere in frame.',
  'Every vehicle surface is plain and unmarked: a smooth blank grille, blank bumper, blank',
  'panels, no emblem, no badge, no model name, no livery, no destination sign, no number plate.',
].join(' ')

function buildPrompt(art) {
  return [
    art.scene,
    HOUSE_STYLE,
    // The chip and headline sit in the top third, the offer ribbon in the
    // bottom third. Both have to come back quiet or the copy lands on clutter.
    `Composition: the subject sits in the MIDDLE band of the square frame.`,
    `The top third is open sky and the bottom third is open road, ground or water —`,
    `both clean and uncluttered, with nothing important placed in either.`,
  ].join(' ')
}

function loadKey() {
  const fromEnv = process.env.FLUXAPI_KEY
  if (fromEnv) return fromEnv
  const envFile = '.env.local'
  if (!fs.existsSync(envFile)) {
    throw new Error(`No FLUXAPI_KEY. Put it in ${envFile} as FLUXAPI_KEY=...`)
  }
  const match = fs.readFileSync(envFile, 'utf8').match(/^\s*FLUXAPI_KEY\s*=\s*(.+?)\s*$/m)
  if (!match) throw new Error(`${envFile} exists but has no FLUXAPI_KEY line`)
  return match[1].replace(/^["']|["']$/g, '')
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * fetch() rejects with a bare "TypeError: fetch failed" on any transport
 * problem and hides the real cause on .cause. Retry the transient ones, and
 * when giving up, say what actually went wrong.
 */
async function fetchRetry(url, init, attempts = 4) {
  for (let i = 1; ; i++) {
    try {
      return await fetch(url, init)
    } catch (error) {
      if (i >= attempts) {
        const cause = error.cause?.code ?? error.cause?.message ?? error.message
        throw new Error(`network error after ${attempts} attempts: ${cause}`)
      }
      await sleep(2000 * i)
    }
  }
}

async function call(url, init) {
  const res = await fetchRetry(url, init)
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    throw new Error(`${url} -> ${res.status}, non-JSON body: ${text.slice(0, 300)}`)
  }
  if (!res.ok || body.code !== 200) {
    throw new Error(`${url} -> ${res.status} code=${body.code} msg=${body.msg}`)
  }
  return body.data
}

async function generate(key, art) {
  const data = await call(`${API}/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: buildPrompt(art),
      model: 'flux-kontext-pro',
      aspectRatio: ASPECT_RATIO,
      outputFormat: 'png',
      // Defaults to true, which paraphrases the prompt through English. The
      // negative constraints above are exactly the part that must survive.
      enableTranslation: false,
      promptUpsampling: false,
    }),
  })
  if (!data?.taskId) throw new Error(`no taskId in response: ${JSON.stringify(data)}`)
  return data.taskId
}

async function waitForImage(key, taskId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS)
    const data = await call(`${API}/record-info?taskId=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    // 0 generating, 1 success, 2 create failed, 3 generate failed
    if (data.successFlag === 1) {
      const url = data.response?.resultImageUrl
      if (!url) throw new Error(`success but no resultImageUrl: ${JSON.stringify(data.response)}`)
      return url
    }
    if (data.successFlag === 2 || data.successFlag === 3) {
      throw new Error(
        `generation failed (${data.successFlag}): ${data.errorMessage || data.errorCode}`,
      )
    }
  }
  throw new Error(`timed out after ${POLL_TIMEOUT_MS / 1000}s`)
}

async function download(url, dest) {
  const res = await fetchRetry(url)
  if (!res.ok) throw new Error(`download ${url} -> ${res.status}`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  return fs.statSync(dest).size
}

const key = loadKey()
const wanted = process.argv.slice(2)
const todo = wanted.length ? CAMPAIGN_ART.filter((c) => wanted.includes(c.id)) : CAMPAIGN_ART
if (!todo.length) throw new Error(`no campaign matched: ${wanted.join(', ')}`)

fs.mkdirSync(RAW_DIR, { recursive: true })

// Sequential on purpose: five images is not worth risking a rate limit, and a
// failure part-way through leaves the earlier files already on disk.
for (const art of todo) {
  process.stdout.write(`${art.id} ... `)
  try {
    const taskId = await generate(key, art)
    const url = await waitForImage(key, taskId)
    const dest = path.join(RAW_DIR, `${art.id}.png`)
    const bytes = await download(url, dest)
    console.log(`ok  ${dest}  ${(bytes / 1024).toFixed(0)} kB`)
  } catch (error) {
    console.log(`FAILED  ${error.message}`)
  }
}
