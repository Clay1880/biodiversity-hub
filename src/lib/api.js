// Talks to the Flask backend in server/. In dev, Vite proxies /api to localhost:5000.
// For a built site, set VITE_API_URL (e.g. http://localhost:5000) before `npm run build`.
const BASE = import.meta.env.VITE_API_URL ?? ''

async function call(path, opts) {
  let res
  try {
    res = await fetch(BASE + path, opts)
  } catch {
    throw new Error('offline')
  }
  // The dev proxy answers 502/503/504 when Flask is not running
  if ([502, 503, 504].includes(res.status)) throw new Error('offline')
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`)
  return data
}

export const identifyImage = file => {
  const body = new FormData()
  body.append('image', file)
  return call('/api/identify', { method: 'POST', body })
}

export const analyze = (file, target) => {
  const body = new FormData()
  if (file) body.append('file', file)
  if (target) body.append('target', target)
  return call('/api/analyze', { method: 'POST', body })
}

export const OFFLINE_MSG = 'The analysis server is not running. In a second terminal run:  python server/app.py'
