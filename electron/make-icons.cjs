'use strict'

/**
 * 由 src/assets/logo.png 生成桌面端图标（electron/assets/icon.ico + icon.png）。
 *
 * 为什么需要这一步：
 *   - 不设 BrowserWindow.icon 时，Windows 任务栏显示的是 Electron 默认原子图标，
 *     用户一眼就能认出"这是个套壳网页"，而不是一个独立应用
 *   - .ico 必须是多尺寸的：任务栏 32、高 DPI 48、Alt+Tab 64、
 *     桌面快捷方式 128/256 各取一档，单尺寸会被系统强行拉伸变糊
 *
 * 缩放借 Electron 自带的 nativeImage（skia），不额外引 sharp/png-to-ico。
 * 源图只有 128×128，所以 256 档是放大的，仅用于资源管理器大图标视图。
 *
 * 用法：npm run desktop:icons
 */

const { app, nativeImage } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const SRC = path.join(__dirname, '..', 'src', 'assets', 'logo.png')
const OUT_DIR = path.join(__dirname, 'assets')
const SIZES = [256, 128, 64, 48, 32, 16]

/**
 * 把方形图裁成超椭圆（squircle）并让四角透明。
 *
 * 源 logo 是浅米色实底，直接当图标会在深色任务栏上变成一个突兀的方块。
 * 用 |x|^n + |y|^n <= 1 的边界（n≈4.5）比圆角矩形更接近系统图标的形状语言，
 * 边缘用一像素过渡带做抗锯齿，避免锯齿毛边。
 *
 * toBitmap() 给的是 BGRA，且 createFromBitmap() 按预乘 alpha 解释，
 * 所以改 alpha 时必须同时把 RGB 乘上同一系数，否则边缘会渗出原色。
 */
function applySquircle(image, size, power = 4.5, feather = 1.2) {
  const bitmap = image.toBitmap()
  const half = size / 2
  // 归一化到 [-1, 1]，让超椭圆公式的各档尺寸形状一致
  const scale = half - 0.5

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = Math.abs((x + 0.5 - half) / scale)
      const ny = Math.abs((y + 0.5 - half) / scale)
      const r = Math.pow(Math.pow(nx, power) + Math.pow(ny, power), 1 / power)

      // r <= 1 在内部；只处理边缘一圈，内部像素完全不动
      let factor = 1
      if (r > 1) {
        factor = 0
      } else if (r > 1 - feather / scale) {
        factor = (1 - r) / (feather / scale)
        factor = Math.max(0, Math.min(1, factor))
      }
      if (factor === 1) {
        continue
      }

      const i = (y * size + x) * 4
      bitmap[i] = Math.round(bitmap[i] * factor) // B
      bitmap[i + 1] = Math.round(bitmap[i + 1] * factor) // G
      bitmap[i + 2] = Math.round(bitmap[i + 2] * factor) // R
      bitmap[i + 3] = Math.round(bitmap[i + 3] * factor) // A
    }
  }

  return nativeImage.createFromBitmap(bitmap, { width: size, height: size })
}

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

app.whenReady().then(() => {
  if (!fs.existsSync(SRC)) {
    console.error(`[icons] 找不到源图：${SRC}`)
    app.exit(1)
    return
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const source = nativeImage.createFromPath(SRC)
  if (source.isEmpty()) {
    console.error('[icons] 源图解码失败')
    app.exit(1)
    return
  }

  const pngs = SIZES.map((size) => {
    const resized = source.resize({ width: size, height: size, quality: 'best' })
    const framed = applySquircle(resized, size)
    return { size, data: framed.toPNG() }
  })

  const icoPath = path.join(OUT_DIR, 'icon.ico')
  fs.writeFileSync(icoPath, buildIco(pngs))

  // png 给 macOS/Linux 与打包工具兜底；256 是各平台通用的推荐尺寸
  const pngPath = path.join(OUT_DIR, 'icon.png')
  fs.writeFileSync(pngPath, pngs[0].data)

  console.log(`[icons] 已生成 ${SIZES.join('/')} → ${icoPath}`)
  console.log(`[icons] 已生成 256×256 → ${pngPath}`)
  app.exit(0)
})
