import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 正在进行的生成任务。
 * <p>
 * 为什么需要这个 store：对话页是流式生成的"消费者"，用户切到别的页面时组件会被
 * keep-alive 缓存而不是销毁，流继续跑；但侧边栏不知道这件事，用户也没有任何提示。
 * 这里只记录"哪个应用正在生成"，供侧边栏展示和跳回。
 * <p>
 * 只存最小信息（appId / 名称 / 开始时间），不存消息内容 —— 消息仍然活在对话页实例里，
 * 避免同一份数据两处维护导致不一致。
 */
export const useGenerationStore = defineStore('generation', () => {
  interface ActiveGeneration {
    appId: string
    appName: string
    startedAt: number
  }

  const active = ref<Record<string, ActiveGeneration>>({})

  const list = computed(() =>
    Object.values(active.value).sort((a, b) => a.startedAt - b.startedAt),
  )

  const count = computed(() => list.value.length)

  const isActive = (appId?: string | number) => {
    if (appId === undefined || appId === null) return false
    return Boolean(active.value[String(appId)])
  }

  /** 开始（重复调用只会更新名称，不会重置开始时间） */
  const start = (appId: string, appName?: string) => {
    const current = active.value[appId]
    active.value[appId] = {
      appId,
      appName: appName || current?.appName || `应用 ${appId}`,
      startedAt: current?.startedAt ?? Date.now(),
    }
  }

  /** 结束：所有收尾分支（完成 / 出错 / 手动停止）都调这里 */
  const finish = (appId?: string | number) => {
    if (appId === undefined || appId === null) return
    const key = String(appId)
    if (active.value[key]) {
      delete active.value[key]
    }
  }

  return { active, list, count, isActive, start, finish }
})
