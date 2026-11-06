/**
 * 主题定义（数据驱动）。
 *
 * 每套主题不只是换配色，而是一整套形态语言：
 * 圆角大小、阴影软硬、过渡时长都跟着变 —— 这才是「石墨」和「瑞士」
 * 看起来完全不同的原因，只改主色是做不到的。
 *
 * 实现方式：applyTheme 把变量写到 <html> 的行内 style 上。
 * 切换前先清空所有主题变量，让它们回落到 App.vue 的 :root 基线（石墨），
 * 这样切换不会出现「上一套的圆角残留」。
 */

export interface ThemeVars {
  [key: string]: string
}

export interface AppTheme {
  id: string
  label: string
  /** 一句话定位，展示页用 */
  description: string
  /** 切换器色点 */
  swatch: string
  /** 形态特征标签，展示页用 */
  traits: string[]
  vars: ThemeVars
}

/** 石墨专业：默认主题，变量值与 App.vue 的 :root 保持一致 */
const graphite: ThemeVars = {
  '--ai-primary': '#4f46e5',
  '--ai-primary-strong': '#4338ca',
  '--ai-primary-glow': 'rgba(79, 70, 229, 0.14)',
  '--ai-accent': '#0ea5e9',
  '--ai-accent-soft': '#7dd3fc',
  '--ai-accent-rgb': '79, 70, 229',
  '--ai-surface-rgb': '255, 255, 255',
  '--ai-ink-rgb': '17, 24, 39',
  '--ai-shadow-rgb': '16, 24, 40',

  '--ai-bg': '#fafafa',
  '--ai-surface': '#ffffff',
  '--ai-surface-soft': '#f4f4f5',
  '--ai-card-bg': '#ffffff',
  '--ai-glass': 'rgba(255, 255, 255, 0.72)',
  '--ai-glass-strong': 'rgba(255, 255, 255, 0.92)',
  '--ai-glass-border': 'rgba(228, 228, 231, 0.9)',
  '--ai-card-surface': '#ffffff',
  '--ai-card-surface-solid': '#ffffff',
  '--ai-card-border': '#e5e7eb',
  '--ai-card-shadow': '0 1px 2px rgba(16, 24, 40, 0.04)',

  '--ai-title': '#111827',
  '--ai-text': '#4b5563',
  '--ai-muted': '#5f6673',

  '--ai-border': '#e5e7eb',
  '--ai-border-soft': '#f1f2f4',
  '--ai-overlay': 'rgba(17, 24, 39, 0.36)',
  '--ai-chip-bg': 'rgba(79, 70, 229, 0.07)',
  '--ai-chip-bg-hover': 'rgba(79, 70, 229, 0.12)',

  '--ai-card-radius': '8px',
  '--ai-control-radius': '6px',
  '--ai-shadow': '0 1px 3px rgba(16, 24, 40, 0.06)',
  '--ai-shadow-hover': '0 4px 12px rgba(16, 24, 40, 0.08)',
  '--ai-transition': 'all 0.16s ease',
}

/** 终端青：深色，代码优先 */
const terminal: ThemeVars = {
  '--ai-primary': '#22d3a6',
  '--ai-primary-strong': '#34e0b4',
  '--ai-primary-glow': 'rgba(34, 211, 166, 0.16)',
  '--ai-accent': '#3b82f6',
  '--ai-accent-soft': '#93c5fd',
  '--ai-accent-rgb': '34, 211, 166',
  '--ai-surface-rgb': '13, 13, 15',
  '--ai-ink-rgb': '230, 237, 243',
  '--ai-shadow-rgb': '0, 0, 0',

  '--ai-bg': '#000000',
  '--ai-surface': '#0d0d0f',
  '--ai-surface-soft': '#17171a',
  '--ai-card-bg': '#0d0d0f',
  '--ai-glass': 'rgba(13, 13, 15, 0.72)',
  '--ai-glass-strong': 'rgba(13, 13, 15, 0.92)',
  '--ai-glass-border': 'rgba(38, 38, 42, 0.9)',
  '--ai-card-surface': '#0d0d0f',
  '--ai-card-surface-solid': '#0d0d0f',
  '--ai-card-border': '#26262a',
  '--ai-card-shadow': '0 1px 2px rgba(0, 0, 0, 0.5)',

  '--ai-title': '#e6edf3',
  '--ai-text': '#aab6c4',
  '--ai-muted': '#8b98a8',

  '--ai-border': '#26262a',
  '--ai-border-soft': '#1a1a1d',
  '--ai-overlay': 'rgba(0, 0, 0, 0.6)',
  '--ai-chip-bg': 'rgba(34, 211, 166, 0.1)',
  '--ai-chip-bg-hover': 'rgba(34, 211, 166, 0.16)',

  '--ai-card-radius': '6px',
  '--ai-control-radius': '4px',
  '--ai-shadow': '0 1px 3px rgba(0, 0, 0, 0.55)',
  '--ai-shadow-hover': '0 6px 18px rgba(0, 0, 0, 0.6)',
  '--ai-transition': 'all 0.14s ease',
}

/** 温润中性：米白暖灰，长时间阅读舒适 */
const warm: ThemeVars = {
  '--ai-primary': '#c2410c',
  '--ai-primary-strong': '#9a3412',
  '--ai-primary-glow': 'rgba(194, 65, 12, 0.14)',
  '--ai-accent': '#78716c',
  '--ai-accent-soft': '#a8a29e',
  '--ai-accent-rgb': '194, 65, 12',
  '--ai-surface-rgb': '255, 255, 255',
  '--ai-ink-rgb': '87, 83, 78',
  '--ai-shadow-rgb': '68, 60, 48',

  '--ai-bg': '#f7f5f2',
  '--ai-surface': '#ffffff',
  '--ai-surface-soft': '#efece7',
  '--ai-card-bg': '#ffffff',
  '--ai-glass': 'rgba(255, 255, 255, 0.75)',
  '--ai-glass-strong': 'rgba(255, 255, 255, 0.92)',
  '--ai-glass-border': 'rgba(231, 226, 220, 0.9)',
  '--ai-card-surface': '#ffffff',
  '--ai-card-surface-solid': '#ffffff',
  '--ai-card-border': '#e7e2dc',
  '--ai-card-shadow': '0 1px 3px rgba(31, 30, 29, 0.06)',

  '--ai-title': '#1f1e1d',
  '--ai-text': '#57534e',
  '--ai-muted': '#6b6360',

  '--ai-border': '#e7e2dc',
  '--ai-border-soft': '#f0ece7',
  '--ai-overlay': 'rgba(31, 30, 29, 0.36)',
  '--ai-chip-bg': 'rgba(194, 65, 12, 0.07)',
  '--ai-chip-bg-hover': 'rgba(194, 65, 12, 0.12)',

  '--ai-card-radius': '10px',
  '--ai-control-radius': '8px',
  '--ai-shadow': '0 1px 3px rgba(31, 30, 29, 0.06)',
  '--ai-shadow-hover': '0 6px 16px rgba(31, 30, 29, 0.08)',
  '--ai-transition': 'all 0.2s ease',
}

/** 瑞士排版：纯白黑字 + 朱红，近乎直角 */
const swiss: ThemeVars = {
  '--ai-primary': '#ff4d2e',
  '--ai-primary-strong': '#e63a1d',
  '--ai-primary-glow': 'rgba(255, 77, 46, 0.14)',
  '--ai-accent': '#0a0a0a',
  '--ai-accent-soft': '#525252',
  '--ai-accent-rgb': '255, 77, 46',
  '--ai-surface-rgb': '255, 255, 255',
  '--ai-ink-rgb': '10, 10, 10',
  '--ai-shadow-rgb': '0, 0, 0',

  '--ai-bg': '#ffffff',
  '--ai-surface': '#ffffff',
  '--ai-surface-soft': '#f5f5f5',
  '--ai-card-bg': '#ffffff',
  '--ai-glass': 'rgba(255, 255, 255, 0.8)',
  '--ai-glass-strong': 'rgba(255, 255, 255, 0.95)',
  '--ai-glass-border': 'rgba(10, 10, 10, 0.12)',
  '--ai-card-surface': '#ffffff',
  '--ai-card-surface-solid': '#ffffff',
  // 卡片用黑边、普通分隔线用浅灰，全黑会让页面太重
  '--ai-card-border': '#0a0a0a',
  '--ai-card-shadow': 'none',

  '--ai-title': '#0a0a0a',
  '--ai-text': '#525252',
  '--ai-muted': '#666666',

  '--ai-border': '#d4d4d4',
  '--ai-border-soft': '#e5e5e5',
  '--ai-overlay': 'rgba(10, 10, 10, 0.4)',
  '--ai-chip-bg': 'rgba(255, 77, 46, 0.08)',
  '--ai-chip-bg-hover': 'rgba(255, 77, 46, 0.14)',

  '--ai-card-radius': '2px',
  '--ai-control-radius': '2px',
  '--ai-shadow': 'none',
  '--ai-shadow-hover': 'none',
  '--ai-transition': 'all 0.1s linear',
}

export const THEME_LIST: AppTheme[] = [
  {
    id: 'graphite',
    label: '石墨专业',
    description: '冷灰底配靛蓝强调，细边框、克制圆角。像开发者工具，让内容自己说话。',
    swatch: '#4f46e5',
    traits: ['8px 圆角', '细边框', '无重阴影', '0.16s 过渡'],
    vars: graphite,
  },
  {
    id: 'terminal',
    label: '终端青',
    description: '深色底配青绿，接近 IDE 的观感。适合长时间盯代码，预览区反差也好看。',
    swatch: '#22d3a6',
    traits: ['6px 圆角', '深色表面', '青绿强调', '0.14s 过渡'],
    vars: terminal,
  },
  // 历史备注：
  // 全站有 22+ 处硬编码的白色/半透明白背景（AppChatPage 14 处、App.vue、GlobalHeader、
  // MarkdownRenderer、PlanChoiceModal、HomePage），这些在浅色主题下看不出来，
  // 一旦切到深底就会变成"白卡片浮在深底上"。要做深色，必须先逐个组件把这批浅色
  // 换成 --ai-surface / color-mix，属于独立一轮改造，不能靠换变量蒙混过关。
  // 变量定义留在下面，等专项适配时直接启用即可。
  {
    id: 'warm',
    label: '温润中性',
    description: '米白暖灰配砖红，软投影、稍大圆角。保留阅读的舒适度，但不再有贴纸感。',
    swatch: '#c2410c',
    traits: ['10px 圆角', '暖灰底', '软投影', '0.2s 过渡'],
    vars: warm,
  },
  {
    id: 'swiss',
    label: '瑞士排版',
    description: '纯白黑字加朱红点缀，近乎直角、零阴影。信息层级全靠字号和留白撑起来。',
    swatch: '#ff4d2e',
    traits: ['2px 圆角', '黑色描边', '零阴影', '0.1s 过渡'],
    vars: swiss,
  },
]

/** 需要清理的变量名，切换前统一移除，避免上一套残留 */
export const ALL_THEME_VAR_NAMES = Object.keys(graphite)
