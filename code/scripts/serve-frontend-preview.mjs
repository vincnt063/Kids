import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'

const rootDir = path.resolve(import.meta.dirname, '..')
const distDir = path.join(rootDir, 'frontend', 'dist')
const backendOrigin = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:8080'
const port = Number(process.env.FRONTEND_PREVIEW_PORT || 3000)

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
}

const ensureDistExists = () => {
  if (fs.existsSync(path.join(distDir, 'index.html'))) {
    return true
  }

  console.error('[ERROR] Missing frontend/dist/index.html')
  console.error('[ERROR] Run "cd frontend && npm run build" first.')
  return false
}

const sendJsonError = (res, statusCode, message) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ code: statusCode, message }))
}

const sendFile = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  res.writeHead(200, { 'Content-Type': contentType })
  fs.createReadStream(filePath).pipe(res)
}

const proxyApiRequest = async (req, res) => {
  const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`)
  const targetUrl = new URL(requestUrl.pathname + requestUrl.search, backendOrigin)

  const headers = { ...req.headers }
  delete headers.host
  delete headers.connection
  delete headers['content-length']

  const bodyBuffer = await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : undefined))
    req.on('error', reject)
  })

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method || 'GET') ? undefined : bodyBuffer
    })

    const responseHeaders = {}
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') {
        return
      }
      responseHeaders[key] = value
    })

    res.writeHead(response.status, responseHeaders)

    if (req.method === 'HEAD') {
      res.end()
      return
    }

    const arrayBuffer = await response.arrayBuffer()
    res.end(Buffer.from(arrayBuffer))
  } catch (error) {
    console.error('[ERROR] API proxy failed:', error.message)
    sendJsonError(res, 502, 'Backend proxy failed')
  }
}

const resolveStaticPath = (urlPathname) => {
  const cleanPath = decodeURIComponent(urlPathname.split('?')[0])
  const requestedPath = cleanPath === '/' ? '/index.html' : cleanPath
  const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '')
  const filePath = path.join(distDir, normalizedPath)

  if (!filePath.startsWith(distDir)) {
    return null
  }

  return filePath
}

const serveAppRequest = (req, res) => {
  const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`)
  const filePath = resolveStaticPath(requestUrl.pathname)

  if (!filePath) {
    sendJsonError(res, 400, 'Bad request path')
    return
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath)
    return
  }

  sendFile(res, path.join(distDir, 'index.html'))
}

if (!ensureDistExists()) {
  process.exit(1)
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`)
  console.log(`[REQ ] ${req.method} ${requestUrl.pathname}`)

  if (requestUrl.pathname.startsWith('/api')) {
    proxyApiRequest(req, res)
    return
  }

  serveAppRequest(req, res)
})

server.on('error', (error) => {
  console.error('[ERROR] Preview server failed:', error.message)
  process.exitCode = 1
})

server.listen(port, '127.0.0.1', () => {
  console.log(`[INFO] Frontend preview is listening on http://127.0.0.1:${port}`)
  console.log(`[INFO] API proxy target: ${backendOrigin}`)
})
