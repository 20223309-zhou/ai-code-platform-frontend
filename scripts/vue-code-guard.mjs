#!/usr/bin/env node
/**
 * vue-code-guard —— Vue 生成代码的确定性体检工具
 *
 * 解决：AI 生成 Vue 项目（尤其放开组件库约束后）构建成功率下降的问题。
 * 用静态分析 + 编译器解析，确定性地查出三类问题，而非依赖 LLM 自查：
 *
 *   1) dependency —— 依赖引入是否完整（import 了包，package.json 里没有）
 *   2) component  —— 组件是否正确使用（用了组件没引入 / 组件名是幻觉）
 *   3) syntax     —— 语法是否合法（SFC 编译 / TS 解析报错）
 *
 * 用法：
 *   node scripts/vue-code-guard.mjs <projectDir>            人类可读输出
 *   node scripts/vue-code-guard.mjs <projectDir> --json     结构化 JSON（供自动修复闭环消费）
 *
 * 退出码：
 *   0 = 无 error（可能有 warning）
 *   1 = 存在 error
 *   2 = 参数错误 / 目录不可读
 *
 * 输出字段说明（JSON 模式）：
 *   issues[].type     : dependency | component | syntax
 *   issues[].severity : error | warning
 *   issues[].file     : 相对项目根目录的路径
 *   issues[].line     : 行号（未知为 0）
 *   issues[].message  : 人类可读的问题描述
 *   issues[].hint     : 修复建议（可直接喂给 LLM 做修补）
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import { transformSync } from 'esbuild'

/* ────────────────────────── 配置 ────────────────────────── */

/** 原生 HTML 标签（不需要引入） */
const HTML_TAGS = new Set([
  'html', 'head', 'body', 'title', 'meta', 'link', 'style', 'script', 'noscript',
  'div', 'span', 'p', 'a', 'img', 'br', 'hr', 'input', 'button', 'select', 'option',
  'textarea', 'label', 'form', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
  'caption', 'col', 'colgroup', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'header', 'footer', 'nav', 'main', 'section', 'article', 'aside',
  'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'svg', 'path', 'g',
  'circle', 'rect', 'line', 'polyline', 'polygon', 'text', 'defs', 'use', 'iframe',
  'strong', 'em', 'b', 'i', 'u', 's', 'small', 'sub', 'sup', 'code', 'pre', 'blockquote',
  'q', 'cite', 'abbr', 'time', 'mark', 'del', 'ins', 'kbd', 'samp', 'var', 'progress',
  'meter', 'details', 'summary', 'dialog', 'slot', 'template', 'transition',
  'transition-group', 'keep-alive', 'component', 'teleport', 'suspense', 'router-view',
  'router-link',
  // SVG 绘图元素（装饰插画 / 图标里常用，不需要引入）
  'ellipse', 'polygon', 'polyline', 'path', 'circle', 'rect', 'line', 'g', 'defs', 'use',
  'mask', 'pattern', 'filter', 'linear-gradient', 'radial-gradient', 'stop', 'clip-path',
  'foreign-object', 'tspan', 'symbol', 'marker', 'animate', 'animate-transform', 'switch',
])

/** Node 内置模块（不算缺失依赖） */
const NODE_BUILTIN = new Set([
  'fs', 'path', 'os', 'http', 'https', 'url', 'util', 'crypto', 'stream', 'events',
  'child_process', 'buffer', 'querystring', 'zlib', 'net', 'dns', 'assert', 'timers',
  'node:fs', 'node:path', 'node:os', 'node:process', 'node:url', 'node:util',
  'process', 'module',
])

/** 组件库前缀 → 包名 */
const LIB_BY_PREFIX = {
  'el-': 'element-plus',
  'a-': 'ant-design-vue',
}

/** 组件库常用组件名（用于识别"幻觉组件名"） */
const LIB_COMPONENTS = {
  'element-plus': new Set([
    'button', 'input', 'input-number', 'textarea', 'select', 'option', 'option-group',
    'table', 'table-column', 'form', 'form-item', 'dialog', 'drawer', 'card', 'row', 'col',
    'menu', 'menu-item', 'sub-menu', 'icon', 'tag', 'upload', 'date-picker', 'time-picker',
    'switch', 'checkbox', 'checkbox-group', 'checkbox-button', 'radio', 'radio-group',
    'radio-button', 'pagination', 'tabs', 'tab-pane', 'collapse', 'collapse-item',
    'badge', 'avatar', 'progress', 'alert', 'tooltip', 'popover', 'popconfirm',
    'dropdown', 'dropdown-item', 'dropdown-menu', 'breadcrumb', 'breadcrumb-item',
    'steps', 'step', 'timeline', 'timeline-item', 'empty', 'result', 'skeleton',
    'image', 'carousel', 'carousel-item', 'rate', 'slider', 'color-picker', 'cascader',
    'transfer', 'tree', 'divider', 'space', 'container', 'header', 'aside', 'main',
    'footer', 'config-provider', 'scrollbar', 'backtop', 'affix', 'watermark',
    'statistic', 'descriptions', 'descriptions-item', 'calendar', 'segmented', 'anchor',
    'splitter', 'text', 'link', 'loading', 'message', 'notification', 'message-box',
  ]),
  'ant-design-vue': new Set([
    'button', 'input', 'input-number', 'input-password', 'textarea', 'select',
    'select-option', 'table', 'form', 'form-item', 'modal', 'drawer', 'card', 'row',
    'col', 'menu', 'menu-item', 'sub-menu', 'tag', 'upload', 'date-picker', 'time-picker',
    'switch', 'checkbox', 'checkbox-group', 'radio', 'radio-group', 'radio-button',
    'pagination', 'tabs', 'tab-pane', 'collapse', 'collapse-panel', 'badge', 'avatar',
    'progress', 'alert', 'tooltip', 'popover', 'popconfirm', 'dropdown', 'breadcrumb',
    'steps', 'timeline', 'empty', 'result', 'skeleton', 'image', 'carousel', 'rate',
    'slider', 'cascader', 'transfer', 'tree', 'tree-select', 'divider', 'space',
    'layout', 'layout-header', 'layout-content', 'layout-footer', 'layout-sider',
    'config-provider', 'descriptions', 'descriptions-item', 'calendar', 'statistic', 'list', 'list-item',
    'spin', 'affix', 'back-top', 'auto-complete', 'mentions', 'anchor', 'watermark',
    'flex', 'grid', 'typography', 'text', 'title', 'paragraph', 'qrcode', 'tour',
    'message', 'notification', 'input-group', 'input-search', 'tab-pane', 'select-option',
    'radio-button', 'checkbox-group', 'radio-group', 'menu-item', 'sub-menu', 'form-item',
    'collapse-panel', 'breadcrumb-item', 'timeline-item', 'carousel-item', 'step',
  ]),
}

const SOURCE_EXT = new Set(['.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts'])
// 注意：跳过 scripts/ —— 本工具自身不属于被检查的应用代码
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.vite', 'build', 'coverage', '.output', 'scripts', '.workbuddy'])

/* ────────────────────────── 工具函数 ────────────────────────── */

const toPascal = (s) =>
  s
    .split(/[-_]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')

function walkFiles(dir, base, out = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) walkFiles(abs, base, out)
    else if (SOURCE_EXT.has(path.extname(e.name))) out.push(path.relative(base, abs).split(path.sep).join('/'))
  }
  return out
}

/** 提取代码里的三方依赖包名（剥离注释，避免注释/字符串里的文本被误判） */
function extractPackages(code) {
  const pkgs = new Set()
  // 去掉块注释与行注释（保留行结构，便于行首锚点匹配）
  const clean = code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1')

  const push = (spec) => {
    if (!spec) return
    // 路径别名（vite 的 @/、~、#/ 等）不是 npm 包
    if (/^[@~#]\//.test(spec) || spec === '@' || spec === '~') return
    if (spec.startsWith('.') || spec.startsWith('/')) return
    if (NODE_BUILTIN.has(spec)) return
    // @scope/name → @scope/name ；name/sub → name
    const parts = spec.split('/')
    pkgs.add(spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0])
  }

  // import/export ... from 'xxx'（行首锚点，避免匹配到字符串内容）
  const fromRe = /^\s*(?:import|export)\b[\s\S]*?\bfrom\s*['"]([^'"]+)['"]/gm
  let m
  while ((m = fromRe.exec(clean))) push(m[1])
  // import 'xxx'
  const bareRe = /^\s*import\s*['"]([^'"]+)['"]/gm
  while ((m = bareRe.exec(clean))) push(m[1])
  // require('xxx')
  const reqRe = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = reqRe.exec(clean))) push(m[1])

  return pkgs
}

/** 提取 SFC script 中 import 进来的标识符（组件候选） */
function extractImportedNames(code) {
  const names = new Set()
  // import { A, B as C } from '...'
  const braceRe = /import\s*(?:type\s*)?\{([^}]*)\}\s*from/g
  let m
  while ((m = braceRe.exec(code))) {
    for (const raw of m[1].split(',')) {
      const t = raw.trim()
      if (!t) continue
      const asIdx = t.toLowerCase().indexOf(' as ')
      const name = (asIdx >= 0 ? t.slice(asIdx + 4) : t).trim()
      if (name) names.add(name)
    }
  }
  // import Default from '...'
  const defRe = /import\s+([A-Za-z_$][\w$]*)\s*(?:,\s*\{)?\s*from/g
  while ((m = defRe.exec(code))) names.add(m[1])
  // import A, { B } from
  const mixedRe = /import\s+([A-Za-z_$][\w$]*)\s*,\s*\{/g
  while ((m = mixedRe.exec(code))) names.add(m[1])
  return names
}

/** 提取模板中使用的标签名（去注释、去字符串干扰的轻量方案） */
function extractTemplateTags(templateSource) {
  const tags = new Map() // tagName → 首次出现的行号
  const clean = templateSource.replace(/<!--[\s\S]*?-->/g, '')
  const re = /<([A-Za-z][\w.-]*)/g
  const before = clean
  let m
  while ((m = re.exec(clean))) {
    const tag = m[1]
    if (!tags.has(tag)) {
      const line = before.slice(0, m.index).split('\n').length
      tags.set(tag, line)
    }
  }
  return tags
}

/** 从入口文件里找全局注册：app.use(ElementPlus) / app.component(...) */
function detectGlobalRegistration(files, rootDir) {
  const globalPkgs = new Set()
  const globalComponents = new Set()
  const entries = files.filter((f) => /^(src\/)?(main|index)\.(ts|js|tsx|jsx|mjs)$/.test(f))
  for (const f of entries) {
    let code
    try {
      code = fs.readFileSync(path.join(rootDir, f), 'utf8')
    } catch {
      continue
    }
    // app.use(ElementPlus) / app.use(Antd)
    const useRe = /\.use\(\s*([A-Za-z_$][\w$.]*)\s*\)/g
    let m
    while ((m = useRe.exec(code))) {
      const name = m[1]
      if (/element/i.test(name)) globalPkgs.add('element-plus')
      if (/antd/i.test(name)) globalPkgs.add('ant-design-vue')
      if (/pinia/i.test(name)) globalPkgs.add('pinia')
      // app.use(router) 会全局注册 RouterLink / RouterView
      if (/router/i.test(name)) {
        globalPkgs.add('vue-router')
        globalComponents.add('RouterLink')
        globalComponents.add('RouterView')
      }
    }
    // app.component('el-button', Xxx) / component('MyComp', ...)
    const compRe = /\.component\(\s*['"]([^'"]+)['"]/g
    while ((m = compRe.exec(code))) globalComponents.add(toPascal(m[1]))
  }
  return { globalPkgs, globalComponents }
}

/* ────────────────────────── 主流程 ────────────────────────── */

function main() {
  const args = process.argv.slice(2)
  const jsonMode = args.includes('--json')
  const projectDir = args.find((a) => !a.startsWith('--'))

  if (!projectDir) {
    console.error('用法: node scripts/vue-code-guard.mjs <projectDir> [--json]')
    process.exit(2)
  }
  const rootDir = path.resolve(projectDir)
  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
    console.error(`目录不存在或不是目录: ${rootDir}`)
    process.exit(2)
  }

  const issues = []
  const add = (type, severity, file, line, message, hint) =>
    issues.push({ type, severity, file, line: line || 0, message, hint })

  /* ---------- 读取 package.json ---------- */
  let declared = new Set()
  const pkgPath = path.join(rootDir, 'package.json')
  let hasPkgJson = false
  if (fs.existsSync(pkgPath)) {
    hasPkgJson = true
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      declared = new Set([
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ])
    } catch (e) {
      add('dependency', 'error', 'package.json', 0, `package.json 解析失败: ${e.message}`, '生成合法的 package.json（必须是严格 JSON，不能有注释或尾逗号）')
    }
  } else {
    add('dependency', 'error', 'package.json', 0, '缺少 package.json', 'Vue 项目必须包含 package.json 并声明所有用到的依赖')
  }

  const files = walkFiles(rootDir, rootDir)
  const { globalPkgs, globalComponents } = detectGlobalRegistration(files, rootDir)

  /* ---------- 预读所有源文件 ---------- */
  const fileCodes = new Map()
  for (const f of files) {
    try {
      fileCodes.set(f, fs.readFileSync(path.join(rootDir, f), 'utf8'))
    } catch {
      /* 读不到就跳过 */
    }
  }

  /* ---------- 解析 SFC，并推导"实际需要哪些库" ---------- */
  // 关键点：AI 常常"用了组件但忘了写 import"，此时仅扫描 import 语句会漏掉依赖缺失。
  // 因此这里从模板里的组件标签前缀（el- / a-）反推所需组件库。
  const requiredPkgs = new Map() // pkg → Set(file)
  const addPkg = (p, f) => {
    if (!requiredPkgs.has(p)) requiredPkgs.set(p, new Set())
    requiredPkgs.get(p).add(f)
  }
  const sfcList = [] // { file, descriptor, code }

  for (const [f, code] of fileCodes) {
    // import 语句里的包
    for (const p of extractPackages(code)) addPkg(p, f)

    if (!f.endsWith('.vue')) continue
    let result
    try {
      result = parse(code, { filename: f })
    } catch (e) {
      add('syntax', 'error', f, 0, `SFC 解析失败: ${e.message}`, '检查 <template>/<script>/<style> 块是否完整闭合')
      continue
    }
    const descriptor = result.descriptor
    for (const e of result.errors || []) {
      add('syntax', 'error', f, (e.loc && e.loc.start.line) || 0, `SFC 解析错误: ${e.message}`, '检查标签是否闭合、模板语法是否合法、script/style 块结构是否正确')
    }
    // 从模板标签反推组件库依赖
    if (descriptor.template) {
      for (const tag of extractTemplateTags(descriptor.template.content).keys()) {
        const lower = tag.toLowerCase()
        const prefix = Object.keys(LIB_BY_PREFIX).find((p) => lower.startsWith(p))
        if (prefix) addPkg(LIB_BY_PREFIX[prefix], f)
      }
    }
    sfcList.push({ file: f, descriptor, code })
  }

  /* ---------- 1) 依赖完整性 ---------- */
  for (const [pkg, where] of requiredPkgs) {
    if (declared.has(pkg)) continue
    const filesList = [...where].slice(0, 3).join(', ')
    add(
      'dependency',
      'error',
      [...where][0],
      0,
      `代码用到了 "${pkg}"，但 package.json 中未声明该依赖（用于: ${filesList}）`,
      `在 package.json 的 dependencies 中加入 "${pkg}"，或改用已声明的库`,
    )
  }

  /* ---------- 2) 组件使用 + 3) 语法 ---------- */
  for (const { file: f, descriptor } of sfcList) {
    /* --- 语法：script 编译 --- */
    if (descriptor.script || descriptor.scriptSetup) {
      try {
        compileScript(descriptor, { id: f, isProd: false })
      } catch (e) {
        const line = (e.loc && e.loc.start.line) || 0
        add('syntax', 'error', f, line, `Script 编译错误: ${e.message}`, '检查 TS/JS 语法、import/export 是否合法')
      }
    }

    if (!descriptor.template) continue

    /* --- 语法：template 编译 --- */
    try {
      compileTemplate({
        id: f,
        filename: f,
        source: descriptor.template.content,
        isProd: false,
      })
    } catch (e) {
      const line = (e.loc && e.loc.start.line) || 0
      add('syntax', 'error', f, line, `模板编译错误: ${e.message}`, '检查模板中的表达式、指令、标签闭合是否合法')
    }

    /* --- 组件使用检查 --- */
    const scriptCode =
      (descriptor.script && descriptor.script.content) ||
      (descriptor.scriptSetup && descriptor.scriptSetup.content) ||
      ''
    const imported = extractImportedNames(scriptCode)
    const tags = extractTemplateTags(descriptor.template.content)

    for (const [tag, line] of tags) {
      const lower = tag.toLowerCase()
      if (HTML_TAGS.has(lower)) continue

      // 组件库前缀组件：<el-button> / <a-table>
      const prefix = Object.keys(LIB_BY_PREFIX).find((p) => lower.startsWith(p))
      if (prefix) {
        const libPkg = LIB_BY_PREFIX[prefix]
        const bareName = lower.slice(prefix.length)
        const lib = LIB_COMPONENTS[libPkg]
        // 幻觉组件名检测
        if (lib && bareName && !lib.has(bareName)) {
          const maybe = [...lib].filter((n) => n.startsWith(bareName.slice(0, 4))).slice(0, 3)
          add(
            'component',
            'warning',
            f,
            line,
            `组件 <${tag}> 不在 ${libPkg} 的已知组件列表中，可能是编造的组件名`,
            `核对 ${libPkg} 文档确认组件名${maybe.length ? `，你是否想用: ${maybe.map((n) => prefix + n).join(', ')}` : ''}`,
          )
        }
        // 引入检测：显式 import 或入口全局注册（app.use(ElementPlus)）
        const importedPascal = toPascal(tag)
        const isImported = imported.has(importedPascal) || imported.has(tag)
        const isGlobalRegistered = globalPkgs.has(libPkg) || globalComponents.has(importedPascal)
        if (!isImported && !isGlobalRegistered) {
          add(
            'component',
            'error',
            f,
            line,
            `使用了 <${tag}>，但既没有在组件中 import，也没有在入口文件全局注册`,
            `在 <script setup> 中 import { ${importedPascal} } from '${libPkg}'，或在 main.ts 中 app.use(${libPkg === 'element-plus' ? 'ElementPlus' : 'Antd'}) 全局注册`,
          )
        }
        continue
      }

      // 自定义组件：PascalCase 或 kebab-case
      const pascal = toPascal(tag)
      const isImported = imported.has(pascal) || imported.has(tag)
      const isGlobal = globalComponents.has(pascal)
      if (!isImported && !isGlobal) {
        add(
          'component',
          'error',
          f,
          line,
          `使用了组件 <${tag}>，但未找到对应的 import 或全局注册`,
          `在 <script setup> 中 import ${pascal} from './components/${pascal}.vue'（确认路径与文件名大小写一致）`,
        )
      }
    }
  }

  /* ---------- 非 SFC 文件的语法检查 ---------- */
  const loaderMap = { '.ts': 'ts', '.tsx': 'tsx', '.js': 'js', '.jsx': 'jsx', '.mjs': 'js', '.mts': 'ts' }
  for (const [f, code] of fileCodes) {
    const ext = path.extname(f)
    if (ext === '.vue' || !loaderMap[ext]) continue
    try {
      transformSync(code, { loader: loaderMap[ext], sourcefile: f })
    } catch (e) {
      const first = e.errors && e.errors[0]
      const line = (first && first.location && first.location.line) || 0
      add('syntax', 'error', f, line, `语法错误: ${(first && first.text) || e.message}`, '修正语法后重新生成该文件')
    }
  }

  /* ---------- 输出 ---------- */
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          ok: errors.length === 0,
          projectDir: rootDir,
          hasPackageJson: hasPkgJson,
          scannedFiles: files.length,
          summary: { errors: errors.length, warnings: warnings.length },
          issues,
        },
        null,
        2,
      ),
    )
  } else {
    if (issues.length === 0) {
      console.log(`✅ 未发现问题（已扫描 ${files.length} 个文件）`)
    } else {
      console.log(`扫描 ${files.length} 个文件，发现 ${errors.length} 个错误、${warnings.length} 个警告\n`)
      const byType = { dependency: [], component: [], syntax: [] }
      for (const i of issues) byType[i.type].push(i)
      const titles = { dependency: '① 依赖引入', component: '② 组件使用', syntax: '③ 语法合法性' }
      for (const t of ['dependency', 'component', 'syntax']) {
        if (!byType[t].length) continue
        console.log(`── ${titles[t]} ──`)
        for (const i of byType[t]) {
          const mark = i.severity === 'error' ? '✗' : '⚠'
          console.log(`${mark} [${i.file}${i.line ? `:${i.line}` : ''}] ${i.message}`)
          console.log(`   修复: ${i.hint}`)
        }
        console.log('')
      }
    }
  }

  process.exit(errors.length ? 1 : 0)
}

main()
