/**
 * Vercel Serverless Function: API Proxy
 * Routes all /api/* requests to the DigitalOcean backend.
 * This avoids browser mixed-content errors (HTTPS frontend → HTTP backend).
 */
const BACKEND = 'http://198.199.88.122'

export default async function handler(req, res) {
  const { path = [] } = req.query
  const backendPath = '/api/' + path.join('/')
  const url = BACKEND + backendPath + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')

  try {
    const headers = { 'Content-Type': 'application/json' }
    if (req.headers['x-api-key']) headers['x-api-key'] = req.headers['x-api-key']

    const fetchOptions = {
      method: req.method,
      headers,
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body)
    }

    const response = await fetch(url, fetchOptions)
    const data = await response.text()

    res.status(response.status)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    res.send(data)
  } catch (err) {
    res.status(502).json({ detail: `Proxy error: ${err.message}` })
  }
}
