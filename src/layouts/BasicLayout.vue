<template>
  <div class="app-shell">
    <AppSidebar v-if="showSidebar" />
    <div class="main-column">
      <!-- 桌面端窗口条：只占右列，让 Aside 能顶到窗口最上方。
           承载窗口拖动，同时把右上角让给最小化/最大化/关闭。
           浏览器里不渲染（display:none），网页端布局不受影响。 -->
      <div class="window-bar" aria-hidden="true"></div>
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'

const route = useRoute()

// 登录/注册是纯入口页，不该出现侧栏
const showSidebar = computed(() => route.meta.bare !== true)
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.window-bar {
  display: none;
  flex-shrink: 0;
  height: 48px;
}

.app-main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
