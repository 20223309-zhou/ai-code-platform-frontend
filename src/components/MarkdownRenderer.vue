<template>
  <div class="markdown-content" v-html="renderedMarkdown" @click="onContentClick"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 引入代码高亮样式（浅色主题，与整体亮色风格统一）
import 'highlight.js/styles/atom-one-light.css'

interface Props {
  content: string
  /** 是否正在流式输出：流式期间代码块不折叠，否则每次重渲染都会重置展开状态 */
  streaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
})

/**
 * 折叠策略：非流式时**所有**代码块一律折叠，保证列表里外观整齐；
 * 流式期间不折叠（见下方说明）。
 */

// 配置 markdown-it 实例
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

/**
 * 生成「代码面板」结构：语言标签头 + 代码体。
 * 由自定义 fence 渲染器输出，避免 <pre> 同时带 .hljs 时被高亮主题的
 * 背景规则刷成透明（历史上踩过这个坑）。
 *
 * 折叠用原生 <details>/<summary>：
 * - 零 JS，键盘与读屏器天然可用
 * - 状态由浏览器维护，但只对“内容不再变化”的消息可靠 —— v-html 会整体替换 DOM，
 *   流式期间每个 token 都会重置它，所以 streaming 时不折叠
 */
function renderCodePanel(code: string, info: string): string {
  const lang = (info || '').trim().split(/\s+/)[0].toLowerCase()
  let inner: string
  if (lang && hljs.getLanguage(lang)) {
    try {
      inner = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    } catch {
      inner = md.utils.escapeHtml(code)
    }
  } else {
    inner = md.utils.escapeHtml(code)
  }
  const label = lang || 'code'
  const lineCount = code.replace(/\n$/, '').split('\n').length
  const collapsible = !props.streaming

  const headTag = collapsible ? 'summary' : 'div'
  const head =
    '<' +
    headTag +
    ' class="code-block-head">' +
    '<span class="code-block-lang">' +
    label +
    '</span>' +
    '<span class="code-block-meta">' +
    lineCount +
    ' 行</span>' +
    '<button type="button" class="code-block-copy" data-copy>复制</button>' +
    '</' +
    headTag +
    '>'
  const body =
    '<pre class="code-block-pre"><code class="hljs">' + inner + '</code></pre>'

  if (!collapsible) {
    return '<div class="code-block">' + head + body + '</div>\n'
  }
  return '<details class="code-block code-block-collapsible">' + head + body + '</details>\n'
}

// 围栏代码块 ```lang
md.renderer.rules.fence = (tokens, idx) => {
  return renderCodePanel(tokens[idx].content, tokens[idx].info)
}

// 缩进式代码块（4 空格）
md.renderer.rules.code_block = (tokens, idx) => {
  return renderCodePanel(tokens[idx].content, '')
}

// 计算渲染后的 Markdown
const renderedMarkdown = computed(() => {
  return md.render(props.content)
})

/**
 * 复制按钮：挂在容器上做事件委托，避免给每段 HTML 绑定监听。
 * 按钮在 <summary> 里，必须 preventDefault，否则点复制会顺带把代码块折叠掉。
 */
async function onContentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const btn = target?.closest<HTMLElement>('.code-block-copy')
  if (!btn) return
  event.preventDefault()
  event.stopPropagation()

  const block = btn.closest('.code-block')
  const code = block?.querySelector('code')?.textContent ?? ''
  if (!code) return

  const original = btn.textContent || '复制'
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    btn.textContent = '已复制'
    btn.classList.add('is-copied')
  } catch {
    btn.textContent = '复制失败'
  }
  window.setTimeout(() => {
    btn.textContent = original
    btn.classList.remove('is-copied')
  }, 1500)
}
</script>

<style scoped>
.markdown-content {
  line-height: 1.7;
  color: var(--ai-title);
  word-wrap: break-word;
  letter-spacing: 0.01em;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 1.2em 0 0.5em 0;
  font-weight: 600;
  line-height: 1.25;
  color: var(--ai-title);
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--ai-border-soft);
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
  border-bottom: 1px solid var(--ai-border-soft);
  padding-bottom: 0.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.1em;
}

.markdown-content :deep(p) {
  margin: 0.8em 0;
  color: var(--ai-title);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.8em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(li) {
  margin: 0.3em 0;
  color: var(--ai-title);
}

.markdown-content :deep(blockquote) {
  margin: 1em 0;
  padding: 0.6em 1em;
  border-left: 3px solid rgba(var(--ai-accent-rgb), 0.3);
  background: rgba(var(--ai-accent-rgb), 0.04);
  color: var(--ai-text);
  border-radius: 0 6px 6px 0;
}

.markdown-content :deep(code) {
  background: var(--ai-surface-soft);
  padding: 0.18em 0.42em;
  border-radius: 5px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: #b3327f;
}

/* ── 代码面板：语言标签头 + 左侧品牌色边 + 比纯白深一档的冷蓝内嵌底 ── */
.markdown-content :deep(.code-block) {
  margin: 1em 0;
  border: 1px solid rgba(var(--ai-ink-rgb), 0.09);
  border-left: 3px solid rgba(var(--ai-accent-rgb), 0.55);
  border-radius: 10px;
  background: var(--ai-surface-soft);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(var(--ai-ink-rgb), 0.04);
}

.markdown-content :deep(.code-block-head) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: rgba(var(--ai-surface-rgb), 0.55);
  border-bottom: 1px solid rgba(var(--ai-ink-rgb), 0.07);
}

/* summary 默认的三角标去掉，改用下面的自定义箭头 */
.markdown-content :deep(summary.code-block-head) {
  list-style: none;
  cursor: pointer;
  user-select: none;
}

.markdown-content :deep(summary.code-block-head)::-webkit-details-marker {
  display: none;
}

.markdown-content :deep(summary.code-block-head)::after {
  content: '▾';
  margin-left: 8px;
  font-size: 11px;
  line-height: 1;
  color: var(--ai-muted);
  transition: transform 0.18s ease;
}

.markdown-content :deep(details.code-block:not([open]) summary.code-block-head)::after {
  transform: rotate(-90deg);
}

.markdown-content :deep(.code-block-lang) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ai-muted);
}

.markdown-content :deep(.code-block-meta) {
  font-size: 11px;
  line-height: 1.4;
  color: rgba(var(--ai-ink-rgb), 0.42);
}

.markdown-content :deep(.code-block-copy) {
  margin-left: auto;
  padding: 2px 8px;
  border: 1px solid rgba(var(--ai-ink-rgb), 0.12);
  border-radius: 6px;
  background: rgba(var(--ai-surface-rgb), 0.7);
  color: var(--ai-muted);
  font-size: 11px;
  line-height: 1.5;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.markdown-content :deep(.code-block:hover .code-block-copy),
.markdown-content :deep(.code-block-copy:focus-visible),
.markdown-content :deep(.code-block-copy.is-copied) {
  opacity: 1;
}

/* 触摸设备没有 hover，按钮不能一直隐身，否则成了不可见的点击区 */
@media (hover: none) {
  .markdown-content :deep(.code-block-copy) {
    opacity: 1;
  }
}

.markdown-content :deep(.code-block-copy:hover) {
  color: var(--ai-primary);
  border-color: rgba(var(--ai-accent-rgb), 0.45);
}

.markdown-content :deep(.code-block-pre) {
  margin: 0;
  padding: 0.9em 1em;
  background: transparent !important;
  border: none;
  border-radius: 0;
  overflow-x: auto;
}

.markdown-content :deep(.code-block-pre code),
.markdown-content :deep(.code-block-pre code.hljs) {
  background: transparent !important;
  padding: 0;
  border-radius: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  line-height: 1.65;
  color: var(--ai-title);
}

/* 兜底：未被 fence 包裹的裸 <pre>（如 markdown 内嵌 HTML）也给同款浅色底 */
.markdown-content :deep(pre) {
  background: var(--ai-surface-soft) !important;
  border: 1px solid rgba(var(--ai-ink-rgb), 0.09);
  border-radius: 10px;
  padding: 0.9em 1em;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-content :deep(pre code) {
  background: transparent !important;
  padding: 0;
  border-radius: 0;
  font-size: 0.9em;
  line-height: 1.65;
  color: var(--ai-title);
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.markdown-content :deep(table th),
.markdown-content :deep(table td) {
  border: 1px solid var(--ai-border-soft);
  padding: 0.5em 0.8em;
  text-align: left;
  color: var(--ai-title);
}

.markdown-content :deep(table th) {
  background: rgba(var(--ai-ink-rgb), 0.04);
  font-weight: 600;
}

.markdown-content :deep(table tr:nth-child(even)) {
  background: rgba(var(--ai-ink-rgb), 0.02);
}

.markdown-content :deep(a) {
  color: var(--ai-primary);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.5em 0;
  border: 1px solid var(--ai-border-soft);
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--ai-border-soft);
  margin: 1.5em 0;
}

/* 代码块：与亮色主题同语言的「内嵌代码面板」——
   比纯白深一档的冷蓝底，既有代码块的可辨识度，又不会像深色块那样突兀。
   注意：<pre> 同时带 .hljs 类，此规则优先级高于 pre 规则，故两处都需给实色底。 */
.markdown-content :deep(.hljs) {
  background: var(--ai-surface-soft) !important;
  color: var(--ai-title) !important;
  border-radius: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  line-height: 1.6;
}
</style>
