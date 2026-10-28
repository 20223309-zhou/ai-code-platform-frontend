'use strict'

/**
 * 桌面端运行配置。
 *
 * 设计原则：**页面和 API 必须同源**。所以壳内起一个本地 HTTP 服务，
 * 同一个端口既托管 dist 静态资源，又把 /api 转发到远程后端。
 *
 * 这样带来三个直接好处：
 *   1. 后端零改动 —— 请求是「同站」的，Session Cookie（host-only、非 Secure、
 *      SameSite 默认 Lax）能正常携带，不需要改成 SameSite=None + HTTPS
 *   2. 静态预览 iframe 与主页面同源 —— 可视化编辑依赖的
 *      `iframe.contentDocument` 不会被同源策略拦住
 *   3. 前端源码零改动 —— `.env` 里 VITE_API_BASE_URL 仍是相对路径 /api
 */

/**
 * 远程后端根地址（不带 /api，后端 context-path 自带 /api）。
 *
 * 用域名而不是 IP：150.158.92.249 的 nginx 对 /api 返回 502（上游不可达），
 * 域名才是真正接了后端的入口。实测 https 未开通，只能走 http ——
 * 这反而是好事，同源代理下 Cookie 不需要 Secure 属性。
 */
const DEFAULT_API_ORIGIN = 'http://www.icodeplay.site'

/** 本地服务首选端口；被占用时自动往上找 */
const DEFAULT_PORT = 38080

function normalizeOrigin(raw) {
  return String(raw || '').trim().replace(/\/+$/, '')
}

const apiOrigin = normalizeOrigin(process.env.AICODE_API_ORIGIN) || DEFAULT_API_ORIGIN

/**
 * 运行模式。
 *
 * online（默认）：窗口直接加载线上站点，壳只负责窗口/托盘/菜单。
 *   为什么默认改成它：页面与后端同域，Session Cookie、OAuth 回调、预览 iframe
 *   全部天然成立 —— GitHub 登录这种依赖 Cookie 域的功能只有在同域下才能工作。
 *
 * local：壳内起本地服务托管 dist 并代理 /api（离线可用、前端版本可控），
 *   但页面在 127.0.0.1 下，而 OAuth 回调落在线上域名，
 *   Cookie 写不到壳内 —— GitHub 登录必然失败。保留它是为了离线演示。
 */
const mode = process.env.AICODE_DESKTOP_MODE === 'local' ? 'local' : 'online'

module.exports = {
  mode,
  apiOrigin,
  /** online 模式下窗口加载的地址（与后端同域） */
  webOrigin: normalizeOrigin(process.env.AICODE_WEB_ORIGIN) || DEFAULT_API_ORIGIN,

  /**
   * 会被转发到远端的路径前缀，其余请求交给本地 dist 静态服务。
   * 只列 /api：部署产物（/dist/**）是 nginx 托管的静态目录，
   * 桌面端不应该在壳里镜像它，点击部署链接交给系统浏览器打开更合适。
   */
  proxyPrefixes: ['/api'],

  port: Number(process.env.AICODE_DESKTOP_PORT) || DEFAULT_PORT,

  /** 端口被占用时最多尝试几次 */
  portRetries: 10,
}
