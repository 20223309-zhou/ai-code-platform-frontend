/**
 * 图片优化工具函数
 * 对 COS 图片链接追加处理参数，缩小体积加速加载
 */

/** COS 图片处理：缩放 + WebP 转换 */
export function getOptimizedCover(url: string, width = 640): string {
  if (!url) return url
  // 只处理 COS 的图片链接（包含 myqcloud.com 或 cos. 的 URL）
  if (url.includes('myqcloud.com') || url.includes('cos.')) {
    // 避免重复追加参数
    if (url.includes('imageMogr2')) return url
    return `${url}?imageMogr2/thumbnail/${width}x/format/webp`
  }
  return url
}
