/**
 * 主题切换。
 *
 * 实现方式是给 <html> 挂 `data-theme`，由 `styles/themes.css` 里
 * `:root[data-theme=...]` 覆盖那套 `--ai-*` 变量 —— 组件代码一行都不用改。
 *
 * 默认主题 paper 不写覆盖块，直接沿用 App.vue 的 `:root` 原值，
 * 这样以后调默认配色只改一个地方。
 */

export interface AppTheme {
  id: string
  label: string
  /** 切换器上的色点，取该主题的主色 */
  swatch: string
}

export const THEMES: AppTheme[] = [
  { id: 'paper', label: '原纸', swatch: '#c9713e' },
  { id: 'dusk', label: '暮橙', swatch: '#b5633f' },
  { id: 'mist', label: '雾蓝', swatch: '#4a6fa5' },
  { id: 'forest', label: '森绿', swatch: '#5b7f52' },
]

export const DEFAULT_THEME_ID = 'paper'

const STORAGE_KEY = 'ai-code:theme'

let transitionTimer: number | undefined

function normalize(id?: string | null): string {
  return THEMES.some((theme) => theme.id === id) ? (id as string) : DEFAULT_THEME_ID
}

export function getThemeId(): string {
  try {
    return normalize(localStorage.getItem(STORAGE_KEY))
  } catch {
    // 隐私模式 / 存储被禁用时不要因为读不到偏好就崩掉
    return DEFAULT_THEME_ID
  }
}

/**
 * 首屏应用主题。不加过渡动画，否则刷新瞬间会看到一次颜色渐变。
 */
export function initTheme(): void {
  document.documentElement.setAttribute('data-theme', getThemeId())
}

/**
 * 切换主题并持久化。
 */
export function applyTheme(id: string): void {
  const themeId = normalize(id)
  const root = document.documentElement

  // 切换的这一刻才加过渡，平时不加 —— 否则所有 hover 都会被强行拖慢 280ms
  root.classList.add('theme-switching')
  root.setAttribute('data-theme', themeId)

  try {
    localStorage.setItem(STORAGE_KEY, themeId)
  } catch {
    // 存不下就只在本次会话生效，不影响使用
  }

  window.clearTimeout(transitionTimer)
  transitionTimer = window.setTimeout(() => {
    root.classList.remove('theme-switching')
  }, 320)
}
