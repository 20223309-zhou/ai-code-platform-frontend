'use strict'
const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const build = async (win, theme) => {
  await win.webContents.executeJavaScript(`localStorage.setItem('ai-code:theme', '${theme}')`)
  await win.reload()
  await new Promise((r) => setTimeout(r, 3200))

  const info = await win.webContents.executeJavaScript(`(async () => {
    const href = [...document.styleSheets].map(s => s.href).filter(Boolean).find(u => u.includes('.css'))
    const cssText = await fetch(href).then(r => r.text())
    const m = cssText.match(/hero-section\\[data-v-([0-9a-f]+)\\]/)
    if (!m) return { error: 'no hash' }
    const v = 'data-v-' + m[1]
    const chip = (t) => '<button class="template-chip" ' + v + ' type="button">' + t + '</button>'

    document.getElementById('app').innerHTML =
      '<div id="homePage" ' + v + '><div class="page-shell" ' + v + '>' +
      '<section class="hero-section" ' + v + '>' +
        '<div class="hero-badge" ' + v + '>智能生成 · 低代码 · 未来体验</div>' +
        '<h1 class="hero-title" ' + v + '>iCodeAI 应用生成平台</h1>' +
        '<p class="hero-description" ' + v + '>一句自然语言，快速生成完整应用原型与交互体验。</p>' +
      '</section>' +
      '<section class="generator-panel" ' + v + '>' +
        '<div class="generator-header" ' + v + '><h2 class="panel-title" ' + v + '>开始生成</h2>' +
        '<p class="panel-subtitle" ' + v + '>描述你的业务目标、页面结构或交互想法，AI 将开始生成。</p></div>' +
        '<textarea class="prompt-input ant-input" ' + v + ' placeholder="例如：帮我创建一个现代 AI SaaS 官网" style="width:100%;height:86px;border-radius:6px;padding:12px;resize:none"></textarea>' +
        '<div class="quick-actions" ' + v + ' style="margin-top:12px">' + chip('个人博客网站') + chip('企业官网') + chip('在线商城') + chip('作品展示网站') + '</div>' +
      '</section></div></div>'

    await new Promise(r => setTimeout(r, 500))
    const panel = document.querySelector('.generator-panel')
    const chipEl = document.querySelector('.template-chip')
    const ps = getComputedStyle(panel)
    return {
      panelBg: ps.backgroundColor,
      panelShadow: ps.boxShadow,
      panelRadius: ps.borderRadius,
      panelBorder: ps.borderColor,
      chipRadius: getComputedStyle(chipEl).borderRadius,
      chipShadow: getComputedStyle(chipEl).boxShadow,
      heroGlow: getComputedStyle(document.querySelector('#homePage'), '::before').backgroundImage.slice(0, 60),
      grid: getComputedStyle(document.querySelector('.bg-dynamic-global'), '::after').backgroundImage.slice(0, 60),
    }
  })()`)
  return info
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 880, show: true, x: 0, y: 0 })
  win.webContents.session.clearCache()
  await win.loadURL('http://localhost:4182/user/login')
  await new Promise((r) => setTimeout(r, 2400))

  const dark = await build(win, 'terminal')
  console.log('深色:', JSON.stringify(dark, null, 2))
  await new Promise((r) => setTimeout(r, 400))
  fs.writeFileSync(path.join(process.env.TEMP, 'home-dark3.png'), (await win.webContents.capturePage()).toPNG())

  const light = await build(win, 'graphite')
  console.log('浅色:', JSON.stringify({ panelShadow: light.panelShadow, panelRadius: light.panelRadius, chipRadius: light.chipRadius }, null, 2))
  await new Promise((r) => setTimeout(r, 400))
  fs.writeFileSync(path.join(process.env.TEMP, 'home-light3.png'), (await win.webContents.capturePage()).toPNG())

  console.log('saved')
  app.exit(0)
})
