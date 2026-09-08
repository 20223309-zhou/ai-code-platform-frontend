<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
</script>

<template>
  <BasicLayout />
  <div class="bg-dynamic-global" aria-hidden="true"></div>
</template>

<style>
:root {
  /* 品牌色 —— 亮色下加深以保证白字按钮对比 */
  --ai-primary: #3d6bff;
  --ai-primary-strong: #2b4fe0;
  --ai-primary-glow: rgba(61, 107, 255, 0.18);
  --ai-accent: #22a0f0;
  --ai-accent-soft: #3fa9f5;
  /* 背景体系 —— 带冷蓝的浅底，避免纯白单调 */
  --ai-bg: #eef1f8;
  --ai-surface: #ffffff;
  --ai-surface-soft: #f4f6fc;
  --ai-card-bg: rgba(255, 255, 255, 0.92);
  --ai-glass: rgba(255, 255, 255, 0.78);
  --ai-glass-strong: rgba(255, 255, 255, 0.96);
  --ai-glass-border: rgba(28, 42, 96, 0.13);
  /* 文本三档（反相） */
  --ai-title: #141b2e;
  --ai-text: #3f4a60;
  --ai-muted: #8b93a6;
  /* 边框 / 遮罩 / 阴影 */
  --ai-border: rgba(28, 42, 96, 0.12);
  --ai-border-soft: rgba(28, 42, 96, 0.07);
  --ai-overlay: rgba(30, 41, 82, 0.35);
  --ai-chip-bg: rgba(28, 42, 96, 0.05);
  --ai-chip-bg-hover: rgba(61, 107, 255, 0.1);
  --ai-card-radius: 14px;
  --ai-control-radius: 10px;
  --ai-shadow: 0 18px 50px rgba(28, 44, 110, 0.18);
  --ai-shadow-hover: 0 22px 60px rgba(61, 107, 255, 0.26);
  --ai-transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
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

/* 亮色氛围底：渐变色相 + 细腻点阵纹理，让浅底有层次不显单调 */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 76% 46% at 8% -8%, rgba(110, 148, 255, 0.30), transparent 58%),
    radial-gradient(ellipse 70% 44% at 94% 110%, rgba(110, 205, 255, 0.28), transparent 58%),
    radial-gradient(ellipse 52% 38% at 72% 8%, rgba(190, 150, 255, 0.20), transparent 60%),
    radial-gradient(ellipse 60% 44% at 26% 114%, rgba(100, 230, 220, 0.20), transparent 58%),
    radial-gradient(ellipse 40% 30% at 45% 48%, rgba(140, 175, 255, 0.10), transparent 60%),
    linear-gradient(180deg, #f0f3fd 0%, #e7ecf9 55%, #eaf0fa 100%);
  background-size: 100% 100%, 130% 120%, 110% 110%, 120% 130%, 100% 100%, 100% 100%;
  animation: aurora-drift 80s ease-in-out infinite alternate;
}

/* 细腻点阵层：light 下提供可感知的纹理层次 */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(28, 42, 96, 0.085) 1px, transparent 1.6px);
  background-size: 22px 22px;
  mask-image: radial-gradient(ellipse 120% 100% at 50% 0%, #000 38%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 120% 100% at 50% 0%, #000 38%, transparent 90%);
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
  transition: var(--ai-transition);
}

button, input, textarea,
.ant-btn, .ant-input, .ant-input-affix-wrapper,
.ant-pagination-item, .ant-card, .ant-tag {
  transition: var(--ai-transition);
}

::selection {
  background: rgba(61, 107, 255, 0.18);
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
  0% { box-shadow: 0 0 0 0 rgba(61, 107, 255, 0); }
  50% { box-shadow: 0 0 28px 4px rgba(61, 107, 255, 0.15); }
  100% { box-shadow: 0 0 0 0 rgba(61, 107, 255, 0); }
}
@keyframes breathe-subtle {
  0% { box-shadow: inset 0 0 0 0 rgba(61, 107, 255, 0); }
  50% { box-shadow: inset 0 0 0 1px rgba(61, 107, 255, 0.06), 0 0 18px rgba(61, 107, 255, 0.04); }
  100% { box-shadow: inset 0 0 0 0 rgba(61, 107, 255, 0); }
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

.bg-dynamic-global {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.bg-dynamic-global::before,
.bg-dynamic-global::after {
  content: '';
  position: absolute;
  inset: -12%;
  filter: blur(36px);
  will-change: transform, opacity;
}

.bg-dynamic-global::before {
  background:
    linear-gradient(115deg, transparent 4%, rgba(110, 148, 255, 0.28) 22%, rgba(120, 205, 255, 0.34) 44%, rgba(168, 130, 255, 0.26) 62%, transparent 82%),
    radial-gradient(circle at 16% 22%, rgba(110, 148, 255, 0.3), transparent 32%),
    radial-gradient(circle at 86% 58%, rgba(120, 200, 255, 0.3), transparent 28%),
    radial-gradient(circle at 58% 10%, rgba(205, 165, 255, 0.22), transparent 22%);
  animation: light-curtain 12s ease-in-out infinite alternate;
}

.bg-dynamic-global::after {
  background:
    linear-gradient(70deg, transparent 6%, rgba(130, 210, 255, 0.2) 26%, rgba(110, 148, 255, 0.28) 50%, rgba(110, 235, 225, 0.2) 74%, transparent 88%),
    radial-gradient(circle at 76% 22%, rgba(110, 148, 255, 0.26), transparent 26%),
    radial-gradient(circle at 28% 84%, rgba(110, 225, 220, 0.26), transparent 28%);
  animation: light-curtain-alt 16s ease-in-out infinite alternate;
}

/* ===== 全局亮色覆盖 ===== */

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
  background: rgba(61, 107, 255, 0.04) !important;
}
.ant-table-thead > tr > th {
  background: rgba(28, 42, 96, 0.03) !important;
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
  background: rgba(28, 42, 96, 0.05) !important;
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
  border-color: rgba(61, 107, 255, 0.35) !important;
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
  border-color: rgba(61, 107, 255, 0.4) !important;
  color: var(--ai-primary) !important;
}
.ant-btn-primary {
  border: none !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #3d6bff, #2b4fe0) !important;
  box-shadow: 0 8px 22px rgba(61, 107, 255, 0.22) !important;
}
.ant-btn-primary:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 12px 30px rgba(61, 107, 255, 0.3) !important;
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
  background: rgba(28, 42, 96, 0.05) !important;
}
.ant-btn-background-ghost {
  color: var(--ai-title) !important;
  border-color: rgba(28, 42, 96, 0.25) !important;
  background: transparent !important;
}
.ant-btn-background-ghost:hover {
  border-color: var(--ai-primary) !important;
  color: var(--ai-primary) !important;
  background: rgba(61, 107, 255, 0.06) !important;
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
  border-color: rgba(61, 107, 255, 0.35) !important;
}
.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
  border-color: rgba(61, 107, 255, 0.5) !important;
  box-shadow: 0 0 0 3px rgba(61, 107, 255, 0.1) !important;
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
  background: rgba(28, 42, 96, 0.05) !important;
  color: var(--ai-title) !important;
}
.ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background: rgba(61, 107, 255, 0.1) !important;
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
  border-color: rgba(61, 107, 255, 0.4) !important;
  background: rgba(61, 107, 255, 0.08) !important;
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
  border-color: rgba(61, 107, 255, 0.4) !important;
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
  background: rgba(61, 107, 255, 0.12) !important;
  color: var(--ai-primary) !important;
  font-weight: 600 !important;
  border-color: rgba(61, 107, 255, 0.4) !important;
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
  background: rgba(61, 107, 255, 0.06) !important;
  border: 1px solid rgba(61, 107, 255, 0.18) !important;
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
  background: rgba(28, 42, 96, 0.12);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(28, 42, 96, 0.2);
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
