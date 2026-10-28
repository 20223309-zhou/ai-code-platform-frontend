'use strict'

/**
 * 桌面壳的本地服务：**一个端口，同时做两件事**。
 *
 *   GET /api/**   → 流式转发到远程后端
 *   其他           → 返回 dist 下的静态文件（带 SPA fallback）
 *
 * 为什么必须合成一个端口：只要页面和 API 的 origin 不一致，就会同时踩两个坑
 * —— Session Cookie 在跨站请求里不发送（SameSite 默认 Lax），以及
 * `iframe.contentDocument` 被同源策略拦住导致可视化编辑失效。
 *
 * 顺手处理的三件事：
 *   - Set-Cookie 重写：剥掉 Domain / Secure / SameSite。
 *     后端下发 `Domain=api.xxx.com` 的 Cookie，浏览器在 `127.0.0.1` 上会直接拒收
 *   - SSE 不缓冲：写头后立刻 flushHeaders，并关掉 Nagle，否则 AI 流式输出会一卡一卡
 *   - 客户端断开即掐上游：用户点"停止生成"后不能让后端继续计费
 */

const http = require('node:http')
const https = require('node:https')
const fs = require('node:fs')
const path = require('node:path')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

/** 这些头只对单跳连接有意义，转发时必须剔除，否则 Node 会重复处理 */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

function createLocalServer({ distDir, apiOrigin, proxyPrefixes, port, portRetries = 10 }) {
  const rootDir = path.resolve(distDir)
  const upstream = new URL(apiOrigin)
  const transport = upstream.protocol === 'https:' ? https : http

  const server = http.createServer((req, res) => {
    if (matchesPrefix(req.url, proxyPrefixes)) {
      proxyRequest(req, res, upstream, transport)
    } else {
      serveStatic(req, res, rootDir)
    }
  })

  // SSE 可能挂几分钟，任何一层超时都会把流掐断
  server.timeout = 0
  server.requestTimeout = 0
  server.headersTimeout = 0

  return listenWithRetry(server, port, portRetries).then((actualPort) => ({
    server,
    port: actualPort,
  }))
}

function matchesPrefix(rawUrl, prefixes) {
  if (!rawUrl) {
    return false
  }
  const pathname = rawUrl.split('?')[0]
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

function listenWithRetry(server, startPort, retries) {
  return new Promise((resolve, reject) => {
    let attempt = 0

    const tryListen = (candidate) => {
      const onError = (error) => {
        if (error.code === 'EADDRINUSE' && attempt < retries) {
          attempt += 1
          tryListen(candidate + 1)
          return
        }
        reject(error)
      }
      server.once('error', onError)
      server.listen(candidate, '127.0.0.1', () => {
        server.removeListener('error', onError)
        resolve(server.address().port)
      })
    }

    tryListen(startPort)
  })
}

// ---------------------------------------------------------------- 代理

function proxyRequest(req, res, upstream, transport) {
  const headers = {}
  for (const [key, value] of Object.entries(req.headers)) {
    const lower = key.toLowerCase()
    if (HOP_BY_HOP_HEADERS.has(lower) || lower === 'host') {
      continue
    }
    headers[key] = value
  }
  headers.host = upstream.host

  const upstreamReq = transport.request(
    {
      protocol: upstream.protocol,
      hostname: upstream.hostname,
      port: upstream.port || (upstream.protocol === 'https:' ? 443 : 80),
      method: req.method,
      path: req.url,
      headers,
    },
    (upstreamRes) => {
      const responseHeaders = {}
      for (const [key, value] of Object.entries(upstreamRes.headers)) {
        const lower = key.toLowerCase()
        if (HOP_BY_HOP_HEADERS.has(lower)) {
          continue
        }
        responseHeaders[key] =
          lower === 'set-cookie' ? value.map(rewriteSetCookie) : value
      }

      res.writeHead(upstreamRes.statusCode || 502, responseHeaders)
      // 头立刻发出去 + 关 Nagle：SSE 的每个 token 才能即时冒到界面上
      res.flushHeaders()
      if (res.socket) {
        res.socket.setNoDelay(true)
      }
      upstreamRes.pipe(res)
    },
  )

  upstreamReq.on('error', (error) => {
    if (res.headersSent) {
      res.destroy()
      return
    }
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(
      JSON.stringify({
        code: 50000,
        message: `无法连接后端服务（${upstream.origin}）：${error.message}`,
      }),
    )
  })

  // 用户点「停止生成」或关窗口时，前端 abort 只是断开这条连接，
  // 不掐上游的话后端会继续跑完整个 SSE，白烧 token
  res.on('close', () => {
    if (!res.writableEnded) {
      upstreamReq.destroy()
    }
  })

  req.pipe(upstreamReq)
}

/**
 * 把后端下发的 Cookie 改写成能落在 127.0.0.1 上的形式。
 * 只保留 name=value 与 Max-Age / Expires / HttpOnly，其余属性重建。
 */
function rewriteSetCookie(rawCookie) {
  if (typeof rawCookie !== 'string') {
    return rawCookie
  }
  const segments = rawCookie.split(';')
  const pair = (segments.shift() || '').trim()
  const kept = segments
    .map((segment) => segment.trim())
    .filter((segment) => {
      const lower = segment.toLowerCase()
      return !(
        lower.startsWith('domain') ||
        lower.startsWith('secure') ||
        lower.startsWith('samesite') ||
        lower.startsWith('path')
      )
    })

  return [pair, 'Path=/', ...kept].filter(Boolean).join('; ')
}

// ---------------------------------------------------------------- 静态资源

function serveStatic(req, res, rootDir) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Method Not Allowed')
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname)
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Bad Request')
    return
  }
  if (pathname === '/') {
    pathname = '/index.html'
  }

  const candidate = path.resolve(rootDir, '.' + pathname)
  // 防目录穿越：解析结果必须落在 dist 之内
  if (candidate !== rootDir && !candidate.startsWith(rootDir + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Forbidden')
    return
  }

  fs.stat(candidate, (error, stat) => {
    if (!error && stat.isFile()) {
      sendFile(res, candidate, stat, req.method === 'HEAD')
      return
    }

    // SPA fallback：createWebHistory 模式下 /app/chat/123 这类路径要回 index.html。
    // 但带扩展名的资源（/assets/x.js）缺了就是缺了，回 HTML 只会让浏览器报 MIME 错。
    if (path.extname(pathname)) {
      notFound(res)
      return
    }
    const indexHtml = path.join(rootDir, 'index.html')
    fs.stat(indexHtml, (indexError, indexStat) => {
      if (indexError || !indexStat.isFile()) {
        notFound(res)
        return
      }
      sendFile(res, indexHtml, indexStat, req.method === 'HEAD')
    })
  })
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not Found')
}

function sendFile(res, filePath, stat, headOnly) {
  const ext = path.extname(filePath).toLowerCase()
  // Vite 产物在 assets/ 下且文件名带 hash，可以永久缓存；index.html 必须每次校验
  const isImmutable = filePath.includes(`${path.sep}assets${path.sep}`)

  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': isImmutable
      ? 'public, max-age=31536000, immutable'
      : 'no-cache, no-store, must-revalidate',
  })

  if (headOnly) {
    res.end()
    return
  }

  const stream = fs.createReadStream(filePath)
  stream.on('error', () => res.destroy())
  stream.pipe(res)
}

module.exports = { createLocalServer }
