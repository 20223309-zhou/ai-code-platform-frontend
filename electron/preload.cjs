'use strict'

/**
 * 预加载脚本：暴露"我跑在桌面壳里"这个事实，以及少量必须主进程配合的窗口能力。
 *
 * 前端大部分功能不需要它（API 走同源），扩展点留着是为了
 * 将来加平台能力（打开下载目录、系统通知）时不用临时打开 nodeIntegration。
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },

  /**
   * 在独立窗口里打开某个应用。
   *
   * 为什么用独立窗口：每个窗口有独立渲染进程，也就有独立的 SSE 连接和组件状态。
   * 一个窗口在生成代码时，另一个窗口可以照常操作、甚至同时生成，互不打断。
   * 页内切换做不到这点 —— 组件卸载会 abort 掉流并调取消接口。
   *
   * @param {string|number} appId 应用 ID
   * @param {string} appName 应用名，只用于窗口标题，方便任务栏区分
   * @returns {Promise<boolean>} 是否打开成功
   */
  openAppWindow: (appId, appName) =>
    ipcRenderer.invoke('desktop:open-app-window', String(appId), String(appName || '')),
})
