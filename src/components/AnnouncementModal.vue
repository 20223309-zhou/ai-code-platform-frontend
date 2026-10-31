<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { isRead, markRead } from '@/utils/announcementRead'
import { useAnnouncementFeed } from '@/utils/announcementFeed'
import type { AnnouncementVO } from '@/api/announcementController'

/**
 * 进站公告弹窗：只弹「最新一条未读」。
 *
 * 一次只弹一条 —— 多条连着弹几个窗口比不弹还烦。
 * 想翻其他公告走侧栏的「公告」入口（AnnouncementCenter）。
 *
 * 已读只记在 localStorage（见 utils/announcementRead.ts），
 * 清缓存后会重新看到一次，属于可接受的代价。
 */

const { list, ensureLoaded } = useAnnouncementFeed()

const open = ref(false)
const current = ref<AnnouncementVO | null>(null)

const levelClass = computed(() => {
  const level = (current.value?.level || 'INFO').toLowerCase()
  return ['warning', 'success'].includes(level) ? level : 'info'
})

async function pickUnread() {
  await ensureLoaded()
  // 后端已按「置顶 → 发布时间倒序」排好，取第一条未读即可
  const unread = list.value.find((item) => !isRead(item.id))
  if (unread) {
    current.value = unread
    open.value = true
  }
}

const acknowledge = () => {
  if (current.value) {
    markRead(current.value.id)
  }
  open.value = false
}

onMounted(pickUnread)
</script>

<template>
  <a-modal
    :open="open"
    :footer="null"
    :width="560"
    centered
    :mask-closable="true"
    @cancel="acknowledge"
  >
    <div class="announcement" :class="`is-${levelClass}`">
      <header class="announcement-head">
        <span class="announcement-badge">公告</span>
        <h3 class="announcement-title">{{ current?.title }}</h3>
      </header>

      <div class="announcement-body">
        <MarkdownRenderer :content="current?.content || ''" />
      </div>

      <footer class="announcement-actions">
        <a-button type="primary" @click="acknowledge">我知道了</a-button>
      </footer>
    </div>
  </a-modal>
</template>

<style scoped>
.announcement {
  padding: 4px 4px 0;
}

.announcement-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.announcement-badge {
  flex: none;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.6;
  color: #fff;
  background: var(--ai-primary, #4a6fa5);
}

.announcement.is-warning .announcement-badge {
  background: #d98324;
}

.announcement.is-success .announcement-badge {
  background: #4f9d69;
}

.announcement-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--ai-title, #2c3a4d);
}

.announcement-body {
  max-height: 52vh;
  overflow-y: auto;
  padding-right: 4px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--ai-text, #4a5a6e);
}

.announcement-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
