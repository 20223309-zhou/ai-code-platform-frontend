/**
 * 主题切换。
 *
 * 数据驱动：每套主题的完整变量定义在 `styles/themes.ts`，
 * 切换时把这些变量写到 <html> 的行内 style 上。
 *
 * 为什么不用 `:root[data-theme=...]` 的 CSS 覆盖块：
 * 主题展示页需要「同时预览多套」—— CSS 类做不到局部作用域，
 * 而行内变量可以按卡片单独注入，预览和真实效果完全一致。
 *
 * 切换前会先清空所有主题变量，让它们回落到 App.vue 的 :root 基线（石墨），
 * 避免上一套的圆角 / 阴影残留。
 */

import { ref } from 'vue'
import { ALL_THEME_VAR_NAMES, THEME_LIST, type AppTheme } from '@/styles/themes'

export type { AppTheme }

/** 侧栏等处只需要 id / label / swatch，这里保持原样导出 */
export const THEMES = THEME_LIST.map(({ id, label, swatch }) => ({ id, label, swatch }))

export const DEFAULT_THEME_ID = 'graphite'

/** 当前主题的响应式副本：侧栏色点和主题页共用，避免两处状态不同步 */
export const currentThemeId = ref(DEFAULT_THEME_ID)

const STORAGE_KEY = 'ai-code:theme'

let transitionTimer: number | undefined

export function getTheme(id?: string | null): AppTheme {
  return THEME_LIST.find((theme) => theme.id === id) ?? THEME_LIST[0]
}

function normalize(id?: string | null): string {
  return THEME_LIST.some((theme) => theme.id === id) ? (id as string) : DEFAULT_THEME_ID
}

export function getThemeId(): string {
  try {
    return normalize(localStorage.getItem(STORAGE_KEY))
  } catch {
    // 隐私模式 / 存储被禁用时不要因为读不到偏好就崩掉
    return DEFAULT_THEME_ID
  }
}

/** 把一套主题的变量注入到任意元素（主题展示页的预览卡用） */
export function applyThemeVars(el: HTMLElement | null, theme: AppTheme): void {
  if (!el) {
    return
  }
  Object.entries(theme.vars).forEach(([name, value]) => {
    el.style.setProperty(name, value)
  })
}

/**
 * 首屏应用主题。不加过渡动画，否则刷新瞬间会看到一次颜色渐变。
 */
export function initTheme(): void {
  const root = document.documentElement
  const theme = getTheme(getThemeId())
  currentThemeId.value = theme.id
  root.setAttribute('data-theme', theme.id)
  applyColorScheme(theme.id)
  if (theme.id !== DEFAULT_THEME_ID) {
    Object.entries(theme.vars).forEach(([name, value]) => root.style.setProperty(name, value))
  }
}

/**
 * 切换主题并持久化。
 */
export function applyTheme(id: string): void {
  const themeId = normalize(id)
  const theme = getTheme(themeId)
  const root = document.documentElement

  // 切换的这一刻才加过渡，平时不加 —— 否则所有 hover 都会被强行拖慢
  root.classList.add('theme-switching')
  root.setAttribute('data-theme', theme.id)
  currentThemeId.value = theme.id

  // 先清空，再写目标值：没被覆盖的变量自动回落到 :root 基线（石墨）
  ALL_THEME_VAR_NAMES.forEach((name) => root.style.removeProperty(name))
  if (theme.id !== DEFAULT_THEME_ID) {
    Object.entries(theme.vars).forEach(([name, value]) => root.style.setProperty(name, value))
  }

  try {
    localStorage.setItem(STORAGE_KEY, theme.id)
  } catch {
    // 存不下就只在本次会话生效，不影响使用
  }

  applyColorScheme(theme.id)

  window.clearTimeout(transitionTimer)
  transitionTimer = window.setTimeout(() => {
    root.classList.remove('theme-switching')
  }, 400)
}

/**
 * 同步浏览器 UI 的明暗（滚动条、表单控件、地址栏）。
 * 不设的话深色主题下滑动条还是白的，很割裂。
 */
function applyColorScheme(themeId: string): void {
  const dark = themeId === 'terminal'
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}
