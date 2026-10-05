<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
</script>

<template>
  <BasicLayout />

  <!-- 背景装饰层：纸面晕染 + 剪纸小景（全部静止，无动画 / 无毛玻璃） -->
  <div class="bg-dynamic-global" aria-hidden="true">
    <!-- 云朵（远景，淡） -->
    <svg class="deco deco--far deco--cloud1" viewBox="0 0 120 60">
      <g transform="translate(2.4,2.8)" fill="#d9cbaa">
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
    <svg class="deco deco--far deco--cloud2" viewBox="0 0 120 60">
      <g transform="translate(2.4,2.8)" fill="#d9cbaa">
        <ellipse cx="46" cy="38" rx="26" ry="15" />
        <circle cx="40" cy="28" r="14" />
        <ellipse cx="76" cy="40" rx="20" ry="12" />
      </g>
      <ellipse cx="46" cy="38" rx="26" ry="15" fill="#fffaf0" />
      <circle cx="40" cy="28" r="14" fill="#fffaf0" />
      <ellipse cx="76" cy="40" rx="20" ry="12" fill="#fffaf0" />
    </svg>

    <!-- 散落小纸片：给留白处一点呼吸感（远景，淡） -->
    <svg class="deco deco--far deco--confetti1" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="7" fill="#e8c98a" />
      <circle cx="20" cy="20" r="2.6" fill="#fffaf0" />
    </svg>
    <svg class="deco deco--far deco--confetti2" viewBox="0 0 40 40">
      <path d="M20 6 L33 20 L20 34 L7 20 Z" fill="#c9d8b4" />
    </svg>
    <svg class="deco deco--far deco--confetti3" viewBox="0 0 40 40">
      <rect x="8" y="12" width="24" height="14" rx="7" fill="#e8b48c" />
    </svg>
    <svg class="deco deco--far deco--confetti4" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="6" fill="#d8c2a0" />
    </svg>

    <!-- 地面场景：层叠剪纸丘陵（横贯底部），把动物/树/蘑菇统一到同一片草地上 -->
    <div class="bg-scene">
      <svg class="hill hill--back" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 96 C 160 44 340 116 560 84 C 780 52 920 118 1120 88 C 1280 66 1380 96 1440 82 L1440 170 L0 170 Z" fill="#dadcc5" />
      </svg>
      <svg class="hill hill--front" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 74 C 200 30 430 100 660 68 C 880 38 1090 96 1270 66 C 1360 52 1410 64 1440 58 L1440 120 L0 120 Z" fill="#c6c9ac" />
        <!-- 前层丘陵上的小草点缀 -->
        <path d="M120 96 C 124 82 132 86 136 96" stroke="#acb096" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M480 88 C 484 74 492 78 496 88" stroke="#acb096" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M860 84 C 864 70 872 74 876 84" stroke="#acb096" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M1240 78 C 1244 66 1252 70 1256 80" stroke="#acb096" stroke-width="4" fill="none" stroke-linecap="round" />
      </svg>

      <!-- 站在草地上的居民：底部对齐丘陵，彼此有位置关系 -->
      <svg class="scene-item scene--bunny" viewBox="0 0 95 105" aria-hidden="true">
        <g transform="translate(2.4,3)" fill="#d3c19c">
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

      <svg class="scene-item scene--tree1" viewBox="0 0 80 110" aria-hidden="true">
        <g transform="translate(2.6,3)" fill="#9aa083">
          <ellipse cx="40" cy="40" rx="30" ry="28" />
          <rect x="34" y="58" width="13" height="40" rx="4" />
        </g>
        <ellipse cx="40" cy="40" rx="30" ry="28" fill="#b0b89c" />
        <ellipse cx="34" cy="34" rx="17" ry="15" fill="#bcc4a8" opacity="0.75" />
        <rect x="34" y="58" width="13" height="40" rx="4" fill="#b08a5f" />
      </svg>

      <svg class="scene-item scene--mushroom1" viewBox="0 0 70 72" aria-hidden="true">
        <g transform="translate(2.6,3)" fill="#b8632f">
          <path d="M10 38 C10 18 60 18 60 38 Z" />
          <rect x="27" y="34" width="15" height="28" rx="6" />
        </g>
        <path d="M10 38 C10 18 60 18 60 38 Z" fill="#d97a45" />
        <circle cx="25" cy="29" r="4.6" fill="#fff6e6" />
        <circle cx="44" cy="27" r="3.6" fill="#fff6e6" />
        <circle cx="35" cy="34" r="2.6" fill="#fff6e6" />
        <rect x="27" y="34" width="15" height="28" rx="6" fill="#f6e7cf" />
      </svg>

      <svg class="scene-item scene--grass1" viewBox="0 0 100 56" aria-hidden="true">
        <path d="M10 52 C16 26 24 32 30 50" stroke="#b0b89c" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M34 52 C40 22 48 30 54 50" stroke="#a3ab8c" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M60 52 C66 28 74 34 80 50" stroke="#b0b89c" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M82 52 C88 32 94 36 97 50" stroke="#a3ab8c" stroke-width="5" fill="none" stroke-linecap="round" />
      </svg>

      <svg class="scene-item scene--kitty" viewBox="0 0 95 95" aria-hidden="true">
        <g transform="translate(2.4,3)" fill="#b57e52">
          <path d="M20 34 L15 8 L43 24 Z" />
          <path d="M66 34 L71 8 L43 24 Z" />
          <ellipse cx="44" cy="62" rx="36" ry="29" />
        </g>
        <path d="M20 34 L15 8 L43 24 Z" fill="#e0a86f" />
        <path d="M66 34 L71 8 L43 24 Z" fill="#e0a86f" />
        <path d="M24 30 L21 16 L36 25 Z" fill="#f6d9be" />
        <path d="M62 30 L65 16 L50 25 Z" fill="#f6d9be" />
        <ellipse cx="44" cy="62" rx="36" ry="29" fill="#f0bd82" />
        <circle cx="32" cy="58" r="4" fill="#4a3f33" />
        <circle cx="56" cy="58" r="4" fill="#4a3f33" />
        <path d="M42 66 L47 71 L42 75 L37 71 Z" fill="#c9713e" />
        <path d="M78 64 C90 58 92 46 84 42" stroke="#c08a5e" stroke-width="8" fill="none" stroke-linecap="round" />
      </svg>

      <svg class="scene-item scene--bear" viewBox="0 0 95 90" aria-hidden="true">
        <g transform="translate(2.4,3)" fill="#a9825c">
          <circle cx="24" cy="24" r="14" />
          <circle cx="66" cy="24" r="14" />
          <ellipse cx="45" cy="60" rx="37" ry="28" />
        </g>
        <circle cx="24" cy="24" r="14" fill="#d9b58a" />
        <circle cx="66" cy="24" r="14" fill="#d9b58a" />
        <circle cx="24" cy="24" r="6.5" fill="#f0d7b6" />
        <circle cx="66" cy="24" r="6.5" fill="#f0d7b6" />
        <ellipse cx="45" cy="60" rx="37" ry="28" fill="#e6c69c" />
        <ellipse cx="45" cy="70" rx="16" ry="11" fill="#f6e7cf" />
        <circle cx="32" cy="56" r="4" fill="#4a3f33" />
        <circle cx="58" cy="56" r="4" fill="#4a3f33" />
        <path d="M45 63 L50 68 L45 72 L40 68 Z" fill="#7a5a3a" />
      </svg>

      <svg class="scene-item scene--mushroom2" viewBox="0 0 70 72" aria-hidden="true">
        <g transform="translate(2.6,3)" fill="#a8612f">
          <path d="M10 38 C10 18 60 18 60 38 Z" />
          <rect x="27" y="34" width="15" height="28" rx="6" />
        </g>
        <path d="M10 38 C10 18 60 18 60 38 Z" fill="#e09a5c" />
        <circle cx="28" cy="30" r="3.8" fill="#fff6e6" />
        <circle cx="46" cy="28" r="3" fill="#fff6e6" />
        <rect x="27" y="34" width="15" height="28" rx="6" fill="#f6e7cf" />
      </svg>

      <svg class="scene-item scene--grass2" viewBox="0 0 100 56" aria-hidden="true">
        <path d="M14 52 C20 28 28 34 34 50" stroke="#b0b89c" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M40 52 C46 20 54 30 60 50" stroke="#a3ab8c" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M66 52 C72 30 80 36 86 50" stroke="#b0b89c" stroke-width="5" fill="none" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>

<style>
:root {
  /* ===== 纸雕主题 · 温柔纸雕 / 淡黄纸片（全站） ===== */
  /* 品牌色：陶土橘 */
  --ai-primary: #c9713e;
  --ai-primary-strong: #ad5c2f;
  --ai-primary-glow: rgba(201, 113, 62, 0.18);
  --ai-accent: #7e9b6b;
  --ai-accent-soft: #b0b89c;
  /* 强调色 RGB 分量（供 rgba(var(--ai-accent-rgb), α) 使用）：整站换主题只需改这里 */
  --ai-accent-rgb: 201, 113, 62;
  /* 中性墨色 RGB 分量：用于阴影 / 描边等中性色，保持纸雕的暖调 */
  --ai-ink-rgb: 154, 126, 84;

  /* 纸料背景 / 纸面 */
  --ai-bg: #fbf3e1;
  --ai-surface: #fffdf7;
  --ai-surface-soft: #f7eeda;
  --ai-card-bg: #fffdf7;
  --ai-glass: #fffdf7;
  --ai-glass-strong: #fffdf7;
  --ai-glass-border: #ecdcbd;

  /* 纸片卡面：不透明，靠暖色描边 + 硬边偏移投影区分层次 */
  --ai-card-surface: #fffdf7;
  --ai-card-surface-solid: #fffdf7;
  --ai-card-border: #ecdcbd;
  --ai-card-shadow: 2px 3px 0 rgba(184, 152, 104, 0.24), 0 16px 26px -22px rgba(120, 92, 52, 0.5);

  /* 暖墨文字三档 */
  --ai-title: #4a3f33;
  --ai-text: #6e6047;
  --ai-muted: #a0917a;

  /* 边框 / 遮罩 / 阴影 */
  --ai-border: #e8d9bb;
  --ai-border-soft: #f2e8d2;
  --ai-overlay: rgba(74, 63, 51, 0.4);
  --ai-chip-bg: rgba(201, 113, 62, 0.08);
  --ai-chip-bg-hover: rgba(201, 113, 62, 0.14);
  --ai-card-radius: 16px;
  --ai-control-radius: 12px;
  --ai-shadow: 2px 3px 0 rgba(184, 152, 104, 0.24), 0 16px 26px -22px rgba(120, 92, 52, 0.5);
  --ai-shadow-hover: 3px 5px 0 rgba(184, 152, 104, 0.28), 0 22px 34px -24px rgba(120, 92, 52, 0.55);
  --ai-transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 纸雕主题：全站不再使用毛玻璃。
   背景已是"不透明纸面"，模糊既没有视觉效果，又是最贵的渲染开销之一。 */
*,
*::before,
*::after {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

/* 让应用内容整体处于背景装饰层之上，避免点阵/光幕叠在内容上冲淡可读性。
   注意：.basic-layout 需为透明，背景装饰才能透出（见 BasicLayout.vue）。 */
#app {
  position: relative;
  z-index: 1;
}

body {
  font-family: 'Inter', 'PingFang SC', 'HarmonyOS Sans SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
  background: var(--ai-bg);
  color: var(--ai-text);
  line-height: 1.7;
  letter-spacing: 0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* 亮色氛围底：纸面 + 纤维纹理 + 纸浆云斑，让大面积浅底有层次不显单调 */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* 纸面底：暖米黄纸 + 斜向纤维 + 纸浆云斑 + 上下柔和晕染（静止，只栅格化一次） */
  background-color: #fbf3e1;
  background-image:
    /* 纸浆云斑：大尺度、极低透明的不规则斑块，打破大面积单色 */
    radial-gradient(ellipse 42% 30% at 18% 22%, rgba(255, 252, 242, 0.85), transparent 70%),
    radial-gradient(ellipse 36% 26% at 82% 38%, rgba(233, 214, 178, 0.4), transparent 72%),
    radial-gradient(ellipse 46% 32% at 30% 76%, rgba(255, 251, 240, 0.7), transparent 72%),
    radial-gradient(ellipse 34% 24% at 68% 88%, rgba(226, 205, 165, 0.42), transparent 70%),
    radial-gradient(ellipse 28% 20% at 52% 46%, rgba(255, 253, 247, 0.6), transparent 74%),
    /* 纸张纤维：斜向细纹，给纸面可感知的织理 */
    repeating-linear-gradient(48deg, rgba(176, 146, 96, 0.05) 0 1px, transparent 1px 5px),
    repeating-linear-gradient(-42deg, rgba(176, 146, 96, 0.032) 0 1px, transparent 1px 7px),
    repeating-linear-gradient(0deg, rgba(176, 146, 96, 0.028) 0 1px, transparent 1px 4px),
    /* 上下晕染：顶部提亮、底部泛黄晕，营造纸张受光 */
    radial-gradient(ellipse 85% 55% at 50% -8%, rgba(255, 253, 246, 0.95), transparent 72%),
    radial-gradient(ellipse 80% 52% at 50% 112%, rgba(226, 205, 165, 0.55), transparent 72%);
}

/* 极细纸屑颗粒：给纸面一点可感知的颗粒感 */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    radial-gradient(rgba(150, 118, 68, 0.075) 1px, transparent 1.5px),
    radial-gradient(rgba(150, 118, 68, 0.05) 0.8px, transparent 1.2px);
  background-size: 26px 26px, 13px 13px;
  background-position: 0 0, 6px 9px;
  mask-image: radial-gradient(ellipse 130% 110% at 50% 0%, #000 30%, transparent 92%);
  -webkit-mask-image: radial-gradient(ellipse 130% 110% at 50% 0%, #000 30%, transparent 92%);
}

@keyframes aurora-drift {
  0% {
    background-position: 0% 0%, 0% 0%, 50% 50%, 100% 100%, 50% 50%, 0 0;
    filter: saturate(1);
  }
  50% {
    background-position: 8% 4%, -10% 8%, 45% 48%, 90% 95%, 46% 46%, 0 0;
    filter: saturate(1.1);
  }
  100% {
    background-position: -5% -3%, 12% -6%, 55% 52%, 110% 104%, 54% 52%, 0 0;
    filter: saturate(1.04);
  }
}

a {
  color: inherit;
  text-decoration: none;
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}

/* 性能：原来这里对全站按钮/输入/卡片使用 transition: all，
   浏览器会为每个元素监听所有可动画属性（含布局属性），样式重算开销大。
   收窄为显式属性，观感基本不变。 */
button, input, textarea,
.ant-btn, .ant-input, .ant-input-affix-wrapper,
.ant-pagination-item, .ant-card, .ant-tag {
  transition:
    color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

::selection {
  background: rgba(var(--ai-accent-rgb), 0.18);
  color: var(--ai-title);
}

/* ===== 动画 ===== */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-ring {
  from { opacity: 0.5; transform: scale(0.88); }
  to { opacity: 0; transform: scale(1.8); }
}
@keyframes spin-ring {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes breathe {
  0% { box-shadow: 0 0 0 0 rgba(var(--ai-accent-rgb), 0); }
  50% { box-shadow: 0 0 28px 4px rgba(var(--ai-accent-rgb), 0.15); }
  100% { box-shadow: 0 0 0 0 rgba(var(--ai-accent-rgb), 0); }
}
@keyframes breathe-subtle {
  0% { box-shadow: inset 0 0 0 0 rgba(var(--ai-accent-rgb), 0); }
  50% { box-shadow: inset 0 0 0 1px rgba(var(--ai-accent-rgb), 0.06), 0 0 18px rgba(var(--ai-accent-rgb), 0.04); }
  100% { box-shadow: inset 0 0 0 0 rgba(var(--ai-accent-rgb), 0); }
}

/* === 大面积背景光幕动画 === */
@keyframes light-curtain {
  0% {
    transform: translate3d(-18%, -6%, 0) rotate(-8deg) scale(1);
    opacity: 0.35;
  }
  50% {
    transform: translate3d(12%, 4%, 0) rotate(6deg) scale(1.08);
    opacity: 0.6;
  }
  100% {
    transform: translate3d(-10%, 10%, 0) rotate(-4deg) scale(0.98);
    opacity: 0.4;
  }
}

@keyframes light-curtain-alt {
  0% {
    transform: translate3d(10%, -8%, 0) rotate(10deg) scale(1.02);
    opacity: 0.16;
  }
  50% {
    transform: translate3d(-10%, 8%, 0) rotate(-8deg) scale(1.1);
    opacity: 0.42;
  }
  100% {
    transform: translate3d(8%, -2%, 0) rotate(6deg) scale(1);
    opacity: 0.2;
  }
}

/* 背景装饰层：置于内容之下（#app 建立了层叠上下文） */
.bg-dynamic-global {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

/* 柔和暖色晕染：打破大面积单色的纸面（静止，只栅格化一次） */
.bg-dynamic-global::before {
  content: '';
  position: absolute;
  inset: -10%;
  filter: blur(48px);
  background:
    radial-gradient(circle at 12% 16%, rgba(201, 113, 62, 0.16), transparent 40%),
    radial-gradient(circle at 88% 24%, rgba(126, 155, 107, 0.14), transparent 38%),
    radial-gradient(circle at 74% 90%, rgba(216, 165, 91, 0.18), transparent 42%);
}

/* 纸张压边：四角与四边的柔和暗角，让整页像"一张有厚度的纸"而非无限延展的色块 */
.bg-dynamic-global::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 120% 90% at 50% 50%, transparent 58%, rgba(168, 134, 84, 0.09) 100%),
    linear-gradient(90deg, rgba(168, 134, 84, 0.07) 0%, transparent 9%, transparent 91%, rgba(168, 134, 84, 0.07) 100%);
}

/* ───────── 剪纸卡通动物装饰（静止、无动画、无毛玻璃） ───────── */
.deco {
  position: absolute;
  pointer-events: none;
  /* 纸片厚度感 */
  filter: drop-shadow(2px 3px 0 rgba(184, 152, 104, 0.26));
}

/* 远景：更小、更淡、投影更弱 —— 制造纵深，避免所有元素"一样近" */
.deco--far {
  opacity: 0.55;
  filter: drop-shadow(1px 2px 0 rgba(184, 152, 104, 0.14));
}
.deco--cloud1   { top: 6%; left: 9%; width: 112px; }
.deco--cloud2   { top: 11%; right: 7%; width: 94px; }
.deco--confetti1 { top: 24%; left: 16%; width: 22px; }
.deco--confetti2 { top: 52%; left: 13%; width: 20px; }
.deco--confetti3 { top: 36%; right: 16%; width: 24px; }
.deco--confetti4 { bottom: 38%; right: 18%; width: 20px; }

/* ───── 地面场景：层叠剪纸丘陵 + 站在草地上的居民 ─────
   构图逻辑：天（云）— 地平线（后层丘陵）— 草地（前层丘陵 + 居民），
   所有元素共享同一条地面线，形成完整的"纸上小世界"而非散落贴纸。 */
.bg-scene {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 200px;
  pointer-events: none;
}
.hill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: block;
}
.hill--back {
  height: 170px;
  opacity: 0.42;
}
.hill--front {
  height: 118px;
  opacity: 0.62;
}
.scene-item {
  position: absolute;
  pointer-events: none;
  filter: drop-shadow(2px 3px 0 rgba(184, 152, 104, 0.2));
}
/* 左岸：树 + 兔 + 蘑菇 + 草丛 */
.scene--tree1     { left: 4%;  bottom: 96px; width: 88px; }
.scene--bunny     { left: 12%; bottom: 88px; width: 76px; }
.scene--grass1    { left: 20%; bottom: 66px; width: 82px; filter: drop-shadow(1px 2px 0 rgba(184, 152, 104, 0.16)); }
.scene--mushroom1 { left: 27%; bottom: 78px; width: 40px; }
/* 右岸：猫 + 熊 + 蘑菇 + 草丛 */
.scene--kitty     { right: 20%; bottom: 84px; width: 74px; }
.scene--bear      { right: 7%;  bottom: 94px; width: 82px; }
.scene--grass2    { right: 3%;  bottom: 62px; width: 86px; filter: drop-shadow(1px 2px 0 rgba(184, 152, 104, 0.16)); }
.scene--mushroom2 { right: 29%; bottom: 72px; width: 38px; }

/* 中等宽度：收掉散落小纸片，避免视觉碎屑过多 */
@media (max-width: 1340px) {
  .deco--confetti1,
  .deco--confetti2,
  .deco--confetti3,
  .deco--confetti4 {
    display: none;
  }
}

/* 页面留白不够时收起装饰，避免压到内容 */
@media (max-width: 1024px) {
  .deco,
  .bg-scene {
    display: none;
  }
}

/* ===== 全局亮色覆盖 ===== */

/* 纸雕主题：标签统一为暖纸色（覆盖 antd 预设色，如 color="blue"） */
.ant-tag {
  border-radius: 8px !important;
}
.ant-tag-blue {
  color: #a8612f !important;
  background: rgba(201, 113, 62, 0.08) !important;
  border-color: rgba(201, 113, 62, 0.28) !important;
}

/* Table */
.ant-table,
.ant-table-container,
.ant-table-thead > tr > th {
  background: transparent !important;
  color: var(--ai-title) !important;
  border-color: var(--ai-border-soft) !important;
}
.ant-table-tbody > tr > td {
  color: var(--ai-text) !important;
  border-color: var(--ai-border-soft) !important;
  background: transparent !important;
}
.ant-table-tbody > tr:hover > td {
  background: rgba(var(--ai-accent-rgb), 0.04) !important;
}
.ant-table-thead > tr > th {
  background: rgba(var(--ai-ink-rgb), 0.03) !important;
  color: var(--ai-title) !important;
  font-weight: 500;
}
.ant-table-wrapper,
.ant-table {
  color: var(--ai-text) !important;
  background: transparent !important;
}
.ant-table-container {
  background: transparent !important;
}
.ant-table-placeholder {
  background: transparent !important;
}
.ant-empty-normal,
.ant-empty-description {
  color: var(--ai-muted) !important;
}

/* Dropdown */
.ant-dropdown-menu {
  background: var(--ai-glass-strong) !important;
  border: 1px solid var(--ai-glass-border) !important;
  border-radius: 10px !important;
  padding: 4px !important;
  backdrop-filter: blur(28px);
  box-shadow: var(--ai-shadow) !important;
}
.ant-dropdown-menu-item {
  color: var(--ai-text) !important;
  border-radius: 6px !important;
  padding: 8px 12px !important;
}
.ant-dropdown-menu-item:hover {
  background: rgba(var(--ai-ink-rgb), 0.05) !important;
  color: var(--ai-title) !important;
}

/* Input */
.ant-input-affix-wrapper {
  border-color: var(--ai-glass-border) !important;
  background: var(--ai-surface) !important;
  color: var(--ai-title) !important;
}
.ant-input-affix-wrapper:hover,
.ant-input-affix-wrapper-focused {
  border-color: rgba(var(--ai-accent-rgb), 0.35) !important;
}
.ant-input {
  color: var(--ai-title) !important;
  background: transparent !important;
}
.ant-input-affix-wrapper input {
  background: transparent !important;
}
.ant-input-password-icon {
  color: var(--ai-muted) !important;
}
.ant-input-password-icon:hover {
  color: var(--ai-primary) !important;
}
input::placeholder,
textarea::placeholder,
.ant-input-affix-wrapper input::placeholder {
  color: var(--ai-muted) !important;
  opacity: 1 !important;
}

/* Buttons */
.ant-btn {
  letter-spacing: 0.02em !important;
}
.ant-btn-default {
  background: var(--ai-surface) !important;
  border-color: var(--ai-glass-border) !important;
  color: var(--ai-text) !important;
  border-radius: 8px !important;
}
.ant-btn-default:hover {
  background: var(--ai-surface-soft) !important;
  border-color: rgba(var(--ai-accent-rgb), 0.4) !important;
  color: var(--ai-primary) !important;
}
.ant-btn-primary {
  border: none !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, var(--ai-primary), var(--ai-primary-strong)) !important;
  box-shadow: 0 8px 22px rgba(var(--ai-accent-rgb), 0.22) !important;
}
/* 交互态必须单独覆盖：antd 内部默认主色仍是蓝色，
   只写默认态的话，按钮一点击/聚焦就会露出刺眼的蓝 */
.ant-btn-primary:hover,
.ant-btn-primary:focus,
.ant-btn-primary:focus-visible {
  background: linear-gradient(135deg, #d4824b, var(--ai-primary-strong)) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 12px 30px rgba(var(--ai-accent-rgb), 0.3) !important;
}
.ant-btn-primary:active {
  background: var(--ai-primary-strong) !important;
  transform: translateY(1px) !important;
  box-shadow: 0 3px 8px rgba(var(--ai-accent-rgb), 0.26) !important;
}
.ant-btn-primary:disabled,
.ant-btn-primary[disabled]:hover {
  background: #ddcdaa !important;
  color: #fffdf7 !important;
  box-shadow: none !important;
  transform: none !important;
}
/* 去掉 antd 默认的蓝色聚焦环 */
.ant-btn:focus-visible {
  outline: none !important;
}
.ant-btn-link {
  color: var(--ai-primary) !important;
}
.ant-btn-link:hover {
  color: var(--ai-primary-strong) !important;
}
.ant-btn-text {
  color: var(--ai-title) !important;
}
.ant-btn-text:hover {
  background: rgba(var(--ai-ink-rgb), 0.05) !important;
}
.ant-btn-background-ghost {
  color: var(--ai-title) !important;
  border-color: rgba(var(--ai-ink-rgb), 0.25) !important;
  background: transparent !important;
}
.ant-btn-background-ghost:hover {
  border-color: var(--ai-primary) !important;
  color: var(--ai-primary) !important;
  background: rgba(var(--ai-accent-rgb), 0.06) !important;
}

/* Tag */
.ant-tag {
  border-color: var(--ai-glass-border) !important;
  border-radius: 6px !important;
}

/* Select */
.ant-select:not(.ant-select-customize-input) .ant-select-selector {
  background: var(--ai-surface) !important;
  border-color: var(--ai-glass-border) !important;
  color: var(--ai-title) !important;
  border-radius: 8px !important;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.ant-select:hover .ant-select-selector {
  border-color: rgba(var(--ai-accent-rgb), 0.35) !important;
}
.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
  border-color: rgba(var(--ai-accent-rgb), 0.5) !important;
  box-shadow: 0 0 0 3px rgba(var(--ai-accent-rgb), 0.1) !important;
}
.ant-select-selection-placeholder,
.ant-select-arrow,
.ant-select-clear {
  color: var(--ai-muted) !important;
}
.ant-select-clear {
  background: var(--ai-surface) !important;
}

/* Select dropdown popup */
.ant-select-dropdown {
  background: var(--ai-glass-strong) !important;
  border: 1px solid var(--ai-glass-border) !important;
  border-radius: 10px !important;
  padding: 4px !important;
  backdrop-filter: blur(28px);
  box-shadow: var(--ai-shadow) !important;
}
.ant-select-item {
  color: var(--ai-text) !important;
  border-radius: 6px !important;
}
.ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background: rgba(var(--ai-ink-rgb), 0.05) !important;
  color: var(--ai-title) !important;
}
.ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background: rgba(var(--ai-accent-rgb), 0.1) !important;
  color: var(--ai-primary) !important;
  font-weight: 500;
}
.ant-select-item-option-selected:not(.ant-select-item-option-disabled) .ant-select-item-option-state {
  color: var(--ai-primary) !important;
}

/* Form */
.ant-form-item-label > label {
  color: var(--ai-title) !important;
}

/* Pagination */
.ant-pagination-item {
  background: var(--ai-surface) !important;
  border-color: var(--ai-glass-border) !important;
  border-radius: 8px !important;
}
.ant-pagination-item a {
  color: var(--ai-text) !important;
}
.ant-pagination-item-active {
  border-color: rgba(var(--ai-accent-rgb), 0.4) !important;
  background: rgba(var(--ai-accent-rgb), 0.08) !important;
}
.ant-pagination-item-active a {
  color: var(--ai-primary) !important;
  font-weight: 500;
}
.ant-pagination-prev .ant-pagination-item-link,
.ant-pagination-next .ant-pagination-item-link {
  background: var(--ai-surface) !important;
  border-color: var(--ai-glass-border) !important;
  color: var(--ai-text) !important;
  border-radius: 8px !important;
}
.ant-pagination-prev:hover .ant-pagination-item-link,
.ant-pagination-next:hover .ant-pagination-item-link {
  border-color: rgba(var(--ai-accent-rgb), 0.4) !important;
  color: var(--ai-primary) !important;
}
.ant-pagination-total-text {
  color: var(--ai-text) !important;
}

/* 分页全元素最强保险：强制可见 + 显式颜色/背景/边框 */
.ant-pagination-item,
.ant-pagination-prev,
.ant-pagination-next,
.ant-pagination-options,
.ant-pagination-total-text,
.ant-pagination-simple-pager {
  min-width: 32px !important;
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 1 !important;
  visibility: visible !important;
  color: var(--ai-title) !important;
  background: var(--ai-surface) !important;
  border: 1px solid var(--ai-border) !important;
  border-radius: 8px !important;
  padding: 0 6px !important;
  cursor: pointer;
}
.ant-pagination-item a,
.ant-pagination-prev .ant-pagination-item-link,
.ant-pagination-next .ant-pagination-item-link,
.ant-pagination-simple-pager input {
  color: var(--ai-title) !important;
  opacity: 1 !important;
  visibility: visible !important;
  background: transparent !important;
  border: none !important;
}
.ant-pagination-item-active,
.ant-pagination-item-active a {
  background: rgba(var(--ai-accent-rgb), 0.12) !important;
  color: var(--ai-primary) !important;
  font-weight: 600 !important;
  border-color: rgba(var(--ai-accent-rgb), 0.4) !important;
}

/* Modal */
.ant-modal-content {
  background: var(--ai-glass-strong) !important;
  border: 1px solid var(--ai-glass-border) !important;
  border-radius: 14px !important;
  backdrop-filter: blur(28px);
  box-shadow: var(--ai-shadow) !important;
}
.ant-modal-header {
  background: transparent !important;
  border-bottom-color: var(--ai-border-soft) !important;
}
.ant-modal-title {
  color: var(--ai-title) !important;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.ant-modal-close {
  color: var(--ai-muted) !important;
}
.ant-modal-body {
  color: var(--ai-text) !important;
}
.ant-modal-footer {
  border-top-color: var(--ai-border-soft) !important;
}

/* Alert */
.ant-alert {
  border-radius: 8px !important;
  background: rgba(var(--ai-accent-rgb), 0.06) !important;
  border: 1px solid rgba(var(--ai-accent-rgb), 0.18) !important;
}
.ant-alert-message {
  color: var(--ai-title) !important;
}

/* Divider */
.ant-divider {
  border-color: var(--ai-border-soft) !important;
}

/* Avatar */
.ant-avatar {
  border: none !important;
}

/* Message */
.ant-message-notice-content {
  background: rgba(255, 255, 255, 0.92) !important;
  border: 1px solid var(--ai-glass-border) !important;
  border-radius: 10px !important;
  backdrop-filter: blur(28px) !important;
  box-shadow: var(--ai-shadow) !important;
  color: var(--ai-title) !important;
  padding: 12px 20px !important;
}
.ant-message .anticon {
  color: var(--ai-primary) !important;
}
.ant-message .ant-message-success .anticon {
  color: #16a34a !important;
}
.ant-message .ant-message-error .anticon {
  color: #e5484d !important;
}
.ant-message .ant-message-warning .anticon {
  color: #d97706 !important;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(var(--ai-ink-rgb), 0.12);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--ai-ink-rgb), 0.2);
}

/* Preview iframe */
iframe.preview-iframe {
  background: #ffffff !important;
}

/* Popover */
.ant-popover-inner {
  background: var(--ai-glass-strong) !important;
  border: 1px solid var(--ai-glass-border) !important;
  border-radius: 12px !important;
  box-shadow: var(--ai-shadow) !important;
}
.ant-popover-arrow-content {
  background: var(--ai-glass-strong) !important;
}
.ant-popover-arrow-content::before {
  background: var(--ai-glass-strong) !important;
}

/* Popconfirm - 确认弹窗 */
.ant-popconfirm .ant-popconfirm-message-title {
  color: var(--ai-title) !important;
}
.ant-popconfirm .ant-popconfirm-description {
  color: var(--ai-text) !important;
}
.ant-popconfirm .ant-btn {
  color: var(--ai-text) !important;
}
.ant-popconfirm .ant-btn-primary {
  color: #fff !important;
}
</style>
