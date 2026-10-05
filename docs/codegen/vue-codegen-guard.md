# Vue 生成代码质量保障方案（依赖 / 组件 / 语法）

> 目标：解决「放开组件库约束后，Vue 构建模式成功率下降」的问题。
> 核心思路：**不要指望 LLM 自查**——生成后用**确定性工具**体检 + **自动修复闭环**。

---

## 一、为什么成功率会掉

放开组件库后，AI 自由度变大，但放大了三类**确定性**错误：

| 类型 | 典型表现 | 能否静态查出 |
|---|---|---|
| 依赖缺失 | 用了 `<el-table>`，但 `package.json` 没有 `element-plus` | ✅ 100% |
| 引入/注册缺失 | 没 `import { ElButton }`，也没 `app.use(ElementPlus)` | ✅ 100% |
| 组件名幻觉 | 用了不存在的 `<el-super-btn>`、错误的 prop 名 | ⚠️ 大部分 |
| 语法错误 | 标签未闭合、TS 语法错 | ✅ 100% |

**结论**：前两类占了失败的大头，且能 100% 用脚本检出。所以方案必须是「**提示词约束（防）+ 脚本校验（查）+ 自动修复（补）**」三层。

---

## 二、三层方案

```
① 生成前：系统提示词约束（防）        ← 减少犯错概率
② 生成后：vue-code-guard 静态体检（查） ← 确定性抓错，本方案核心
③ 有问题：结构化错误喂回 LLM 修补（补） ← 自动闭环，最多 3 轮
```

---

## 三、第一层：生成约束（系统提示词片段，可直接复制进你们的 VUE_PROJECT 提示词）

```text
【技术栈约束】
- 项目类型：Vite + Vue 3 + TypeScript + <script setup>
- 必须产出的文件：package.json、vite.config.ts、index.html、src/main.ts、src/App.vue

【组件库约束（严格遵守，违反会导致构建失败）】
1. 仅允许使用以下组件库之一（如需其他库，必须先在 package.json 声明）：
   - element-plus（组件前缀 el-，如 <el-button>、<el-table>）
   - ant-design-vue（组件前缀 a-，如 <a-button>、<a-table>）
   - 不使用组件库时，用原生 HTML + CSS 实现
2. 【依赖自洽】每使用一个三方库的组件或 API，必须在 package.json 的 dependencies 中声明该包，
   且版本号必须真实存在（element-plus 用 ^2.8.0，ant-design-vue 用 ^4.2.0）。
   禁止出现"用了组件但没声明依赖"的情况。
3. 【引入自洽】在 Vue 3 SFC 中使用的每个组件，必须满足以下任一条件：
   a) 在 <script setup> 中显式 import（如 import { ElButton } from 'element-plus'）；
   b) 在 main.ts 中全局注册（import ElementPlus from 'element-plus'; app.use(ElementPlus)）。
   禁止只写标签不引入。
4. 【禁止编造】不得使用不存在的组件名、prop 名、事件名。
   不确定某个组件是否存在时，改用原生 HTML 元素 + 自定义样式实现，不要用疑似组件名。
5. 【路径自洽】import 本地组件时，路径与文件名大小写必须与实际生成的文件完全一致
   （如 import MyCard from './components/MyCard.vue'）。

【输出格式约束】
- package.json 必须是合法 JSON：不能有注释、不能有尾逗号。
- 每个文件必须完整输出，不得使用 "// 省略"、"..." 等占位。
```

---

## 四、第二层：确定性校验脚本

### 用法

```bash
# 人类可读
node scripts/vue-code-guard.mjs <生成的项目目录>

# 结构化 JSON（供后端消费）
node scripts/vue-code-guard.mjs <生成的项目目录> --json
```

### 退出码

| 码 | 含义 |
|---|---|
| 0 | 无 error（可能仍有 warning）→ 可以构建 |
| 1 | 存在 error → 进入修复闭环 |
| 2 | 参数错误 / 目录不存在 |

### 检查项

**① 依赖引入（dependency）**
扫描所有源文件的 import / require，**并从模板里的组件标签前缀反推所需组件库**
（这点很关键：AI 常常「用了组件却忘了写 import」，只扫 import 语句会漏）。
与 `package.json` 的 dependencies / devDependencies 比对，缺失即报错。

**② 组件使用（component）**
- 模板里用到的组件，是否在 `<script setup>` 中 import 或在 main.ts 全局注册 `app.use()`
- 组件名是否存在于已知组件清单（识别「幻觉组件名」，报 warning 并给出相近建议）

**③ 语法合法性（syntax）**
- `.vue`：用 `@vue/compiler-sfc` 解析 + 编译 script/template，捕获真实编译错误
- `.ts/.js/.tsx`：用 esbuild 解析，捕获语法错误
- 均带文件名与行号

### JSON 输出示例

```json
{
  "ok": false,
  "scannedFiles": 12,
  "summary": { "errors": 3, "warnings": 1 },
  "issues": [
    {
      "type": "dependency",
      "severity": "error",
      "file": "src/App.vue",
      "line": 0,
      "message": "代码用到了 \"element-plus\"，但 package.json 中未声明该依赖",
      "hint": "在 package.json 的 dependencies 中加入 \"element-plus\""
    },
    {
      "type": "component",
      "severity": "error",
      "file": "src/App.vue",
      "line": 3,
      "message": "使用了 <el-button>，但既没有 import，也没有全局注册",
      "hint": "在 <script setup> 中 import { ElButton } from 'element-plus'"
    },
    {
      "type": "syntax",
      "severity": "error",
      "file": "src/utils/api.ts",
      "line": 7,
      "message": "语法错误: Unexpected \";\"",
      "hint": "修正语法后重新生成该文件"
    }
  ]
}
```

### 已内置的误报防护（在真实项目上验证过，误报已清零）

| 场景 | 处理 |
|---|---|
| 路径别名 `@/api`、`~/x` | 识别为别名，不当作缺失的 npm 包（`@scope/name` 形式的真包不受影响） |
| SVG 绘图元素 `<ellipse>` `<path>` | 视为原生元素，不要求 import |
| `<RouterLink>` / `<RouterView>` | 入口有 `app.use(router)` 即视为已全局注册 |
| 注释 / 字符串里的文本 | 先剥离注释再解析，避免误判为 import |
| 工具脚本自身 | 默认跳过 `scripts/`、`.workbuddy/` 等目录 |

### 关于"传递依赖"（重要）

像 `dayjs`、`@ant-design/icons-vue` 这类包，常常没写在 `package.json` 里但**能正常 import**——
因为它们作为 `ant-design-vue` 的传递依赖被 hoist 到了 `node_modules` 根目录。

**这在本机构建能过，但换用 pnpm 或全新严格安装就会失败**，属于真实隐患。
因此脚本对此**按 error 报**，建议一律显式声明到 `dependencies`。

> 实测：本项目就存在这两个隐患，已按脚本提示补进 `package.json`（版本与已安装的对齐：dayjs 1.11.13、@ant-design/icons-vue 7.0.1）。

### 环境依赖

脚本用 ESM（`.mjs`），需要 Node 18+ 与两个包：

```bash
npm i @vue/compiler-sfc@^3.5.0 esbuild@^0.25.0
```

在本项目里可直接用 npm 入口（依赖已随 vue/vite 存在于 node_modules）：

```bash
npm run guard                 # 检查当前项目
npm run guard -- ../gen-app   # 检查指定目录
npm run guard -- ../gen-app --json
```

后端调用方式：把脚本与 node_modules 一起部署，用 `ProcessBuilder` 调用
`node scripts/vue-code-guard.mjs <dir> --json`，读取 stdout 的 JSON，按 exit code 判断。

---

## 五、第三层：自动修复闭环（提示模板 + 编排）

### 5.1 修复提示词模板（把 issues 填进去即可）

```text
你是 Vue 3 + TypeScript 项目的修复专家。

下面是静态分析工具对刚生成的项目做体检后报出的问题。
这些都是工具确定性检出的事实（不是猜测），不要质疑其真实性，逐条修复即可。

## 问题清单
{{ISSUES}}

（issues 中每个条目含：type=依赖/组件/语法、severity、file、line、message、hint）

## 修复要求
1. 只修改「问题清单中提到的文件」，不要改动其他文件，不要重构无关代码。
2. 每个问题按 hint 修复；若 hint 不足以修复，用最稳妥的方式（例如把有问题的组件
   换成原生 HTML 实现，或补齐缺失的依赖声明）。
3. 修复后必须保证：
   - package.json 是合法 JSON，且声明了所有用到的依赖；
   - 每个用到的组件都有 import 或全局注册；
   - 所有文件语法合法、标签闭合。
4. 输出格式：只输出需要修改的文件的【完整内容】，用如下格式：
   <<<FILE: 相对路径>>>
   文件完整内容
   <<<END>>>

不要输出解释性文字，不要输出 diff，不要省略任何代码。
```

> `{{ISSUES}}` 建议直接用 `--json` 输出的 `issues` 数组（转成可读文本或原样 JSON 均可，
> 实测给 JSON 更利于模型定位 file/line）。

### 5.2 编排流程（后端伪代码）

```
生成代码 → 写入 <projectDir>
loop = 0
while loop < 3:
    result = run("node scripts/vue-code-guard.mjs <projectDir> --json")
    if result.exitCode == 0:
        break                      # 体检通过
    issues = parse(result.stdout).issues
    patchPrompt = 修复提示模板.replace("{{ISSUES}}", issues)
    patchedFiles = callLLM(patchPrompt)
    applyPatchedFiles(projectDir, patchedFiles)   # 只覆盖模型输出的文件
    loop += 1

if 仍不通过:
    → 执行构建，把构建错误也一并收集
    → 返回失败，附带最终问题清单（便于人工排查 / 提示词迭代）
else:
    → 执行 vite build
```

**建议**：修复轮次上限 3 轮。经验上 80% 的问题在第 1 轮就能修掉。

---

## 六、落地顺序建议

1. **先接第二层**（脚本校验）——投入最小、见效最快，能立刻看到失败率下降和失败原因分布。
2. **再接第三层**（修复闭环）——在校验之上叠加，成功率还会再上一个台阶。
3. **同时上第一层**（提示词约束）——从源头减少问题数量，降低修复轮次与 token 消耗。
4. **持续迭代**：统计高频 issue（比如某个组件名总被编造），反过来补充到提示词的「禁止清单」和脚本的组件白名单里。

---

## 七、扩展：新增组件库 / 组件名

编辑 `scripts/vue-code-guard.mjs` 顶部两个配置即可：

```js
const LIB_BY_PREFIX = { 'el-': 'element-plus', 'a-': 'ant-design-vue' }
const LIB_COMPONENTS = { 'element-plus': new Set([...]), 'ant-design-vue': new Set([...]) }
```

新增一个库：加前缀映射 + 组件名清单（组件名填 `el-` 之后的部分，如 `button`）。
组件清单越全，「幻觉组件名」的识别就越准。
