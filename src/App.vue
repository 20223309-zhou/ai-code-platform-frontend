<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
</script>

<template>
  <BasicLayout />
</template>

<style>
:root {
  --ai-primary: #4361ee;
  --ai-primary-deep: #3a0ca3;
  --ai-accent: #00f5d4;
  --ai-bg: #f8fafc;
  --ai-surface: #ffffff;
  --ai-title: #1e293b;
  --ai-text: #64748b;
  --ai-muted: #94a3b8;
  --ai-border: #e2e8f0;
  --ai-card-radius: 16px;
  --ai-control-radius: 12px;
  --ai-shadow: 0 4px 12px rgba(67, 97, 238, 0.06);
  --ai-shadow-hover: 0 8px 24px rgba(67, 97, 238, 0.1);
  --ai-transition: all 0.3s ease-in-out;
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
  font-family:
    'Inter', 'PingFang SC', 'HarmonyOS Sans SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
  background: var(--ai-bg);
  color: var(--ai-text);
  line-height: 1.6;
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
  transition: var(--ai-transition);
}

button,
input,
textarea,
.ant-btn,
.ant-input,
.ant-input-affix-wrapper,
.ant-pagination-item,
.ant-card,
.ant-tag {
  transition: var(--ai-transition);
}

::selection {
  background: rgba(67, 97, 238, 0.15);
  color: var(--ai-title);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-ring {
  from {
    opacity: 0.65;
    transform: scale(0.85);
  }
  to {
    opacity: 0;
    transform: scale(1.7);
  }
}

@keyframes spin-ring {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .ant-spin-dot,
  .ant-spin-dot-spin,
  .ant-spin-dot-holder,
  .anticon-loading,
  .ant-btn-loading-icon .anticon {
    animation-duration: 0.9s !important;
    animation-iteration-count: infinite !important;
    animation-timing-function: linear !important;
  }
}
</style>
