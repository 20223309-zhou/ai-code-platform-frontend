<template>
  <div class="app-card" :class="{ 'app-card--featured': featured }">
    <div class="app-preview">
      <img v-if="app.cover" :src="getOptimizedCover(app.cover)" :alt="app.appName" loading="lazy" />
      <div v-else class="app-placeholder">
        <svg viewBox="0 0 320 140" class="placeholder-illustration" aria-hidden="true">
          <rect x="22" y="20" width="276" height="100" rx="18" class="line panel" />
          <rect x="40" y="38" width="64" height="10" rx="5" class="line soft" />
          <rect x="40" y="58" width="112" height="8" rx="4" class="line soft" />
          <rect x="40" y="76" width="86" height="8" rx="4" class="line soft" />
          <rect x="182" y="40" width="92" height="56" rx="14" class="line accent" />
          <path d="M 196 88 C 214 60, 242 62, 258 48" class="line accent" />
          <circle cx="208" cy="54" r="6" class="dot" />
          <circle cx="236" cy="70" r="6" class="dot" />
          <circle cx="256" cy="50" r="6" class="dot" />
        </svg>
      </div>
      <div class="app-badge">{{ featured ? '精选案例' : '我的作品' }}</div>
      <div class="app-overlay">
        <a-space>
          <a-button type="primary" class="overlay-button" @click="handleViewChat">查看对话</a-button>
          <a-button v-if="app.deployKey" class="overlay-button overlay-button--ghost" @click="handleViewWork"
            >查看作品</a-button
          >
        </a-space>
      </div>
    </div>
    <div class="app-info">
      <div class="app-text">
        <h3 class="app-title">{{ app.appName || '未命名应用' }}</h3>
        <p class="app-description">
          {{
            app.initPrompt ||
            (featured ? '精选灵感案例，展示 AI 生成应用的交互与界面表达。' : '从一句描述出发，继续完善你的专属应用。')
          }}
        </p>
      </div>
      <div class="app-meta">
        <a-avatar :src="app.user?.userAvatar" :size="36" class="author-avatar">
          {{ app.user?.userName?.charAt(0) || 'U' }}
        </a-avatar>
        <span class="app-author">{{ app.user?.userName || (featured ? '官方精选' : '未知用户') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getOptimizedCover } from '@/utils/image'

interface Props {
  app: API.AppVO
  featured?: boolean
}

interface Emits {
  (e: 'view-chat', appId: string | number | undefined): void
  (e: 'view-work', app: API.AppVO): void
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
})

const emit = defineEmits<Emits>()

const handleViewChat = () => {
  emit('view-chat', props.app.id)
}

const handleViewWork = () => {
  emit('view-work', props.app)
}
</script>

<style scoped>
.app-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  box-shadow:
    0 1px 2px rgba(28, 44, 110, 0.05),
    0 16px 40px -12px rgba(28, 44, 110, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.app-card:hover {
  transform: translateY(-3px);
  border-color: rgba(61, 107, 255, 0.35);
  box-shadow:
    0 1px 2px rgba(28, 44, 110, 0.05),
    0 22px 50px -12px rgba(61, 107, 255, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.app-card--featured:hover {
  transform: translateY(-3px) scale(1.015);
}

.app-preview {
  position: relative;
  height: 160px;
  padding: 8px;
  background: rgba(61, 107, 255, 0.05);
  overflow: hidden;
}

.app-preview img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 1px solid var(--ai-border-soft);
  object-fit: cover;
}

.app-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--ai-border-soft);
  background: rgba(61, 107, 255, 0.03);
}

.placeholder-illustration {
  width: calc(100% - 24px);
  height: calc(100% - 18px);
}

.line {
  fill: none;
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.panel {
  stroke: rgba(61, 107, 255, 0.2);
  fill: rgba(28, 42, 96, 0.03);
}

.soft {
  stroke: rgba(28, 42, 96, 0.16);
}

.accent {
  stroke: rgba(61, 107, 255, 0.45);
}

.dot {
  fill: #3fa9f5;
}

.app-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(61, 107, 255, 0.3);
  color: var(--ai-primary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 8px rgba(35, 55, 130, 0.08);
}

.app-overlay {
  position: absolute;
  inset: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.app-card:hover .app-overlay {
  opacity: 1;
}

.overlay-button {
  height: 32px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  background: linear-gradient(135deg, #3d6bff, #2b4fe0);
  box-shadow: 0 4px 14px rgba(61, 107, 255, 0.22);
}

.overlay-button--ghost {
  background: rgba(255, 255, 255, 0.9);
  color: var(--ai-title);
  border: 1px solid var(--ai-glass-border);
  box-shadow: 0 2px 10px rgba(35, 55, 130, 0.08);
}

.overlay-button--ghost:hover {
  background: var(--ai-surface-soft) !important;
  border-color: rgba(61, 107, 255, 0.4);
  color: var(--ai-primary);
}

.app-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px 14px;
}

.app-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.app-description {
  margin: 6px 0 0;
  color: var(--ai-text);
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  border: 1px solid var(--ai-border-soft);
}

.app-author {
  color: var(--ai-muted);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.01em;
}
</style>
