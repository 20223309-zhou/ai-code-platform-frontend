<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { markAllRead } from '@/utils/announcementRead'
import { useAnnouncementFeed } from '@/utils/announcementFeed'

/**
 * 公告中心：常驻入口，列出所有可见公告。
 *
 * 进站弹窗只弹最新一条未读，关掉就看不到了；
 * 这个列表负责「我还想再看一眼」的场景，也承载多条公告的浏览。
 */

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

const { list, ensureLoaded } = useAnnouncementFeed()

/** 默认展开最新一条，其余收起 —— 全展开会把弹窗撑得很长 */
const activeKeys = ref<string[]>([])

const visible = computed(() => list.value)

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const levelClass = (level?: string) => {
  const value = (level || 'INFO').toLowerCase()
  return ['warning', 'success'].includes(value) ? value : 'info'
}

const formatTime = (value?: string) => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 打开时：拉数据、展开第一条、把当前可见的公告全部标已读（侧栏红点清零）
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      return
    }
    await ensureLoaded()
    activeKeys.value = visible.value.length > 0 ? [String(visible.value[0].id)] : []
    markAllRead(visible.value.map((item) => item.id))
  },
  { immediate: true },
)
</script>

<template>
  <a-modal v-model:open="open" title="公告" :footer="null" :width="640" centered>
    <a-empty v-if="!visible.length" description="暂无公告" />

    <a-collapse v-else v-model:activeKey="activeKeys" ghost class="announcement-collapse">
      <a-collapse-panel v-for="item in visible" :key="String(item.id)">
        <template #header>
          <div class="collapse-head">
            <span class="head-dot" :class="`is-${levelClass(item.level)}`" />
            <span class="head-title">{{ item.title }}</span>
            <span class="head-time">{{ formatTime(item.publishTime) }}</span>
          </div>
        </template>
        <MarkdownRenderer :content="item.content" />
      </a-collapse-panel>
    </a-collapse>
  </a-modal>
</template>

<style scoped>
.announcement-collapse {
  max-height: 60vh;
  overflow-y: auto;
}

.collapse-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 4px;
}

.head-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ai-primary, #4a6fa5);
}

.head-dot.is-warning {
  background: #d98324;
}

.head-dot.is-success {
  background: #4f9d69;
}

.head-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--ai-title, #2c3a4d);
}

.head-time {
  flex: none;
  font-size: 12px;
  color: var(--ai-muted, #8b97a8);
}
</style>
