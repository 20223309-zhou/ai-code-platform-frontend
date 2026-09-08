<template>
  <div class="markdown-content" v-html="renderedMarkdown"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 引入代码高亮样式
import 'highlight.js/styles/atom-one-dark.css'

interface Props {
  content: string
}

const props = defineProps<Props>()

// 配置 markdown-it 实例
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch {
        // 忽略错误，使用默认处理
      }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  },
})

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
  border-left: 3px solid rgba(61, 107, 255, 0.3);
  background: rgba(61, 107, 255, 0.04);
  color: var(--ai-text);
  border-radius: 0 6px 6px 0;
}

.markdown-content :deep(code) {
  background: rgba(61, 107, 255, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: #a21caf;
}

/* 代码块保持深色，保证代码高亮清晰（符合 atom-one-dark 主题） */
.markdown-content :deep(pre) {
  background: #1c1e2b !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.9em;
  line-height: 1.5;
  color: #d7dce8;
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
  background: rgba(28, 42, 96, 0.04);
  font-weight: 600;
}

.markdown-content :deep(table tr:nth-child(even)) {
  background: rgba(28, 42, 96, 0.02);
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

.markdown-content :deep(.hljs) {
  background: transparent !important;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  line-height: 1.5;
}
</style>
