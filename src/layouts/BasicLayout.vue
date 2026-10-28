<template>
  <div class="app-shell">
    <AppSidebar v-if="showSidebar" />
    <div class="main-column">
      <!-- 桌面端窗口条：只占右列，让 Aside 能顶到窗口最上方。
           承载窗口拖动，同时把右上角让给最小化/最大化/关闭。
           浏览器里不渲染（display:none），网页端布局不受影响。 -->
      <div class="window-bar" aria-hidden="true"></div>
      <main class="app-main">
        <!--
          key 必须带 path：/app/chat/1 → /app/chat/2 命中同一个路由记录，
          Vue Router 会复用组件实例 —— onMounted 只跑一次，
          页面数据还是上一个应用的，表现就是"点了侧栏没反应"。
          用 path 作 key 后，换应用等于换实例，消息、预览 iframe、
          生成状态都跟着重建；同一页面只变 query 时不会误重建。
        -->
        <router-view v-slot="{ Component, route: viewRoute }">
          <component :is="Component" :key="viewRoute.path" />
        </router-view>
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
