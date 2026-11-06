'use strict'
const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 860, show: true, x: 0, y: 0 })
  win.webContents.session.clearCache()
  await win.loadURL('http://localhost:4182/user/login')
  await new Promise((r) => setTimeout(r, 2400))
  await win.webContents.executeJavaScript(`localStorage.setItem('ai-code:theme', 'terminal')`)
  await win.reload()
  await new Promise((r) => setTimeout(r, 3200))

  // 用打包后的真实 CSS 渲染首页那一段（取 scoped hash，注入同结构）
  const info = await win.webContents.executeJavaScript(`(async () => {
    const href = [...document.styleSheets].map(s => s.href).filter(Boolean).find(u => u.includes('.css'))
    const cssText = await fetch(href).then(r => r.text())
    const m = cssText.match(/hero-section\\[data-v-([0-9a-f]+)\\]/)
    const m2 = cssText.match(/generator-panel\\[data-v-([0-9a-f]+)\\]/)
    const m3 = cssText.match(/#homePage\\[data-v-([0-9a-f]+)\\]/)
    const hash = (m && m[1]) || (m2 && m2[1]) || (m3 && m3[1])
    if (!hash) return { error: 'no hash' }
    const v = 'data-v-' + hash

    const chip = (t) => '<button class="template-chip" ' + v + ' type="button">' + t + '</button>'

    document.body.innerHTML =
      '<div id="homePage" ' + v + '>' +
      '<div class="page-shell" ' + v + '>' +
      '<section class="hero-section" ' + v + '>' +
        '<div class="hero-badge" ' + v + '>智能生成 · 低代码 · 未来体验</div>' +
        '<h1 class="hero-title" ' + v + '>iCodeAI 应用生成平台</h1>' +
        '<p class="hero-description" ' + v + '>一句自然语言，快速生成完整应用原型与交互体验。</p>' +
      '</section>' +
      '<section class="generator-panel" ' + v + '>' +
        '<div class="generator-header" ' + v + '><h2 class="panel-title" ' + v + '>开始生成</h2>' +
        '<p class="panel-subtitle" ' + v + '>描述你的业务目标、页面结构或交互想法，AI 将开始生成。</p></div>' +
        '<textarea class="ant-input" ' + v + ' placeholder="例如：帮我创建一个现代 AI SaaS 官网" style="width:100%;height:92px;border-radius:10px;padding:12px;resize:none"></textarea>' +
        '<div class="quick-actions" ' + v + '>' + chip('个人博客网站') + chip('企业官网') + chip('在线商城') + chip('作品展示网站') + '</div>' +
      '</section>' +
      '</div></div>'

    await new Promise(r => setTimeout(r, 500))
    const cs = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const s = getComputedStyle(el)
      return { bg: s.backgroundColor, shadow: s.boxShadow.slice(0, 90) }
    }
    return {
      hash,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      panelGlow: (() => {
        const el = document.querySelector('#homePage')
        const b = getComputedStyle(el, '::before')
        return { bg: b.backgroundImage.slice(0, 90), opacity: b.opacity }
      })(),
      card: cs('.generator-panel'),
      grid: (() => {
        const el = document.querySelector('.bg-dynamic-global')
        const a = getComputedStyle(el, '::after')
        return a.backgroundImage.slice(0, 120)
      })(),
    }
  })()`)
  console.log(JSON.stringify(info, null, 2))

  const img = await win.webContents.capturePage()
  fs.writeFileSync(path.join(process.env.TEMP, 'home-dark.png'), img.toPNG())
  console.log('saved home-dark.png')
  app.exit(0)
})
