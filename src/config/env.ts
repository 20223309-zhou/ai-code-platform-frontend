/**
 * 环境变量配置
 */
import { CodeGenTypeEnum } from '@/utils/codeGenTypes.ts'

// 应用部署域名
export const DEPLOY_DOMAIN = import.meta.env.VITE_DEPLOY_DOMAIN || 'http://localhost'

// API 基础地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://150.158.92.249'

// 静态资源地址
export const STATIC_BASE_URL = `${API_BASE_URL}/static`

// 获取部署应用的完整URL
export const getDeployUrl = (deployKey: string) => {
  return `${DEPLOY_DOMAIN}/${deployKey}`
}

// 工程模式（Vue / React）都是 vite 构建，产物统一在 dist/ 下，预览要指向 dist/index.html；
// HTML / MULTI_FILE 是直接落盘的静态文件，没有构建步骤，不能加 dist 前缀
const PROJECT_CODE_GEN_TYPES: string[] = [
  CodeGenTypeEnum.VUE_PROJECT,
  CodeGenTypeEnum.REACT_PROJECT,
]

// 获取静态资源预览URL
export const getStaticPreviewUrl = (codeGenType: string, appId: string) => {
  // 开发环境下走 Vite 代理，保证 iframe 同源（编辑模式需要访问 contentDocument）
  const staticBaseUrl = import.meta.env.DEV
    ? '/api/static'
    : STATIC_BASE_URL
  const baseUrl = `${staticBaseUrl}/${codeGenType}_${appId}/`
  if (PROJECT_CODE_GEN_TYPES.includes(codeGenType)) {
    return `${baseUrl}dist/index.html`
  }
  return baseUrl
}
