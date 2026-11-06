'use strict'
const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const OLD = path.join(__dirname, '../src/assets/logo.png')
const NEW = path.join(__dirname, '../src/assets/logo-mark-square.png')
const WIDE = path.join(__dirname, '../src/assets/logo-mark.png')

app.whenReady().then(async () => {
  const o = fs.readFileSync(OLD).toString('base64')
  const n = fs.readFileSync(NEW).toString('base64')
  const w = fs.readFileSync(WIDE).toString('base64')

  const win = new BrowserWindow({ width: 900, height: 700, show: true, x: 0, y: 0 })
  await win.loadURL('data:text/html,<html><body style="margin:0"></body></html>')

  await win.webContents.executeJavaScript(`(() => {
    const row = (bg, label) => \`
      <div style="background:/${bg};padding:18px 22px;display:flex;align-items:center;gap:26px">
        <span style="width:96px;font:12px/1.4 system-ui;color:#888">\${label}</span>
        <img src="data:image/png;base64,${o}" style="width:26px;height:26px;object-fit:contain">
        <img src="data:image/png;base64,${n}" style="width:26px;height:26px;object-fit:contain">
        <img src="data:image/png;base64,${o}" style="width:120px;height:120px;object-fit:contain">
        <img src="data:image/png;base64,${n}" style="width:120px;height:120px;object-fit:contain">
        <img src="data:image/png;base64,${w}" style="height:26px;width:auto">
      </div>\`

    document.body.innerHTML =
      '<div style="font:13px system-ui;color:#555;padding:10px 22px">' +
      '浅底：&nbsp; 旧26px &nbsp;&nbsp; 新26px &nbsp;&nbsp;&nbsp;&nbsp; 旧120px &nbsp;&nbsp; 新120px &nbsp;&nbsp; 横版26px高</div>' +
      row('#f7f7f8', '浅色侧栏') +
      row('#0d0d0f', '深色侧栏') +
      '<div style="padding:10px 22px;font:13px system-ui;color:#555">深底：&nbsp; 旧26px &nbsp;&nbsp; 新26px &nbsp;&nbsp;&nbsp;&nbsp; 旧120px &nbsp;&nbsp; 新120px &nbsp;&nbsp; 横版26px高</div>'
    return true
  })()`)
  await new Promise((r) => setTimeout(r, 800))
  fs.writeFileSync(path.join(process.env.TEMP, 'logo-compare.png'), (await win.webContents.capturePage()).toPNG())
  console.log('saved logo-compare.png')
  app.exit(0)
})
