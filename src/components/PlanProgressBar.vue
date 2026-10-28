<script setup lang="ts">
/**
 * 方案生成中的状态条：阶段文案 + 已用秒数 + 取消。
 *
 * 只负责展示，定位交给使用方（首页放在输入框下面，聊天页放在头部下面），
 * 这样同一套文案样式不用写两遍。
 */
defineProps<{
  /** 是否正在生成 */
  active: boolean
  /** 阶段文案，来自 useStageProgress */
  text: string
  /** 已用秒数 */
  elapsed: number
  /** 超过这个秒数换成"偏慢"的配色，提示用户可以选择取消 */
  slowAfter?: number
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
}>()
</script>

<template>
  <transition name="plan-progress-fade">
    <div
      v-if="active"
      class="plan-progress"
      :class="{ 'is-slow': slowAfter != null && elapsed >= slowAfter }"
      role="status"
      aria-live="polite"
    >
      <span class="plan-progress-ring" aria-hidden="true"></span>
      <span class="plan-progress-text">{{ text }}</span>
      <span class="plan-progress-time">{{ elapsed }}s</span>
      <button type="button" class="plan-progress-cancel" @click="emit('cancel')">取消</button>
    </div>
  </transition>
</template>

<style scoped>
.plan-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--ai-primary, #4a6fa5) 26%, transparent);
  background: color-mix(in srgb, var(--ai-primary, #4a6fa5) 10%, transparent);
  font-size: 13px;
  line-height: 1.4;
  color: var(--ai-title, #2c3a4d);
}

.plan-progress-ring {
  flex: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--ai-accent, #6b8fb8) 28%, transparent);
  border-top-color: var(--ai-primary, #4a6fa5);
  animation: plan-progress-spin 0.9s linear infinite;
}

.plan-progress-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-progress-time {
  flex: none;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  opacity: 0.66;
}

.plan-progress-cancel {
  flex: none;
  padding: 2px 8px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--ai-primary, #4a6fa5);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.plan-progress-cancel:hover {
  background: color-mix(in srgb, var(--ai-primary, #4a6fa5) 12%, transparent);
}

/* 比平时久：底色转暖，暗示"可以等，也可以取消" */
.plan-progress.is-slow {
  border-color: color-mix(in srgb, #d98324 26%, transparent);
  background: color-mix(in srgb, #d98324 9%, transparent);
}

.plan-progress.is-slow .plan-progress-ring {
  border-color: color-mix(in srgb, #d98324 30%, transparent);
  border-top-color: #d98324;
}

@keyframes plan-progress-spin {
  to {
    transform: rotate(360deg);
  }
}

.plan-progress-fade-enter-active,
.plan-progress-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.plan-progress-fade-enter-from,
.plan-progress-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .plan-progress-ring {
    animation-duration: 2.4s;
  }

  .plan-progress-fade-enter-active,
  .plan-progress-fade-leave-active {
    transition: opacity 0.01s;
  }
}
</style>
