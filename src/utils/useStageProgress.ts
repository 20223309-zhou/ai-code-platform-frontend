import { onUnmounted, ref } from 'vue'

export interface ProgressStage {
  /** 从开始计时起，第几秒切到这段文案 */
  at: number
  text: string
}

/**
 * 分阶段进度文案 + 已用秒数。
 *
 * 用途：AI 生成方案要十几秒，期间界面上只有一个转圈，用户既不知道
 * "它在思考"还是"它已经卡死了"，也不知道该不该继续等。
 *
 * ⚠️ 这是纯前端按时间估算的，后端并没有回报真实进度。
 *    所以文案只能描述"正在做什么"，绝不能写"已完成 60%"这类假数字 ——
 *    一旦实际耗时和文案对不上，比没有提示更让人不信任。
 */
export function useStageProgress(stages: ProgressStage[]) {
  const elapsed = ref(0)
  const text = ref(stages[0]?.text ?? '')
  let timer: ReturnType<typeof setInterval> | undefined

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  }

  const start = () => {
    stop()
    elapsed.value = 0
    text.value = stages[0]?.text ?? ''
    timer = setInterval(() => {
      elapsed.value += 1
      // 从后往前找最后一个"已经到达"的阶段，避免文案在阶段间来回跳
      for (let i = stages.length - 1; i >= 0; i -= 1) {
        if (elapsed.value >= stages[i].at) {
          text.value = stages[i].text
          break
        }
      }
    }, 1000)
  }

  // 组件被关掉时定时器必须清掉，否则会一直在后台跑
  onUnmounted(stop)

  return { elapsed, text, start, stop }
}

/**
 * 方案生成的阶段文案。
 * 模型的实际动作是：读需求 → 想布局 → 组织 JSON 输出，
 * 三段耗时大致是 0-3s / 3-8s / 8s 以后。
 */
export const PLAN_STAGES: ProgressStage[] = [
  { at: 0, text: '正在读取你的需求' },
  { at: 3, text: '正在梳理页面结构与信息层级' },
  { at: 8, text: '正在组织设计方案' },
  { at: 16, text: '还在推敲方案细节' },
  { at: 25, text: '这次比平时慢一些，仍在生成中' },
]

/** 超过这个秒数还没返回，就当方案阶段失败，直接放行主流程 */
export const PLAN_TIMEOUT_MS = 45_000
