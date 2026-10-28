import request from '@/request'

/**
 * 方案预选（创建应用前让用户挑设计方向）。
 *
 * 单独成文件而不是塞进 appController.ts —— 那个文件是接口生成器产出的，
 * 手写内容下次生成会被覆盖。
 */

export interface AppPlanItem {
  /** 方案标识，A / B / C */
  id: string
  /** 方案标题，如「仪表盘式」 */
  title: string
  /** 视觉风格，如「极简浅色」 */
  style: string
  /** 布局结构描述 */
  layout: string
  /** 一句话适用场景 */
  desc: string
  /** 标签 */
  tags?: string[]
  /** 是否推荐 */
  recommended?: boolean
}

export interface AppPlanResult {
  plans: AppPlanItem[]
  /** 需求已足够明确时为 true，前端应直接生成 */
  recommendSkip?: boolean
  /** 描述与构建前端页面无关（写脚本、算法题、后端接口等） */
  irrelevant?: boolean
  /** irrelevant 为 true 时给出的引导语 */
  hint?: string
}

/**
 * 生成设计方案。
 * 只产出方案文本，不创建应用、不扣额度、不写文件。
 *
 * `excludeTitles` 只在「换一个方案」时传：不传的话模型很容易又给出上一次那两个方向，
 * 用户点了半天发现还是同一套布局。
 */
export async function generateAppPlan(
  body: { initPrompt: string; excludeTitles?: string[] },
  options?: { [key: string]: any },
) {
  return request<{ code: number; data: AppPlanResult; message?: string }>('/app/chat/plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 换方案：清空当前应用的生成产物（`tmp/code_output/{codeGenType}_{appId}`），
 * 让下一轮生成从零开始。
 *
 * 后端只删生成工作区，**不动已部署的 code_deploy** —— 已上线的版本不会因为换方案而下线。
 */
export async function restartGeneration(appId: number | string) {
  return request<{ code: number; data: boolean; message?: string }>(
    `/app/chat/restart/${appId}`,
    {
      method: 'POST',
    },
  )
}
