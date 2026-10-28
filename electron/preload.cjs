'use strict'

/**
 * 预加载脚本：只暴露"我跑在桌面壳里"这一个事实。
 *
 * 前端目前不需要它也能正常工作（API 走同源相对路径 /api）。
 * 留着是为了将来需要平台能力时（打开下载目录、窗口控制、系统通知）
 * 有个明确的扩展点，而不是临时打开 nodeIntegration。
 */

const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },
})
