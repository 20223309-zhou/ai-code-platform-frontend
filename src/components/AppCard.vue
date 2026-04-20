<template>
  <div class="app-card" :class="{ 'app-card--featured': featured }">
    <div class="app-preview">
      <img v-if="app.cover" :src="app.cover" :alt="app.appName" />
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
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: var(--ai-card-radius);
  box-shadow: var(--ai-shadow);
  overflow: hidden;
  cursor: pointer;
  transition: var(--ai-transition);
}

.app-card::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--ai-primary), var(--ai-accent));
  transform: scaleX(0);
  transform-origin: left center;
  transition: var(--ai-transition);
}

.app-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--ai-shadow-hover);
}

.app-card:hover::after {
  transform: scaleX(1);
}

.app-card--featured:hover {
  transform: translateY(-4px) scale(1.02);
}

.app-preview {
  position: relative;
  height: 172px;
  padding: 10px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  overflow: hidden;
}

.app-preview img {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  object-fit: cover;
}

.app-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.95);
}

.placeholder-illustration {
  width: calc(100% - 24px);
  height: calc(100% - 18px);
}

.line {
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.panel {
  stroke: rgba(67, 97, 238, 0.22);
  fill: rgba(255, 255, 255, 0.72);
}

.soft {
  stroke: rgba(148, 163, 184, 0.75);
}

.accent {
  stroke: rgba(67, 97, 238, 0.85);
}

.dot {
  fill: rgba(0, 245, 212, 0.9);
}

.app-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.9);
  color: var(--ai-primary);
  font-size: 12px;
  font-weight: 700;
}

.app-overlay {
  position: absolute;
  inset: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.58));
  opacity: 0;
  transition: var(--ai-transition);
}

.app-card:hover .app-overlay {
  opacity: 1;
}

.overlay-button {
  height: 36px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--ai-primary), #5e7cff);
}

.overlay-button--ghost {
  background: rgba(255, 255, 255, 0.92);
  color: var(--ai-title);
}

.app-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 16px 18px;
}

.app-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
}

.app-description {
  margin: 8px 0 0;
  color: var(--ai-text);
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  border: 2px solid rgba(67, 97, 238, 0.12);
}

.app-author {
  color: var(--ai-muted);
  font-size: 13px;
  font-weight: 600;
}
</style>
