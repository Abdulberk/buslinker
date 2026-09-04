/**
 * The fluxapi.ai client, shared by the campaign and city-photo generators.
 *
 * Generation is asynchronous: POST returns a taskId, and the image URL only
 * appears once record-info reports successFlag 1. Those URLs expire after 14
 * days, so callers download immediately and commit the file.
 */

import fs from 'node:fs'

const API = 'https://api.fluxapi.ai/api/v1/flux/kontext'
const CREDIT_API = 'https://api.fluxapi.ai/api/v1/common/credit'
const POLL_INTERVAL_MS = 4000
const POLL_TIMEOUT_MS = 5 * 60_000

export function loadKey() {
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

/** Remaining account credits, for reporting what a run will cost before it runs. */
export async function credits(key) {
  return call(CREDIT_API, { headers: { Authorization: `Bearer ${key}` } })
}

async function startTask(key, prompt, { aspectRatio = '1:1', model = 'flux-kontext-pro' } = {}) {
  const data = await call(`${API}/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      model,
      aspectRatio,
      outputFormat: 'png',
      // Defaults to true, which paraphrases the prompt through English. The
      // negative constraints in these prompts are what must survive verbatim.
      enableTranslation: false,
      promptUpsampling: false,
    }),
  })
  if (!data?.taskId) throw new Error(`no taskId in response: ${JSON.stringify(data)}`)
  return data.taskId
}

async function awaitTask(key, taskId) {
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

/** Generates one image and writes it to `dest`. Returns the file size in bytes. */
export async function generateTo(key, prompt, dest, options) {
  const taskId = await startTask(key, prompt, options)
  const url = await awaitTask(key, taskId)
  const res = await fetchRetry(url)
  if (!res.ok) throw new Error(`download ${url} -> ${res.status}`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  return fs.statSync(dest).size
}
