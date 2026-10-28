'use strict'

/**
 * proxy.cjs 的独立自检脚本（不依赖 Electron）。
 * 用法：node electron/smoke-test.cjs
 */

const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { createLocalServer } = require('./proxy.cjs')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const FAKE_BACKEND_PORT = 39001

const results = []
function check(name, passed, detail) {
  results.push({ name, passed, detail })
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? '  → ' + detail : ''}`)
}

function get(port, requestPath, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, path: requestPath, method: options.method || 'GET', headers: options.headers || {} },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          }),
        )
      },
    )
    req.on('error', reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

async function main() {
  // 0. 桌面端静态资产：图标没生成、productName 没设，任务栏就会退回
  //    Electron 默认的原子图标和包名，属于打包前最容易漏的一步，先卡住
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
  check('package.json 设置了 productName', pkg.productName === 'iCodeAI', String(pkg.productName))

  const icoPath = path.join(__dirname, 'assets', 'icon.ico')
  const ico = fs.existsSync(icoPath) ? fs.readFileSync(icoPath) : null
  check('应用图标 icon.ico 存在', Boolean(ico), icoPath)
  if (ico) {
    const count = ico.readUInt16LE(4)
    const sizes = []
    for (let i = 0; i < count; i++) {
      sizes.push(ico.readUInt8(6 + i * 16) || 256)
    }
    check('图标含 32/256 两档（任务栏 + 大图标）', sizes.includes(32) && sizes.includes(256), sizes.join('/'))
  }

  // 假后端：验证代理转发、Set-Cookie 重写、SSE 流式
  const fakeBackend = http.createServer((req, res) => {
    if (req.url.startsWith('/api/sse')) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
      res.write('data: {"d":"chunk1"}\n\n')
      setTimeout(() => {
        res.write('data: {"d":"chunk2"}\n\n')
        res.end()
      }, 120)
      return
    }
    if (req.url.startsWith('/api/login')) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': [
          'SESSION=abc123; Domain=api.example.com; Path=/api; HttpOnly; SameSite=None; Secure',
        ],
      })
      res.end(JSON.stringify({ code: 0 }))
      return
    }
    // 回显收到的 method / path / cookie / body 大小
    let size = 0
    req.on('data', (chunk) => (size += chunk.length))
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          method: req.method,
          url: req.url,
          host: req.headers.host,
          cookie: req.headers.cookie || null,
          bodyBytes: size,
        }),
      )
    })
  })

  await new Promise((resolve) => fakeBackend.listen(FAKE_BACKEND_PORT, '127.0.0.1', resolve))

  const { server, port } = await createLocalServer({
    distDir: DIST_DIR,
    apiOrigin: `http://127.0.0.1:${FAKE_BACKEND_PORT}`,
    proxyPrefixes: ['/api'],
    port: 39080,
    portRetries: 5,
  })
  console.log(`本地服务已启动：http://127.0.0.1:${port}\n`)

  // 1. 首页
  const index = await get(port, '/')
  check('GET / 返回 index.html', index.status === 200 && index.body.includes('<div id="app">'), `status=${index.status}`)
  check('index.html 不缓存', String(index.headers['cache-control']).includes('no-store'))

  // 2. assets 长缓存
  const cssMatch = index.body.match(/\/assets\/[^"']+\.css/)
  if (cssMatch) {
    const asset = await get(port, cssMatch[0])
    check('assets 资源可访问', asset.status === 200, `status=${asset.status}`)
    check('assets 使用 immutable 缓存', String(asset.headers['cache-control']).includes('immutable'))
  } else {
    check('找到 assets 引用', false, 'index.html 里没匹配到 /assets/*.css')
  }

  // 3. SPA fallback（createWebHistory 依赖）
  const spa = await get(port, '/app/chat/123456')
  check('SPA 路由回退到 index.html', spa.status === 200 && spa.body.includes('<div id="app">'), `status=${spa.status}`)

  // 4. 缺失的带扩展名资源不能回退成 HTML
  const missing = await get(port, '/assets/not-exist-abc123.js')
  check('缺失资源返回 404 而不是 HTML', missing.status === 404, `status=${missing.status}`)

  // 5. 目录穿越
  const traversal = await get(port, '/../../package.json')
  check('拒绝目录穿越', traversal.status === 403 || traversal.status === 404, `status=${traversal.status}`)

  // 6. 代理转发：路径与 host
  const proxied = await get(port, '/api/user/get/login')
  const parsed = JSON.parse(proxied.body)
  check('代理保留 /api 前缀', parsed.url === '/api/user/get/login', `url=${parsed.url}`)
  check('代理改写 Host 为后端域名', parsed.host === `127.0.0.1:${FAKE_BACKEND_PORT}`, `host=${parsed.host}`)

  // 7. Cookie 透传
  await get(port, '/api/user/get/login', { headers: { cookie: 'SESSION=abc123' } })
  const withCookie = await get(port, '/api/user/list', { headers: { cookie: 'SESSION=abc123' } })
  check('请求侧 Cookie 正常转发', JSON.parse(withCookie.body).cookie === 'SESSION=abc123')

  // 8. Set-Cookie 重写
  const login = await get(port, '/api/login')
  const setCookie = String(login.headers['set-cookie'] || '')
  check('剥掉 Domain', !/domain=/i.test(setCookie), setCookie)
  check('剥掉 Secure', !/secure/i.test(setCookie), setCookie)
  check('剥掉 SameSite', !/samesite/i.test(setCookie), setCookie)
  check('Path 重写为 /', /path=\//i.test(setCookie), setCookie)
  check('保留 HttpOnly', /httponly/i.test(setCookie), setCookie)

  // 9. POST body 转发
  const post = await get(port, '/api/app/add', { method: 'POST', body: 'x'.repeat(2048) })
  const postParsed = JSON.parse(post.body)
  check('POST 保留方法', postParsed.method === 'POST', postParsed.method)
  check('POST body 完整转发', postParsed.bodyBytes === 2048, `bytes=${postParsed.bodyBytes}`)

  // 10. SSE 流式：两段数据要分两次到达
  const arrivals = []
  await new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, path: '/api/sse', method: 'GET' },
      (res) => {
        res.on('data', (chunk) => arrivals.push({ at: Date.now(), text: chunk.toString() }))
        res.on('end', resolve)
      },
    )
    req.on('error', reject)
    req.end()
  })
  check('SSE 分两次到达（未被缓冲）', arrivals.length >= 2, `chunks=${arrivals.length}`)
  if (arrivals.length >= 2) {
    const gap = arrivals[arrivals.length - 1].at - arrivals[0].at
    check('SSE 间隔接近服务端延迟 120ms', gap >= 80, `${gap}ms`)
  }

  server.close()
  fakeBackend.close()

  const failed = results.filter((item) => !item.passed)
  console.log(`\n合计 ${results.length} 项，失败 ${failed.length} 项`)
  process.exitCode = failed.length === 0 ? 0 : 1
}

main().catch((error) => {
  console.error('自检异常：', error)
  process.exitCode = 1
})
