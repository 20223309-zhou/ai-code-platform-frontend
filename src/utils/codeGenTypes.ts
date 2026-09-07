/**
 * 代码生成类型枚举
 */
export enum CodeGenTypeEnum {
  HTML = 'html',
  MULTI_FILE = 'multi_file',
  VUE_PROJECT = 'vue_project',
  /** 智能选择：创建时由 AI 根据提示词自动路由，不存入库（库里只存具体类型） */
  AUTO = 'auto',
}

/**
 * 代码生成类型配置
 */
export const CODE_GEN_TYPE_CONFIG = {
  [CodeGenTypeEnum.HTML]: {
    label: '原生 HTML 模式',
    value: CodeGenTypeEnum.HTML,
  },
  [CodeGenTypeEnum.MULTI_FILE]: {
    label: '原生多文件模式',
    value: CodeGenTypeEnum.MULTI_FILE,
  },
  [CodeGenTypeEnum.VUE_PROJECT]: {
    label: 'Vue 项目模式',
    value: CodeGenTypeEnum.VUE_PROJECT,
  },
} as const

/**
 * 代码生成类型选项（用于下拉选择，仅含三种具体类型，不含“智能选择”）
 */
export const CODE_GEN_TYPE_OPTIONS = Object.values(CODE_GEN_TYPE_CONFIG).map((config) => ({
  label: config.label,
  value: config.value,
}))

/**
 * 创建应用时可选的生成类型（含“智能选择”），用于前端 4 选 1 控件
 */
export const CODE_GEN_TYPE_CREATE_OPTIONS = [
  {
    label: '原生 HTML 模式',
    value: CodeGenTypeEnum.HTML,
    desc: '单个 HTML 文件，适合简单页面与快速原型',
  },
  {
    label: '原生多文件模式',
    value: CodeGenTypeEnum.MULTI_FILE,
    desc: 'HTML / CSS / JS 多文件工程，适合较完整站点',
  },
  {
    label: 'Vue 项目模式',
    value: CodeGenTypeEnum.VUE_PROJECT,
    desc: '完整 Vue 工程，适合组件化复杂应用',
  },
  {
    label: '智能选择',
    value: CodeGenTypeEnum.AUTO,
    desc: '由 AI 根据描述自动判断最合适的类型',
  },
] as const

/**
 * 格式化代码生成类型
 * @param type 代码生成类型
 * @returns 格式化后的类型描述
 */
export const formatCodeGenType = (type: string | undefined): string => {
  if (!type) return '未知类型'
  if (type === CodeGenTypeEnum.AUTO) return '智能选择'

  const config = CODE_GEN_TYPE_CONFIG[type as keyof typeof CODE_GEN_TYPE_CONFIG]
  return config ? config.label : type
}

/**
 * 获取所有代码生成类型
 */
export const getAllCodeGenTypes = () => {
  return Object.values(CodeGenTypeEnum)
}

/**
 * 检查是否为有效的代码生成类型
 * @param type 待检查的类型
 */
export const isValidCodeGenType = (type: string): type is CodeGenTypeEnum => {
  return Object.values(CodeGenTypeEnum).includes(type as CodeGenTypeEnum)
}
