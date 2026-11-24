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
          <!--
            只缓存对话页（include 按组件名匹配）：
            用户在生成过程中切到别的页面时，对话页不会被销毁，fetch 的流继续读、
            消息继续累积，切回来直接看到最新内容。不缓存其它页面，避免无谓占内存。
            max=8 是"同时记住几个作品"，超出时最久未访问的被销毁。
            别调小：上限太小会让用户连续开几个作品时相互挤掉。
          -->
          <keep-alive :include="['AppChatPage']" :max="8">
            <component :is="Component" :key="viewRoute.path" />
          </keep-alive>
        </router-view>
      </main>
    </div>

    <!-- 进站公告：登录/注册页（bare）不弹，避免打断进入流程 -->
    <AnnouncementModal v-if="showSidebar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AnnouncementModal from '@/components/AnnouncementModal.vue'

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
