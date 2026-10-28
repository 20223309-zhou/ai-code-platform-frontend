## iCodeAI 桌面客户端 v1.0.0

把 iCodeAI 的 Web 端封装成 Windows 桌面应用，**后端零改动**。

### 下载

| 文件 | 说明 |
|---|---|
| `iCodeAI-1.0.0-x64-setup.exe` | Windows 10/11 x64 安装包，85 MB |

### 这个版本做了什么

- **单端口同源架构**：壳内起一个本地服务，同一端口既托管前端静态资源又把 `/api` 转发到远端后端。请求算「同站」，Session Cookie 正常携带，预览 iframe 与主页面同源（可视化编辑才不会失效）——这三个问题都不需要后端配合
- **应用式布局**：侧栏承载品牌、新建应用、主页/模板/GitHub、我的作品、管理后台与账户信息，主区承载内容；隐藏原生标题栏，窗口按钮做成右上角浮层
- **4 套浅色主题**：雾蓝 / 森绿 / 暮棕等，切换后持久化到本地
- **系统托盘常驻**：关闭窗口只是隐藏到托盘，AI 生成长任务不会因为误关窗口被打断；托盘菜单可退出、可开关「关闭即最小化」、可设开机自启
- **方案生成有反馈**：生成前 AI 出多套设计方案时会显示阶段文案 + 已用秒数 + 取消按钮，45 秒超时自动降级直接生成
- **本地日志**：`%APPDATA%\iCodeAI\logs\main.log`，客户端出问题有据可查

### 安装说明

1. 双击 `iCodeAI-1.0.0-x64-setup.exe`
2. 默认安装到 `%LOCALAPPDATA%\Programs\iCodeAI`，**不需要管理员权限**
3. 安装完成后桌面与开始菜单会生成快捷方式

> ⚠️ 本版本未做代码签名。首次运行时 Windows SmartScreen 会提示「Windows 已保护你的电脑」，
> 点击「更多信息」→「仍要运行」即可。

安装包 SHA-256：

```
8b158babe596f1f5fe5442effabd67a2604c8dd01c720533610455a9b0de78c0
```

### 卸载

- 设置 → 应用 → iCodeAI → 卸载，或运行安装目录下的 `Uninstall iCodeAI.exe`
- 卸载会保留下 `%APPDATA%\iCodeAI`（登录态、主题、托盘设置），重装后不用重新登录；
  需要彻底清理可手动删除该目录

### 已知限制

- 仅提供 Windows x64 版本
- 后端地址写在 `electron/config.cjs`（默认 `http://www.icodeplay.site`），换环境需要重新打包
- 需要能访问后端服务，离线状态下只能看到界面

### 相关仓库

- 前端（桌面端代码在 `desktop` 分支）：[ai-code-platform-frontend](https://github.com/20223309-zhou/ai-code-platform-frontend)
