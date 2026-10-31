import { ref } from 'vue'
import { listVisibleAnnouncements, type AnnouncementVO } from '@/api/announcementController'

/**
 * 可见公告的共享数据源。
 *
 * 进站弹窗、侧栏红点、公告列表三处都要这份数据，
 * 各自请求一次就是三个重复接口 —— 这里用模块级单例缓存，
 * 同一会话内只请求一次。
 */

const list = ref<AnnouncementVO[]>([])
const loaded = ref(false)
let pending: Promise<void> | null = null

/**
 * 上次成功拉取的时间。
 * <p>
 * 不加过期时间的话，一个 SPA 会话内数据永远不会更新 ——
 * 管理员发布公告后，用户侧栏和公告列表仍然是旧的。
 */
let lastLoadedAt = 0
const STALE_MS = 60_000

function doLoad(): Promise<void> {
  if (!pending) {
    pending = listVisibleAnnouncements()
      .then((res) => {
        if (res.data?.code === 0) {
          list.value = res.data.data || []
        }
        loaded.value = true
        lastLoadedAt = Date.now()
      })
      .catch((error) => {
        // 公告拉取失败绝不能影响主流程
        console.warn('公告加载失败：', error)
        loaded.value = true
      })
      .finally(() => {
        pending = null
      })
  }
  return pending
}

/**
 * 拉数据，多处复用。
 *
 * @param force 忽略缓存强制重拉（管理端发布后调用）
 */
function ensureLoaded(force = false): Promise<void> {
  const stale = Date.now() - lastLoadedAt > STALE_MS
  if (loaded.value && !stale && !force) {
    return Promise.resolve()
  }
  return doLoad()
}

/**
 * 发布 / 编辑 / 下线 / 删除公告后调用。
 * <p>
 * 管理端操作会改变全站可见数据，必须让共享缓存失效，
 * 否则侧栏红点和公告列表要等 60 秒过期或刷新页面才更新。
 */
export function refreshAnnouncementFeed(): Promise<void> {
  loaded.value = false
  lastLoadedAt = 0
  return doLoad()
}

export function useAnnouncementFeed() {
  return { list, loaded, ensureLoaded }
}
