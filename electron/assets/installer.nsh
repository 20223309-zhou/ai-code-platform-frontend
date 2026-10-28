; 自定义 NSIS 安装脚本（electron-builder 的 nsis.include）
;
; 为什么需要它：
;   默认情况下 electron-builder 用 $LocalAppData\Programs\${APP_FILENAME} 算安装目录，
;   但在实测环境里它落到了 C:\Users\<用户>\ICodeAI —— 直接堆在用户主目录根部，
;   既不符合 Windows 惯例，也会让用户以为是解压出来的绿色版。
;
; 做法是官方推荐的：在 preInit 阶段把期望路径写进安装位置注册表，
; setInstallModePerUser 会优先读这个键（见 app-builder-lib/templates/nsis/multiUser.nsh），
; 读到就用它当 $INSTDIR，跳过那套探测逻辑。
;
; 用 WriteRegStr 而不是 WriteRegExpandStr：后者存成 REG_EXPAND_SZ，
; 读回来时 %LOCALAPPDATA% 不会展开，目录名会变成字面量带百分号。

!macro preInit
  SetRegView 64
  WriteRegStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\iCodeAI"
  SetRegView 32
  WriteRegStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LOCALAPPDATA\Programs\iCodeAI"
!macroend
