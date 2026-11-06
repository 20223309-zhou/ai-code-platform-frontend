'use strict'

/**
 * Electron 主进程。
 *
 * 两种运行模式（见 config.cjs 的 mode）：
 *
 *   online（默认）：窗口直接加载线上站点。页面与后端同域，Session Cookie、
 *     OAuth 回调、预览 iframe 全部天然成立 —— GitHub 登录只有在这种同域下才行。
 *
 *   local：壳内起本地服务托管 dist 并把 /api 转发到远端后端（离线可用、
 *     前端版本可控）。但页面在 127.0.0.1 下，OAuth 回调落在线上域名，
 *     Cookie 写不进壳内，**GitHub 登录必然失败**，仅作离线演示保留。
 *
 * ⚠️ local 模式不要改成 `loadFile('dist/index.html')`。file:// 是不透明源：
 *    - 请求后端的接口算跨源，Cookie 反而不发
 *    - iframe 里的生成页面与主页面不同源，可视化编辑直接失效
 *    走本地 http 是 local 模式能"后端零改动"的前提。
 *
 * ⚠️ app.setName() 必须放在最顶部，且早于任何 app.getPath('userData')。
 *    它决定 userData 目录名（localStorage、Session Cookie、窗口状态都在这儿）。
 *    改名后旧目录不会被读取，等于登录态清空一次 —— 这是预期行为，不是 bug。
 */

const { app, BrowserWindow, Menu, Tray, dialog, shell, nativeImage, ipcMain, session } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const { createLocalServer } = require('./proxy.cjs')
const config = require('./config.cjs')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const APP_TITLE = 'iCodeAI'

// 图标：Windows 用多尺寸 ico（任务栏 32 / 高 DPI 48 / Alt+Tab 64 各取一档），
// 其他平台用 png。都由 npm run desktop:icons 从 src/assets/logo-mark-square.png
// 合成（渐变圆角底 + 白色图标），不是直接拿网页 logo 缩放。
//
// ⚠️ 打包后必须走 resourcesPath：asar 里的文件 JS 层能读，但 Tray /
//    BrowserWindow 的图标是原生解码，asar 内路径在部分 Windows 版本上加载失败。
//    所以 electron-builder.yml 里用 extraResources 把 ico 复制成真实文件。
const ICON_DIR = app.isPackaged ? process.resourcesPath : path.join(__dirname, 'assets')
const ICON_ICO = path.join(ICON_DIR, 'icon.ico')
const ICON_PNG = path.join(ICON_DIR, 'icon.png')
const ICON_PATH = process.platform === 'win32' ? ICON_ICO : ICON_PNG

/** 所有窗口共用：同一个 preload，同一套安全项 */
const WEB_PREFERENCES = {
  preload: path.join(__dirname, 'preload.cjs'),
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  spellcheck: false,
}

app.setName(APP_TITLE)

let mainWindow = null
let localServer = null
let appOrigin = ''
/** appId → 独立窗口，避免同一个应用被开出多个窗口 */
const appWindows = new Map()
/** online = 直接加载线上站点；local = 壳内本地服务托管 dist（见 config.cjs） */
const APP_MODE = config.mode
/** OAuth 授权必须留在壳内完成，否则 Cookie 落在系统浏览器里，回来还是未登录 */
const OAUTH_HOSTS = ['github.com', 'www.github.com']
let tray = null
/** 区分「用户点关闭」和「真的要退出」，否则托盘退出会被 close 拦截成隐藏 */
let isQuitting = false
let trayHintShown = false

const DEFAULT_SETTINGS = {
  /** 关闭窗口时隐藏到托盘而不是退出（后台跑任务的基础） */
  minimizeToTray: true,
  /** 开机自启，仅打包后真正写入系统启动项 */
  autoLaunch: false,
}
let settings = { ...DEFAULT_SETTINGS }

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // 窗口可能是隐藏到托盘的状态，只 focus 不会把它显示出来
    showMainWindow()
  })

  app.whenReady().then(bootstrap).catch(handleFatal)
}

async function bootstrap() {
  // Windows 任务栏分组、通知、跳转列表都靠这个 ID 识别应用。
  // 打包后要与安装程序写入快捷方式的 AppUserModelID 保持一致。
  app.setAppUserModelId('com.aicodeplatform.desktop')

  setupLogging()
  loadSettings()

  if (APP_MODE === 'local') {
    if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
      dialog.showErrorBox(
        '前端资源缺失',
        `没有找到构建产物：\n${DIST_DIR}\n\n请先执行：\n  npm run desktop:build`,
      )
      app.quit()
      return
    }

    const { server, port } = await createLocalServer({ distDir: DIST_DIR, ...config })
    localServer = server
    appOrigin = `http://127.0.0.1:${port}`
    console.log(`[desktop] 本地模式 ${appOrigin}  →  后端 ${config.apiOrigin}`)
  } else {
    // 在线模式：页面与 API 同域，Cookie / OAuth 回调 / iframe 预览都不需要额外处理
    appOrigin = config.webOrigin
    console.log(`[desktop] 在线模式 ${appOrigin}`)
  }

  buildMenu()
  createWindow()
  createTray()

  // 主文档不缓存。
  //
  // online 模式走的是 nginx，缓存的 index.html 会指向旧的 assets/index-*.js，
  // 结果是前端已经更新了，应用重开还是老界面（连新功能都看不到）。
  // 只对 mainFrame 加 no-cache：静态资源带 hash，继续走缓存不影响。
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.resourceType === 'mainFrame') {
      details.requestHeaders['Cache-Control'] = 'no-cache'
      details.requestHeaders['Pragma'] = 'no-cache'
    }
    callback({ requestHeaders: details.requestHeaders })
  })

  // 侧栏「在新窗口打开」走这里：渲染进程不能直接建窗口
  ipcMain.handle('desktop:open-app-window', (event, appId, appName) =>
    createAppWindow(appId, appName),
  )

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      showMainWindow()
    }
  })
}

function createWindow() {
  mainWindow = createBaseWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    title: APP_TITLE,
  })

  // 页面里的 <title> 是「AI 零代码应用生成平台」，加载完会覆盖窗口标题，
  // 任务栏按钮就会显示这串长中文。桌面端要的是应用名，所以直接锁死。
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
    mainWindow.setTitle(APP_TITLE)
  })

  const startHidden = process.argv.includes('--hidden')
  mainWindow.once('ready-to-show', () => {
    if (!startHidden) {
      mainWindow.show()
    }
  })

  mainWindow.loadURL(appOrigin)

  // 关闭 = 隐藏到托盘（默认）。AI 生成是长任务，误关窗口把整轮对话打断很烦。
  // 想彻底关掉可以改托盘菜单的开关，或用托盘/菜单里的「退出」。
  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return
    }
    if (!settings.minimizeToTray) {
      // 允许真正关闭，随后 window-all-closed 里退出
      return
    }
    event.preventDefault()
    mainWindow.hide()
    showTrayHintOnce()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 关机/注销时必须放行。隐藏到托盘的 close 拦截会连带拦住系统关机流程，
  // Windows 上表现为"点了关机又弹回桌面"，是托盘应用最常见的恶评来源。
  mainWindow.on('query-session-end', () => {
    isQuitting = true
  })
  mainWindow.on('session-end', () => {
    isQuitting = true
  })
}

/**
 * 创建窗口的公共部分（尺寸之外的都一样）。
 *
 * 主窗口和「应用独立窗口」共用这套配置：同一个 preload、同一套安全项、
 * 同样的标题栏方案。差异只交给调用方处理（关闭行为、标题、是否隐藏启动）。
 */
function createBaseWindow(options) {
  const win = new BrowserWindow({
    ...options,
    // 任务栏按钮和 Alt+Tab 缩略图取这里，不设就是 Electron 默认的原子图标
    icon: ICON_PATH,
    // 与前端浅色主题对齐，避免窗口出现瞬间闪白/闪黑
    backgroundColor: '#f5f6f8',
    show: false,
    // Windows 原生标题栏和页内导航会形成上下两条顶栏，视觉上很厚。
    // 隐藏原生标题栏，把最小化/最大化/关闭做成覆盖在内容右上角的浮层，
    // 页内导航就是唯一的顶栏。透明底色让页面的氛围背景能透出来。
    // 前端配套：GlobalHeader 加 -webkit-app-region: drag（否则窗口拖不动）
    //          并留出 148px 右内边距（否则窗口按钮压住登录/头像）
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#4b5563',
      // 与 BasicLayout 的 .window-bar 同高，否则按钮会盖到内容区
      height: 48,
    },
    webPreferences: WEB_PREFERENCES,
  })

  attachWebContentsHandlers(win)
  return win
}

/** 所有窗口都要遵守的网页行为：链接外跳、右键菜单、加载失败兜底 */
function attachWebContentsHandlers(win) {
  win.webContents.on('did-finish-load', () => {
    console.log('[desktop] 页面加载完成')
  })

  win.webContents.on('did-fail-load', (event, code, description, url, isMainFrame) => {
    console.error(`[desktop] 页面加载失败 code=${code} ${description} ${url}`)
    // -3 = ERR_ABORTED，重定向或打不开新窗口时的常见结果，不是真的失败
    if (!isMainFrame || code === -3) {
      return
    }
    showOfflinePage(win)
  })

  // 右键菜单：浏览器里"右键→粘贴"是系统给的，Electron 默认什么都不弹。
  // 输入框里想粘贴密码却没有菜单，是最容易被吐槽的"这不像个应用"。
  win.webContents.on('context-menu', (event, params) => {
    const items = []
    if (params.isEditable) {
      items.push(
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      )
    } else if (params.selectionText && params.selectionText.trim()) {
      items.push({ role: 'copy', label: '复制' })
    }
    if (items.length > 0) {
      Menu.buildFromTemplate(items).popup({ window: win })
    }
  })

  // 站内链接留在壳里，站外的交给系统浏览器
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternally(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (!isInAppUrl(url)) {
      event.preventDefault()
      openExternally(url)
    }
  })
}

/**
 * 在独立窗口里打开某个应用。
 *
 * 这是"并行对话"的实现方式：每个窗口是独立渲染进程，
 * 有自己的 SSE 连接和组件状态，一个窗口在生成不影响另一个。
 * 页内切换做不到 —— 组件卸载会 abort 流并调取消接口。
 */
function createAppWindow(rawAppId, rawAppName) {
  const appId = String(rawAppId || '').trim()
  if (!/^[1-9]\d*$/.test(appId)) {
    console.warn('[desktop] 非法 appId，拒绝打开窗口：', rawAppId)
    return false
  }

  const existing = appWindows.get(appId)
  if (existing && !existing.isDestroyed()) {
    if (existing.isMinimized()) {
      existing.restore()
    }
    existing.show()
    existing.focus()
    return true
  }

  const label = rawAppName ? `${APP_TITLE} · ${rawAppName}` : `${APP_TITLE} · 应用 ${appId}`
  const win = createBaseWindow({
    width: 1280,
    height: 840,
    minWidth: 1000,
    minHeight: 680,
    title: label,
  })

  // 标题同样要锁：页面 <title> 会把窗口标题覆盖成长中文
  win.on('page-title-updated', (event) => {
    event.preventDefault()
    win.setTitle(label)
  })

  win.once('ready-to-show', () => win.show())
  win.loadURL(`${appOrigin}/app/chat/${appId}`)

  win.on('closed', () => {
    appWindows.delete(appId)
    console.log(`[desktop] 关闭应用窗口 appId=${appId}`)
  })

  appWindows.set(appId, win)
  console.log(`[desktop] 打开应用窗口 appId=${appId} title=${label}`)
  return true
}

/**
 * 判断一个地址该留在壳内还是交给系统浏览器。
 *
 * 两条例外规则都是踩过坑的：
 *   1. GitHub 必须留在壳内 —— OAuth 授权完成后后端要靠同域 Cookie 认人，
 *      丢给系统浏览器的话 Cookie 落在浏览器里，壳内回来仍是未登录
 *   2. 同域的 /dist/** 必须踢出去 —— 那是生成出来的作品页面，
 *      在壳里打开会顶掉应用界面，且没有后退入口
 */
function isInAppUrl(rawUrl) {
  if (!rawUrl.startsWith(appOrigin)) {
    try {
      return OAUTH_HOSTS.includes(new URL(rawUrl).hostname)
    } catch {
      return false
    }
  }
  try {
    return !new URL(rawUrl).pathname.startsWith('/dist/')
  } catch {
    return true
  }
}

/**
 * 在线模式下服务器不可达时给个能看懂的页面。
 * 不加这个，用户看到的是 Chromium 默认的 ERR_CONNECTION_REFUSED 白屏，
 * 会以为是应用坏了。
 */
function showOfflinePage(win) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>连不上服务器</title>
<style>
  html,body{height:100%;margin:0}
  body{display:flex;align-items:center;justify-content:center;background:#f5f6f8;
       font-family:system-ui,"Microsoft YaHei",sans-serif;color:#4a5a6e}
  .box{text-align:center;max-width:440px;padding:32px}
  h1{font-size:17px;color:#2c3a4d;margin:0 0 12px;font-weight:600}
  p{font-size:13px;line-height:1.8;margin:0 0 20px}
  a{display:inline-block;padding:8px 22px;border-radius:8px;background:#4a6fa5;
    color:#fff;text-decoration:none;font-size:13px}
</style></head><body><div class="box">
  <h1>连不上服务器</h1>
  <p>桌面端直接加载线上站点，当前网络访问不到<br>${appOrigin}<br>请检查网络后重试。</p>
  <a href="${appOrigin}">重新加载</a>
</div></body></html>`
  if (win && !win.isDestroyed()) {
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  }
}

/** 只放行 http/https，避免被 file:// 或自定义协议利用 */
function openExternally(rawUrl) {  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      shell.openExternal(rawUrl)
    }
  } catch {
    // 非法 URL 直接忽略
  }
}

// ---------------------------------------------------------------- 日志

/**
 * 把主进程日志同时写一份到 %APPDATA%\iCodeAI\logs\main.log。
 *
 * 打包后是 GUI 子系统，没有控制台，console.log 直接消失 ——
 * 白屏、托盘异常、页面加载失败这类问题完全没法查。
 * 超过 1MB 就滚成 main.log.old，只留一份，不做无限增长。
 */
function setupLogging() {
  try {
    const dir = path.join(app.getPath('userData'), 'logs')
    fs.mkdirSync(dir, { recursive: true })
    const file = path.join(dir, 'main.log')
    if (fs.existsSync(file) && fs.statSync(file).size > 1024 * 1024) {
      fs.renameSync(file, `${file}.old`)
    }
    const stream = fs.createWriteStream(file, { flags: 'a' })
    const stamp = () => new Date().toISOString().slice(11, 23)
    for (const level of ['log', 'warn', 'error']) {
      const original = console[level].bind(console)
      console[level] = (...args) => {
        original(...args)
        stream.write(`[${stamp()}] [${level}] ${args.join(' ')}\n`)
      }
    }
    console.log(`[desktop] v${app.getVersion()} packaged=${app.isPackaged} userData=${app.getPath('userData')}`)
  } catch (error) {
    // 日志本身不能成为启动失败的原因
    console.warn('[desktop] 日志初始化失败：', error.message)
  }
}

// ---------------------------------------------------------------- 托盘与后台运行

function createTray() {
  const image = nativeImage.createFromPath(ICON_PATH)
  tray = new Tray(image.isEmpty() ? ICON_PNG : image)
  tray.setToolTip(`${APP_TITLE} · 在后台运行中`)
  rebuildTrayMenu()
  // 单击/双击都能把窗口叫回来，比要求用户先右键再选菜单自然
  tray.on('click', showMainWindow)
  tray.on('double-click', showMainWindow)
}

function rebuildTrayMenu() {
  if (!tray) {
    return
  }
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: `打开 ${APP_TITLE}`, click: showMainWindow },
      { type: 'separator' },
      {
        label: '关闭窗口时最小化到托盘',
        type: 'checkbox',
        checked: settings.minimizeToTray,
        click: (item) => {
          settings.minimizeToTray = item.checked
          saveSettings()
        },
      },
      {
        label: '开机自动启动',
        type: 'checkbox',
        checked: settings.autoLaunch,
        click: (item) => applyAutoLaunch(item.checked),
      },
      { type: 'separator' },
      { label: '退出', click: quitApp },
    ]),
  )
}

function showMainWindow() {
  if (!mainWindow) {
    createWindow()
    return
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.show()
  mainWindow.focus()
}

/** 第一次隐藏到托盘时提示一次，否则用户会以为程序被自己关掉了 */
function showTrayHintOnce() {
  if (trayHintShown) {
    return
  }
  trayHintShown = true
  if (!tray) {
    return
  }
  if (process.platform === 'win32') {
    // Win10 起气泡通知受系统"通知"开关控制，可能看不到，
    // 但它不打断操作，比弹模态框合适（模态框会让「关闭窗口」变得不干脆）
    tray.displayBalloon({
      title: APP_TITLE,
      content: '窗口已隐藏，程序仍在后台运行。点击托盘图标可重新打开，右键可退出。',
      iconType: 'info',
      noSound: true,
    })
    return
  }
  console.log('[desktop] 窗口已隐藏到托盘，程序仍在后台运行')
}

function applyAutoLaunch(enabled) {
  settings.autoLaunch = enabled
  saveSettings()

  // 未打包时 process.execPath 是 node_modules 里的 electron.exe，
  // 写进启动项只会开机弹出一个空白 Electron，没有意义还会污染注册表。
  if (!app.isPackaged) {
    console.log('[desktop] 开发模式下不写系统启动项，打包后生效')
    rebuildTrayMenu()
    return
  }

  app.setLoginItemSettings({
    openAtLogin: enabled,
    // 静默启动：开机时只进托盘，不抢焦点弹出主窗口
    args: enabled ? ['--hidden'] : [],
    path: process.execPath,
  })
  rebuildTrayMenu()
}

function quitApp() {
  isQuitting = true
  app.quit()
}

// ---------------------------------------------------------------- 设置持久化

function settingsFile() {
  return path.join(app.getPath('userData'), 'desktop-settings.json')
}

function loadSettings() {
  try {
    const raw = JSON.parse(fs.readFileSync(settingsFile(), 'utf8'))
    settings = { ...DEFAULT_SETTINGS, ...raw }
  } catch {
    // 首次启动或文件损坏，用默认值即可，不必打扰用户
    settings = { ...DEFAULT_SETTINGS }
  }
}

function saveSettings() {
  try {
    fs.mkdirSync(path.dirname(settingsFile()), { recursive: true })
    fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2), 'utf8')
  } catch (error) {
    console.warn('[desktop] 设置保存失败：', error.message)
  }
}

// ---------------------------------------------------------------- 菜单

function buildMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: '文件',
        submenu: [
          { label: '隐藏到托盘', click: () => mainWindow?.hide() },
          { type: 'separator' },
          { label: '退出', accelerator: 'CmdOrCtrl+Q', click: quitApp },
        ],
      },
      {
        label: '编辑',
        submenu: [
          { role: 'undo', label: '撤销' },
          { role: 'redo', label: '重做' },
          { type: 'separator' },
          { role: 'cut', label: '剪切' },
          { role: 'copy', label: '复制' },
          { role: 'paste', label: '粘贴' },
          { role: 'selectAll', label: '全选' },
        ],
      },
      {
        label: '视图',
        submenu: [
          { role: 'reload', label: '刷新' },
          { role: 'forceReload', label: '强制刷新' },
          { type: 'separator' },
          { role: 'resetZoom', label: '实际大小' },
          { role: 'zoomIn', label: '放大' },
          { role: 'zoomOut', label: '缩小' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: '全屏' },
          { role: 'toggleDevTools', label: '开发者工具' },
        ],
      },
    ]),
  )
}

function handleFatal(error) {
  console.error('[desktop] 启动失败：', error)
  dialog.showErrorBox('启动失败', `应用初始化失败：\n${error.message}`)
  app.quit()
}

app.on('window-all-closed', () => {
  // 走到这里说明窗口是被真正关掉的（关闭到托盘时窗口只是 hide，不会触发）。
  // 这时如果还在托盘里留个空壳就变成"退不掉的僵尸进程"，所以直接退出。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('will-quit', () => {
  if (tray) {
    tray.destroy()
    tray = null
  }
  if (localServer) {
    localServer.close()
    localServer = null
  }
})
