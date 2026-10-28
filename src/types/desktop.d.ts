/**
 * 桌面壳注入的全局对象（见 electron/preload.cjs）。
 * 浏览器环境下为 undefined，所有桌面端专属逻辑都要先判空。
 */
export {}

declare global {
  interface Window {
    desktop?: {
      isDesktop: true
      platform: string
      versions: {
        electron: string
        chrome: string
      }
    }
  }
}
