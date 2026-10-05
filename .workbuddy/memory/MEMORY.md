# iCodeAI 前端 —— 长期项目约定

## 性能红线（务必遵守）
1. **不要给全屏背景层加无限动画**。`body::before`、`.bg-dynamic-global::before/::after` 这类铺满视口的层，一旦 `animation` 持续改变 `background-position` / `filter` / `transform`，会逐帧重绘整屏，并**迫使上方所有 `backdrop-filter` 元素每帧重新采样模糊** → 整页掉帧。背景层请保持**静止**（一次栅格化即可）。
2. **`backdrop-filter` 是昂贵属性**：不要大面积/多层叠加；不要把它放进 `transition`（动画模糊极贵）；固定顶栏滚动时常驻模糊是典型掉帧源，优先用高不透明度纯色替代。全站目前有 ~18 处 backdrop-filter，新增前请三思。
3. **避免 `transition: all`**：全站选择器上使用会让浏览器为每个元素监听所有可动画属性（含布局属性）。改为显式属性列表。
4. **谨慎使用 `will-change` / `translateZ(0)`**：会给元素创建常驻合成层。列表项（如模板卡 12 张）上批量使用会显著增加合成层资源。仅在确有渲染 bug 且无他法时保留。
5. 无限动画不要动 `box-shadow`（逐帧重绘），需要"呼吸感"请改用独立伪元素做 `opacity` 动画。
6. **不要在 `mousemove` 里逐帧写 CSS 变量**（尤其写到 `documentElement`）：CSS 变量变更会使整棵子树样式失效，若被铺满视口的元素使用（如 `#homePage::after` 的 `radial-gradient`），每次移动鼠标都会整屏重绘。要用鼠标跟随请改成 `transform`（合成层）+ rAF 节流，或干脆静态化。

## 主题 / 换肤约定
- 全站配色走 `:root` 的 `--ai-*` token。**新增样式请用 token，不要硬编码颜色**；确需写 `rgba()` 时用 `rgba(var(--ai-accent-rgb), α)`，这样能整页换主题。
- 需要"局部换肤"时：把 token 覆盖定义在**更高层的元素上**（如 `body.paper-theme`），并在页面组件挂载/卸载时切换该类，外壳组件（顶栏等）也会跟着变。
- 现状：**全站已切到「温柔纸雕」主题**（淡黄纸片 + 陶土橘 + 剪纸小动物背景装饰），token 直接定义在 `:root`。要回退需恢复 `:root` 旧色板（冷蓝 `#3d6bff` 系）。
- 全站已禁用 `backdrop-filter`（App.vue 里 `*` 规则 + `!important`），不要再往回加。
- 背景装饰动物在 `App.vue` 的 `.bg-dynamic-global` 里（`.deco--*`），`<1260px` 自动隐藏；改动物/位置在那里调。

## 主题 / 样式约定（原）
- 亮色主题 + 冷调"霜面"：展示型卡片用 `--ai-card-surface`（微透冷白渐变），数据型（后台表格）用 `--ai-card-surface-solid`（高不透，保可读）。
- 卡片面**不描边时靠底色区分**：`linear-gradient(180deg, rgba(61,107,255,.1), rgba(61,107,255,.065))`，状态只用底色深浅 + 柔光环表达。
- 覆盖 antd 运行时 CSS-in-JS 样式：全局 `App.vue` 里已有多条 `.ant-*` 的 `!important` 规则（特异性约 0,3,0）。组件内局部覆盖需用**父级类前缀提特异性至 ≥0,4,0** 再配 `!important` 才稳。
- **特异性坑（踩过）**：`:not(.foo)` 内部的选择器**计入特异性**。`App.vue` 的
  `.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector`
  特异性高达 **0,5,0**，比常规 `.ant-select:not(...) .ant-select-selector`(0,3,0) 高很多。**只覆盖 base 态不够**，聚焦 (`-focused`) / 悬停 (`:hover`) 等状态规则要单独覆盖。
  另：ant-design-vue 4 的 CSS-in-JS 会给组件根注入哈希类（如 `.css-1p3hq3p`），其规则特异性会 +1。
  需要压过这类规则时，用**双类名**技巧（如 `.type-selector-item.type-selector-item :deep(...)`）把特异性顶到 ≥6。
- antd 分页 (`a-pagination`) 在本项目与全局样式冲突严重（页码 DOM 在但不可见），**已用自研 `CustomPagination.vue`（原生 button + select）替代**，不要再换回 `a-pagination`。

## 环境 / 构建
- 构建：`node node_modules/vite/bin/vite.js build`（PowerShell 下 `npm run build-only` 常无输出；bash 的 PATH 有时异常）。
- managed node：`C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2-5\node.exe`。
- `dist` 偶发被占用（`EBUSY`）→ 关闭占用它的终端/进程后重试。
- 本机可用 Chrome headless 做视觉验证：`--headless=new --user-data-dir=<临时目录> --screenshot`（用 `http://127.0.0.1:` 而非 `localhost`，成功率更高；偶尔需要重试）。
- **重要坑**：本机 `localhost:5173` 跑的是**另一个项目**（"智语 AI 企业知识库"），**不是本项目**；dev server 里也不服务 `public/` 下新增的临时文件（曾试过放 public/ 与 dist/ 均 404）。要预览本项目：`vite build` → 自写 node 静态服务托管 `dist/` 并把 `/api` 反代到 `www.icodeplay.site`（同源避免 CORS）→ headless 截图 `http://127.0.0.1:<port>/`。首页还会因 401 跳登录，需临时注释 `src/request.ts` 的跳转行（用完务必还原）。
- 用户机器上 `localhost:5173` 是用户自己的本项目 dev server（`present_files` 预览用它），但**本沙箱访问不到**。
