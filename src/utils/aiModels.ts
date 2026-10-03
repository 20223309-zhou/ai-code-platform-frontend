import { getModelList } from '@/api/appController'

export interface ModelOption {
  label: string
  value: string
  isDefault?: boolean
}

/** 兜底默认模型名（与后端 ModelEnum.DEEP_SEEK.getModelName() 保持一致） */
export const DEFAULT_MODEL_NAME = 'deepseek-flash'

/** 进程内缓存，避免多个页面重复拉取 */
let modelOptionsCache: ModelOption[] | null = null

/**
 * 拉取后端可选的模型列表（带进程内缓存）。
 * 失败时返回空数组，由调用方决定是否回退默认模型。
 */
export async function loadModelOptions(): Promise<ModelOption[]> {
  if (modelOptionsCache) {
    return modelOptionsCache
  }
  try {
    const res = await getModelList()
    const data = res.data?.data
    if (!data) {
      return []
    }
    const options: ModelOption[] = Object.values(data)
      .filter((item) => !!item?.modelName)
      .map((item) => ({
        label: item.label || (item.modelName as string),
        value: item.modelName as string,
        isDefault: !!item.default,
      }))
    if (options.length > 0) {
      modelOptionsCache = options
    }
    return options
  } catch (error) {
    console.error('加载模型列表失败：', error)
    return []
  }
}

/** 取默认模型名：优先用后端标记为 default 的，其次列表首项，最后兜底常量 */
export function pickDefaultModelName(options: ModelOption[]): string {
  const preferred = options.find((item) => item.isDefault)
  return preferred?.value || options[0]?.value || DEFAULT_MODEL_NAME
}
