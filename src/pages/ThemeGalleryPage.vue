<template>
  <div id="themeGalleryPage">
    <header class="gallery-head">
      <h1 class="gallery-title">主题风格</h1>
    </header>

    <div class="gallery-grid">
      <article
        v-for="theme in themes"
        :key="theme.id"
        class="theme-card"
        :class="{ 'is-current': theme.id === currentId }"
        :style="theme.vars"
        @click="useTheme(theme)"
      >
        <div class="theme-head">
          <div class="theme-title-row">
            <span class="theme-dot" :style="{ background: theme.swatch }" />
            <h2 class="theme-name">{{ theme.label }}</h2>
            <span v-if="theme.id === currentId" class="theme-badge">使用中</span>
          </div>
          <p class="theme-desc">{{ theme.description }}</p>
        </div>

        <!-- 用该主题的变量渲染一个迷你界面，预览与真实效果一致 -->
        <div class="preview">
          <div class="pv-panel">
            <div class="pv-head">
              <span class="pv-title">示例项目</span>
              <span class="pv-chip">Vue</span>
            </div>
            <p class="pv-text">一句话生成可运行的网页应用</p>
            <div class="pv-actions">
              <span class="pv-btn">生成</span>
              <span class="pv-btn pv-btn--ghost">预览</span>
            </div>
          </div>
        </div>

        <div class="theme-traits">
          <span v-for="trait in theme.traits" :key="trait" class="trait">{{ trait }}</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { THEME_LIST, type AppTheme } from '@/styles/themes'
import { applyTheme, getThemeId } from '@/utils/theme'

const themes = THEME_LIST
const currentId = ref(getThemeId())

const useTheme = (theme: AppTheme) => {
  if (theme.id === currentId.value) {
    return
  }
  applyTheme(theme.id)
  currentId.value = theme.id
  message.success(`已切换到「${theme.label}」`)
}
</script>

<style scoped>
#themeGalleryPage {
  height: 100%;
  padding: 24px 20px 40px;
  overflow-y: auto;
}

.gallery-head {
  max-width: 720px;
  margin-bottom: 22px;
}

.gallery-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 500;
  color: var(--ai-title);
}

.gallery-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ai-text);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.theme-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  cursor: pointer;
  background: var(--ai-card-surface);
  border: 1px solid var(--ai-card-border);
  border-radius: calc(var(--ai-card-radius) + 4px);
  box-shadow: var(--ai-card-shadow);
  transition: var(--ai-transition), transform 0.18s ease;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ai-shadow-hover);
}

/* 当前主题用主色描边，不用重阴影，避免和主题本身的阴影语言打架 */
.theme-card.is-current {
  border-color: var(--ai-primary);
  box-shadow: 0 0 0 1px var(--ai-primary);
}

.theme-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.theme-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: none;
}

.theme-name {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--ai-title);
}

.theme-badge {
  margin-left: auto;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.7;
  color: var(--ai-primary);
  background: var(--ai-chip-bg);
}

.theme-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--ai-text);
}

.preview {
  padding: 16px;
  border-radius: calc(var(--ai-card-radius) + 2px);
  background: var(--ai-bg);
  border: 1px solid var(--ai-border-soft);
}

.pv-panel {
  padding: 14px;
  background: var(--ai-card-surface);
  border: 1px solid var(--ai-card-border);
  border-radius: var(--ai-card-radius);
  box-shadow: var(--ai-card-shadow);
}

.pv-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pv-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--ai-title);
}

.pv-chip {
  margin-left: auto;
  padding: 1px 7px;
  border-radius: calc(var(--ai-control-radius) - 2px);
  font-size: 10px;
  color: var(--ai-primary);
  background: var(--ai-chip-bg);
}

.pv-text {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-text);
}

.pv-actions {
  display: flex;
  gap: 8px;
}

.pv-btn {
  padding: 5px 14px;
  border-radius: var(--ai-control-radius);
  font-size: 12px;
  color: #fff;
  background: var(--ai-primary);
}

.pv-btn--ghost {
  color: var(--ai-primary);
  background: transparent;
  border: 1px solid var(--ai-card-border);
}

.theme-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.trait {
  padding: 2px 8px;
  border-radius: calc(var(--ai-control-radius) - 2px);
  font-size: 11px;
  color: var(--ai-muted);
  background: var(--ai-surface-soft);
}
</style>
