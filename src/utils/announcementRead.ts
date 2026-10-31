import { ref } from 'vue'

/**
 * 公告已读记录（localStorage）。
 *
 * 抽出来是因为现在有三个地方要用同一份状态：
 * 进站弹窗、侧栏未读数、公告列表。
 * 各自读一份 localStorage 会导致「弹窗关了但侧栏红点还在」这类不同步。
 */

const READ_KEY = 'icodeai_read_announcements'
/** 只保留最近 50 个已读 id，避免 localStorage 无限增长 */
const MAX_READ_KEEP = 50

function loadReadIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    // localStorage 被禁用或内容损坏时，当成"都没读过"
    return []
  }
}

/** 响应式集合：侧栏未读红点依赖它自动更新 */
const readIds = ref<Set<string>>(new Set(loadReadIds()))

function persist(next: Set<string>) {
  const arr = Array.from(next).slice(-MAX_READ_KEEP)
  readIds.value = new Set(arr)
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(arr))
  } catch {
    /* 隐私模式下写不进去，忽略 */
  }
}

export function isRead(id: string | number): boolean {
  return readIds.value.has(String(id))
}

export function markRead(id: string | number) {
  const next = new Set(readIds.value)
  next.add(String(id))
  persist(next)
}

/** 打开公告列表时一次性全标已读，红点清零 */
export function markAllRead(ids: Array<string | number>) {
  const next = new Set(readIds.value)
  ids.forEach((id) => next.add(String(id)))
  persist(next)
}

export function useReadIds() {
  return readIds
}
