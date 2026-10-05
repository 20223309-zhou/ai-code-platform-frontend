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
  /* 纸雕：奶白纸片 + 暖色描边 + 硬边偏移投影 */
  background: #fffdf7;
  border: 1.5px solid #ecdcbd;
  border-radius: 16px;
  box-shadow: 2px 3px 0 rgba(184, 152, 104, 0.24), 0 18px 26px -24px rgba(120, 92, 52, 0.5);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.app-card:hover {
  transform: translateY(-3px);
  border-color: #dfc9a2;
  box-shadow: 3px 6px 0 rgba(184, 152, 104, 0.28), 0 24px 32px -26px rgba(120, 92, 52, 0.55);
}

.app-card--featured:hover {
  transform: translateY(-3px) scale(1.015);
}

.app-preview {
  position: relative;
  height: 160px;
  padding: 8px;
  background: #f7eeda;
  overflow: hidden;
}

.app-preview img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 1px solid #eadfc6;
  object-fit: cover;
}

.app-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #eadfc6;
  background: #fffdf7;
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
  stroke: rgba(201, 113, 62, 0.3);
  fill: rgba(201, 113, 62, 0.06);
}

.soft {
  stroke: rgba(120, 96, 62, 0.28);
}

.accent {
  stroke: rgba(201, 113, 62, 0.55);
}

.dot {
  fill: #d9a05b;
}

.app-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 2px 10px;
  border-radius: 8px;
  background: #fffdf7;
  border: 1.5px solid rgba(201, 113, 62, 0.3);
  color: #a8612f;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  box-shadow: 2px 2px 0 rgba(184, 152, 104, 0.22);
}

.app-overlay {
  position: absolute;
  inset: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(255, 253, 247, 0.88);
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.app-card:hover .app-overlay {
  opacity: 1;
}

.overlay-button {
  height: 32px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 13px;
  background: #c9713e;
  box-shadow: 2px 2px 0 rgba(150, 92, 48, 0.35);
}

.overlay-button--ghost {
  background: #fffdf7;
  color: var(--ai-title);
  border: 1.5px solid #ecdcbd;
  box-shadow: 2px 2px 0 rgba(184, 152, 104, 0.2);
}

.overlay-button--ghost:hover {
  background: #fdf6e6 !important;
  border-color: #dcc9a2;
  color: #a8612f;
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
