<template>
  <div class="markdown-content" v-html="renderedMarkdown"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 引入代码高亮样式（浅色主题，与整体亮色风格统一）
import 'highlight.js/styles/atom-one-light.css'

interface Props {
  content: string
}

const props = defineProps<Props>()

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
  return (
    '<div class="code-block">' +
    '<div class="code-block-head"><span class="code-block-lang">' +
    label +
    '</span></div>' +
    '<pre class="code-block-pre"><code class="hljs">' +
    inner +
    '</code></pre>' +
    '</div>'
  )
}

// 围栏代码块 ```lang
md.renderer.rules.fence = (tokens, idx) => {
  return renderCodePanel(tokens[idx].content, tokens[idx].info) + '\n'
}

// 缩进式代码块（4 空格）
md.renderer.rules.code_block = (tokens, idx) => {
  return renderCodePanel(tokens[idx].content, '') + '\n'
}

// 计算渲染后的 Markdown
const renderedMarkdown = computed(() => {
  return md.render(props.content)
})
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
  background: #f7eeda;
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
  background: #f7eeda;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(var(--ai-ink-rgb), 0.04);
}

.markdown-content :deep(.code-block-head) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.55);
  border-bottom: 1px solid rgba(var(--ai-ink-rgb), 0.07);
}

.markdown-content :deep(.code-block-lang) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #a0917a;
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
  color: #4a3f33;
}

/* 兜底：未被 fence 包裹的裸 <pre>（如 markdown 内嵌 HTML）也给同款浅色底 */
.markdown-content :deep(pre) {
  background: #f7eeda !important;
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
  color: #4a3f33;
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
  background: #f7eeda !important;
  color: #4a3f33 !important;
  border-radius: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  line-height: 1.6;
}
</style>
