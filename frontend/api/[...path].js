/**
 * Vercel Serverless Function: API Proxy
 * Routes all /api/* requests to the DigitalOcean backend.
 * This avoids browser mixed-content errors (HTTPS frontend → HTTP backend).
 */
const BACKEND = 'http://198.199.88.122'

export default async function handler(req, res) {
  // path can be: string "leads/sheets", array ["leads","sheets"], or undefined
  const { path } = req.query
  let pathStr = ''
  if (Array.isArray(path)) {
    pathStr = path.join('/')
  } else if (typeof path === 'string') {
    pathStr = path
  }

  // Preserve query string (minus the path param injected by Vercel)
  const originalUrl = req.url || ''
  const qIdx = originalUrl.indexOf('?')
  let qs = ''
  if (qIdx !== -1) {
    const params = new URLSearchParams(originalUrl.slice(qIdx + 1))
    params.delete('path')
    params.delete('...path')
    if (params.toString()) qs = '?' + params.toString()
  }

  const backendUrl = `${BACKEND}/api/${pathStr}${qs}`

  try {
    const headers = { 'Content-Type': 'application/json' }
    if (req.headers['x-api-key']) headers['x-api-key'] = req.headers['x-api-key']

    const fetchOptions = { method: req.method, headers }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body)
    }

    const response = await fetch(backendUrl, fetchOptions)
    const data = await response.text()

    res.status(response.status)
    const ct = response.headers.get('content-type')
    if (ct) res.setHeader('Content-Type', ct)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(data)
  } catch (err) {
    res.status(502).json({ detail: `Proxy error: ${err.message}`, url: backendUrl })
  }
}
