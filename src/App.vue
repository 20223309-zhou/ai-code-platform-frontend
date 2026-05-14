<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
</script>

<template>
  <BasicLayout />
  <div class="bg-dynamic-global" aria-hidden="true"></div>
</template>

<style>
:root {
  --ai-primary: #4f7cff;
  --ai-primary-glow: rgba(79, 124, 255, 0.28);
  --ai-accent: #7dd3fc;
  --ai-bg: #12141e;
  --ai-surface: #181a24;
  --ai-card-bg: rgba(21, 23, 32, 0.7);
  --ai-glass: rgba(255, 255, 255, 0.03);
  --ai-glass-border: rgba(255, 255, 255, 0.06);
  --ai-title: #e4e8f0;
  --ai-text: #929bab;
  --ai-muted: #525a68;
  --ai-border: rgba(255, 255, 255, 0.06);
  --ai-card-radius: 14px;
  --ai-control-radius: 10px;
  --ai-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  --ai-shadow-hover: 0 16px 56px rgba(79, 124, 255, 0.10);
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

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 35% at 15% 0%, rgba(79, 124, 255, 0.06), transparent),
    radial-gradient(ellipse 55% 30% at 85% 100%, rgba(125, 211, 252, 0.04), transparent),
    radial-gradient(ellipse 40% 25% at 50% 50%, rgba(79, 124, 255, 0.025), transparent);
  background-size: 100% 100%, 120% 120%, 100% 100%;
  animation: aurora-drift 90s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 0;
}

@keyframes aurora-drift {
  0% {
    background-position: 0% 0%, 0% 0%, 50% 50%;
    opacity: 0.6;
  }
  33% {
    background-position: 8% 4%, -10% 8%, 45% 48%;
    opacity: 1;
  }
  66% {
    background-position: -5% -3%, 12% -6%, 55% 52%;
    opacity: 0.7;
  }
  100% {
    background-position: 3% 2%, -5% 5%, 48% 51%;
    opacity: 0.9;
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
  background: rgba(79, 124, 255, 0.2);
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
  0% { box-shadow: 0 0 0 0 rgba(79, 124, 255, 0); }
  50% { box-shadow: 0 0 28px 4px rgba(79, 124, 255, 0.15); }
  100% { box-shadow: 0 0 0 0 rgba(79, 124, 255, 0); }
}
@keyframes breathe-subtle {
  0% { box-shadow: inset 0 0 0 0 rgba(79, 124, 255, 0); }
  50% { box-shadow: inset 0 0 0 1px rgba(79, 124, 255, 0.06), 0 0 18px rgba(79, 124, 255, 0.04); }
  100% { box-shadow: inset 0 0 0 0 rgba(79, 124, 255, 0); }
}

/* === 大面积背景光幕动画 === */
@keyframes light-curtain {
  0% {
    transform: translate3d(-18%, -6%, 0) rotate(-8deg) scale(1);
    opacity: 0.42;
  }
  50% {
    transform: translate3d(12%, 4%, 0) rotate(6deg) scale(1.08);
    opacity: 0.78;
  }
  100% {
    transform: translate3d(-10%, 10%, 0) rotate(-4deg) scale(0.98);
    opacity: 0.46;
  }
}

@keyframes light-curtain-alt {
  0% {
    transform: translate3d(10%, -8%, 0) rotate(10deg) scale(1.02);
    opacity: 0.2;
  }
  50% {
    transform: translate3d(-10%, 8%, 0) rotate(-8deg) scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: translate3d(8%, -2%, 0) rotate(6deg) scale(1);
    opacity: 0.24;
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
    linear-gradient(115deg, transparent 10%, rgba(79, 124, 255, 0.1) 28%, rgba(125, 211, 252, 0.18) 48%, rgba(79, 124, 255, 0.08) 68%, transparent 86%),
    radial-gradient(circle at 24% 32%, rgba(79, 124, 255, 0.16), transparent 28%),
    radial-gradient(circle at 78% 58%, rgba(125, 211, 252, 0.14), transparent 24%);
  animation: light-curtain 12s ease-in-out infinite alternate;
}

.bg-dynamic-global::after {
  background:
    linear-gradient(70deg, transparent 12%, rgba(125, 211, 252, 0.06) 30%, rgba(79, 124, 255, 0.14) 52%, rgba(125, 211, 252, 0.05) 74%, transparent 90%),
    radial-gradient(circle at 62% 22%, rgba(79, 124, 255, 0.12), transparent 22%),
    radial-gradient(circle at 38% 78%, rgba(125, 211, 252, 0.1), transparent 24%);
  animation: light-curtain-alt 16s ease-in-out infinite alternate;
}

/* ===== 全局晶体暗色覆盖 ===== */

/* Table */
.ant-table,
.ant-table-container,
.ant-table-thead > tr > th {
  background: transparent !important;
  color: var(--ai-title) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
}
.ant-table-tbody > tr > td {
  color: var(--ai-text) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  background: transparent !important;
}
.ant-table-tbody > tr:hover > td {
  background: rgba(255, 255, 255, 0.025) !important;
}
.ant-table-thead > tr > th {
  background: rgba(255, 255, 255, 0.02) !important;
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
  background: var(--ai-surface) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 10px !important;
  padding: 4px !important;
  backdrop-filter: blur(28px);
}
.ant-dropdown-menu-item {
  color: var(--ai-text) !important;
  border-radius: 6px !important;
  padding: 8px 12px !important;
}
.ant-dropdown-menu-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  color: var(--ai-title) !important;
}

/* Input */
.ant-input-affix-wrapper {
  border-color: rgba(255, 255, 255, 0.06) !important;
  background: rgba(255, 255, 255, 0.02) !important;
  color: var(--ai-title) !important;
}
.ant-input-affix-wrapper:hover,
.ant-input-affix-wrapper-focused {
  border-color: rgba(79, 124, 255, 0.25) !important;
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
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  color: var(--ai-title) !important;
  border-radius: 8px !important;
}
.ant-btn-default:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.ant-btn-primary {
  border: none !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #4f7cff, #2d4fc7) !important;
  box-shadow: 0 8px 24px rgba(79, 124, 255, 0.2) !important;
}
.ant-btn-primary:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 12px 32px rgba(79, 124, 255, 0.3) !important;
}
.ant-btn-link {
  color: var(--ai-text) !important;
}
.ant-btn-link:hover {
  color: var(--ai-primary) !important;
}
.ant-btn-text {
  color: var(--ai-title) !important;
}
.ant-btn-text:hover {
  background: rgba(255, 255, 255, 0.04) !important;
}
.ant-btn-background-ghost {
  color: var(--ai-title) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.ant-btn-background-ghost:hover {
  border-color: var(--ai-primary) !important;
  color: var(--ai-primary) !important;
}

/* Tag */
.ant-tag {
  border-color: rgba(255, 255, 255, 0.06) !important;
  border-radius: 6px !important;
}

/* Select */
.ant-select-selector {
  background: rgba(255, 255, 255, 0.02) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  color: var(--ai-title) !important;
  border-radius: 8px !important;
}
.ant-select-selection-placeholder,
.ant-select-arrow {
  color: var(--ai-muted) !important;
}

/* Form */
.ant-form-item-label > label {
  color: var(--ai-text) !important;
}

/* Pagination */
.ant-pagination-item {
  background: rgba(255, 255, 255, 0.02) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  border-radius: 8px !important;
}
.ant-pagination-item a {
  color: var(--ai-text) !important;
}
.ant-pagination-item-active {
  border-color: rgba(79, 124, 255, 0.25) !important;
  background: rgba(79, 124, 255, 0.08) !important;
}
.ant-pagination-item-active a {
  color: var(--ai-primary) !important;
  font-weight: 500;
}
.ant-pagination-prev .ant-pagination-item-link,
.ant-pagination-next .ant-pagination-item-link {
  background: rgba(255, 255, 255, 0.02) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  color: var(--ai-text) !important;
  border-radius: 8px !important;
}
.ant-pagination-prev:hover .ant-pagination-item-link,
.ant-pagination-next:hover .ant-pagination-item-link {
  border-color: rgba(79, 124, 255, 0.25) !important;
  color: var(--ai-primary) !important;
}
.ant-pagination-total-text {
  color: var(--ai-text) !important;
}

/* Modal */
.ant-modal-content {
  background: var(--ai-surface) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 14px !important;
  backdrop-filter: blur(28px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5) !important;
}
.ant-modal-header {
  background: transparent !important;
  border-bottom-color: rgba(255, 255, 255, 0.05) !important;
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
  border-top-color: rgba(255, 255, 255, 0.05) !important;
}

/* Alert */
.ant-alert {
  border-radius: 8px !important;
  background: rgba(79, 124, 255, 0.06) !important;
  border: 1px solid rgba(79, 124, 255, 0.12) !important;
}
.ant-alert-message {
  color: var(--ai-title) !important;
}

/* Divider */
.ant-divider {
  border-color: rgba(255, 255, 255, 0.05) !important;
}

/* Avatar */
.ant-avatar {
  border: none !important;
}

/* Message */
.ant-message-notice-content {
  background: rgba(21, 23, 32, 0.92) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 10px !important;
  backdrop-filter: blur(28px) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
  color: var(--ai-title) !important;
  padding: 12px 20px !important;
}
.ant-message .anticon {
  color: var(--ai-primary) !important;
}
.ant-message .ant-message-success .anticon {
  color: #34d399 !important;
}
.ant-message .ant-message-error .anticon {
  color: #f87171 !important;
}
.ant-message .ant-message-warning .anticon {
  color: #fbbf24 !important;
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
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* Preview iframe */
iframe.preview-iframe {
  background: #0e1018 !important;
}

/* Popover */
.ant-popover-inner {
  background: var(--ai-surface) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
}
.ant-popover-arrow-content {
  background: var(--ai-surface) !important;
}
.ant-popover-arrow-content::before {
  background: var(--ai-surface) !important;
}
</style>
