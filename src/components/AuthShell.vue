<script setup lang="ts">
/**
 * 登录 / 注册页的共享外壳：单张居中卡片 = 顶部纸雕横幅 + 下方表单。
 *
 * 横幅沿用 App.vue 里那套剪纸元素（丘陵 + 小动物），保证与首页/应用页的
 * 视觉语言一致：每片元素都是"两层纸"——底层同形状的深色纸做厚度，
 * 上层浅色纸盖上去，再用 drop-shadow 压出硬边投影。
 */
withDefaults(
  defineProps<{
    /** 表单区顶部的小标签 */
    badge?: string
    /** 主标题 */
    title: string
    /** 副标题 */
    desc?: string
  }>(),
  {
    badge: '',
    desc: '',
  },
)
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- ───────── 顶部纸雕横幅 ───────── -->
      <div class="auth-banner">
        <!-- 场景整体是装饰性的，交给读屏器忽略；logo 单独放在外面 -->
        <div class="bn-scene" aria-hidden="true">
          <div class="bn-sky"></div>

          <!-- 太阳：三层纸片叠出层次 -->
          <svg class="bn-sun" viewBox="0 0 120 120">
            <circle cx="63" cy="63" r="40" fill="#e0bd7c" />
            <circle cx="58" cy="58" r="40" fill="#f7dca6" />
            <circle cx="58" cy="58" r="25" fill="#fdf1d6" />
          </svg>

          <svg class="bn-cloud" viewBox="0 0 120 60">
            <g transform="translate(2.6,3)" fill="#d3c19c">
              <ellipse cx="42" cy="40" rx="28" ry="17" />
              <circle cx="34" cy="28" r="15" />
              <circle cx="58" cy="32" r="12" />
              <ellipse cx="80" cy="42" rx="22" ry="13" />
            </g>
            <ellipse cx="42" cy="40" rx="28" ry="17" fill="#fffaf0" />
            <circle cx="34" cy="28" r="15" fill="#fffaf0" />
            <circle cx="58" cy="32" r="12" fill="#fffaf0" />
            <ellipse cx="80" cy="42" rx="22" ry="13" fill="#fffaf0" />
          </svg>

          <!-- 地面：层叠丘陵 + 站在草地上的居民 -->
          <div class="bn-ground">
            <svg class="bn-hill bn-hill--back" viewBox="0 0 1440 170" preserveAspectRatio="none">
              <path
                d="M0 96 C 160 44 340 116 560 84 C 780 52 920 118 1120 88 C 1280 66 1380 96 1440 82 L1440 170 L0 170 Z"
                fill="#cdd6b6"
              />
            </svg>
            <svg class="bn-hill bn-hill--front" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path
                d="M0 46 C 240 36 470 54 720 42 C 970 30 1210 50 1440 38 L1440 120 L0 120 Z"
                fill="#b3bd96"
              />
            </svg>

            <svg class="bn-item bn-tree" viewBox="0 0 80 110">
              <g transform="translate(2.6,3)" fill="#93a07a">
                <ellipse cx="40" cy="40" rx="30" ry="28" />
                <rect x="34" y="58" width="13" height="40" rx="4" />
              </g>
              <ellipse cx="40" cy="40" rx="30" ry="28" fill="#adba90" />
              <ellipse cx="34" cy="34" rx="17" ry="15" fill="#c2cda5" opacity="0.8" />
              <rect x="34" y="58" width="13" height="40" rx="4" fill="#b08a5f" />
            </svg>

            <svg class="bn-item bn-bunny" viewBox="0 0 95 105">
              <g transform="translate(2.4,3)" fill="#cdb794">
                <ellipse cx="31" cy="30" rx="8.5" ry="23" />
                <ellipse cx="56" cy="30" rx="8.5" ry="23" />
                <ellipse cx="43" cy="70" rx="36" ry="31" />
              </g>
              <ellipse cx="31" cy="30" rx="8.5" ry="23" fill="#fdf6ea" />
              <ellipse cx="56" cy="30" rx="8.5" ry="23" fill="#fdf6ea" />
              <ellipse cx="31" cy="33" rx="3.8" ry="14" fill="#f7c9c2" />
              <ellipse cx="56" cy="33" rx="3.8" ry="14" fill="#f7c9c2" />
              <ellipse cx="43" cy="70" rx="36" ry="31" fill="#fdf6ea" />
              <circle cx="32" cy="65" r="4" fill="#4a3f33" />
              <circle cx="54" cy="65" r="4" fill="#4a3f33" />
              <path d="M41 73 L46 78 L41 82 L36 78 Z" fill="#c9713e" />
              <ellipse cx="23" cy="75" rx="5.4" ry="3.6" fill="#f2b48c" opacity="0.8" />
              <ellipse cx="63" cy="75" rx="5.4" ry="3.6" fill="#f2b48c" opacity="0.8" />
            </svg>

            <svg class="bn-item bn-mushroom" viewBox="0 0 70 72">
              <g transform="translate(2.6,3)" fill="#a85726">
                <path d="M10 38 C10 18 60 18 60 38 Z" />
                <rect x="27" y="34" width="15" height="28" rx="6" />
              </g>
              <path d="M10 38 C10 18 60 18 60 38 Z" fill="#d97a45" />
              <circle cx="25" cy="29" r="4.6" fill="#fff6e6" />
              <circle cx="44" cy="27" r="3.6" fill="#fff6e6" />
              <circle cx="35" cy="34" r="2.6" fill="#fff6e6" />
              <rect x="27" y="34" width="15" height="28" rx="6" fill="#f6e7cf" />
            </svg>

            <svg class="bn-item bn-grass" viewBox="0 0 100 56">
              <path d="M14 52 C20 28 28 34 34 50" stroke="#93a07a" stroke-width="5" fill="none" stroke-linecap="round" />
              <path d="M40 52 C46 20 54 30 60 50" stroke="#83906b" stroke-width="5" fill="none" stroke-linecap="round" />
              <path d="M66 52 C72 30 80 36 86 50" stroke="#93a07a" stroke-width="5" fill="none" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <!-- 品牌标识：坐在天空区正中，避开地面的小动物。与顶栏左侧同一张图 -->
        <span class="bn-logo">
          <img src="@/assets/logo.png" alt="iCodeAI" />
        </span>
      </div>

      <!-- ───────── 表单 ───────── -->
      <section class="auth-panel">
        <header class="auth-head">
          <span v-if="badge" class="auth-badge">{{ badge }}</span>
          <h2 class="auth-title">{{ title }}</h2>
          <p v-if="desc" class="auth-desc">{{ desc }}</p>
        </header>
        <slot />
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ───────── 页面：让卡片在纸面上居中 ───────── */
.auth-page {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  padding: 24px 20px;
}

/* 一张纸片：硬边偏移投影 + 暖色描边，和全站纸片卡面同一套语汇 */
.auth-card {
  position: relative;
  width: 100%;
  /* 460 而不是更窄：注册页有「账号 | 邮箱」「密码 | 确认密码」两组两列，
     再窄两列的输入框就放不下 placeholder 了 */
  max-width: 460px;
  /* 居中用 margin:auto 而不是 align-items:center —— 内容高过视口时，
     居中会把顶部推到滚动原点之上，用户滚回去也看不到。 */
  margin: auto;
  border: 1px solid var(--ai-card-border);
  border-radius: 18px;
  background: var(--ai-surface);
  box-shadow:
    3px 4px 0 rgba(184, 152, 104, 0.26),
    0 26px 44px -30px rgba(120, 92, 52, 0.55);
  overflow: hidden;
  animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ───────── 顶部纸雕横幅 ───────── */
.auth-banner {
  position: relative;
  height: 116px;
  overflow: hidden;
  border-bottom: 1px solid var(--ai-card-border);
}

.bn-scene {
  position: absolute;
  inset: 0;
}

/* 天空：从上到下由浅到暖，给纸片留出可读的底 */
.bn-sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #fffaf0 0%, #fdf3e2 52%, #f6e8cd 100%);
}

.bn-sun {
  position: absolute;
  top: 11%;
  right: 13%;
  width: 34px;
  opacity: 0.92;
  filter: drop-shadow(2px 3px 0 rgba(184, 152, 104, 0.22));
}

.bn-cloud {
  position: absolute;
  top: 15%;
  left: 9%;
  width: 46px;
  opacity: 0.85;
  filter: drop-shadow(2px 3px 0 rgba(184, 152, 104, 0.2));
}

/* 品牌标识：纸片小壳 + 顶栏那张 logo */
.bn-logo {
  position: absolute;
  top: 9px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transform: translateX(-50%);
  border: 1px solid var(--ai-card-border);
  border-radius: 12px;
  background: var(--ai-surface);
  box-shadow: 2px 3px 0 rgba(184, 152, 104, 0.26);
}

.bn-logo img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* ───────── 地面场景 ───────── */
.bn-ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
}

.bn-hill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: block;
}
.bn-hill--back {
  height: 84%;
  filter: drop-shadow(1px -2px 0 rgba(184, 152, 104, 0.14));
}
/* 前层低而缓：地表高度可预期，站在固定 bottom 上的小动物才不会
   有的悬空、有的陷进地里 */
.bn-hill--front {
  height: 54%;
  filter: drop-shadow(2px -2px 0 rgba(150, 122, 78, 0.2));
}

/* 小动物共用一条地面线，沿宽度铺开 */
.bn-item {
  position: absolute;
  filter: drop-shadow(2px 2px 0 rgba(184, 152, 104, 0.24));
}
.bn-tree {
  left: 8%;
  bottom: 30%;
  width: 28px;
}
.bn-bunny {
  left: 34%;
  bottom: 25%;
  width: 27px;
}
.bn-mushroom {
  left: 54%;
  bottom: 22%;
  width: 15px;
}
.bn-grass {
  right: 7%;
  bottom: 6%;
  width: 30px;
  filter: drop-shadow(1px 2px 0 rgba(184, 152, 104, 0.18));
}

/* ───────── 表单面板 ───────── */
.auth-panel {
  padding: 18px 32px 30px;
  background: var(--ai-surface);
}

.auth-head {
  margin-bottom: 18px;
  text-align: center;
}

/* 纸片小标签 */
.auth-badge {
  display: inline-block;
  padding: 4px 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(var(--ai-accent-rgb), 0.28);
  border-radius: 999px;
  background: rgba(var(--ai-accent-rgb), 0.08);
  color: var(--ai-primary);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.auth-title {
  margin: 0 0 6px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ai-title);
}

.auth-desc {
  margin: 0;
  font-size: 13px;
  color: var(--ai-muted);
}

/* ───────── 表单控件 ─────────
   插槽内容由页面模板渲染，所以要靠 :deep 穿透进来。
   放在外壳里是为了让登录 / 注册两页共用同一套控件语汇。 */
.auth-panel :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.auth-panel :deep(.ant-form-item-label) {
  padding-bottom: 4px;
}

.auth-panel :deep(.ant-form-item-label > label) {
  height: auto;
  font-size: 13px;
  color: var(--ai-text);
}

.auth-panel :deep(.ant-form-item-explain-error) {
  margin-top: 3px;
  font-size: 12px;
}

/* 两列表单：用 a-row 的负边距会顶到面板内边距，这里显式收回 */
.auth-panel :deep(.ant-form-item-row) {
  min-width: 0;
}

/* 纸槽：输入框像压进纸面的一道凹槽，而不是浮在上面的玻璃条。
   这里必须用 !important：App.vue 的全局覆盖对 .ant-input / .ant-input-affix-wrapper
   的 background、border-color、color 都带了 !important，不加就压不过去。 */
.auth-panel :deep(.ant-input) {
  height: 42px;
  padding: 0 13px;
  border: 1px solid var(--ai-border) !important;
  border-radius: var(--ai-control-radius);
  background: var(--ai-surface-soft) !important;
  box-shadow: inset 0 1px 2px rgba(154, 126, 84, 0.1);
  color: var(--ai-title) !important;
  caret-color: var(--ai-primary);
  line-height: 42px;
  letter-spacing: 0.01em;
}

/* 带前后缀的输入（如密码框）：外层是纸槽，内层裸 input 必须完全透明，
   否则会出现"槽里还有一个槽"。这条比上面那条更具体，能稳定覆盖它。 */
.auth-panel :deep(.ant-input-affix-wrapper) {
  height: 42px;
  padding: 0 13px;
  border: 1px solid var(--ai-border) !important;
  border-radius: var(--ai-control-radius);
  background: var(--ai-surface-soft) !important;
  box-shadow: inset 0 1px 2px rgba(154, 126, 84, 0.1);
  color: var(--ai-title) !important;
}

.auth-panel :deep(.ant-input-affix-wrapper .ant-input) {
  height: 100% !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none !important;
  line-height: normal;
}

.auth-panel :deep(.ant-input-affix-wrapper:hover) {
  border-color: rgba(var(--ai-accent-rgb), 0.4) !important;
}

.auth-panel :deep(.ant-input:focus),
.auth-panel :deep(.ant-input-affix-wrapper-focused) {
  border-color: rgba(var(--ai-accent-rgb), 0.55) !important;
  background: var(--ai-surface) !important;
  box-shadow:
    inset 0 1px 2px rgba(154, 126, 84, 0.06),
    0 0 0 3px rgba(var(--ai-accent-rgb), 0.09);
}

.auth-panel :deep(.ant-input-password-icon) {
  color: var(--ai-muted);
}

.auth-panel :deep(.ant-input-password-icon:hover) {
  color: var(--ai-primary);
}

/* 主按钮：纸片按下去的手感 —— 悬停把纸抬起来，点击压回纸面 */
.auth-panel :deep(.auth-submit.ant-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 42px;
  padding: 0 20px;
  border: 1px solid var(--ai-primary-strong);
  border-radius: var(--ai-control-radius);
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #fffdf7 !important;
  background: var(--ai-primary) !important;
  box-shadow: 3px 4px 0 rgba(173, 92, 47, 0.34);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.25s ease;
}

.auth-panel :deep(.auth-submit.ant-btn:hover),
.auth-panel :deep(.auth-submit.ant-btn:focus-visible) {
  background: #d4824b !important;
  transform: translate(-1px, -1px);
  box-shadow: 4px 6px 0 rgba(173, 92, 47, 0.36);
}

.auth-panel :deep(.auth-submit.ant-btn:active) {
  transform: translate(2px, 3px);
  box-shadow: 1px 1px 0 rgba(173, 92, 47, 0.34);
}

.auth-panel :deep(.auth-submit.ant-btn:disabled),
.auth-panel :deep(.auth-submit.ant-btn[disabled]:hover) {
  background: #ddcdaa !important;
  border-color: #d3c19c;
  color: #fffdf7 !important;
  box-shadow: none;
  transform: none;
}

/* ───────── 验证码行：输入框 + 图片 / 发送按钮 ───────── */
.auth-panel :deep(.captcha-row) {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-panel :deep(.captcha-row > .ant-input),
.auth-panel :deep(.captcha-row > .ant-input-affix-wrapper) {
  flex: 1;
  min-width: 0;
}

.auth-panel :deep(.captcha-card) {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  height: 42px;
  padding: 0;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-control-radius);
  background: var(--ai-surface-soft);
  cursor: pointer;
  overflow: hidden;
  transition: var(--ai-transition);
}

.auth-panel :deep(.captcha-card:hover) {
  border-color: rgba(var(--ai-accent-rgb), 0.45);
  box-shadow: 2px 3px 0 rgba(184, 152, 104, 0.24);
  transform: translateY(-1px);
}

.auth-panel :deep(.captcha-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-panel :deep(.captcha-placeholder) {
  color: var(--ai-muted);
  font-size: 12px;
}

.auth-panel :deep(.send-code-btn) {
  flex-shrink: 0;
  width: 112px;
  height: 42px;
  padding: 0;
  border: 1px solid rgba(var(--ai-accent-rgb), 0.35);
  border-radius: var(--ai-control-radius);
  background: rgba(var(--ai-accent-rgb), 0.08);
  color: var(--ai-primary);
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: var(--ai-transition);
}

.auth-panel :deep(.send-code-btn:hover:not(:disabled)) {
  background: rgba(var(--ai-accent-rgb), 0.16);
  border-color: rgba(var(--ai-accent-rgb), 0.5);
}

.auth-panel :deep(.send-code-btn:disabled) {
  opacity: 0.55;
  cursor: not-allowed;
}

/* 表单底部辅助信息（"已有账号？去登录"这类） */
.auth-panel :deep(.auth-tips) {
  margin-bottom: 12px;
  text-align: right;
  font-size: 13px;
  color: var(--ai-muted);
}

.auth-panel :deep(.auth-tips a) {
  color: var(--ai-primary);
  font-weight: 600;
}

.auth-panel :deep(.auth-tips a:hover) {
  color: var(--ai-primary-strong);
  text-decoration: underline;
}

/* ───────── 响应式 ───────── */
@media (max-width: 520px) {
  .auth-page {
    padding: 16px 12px;
  }
  .auth-banner {
    height: 100px;
  }
  .auth-panel {
    padding: 16px 20px 24px;
  }
  .bn-sun {
    width: 30px;
  }
  .bn-cloud {
    width: 40px;
  }
}
</style>
