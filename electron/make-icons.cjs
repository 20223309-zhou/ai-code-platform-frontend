'use strict'

/**
 * 由 src/assets/logo-mark-square.png 生成桌面端图标（electron/assets/icon.ico + icon.png）。
 *
 * 为什么需要这一步：
 *   - 不设 BrowserWindow.icon 时，Windows 任务栏显示的是 Electron 默认原子图标，
 *     用户一眼就能认出"这是个套壳网页"，而不是一个独立应用
 *   - .ico 必须是多尺寸的：任务栏 32、高 DPI 48、Alt+Tab 64、
 *     桌面快捷方式 128/256 各取一档，单尺寸会被系统强行拉伸变糊
 *
 * 两种样式，用 STYLE 切换：
 *   'bare'     透明背景，只放 logo 本体（当前使用）
 *   'gradient' 品牌渐变圆角底 + 白色化图标
 *
 * 实测结论（64/48/32/24/16 五档在深浅任务栏上的对比）：
 *   裸版在 32px 仍能辨认出 i 和 ∞，浅色深色背景都立得住 ——
 *   因为 logo 本身是高饱和紫蓝渐变，反差足够。
 *   唯一短板是 16px（文件列表那种小图标）会糊成两团颜色。
 *   渐变底版整体更"实"，小尺寸更稳，但视觉上更重。
 *
 * 用法：npm run desktop:icons
 */

const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const SRC = path.join(__dirname, '..', 'src', 'assets', 'logo-mark-square.png')
const OUT_DIR = path.join(__dirname, 'assets')
const SIZES = [256, 128, 64, 48, 32, 16]

/** 'bare' = 透明裸图标；'gradient' = 渐变圆角底 + 白 logo */
const STYLE = 'bare'

/** 裸版：内容宽度占画布的多少。0.96 留一点边，避免贴边被裁 */
const BARE_SHARE = 0.96

/** 渐变版参数（STYLE='gradient' 时才用） */
const GRAD_FROM = '#5f1fe9'
const GRAD_TO = '#1d60fc'
const CONTENT_SHARE = 0.56
const CORNER_RATIO = 0.22

/** 按 ICO 容器格式拼装：6 字节目录头 + 每项 16 字节目录项 + 连续 PNG 数据 */
function buildIco(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type = icon
  header.writeUInt16LE(pngs.length, 4)

  const entries = []
  const payloads = []
  let offset = 6 + pngs.length * 16

  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // 宽：256 用 0 表示
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // 高：同上
    entry.writeUInt8(0, 2) // 调色板颜色数，真彩填 0
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // color planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    payloads.push(data)
    offset += data.length
  }

  return Buffer.concat([header, ...entries, ...payloads])
}

app.whenReady().then(async () => {
  if (!fs.existsSync(SRC)) {
    console.error(`[icons] 找不到源图：${SRC}`)
    app.exit(1)
    return
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const b64 = fs.readFileSync(SRC).toString('base64')

  // 用隐藏窗口里的 canvas 合成：缩放、圆角、渐变、白化都是浏览器原生能力，
  // 比在主进程里逐像素操作 BGRA 可靠得多（原生位图是预乘 alpha，
  // 改 alpha 还得手动乘 RGB 抵消，很容易出错）
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } })
  await win.loadURL('data:text/html,<html><body></body></html>')

  const rendered = await win.webContents.executeJavaScript(`(async () => {
    const img = new Image()
    img.src = 'data:image/png;base64,${b64}'
    await img.decode()

    // 求真实内容边界。阈值用 200 而不是 100：logo 边缘有很弱的抗锯齿 alpha，
    // 用低阈值会把渐变拖尾算进内容，裁出来的框偏大、图形显小。
    const probe = document.createElement('canvas')
    probe.width = img.width
    probe.height = img.height
    const pctx = probe.getContext('2d', { willReadFrequently: true })
    pctx.drawImage(img, 0, 0)
    const pd = pctx.getImageData(0, 0, probe.width, probe.height).data

    let minX = probe.width, minY = probe.height, maxX = -1, maxY = -1
    for (let y = 0; y < probe.height; y++) {
      for (let x = 0; x < probe.width; x++) {
        if (pd[(y * probe.width + x) * 4 + 3] > 200) {
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
        }
      }
    }
    const contentW = maxX - minX + 1
    const contentH = maxY - minY + 1

    // 渐变版需要一份白色化的副本：彩色 logo 叠彩色底会糊成一片
    let white = null
    if ('${STYLE}' === 'gradient') {
      white = document.createElement('canvas')
      white.width = img.width
      white.height = img.height
      const wctx = white.getContext('2d')
      wctx.drawImage(img, 0, 0)
      const wd = wctx.getImageData(0, 0, white.width, white.height)
      for (let i = 0; i < wd.data.length; i += 4) {
        wd.data[i] = 255
        wd.data[i + 1] = 255
        wd.data[i + 2] = 255
      }
      wctx.putImageData(wd, 0, 0)
    }

    const render = (size) => {
      const c = document.createElement('canvas')
      c.width = size
      c.height = size
      const ctx = c.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      if ('${STYLE}' === 'gradient') {
        const r = size * ${CORNER_RATIO}
        ctx.beginPath()
        ctx.moveTo(r, 0)
        ctx.arcTo(size, 0, size, size, r)
        ctx.arcTo(size, size, 0, size, r)
        ctx.arcTo(0, size, 0, 0, r)
        ctx.arcTo(0, 0, size, 0, r)
        ctx.closePath()
        const g = ctx.createLinearGradient(0, 0, size, size)
        g.addColorStop(0, '${GRAD_FROM}')
        g.addColorStop(1, '${GRAD_TO}')
        ctx.fillStyle = g
        ctx.fill()

        const w = size * ${CONTENT_SHARE}
        const h = w * (img.height / img.width)
        ctx.drawImage(white, (size - w) / 2, (size - h) / 2, w, h)
      } else {
        // 裸版：裁到内容边界，按宽度撑满画布，垂直居中
        const w = size * ${BARE_SHARE}
        const h = w * (contentH / contentW)
        ctx.drawImage(img, minX, minY, contentW, contentH, (size - w) / 2, (size - h) / 2, w, h)
      }

      return c.toDataURL('image/png')
    }

    return ${JSON.stringify(SIZES)}.map((s) => ({ size: s, url: render(s) }))
  })()`)

  const pngs = rendered.map(({ size, url }) => ({
    size,
    data: Buffer.from(url.split(',')[1], 'base64'),
  }))

  const icoPath = path.join(OUT_DIR, 'icon.ico')
  fs.writeFileSync(icoPath, buildIco(pngs))

  // png 给 macOS/Linux 与打包工具兜底；256 是各平台通用的推荐尺寸
  const pngPath = path.join(OUT_DIR, 'icon.png')
  fs.writeFileSync(pngPath, pngs[0].data)

  console.log(`[icons] 样式=${STYLE}，已生成 ${SIZES.join('/')} → ${icoPath}`)
  console.log(`[icons] 已生成 256×256 → ${pngPath}`)

  win.destroy()
  app.exit(0)
})
