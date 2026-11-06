<template>
  <aside class="app-aside">
    <!-- 品牌区：桌面端这一条同时是窗口拖动区域 -->
    <div class="aside-brand">
      <img class="brand-logo" src="@/assets/logo-mark-square.png" alt="iCodeAI" />
      <span class="brand-name">iCodeAI</span>
    </div>

    <div class="aside-body">
      <!-- 主操作 -->
      <button type="button" class="create-entry" @click="goCreate">
        <PlusOutlined />
        <span>新建应用</span>
      </button>

      <!-- 主导航 -->
      <nav class="aside-group">
        <RouterLink
          v-for="item in primaryNav"
          :key="item.path"
          :to="item.path"
          class="nav-row"
          :class="{ 'is-active': isActive(item.path) }"
        >
          <component :is="item.icon" class="row-icon" />
          <span class="row-label">{{ item.label }}</span>
        </RouterLink>
        <a class="nav-row" @click="openGithub">
          <GithubOutlined class="row-icon" />
          <span class="row-label">GitHub</span>
        </a>
        <!-- 公告常驻入口：进站弹窗只弹最新一条未读，关掉就看不到了 -->
        <a class="nav-row" @click="announcementOpen = true">
          <BellOutlined class="row-icon" />
          <span class="row-label">公告</span>
          <span v-if="unreadCount > 0" class="unread-badge">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </a>
        <RouterLink
          to="/point"
          class="nav-row"
          :class="{ 'is-active': isActive('/point') }"
        >
          <TrophyOutlined class="row-icon" />
          <span class="row-label">签到积分</span>
        </RouterLink>
        <RouterLink
          to="/themes"
          class="nav-row"
          :class="{ 'is-active': isActive('/themes') }"
        >
          <BgColorsOutlined class="row-icon" />
          <span class="row-label">主题风格</span>
        </RouterLink>
      </nav>

      <!-- 我的作品 -->
      <section v-if="isLoggedIn" class="aside-group">
        <header class="group-head">
          <span>我的作品</span>
          <span class="group-count">{{ myAppTotal }}</span>
        </header>
        <div class="app-list">
          <!--
            右键「在新窗口打开」：桌面端才有意义（浏览器里开新窗口就是新标签页，
            而且照样会打断当前页面的生成）。独立窗口 = 独立渲染进程 = 独立 SSE 连接，
            两个作品可以同时生成互不影响。
          -->
          <a-dropdown
            v-for="app in myApps"
            :key="app.id"
            :trigger="['contextmenu']"
            :disabled="!isDesktop"
            placement="bottomLeft"
          >
            <template #overlay>
              <a-menu @click="onAppMenuClick(String($event.key), app)">
                <a-menu-item key="open-window">在新窗口打开</a-menu-item>
              </a-menu>
            </template>
            <RouterLink
              :to="`/app/chat/${app.id}`"
              class="nav-row app-row"
              :class="{ 'is-active': isAppActive(app.id) }"
            >
              <span class="app-dot" />
              <span class="row-label app-label">{{ app.appName || '未命名应用' }}</span>
            </RouterLink>
          </a-dropdown>
          <p v-if="myApps.length === 0" class="group-empty">还没有作品，从「新建应用」开始</p>
        </div>
      </section>

      <!-- 管理后台 -->
      <section v-if="isAdmin" class="aside-group">
        <header class="group-head">
          <span>管理后台</span>
        </header>
        <RouterLink
          v-for="item in adminNav"
          :key="item.path"
          :to="item.path"
          class="nav-row"
          :class="{ 'is-active': isActive(item.path) }"
        >
          <component :is="item.icon" class="row-icon" />
          <span class="row-label">{{ item.label }}</span>
        </RouterLink>
      </section>
    </div>

    <!-- 主题切换：放在账户区上方，颜色小圆点直接显示目标主题的主色 -->
    <div class="theme-switch">
      <span class="theme-label">主题</span>
      <div class="theme-dots">
        <button
          v-for="item in THEMES"
          :key="item.id"
          type="button"
          class="theme-dot"
          :class="{ 'is-active': currentTheme === item.id }"
          :style="{ background: item.swatch }"
          :title="item.label"
          :aria-label="`切换到${item.label}主题`"
          @click="changeTheme(item.id)"
        />
      </div>
    </div>

    <!-- 账户区：固定在底部，像桌面应用而不是网页右上角 -->
    <div class="aside-foot">
      <a-dropdown v-if="isLoggedIn" placement="topRight" :trigger="['click']">
        <button type="button" class="account-trigger">
          <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="28" />
          <span class="account-meta">
            <span class="account-name">{{ loginUserStore.loginUser.userName || '无名' }}</span>
            <span class="account-sub">
              剩余 {{ quota }} 次
              <em v-if="vipLevel > 0" class="vip-badge">V{{ vipLevel }}</em>
            </span>
          </span>
          <MoreOutlined class="account-more" />
        </button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile" @click="router.push('/user/profile')">
              <UserOutlined />
              个人信息
            </a-menu-item>
            <a-menu-item key="logout" @click="doLogout">
              <LogoutOutlined />
              退出登录
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-button v-else block @click="router.push('/user/login')">登录</a-button>
    </div>

    <!-- 公告列表（a-modal 会 teleport 到 body，放这里只是就近管理状态） -->
    <AnnouncementCenter v-model:open="announcementOpen" />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { userLogout } from '@/api/userController'
import { listMyAppVoByPage } from '@/api/appController'
import AnnouncementCenter from '@/components/AnnouncementCenter.vue'
import { useAnnouncementFeed } from '@/utils/announcementFeed'
import { useReadIds } from '@/utils/announcementRead'
import { THEMES, applyTheme, currentThemeId } from '@/utils/theme'
import {
  PlusOutlined,
  HomeOutlined,
  BlockOutlined,
  GithubOutlined,
  TeamOutlined,
  AppstoreOutlined,
  MessageOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MoreOutlined,
  NotificationOutlined,
  BellOutlined,
  TrophyOutlined,
  BgColorsOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 公告：数据源与已读状态都是共享单例，和进站弹窗看到的是同一份
const { list: announcements, ensureLoaded } = useAnnouncementFeed()
const readIds = useReadIds()
const announcementOpen = ref(false)
const unreadCount = computed(
  () => announcements.value.filter((item) => !readIds.value.has(String(item.id))).length,
)

const isLoggedIn = computed(() => Boolean(loginUserStore.loginUser.id))
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 'admin')
const quota = computed(() => loginUserStore.loginUser.quota ?? 0)
const vipLevel = computed(() => loginUserStore.loginUser.vipLevel ?? 0)

const primaryNav = [
  { path: '/', label: '主页', icon: HomeOutlined },
  { path: '/templates', label: '模板广场', icon: BlockOutlined },
]

// 之前 /admin/chatManage 有路由、有页面，但导航里漏了，只能手输 URL 才能进
const adminNav = [
  { path: '/admin/userManage', label: '用户管理', icon: TeamOutlined },
  { path: '/admin/appManage', label: '应用管理', icon: AppstoreOutlined },
  { path: '/admin/chatManage', label: '对话管理', icon: MessageOutlined },
  { path: '/admin/logManage', label: '日志管理', icon: OrderedListOutlined },
  { path: '/admin/announcement', label: '公告管理', icon: NotificationOutlined },
  { path: '/admin/statistics', label: '数据统计', icon: BarChartOutlined },
]

const isActive = (path: string) => route.path === path

const isAppActive = (appId?: string | number) =>
  Boolean(appId) && route.path === `/app/chat/${appId}`

// ---------------------------------------------------------------- 主题

const currentTheme = currentThemeId

const changeTheme = (id: string) => {
  applyTheme(id)
  currentTheme.value = id
}

const goCreate = () => {
  router.push('/')
}

const openGithub = () => {
  window.open('https://github.com/20223309-zhou/ai-code-platform-backend', '_blank')
}

// ---------------------------------------------------------------- 我的作品

const myApps = ref<API.AppVO[]>([])
const myAppTotal = ref(0)

// 桌面壳通过 preload 注入 window.desktop；浏览器里没有这个对象
const desktopApi = (window as any).desktop as
  | { isDesktop?: boolean; openAppWindow?: (id: string | number, name: string) => Promise<boolean> }
  | undefined
const isDesktop = Boolean(desktopApi?.isDesktop)

/** 在独立窗口打开某个作品：两个窗口各自持有 SSE 连接，可以并行生成 */
const onAppMenuClick = (key: string, app: API.AppVO) => {
  if (key !== 'open-window') {
    return
  }
  const openAppWindow = desktopApi?.openAppWindow
  if (!openAppWindow || app.id === undefined) {
    message.warning('当前环境不支持独立窗口')
    return
  }
  openAppWindow(app.id, app.appName || '').catch((error) => {
    console.warn('打开独立窗口失败：', error)
    message.error('打开独立窗口失败')
  })
}

const loadMyApps = async () => {
  if (!loginUserStore.loginUser.id) {
    myApps.value = []
    myAppTotal.value = 0
    return
  }
  try {
    const res = await listMyAppVoByPage({
      pageNum: 1,
      pageSize: 8,
      sortField: 'createTime',
      sortOrder: 'desc',
    })
    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppTotal.value = res.data.data.totalRow || 0
    }
  } catch (error) {
    // 侧栏是辅助信息，加载失败不该打断主流程
    console.warn('侧栏加载我的作品失败：', error)
  }
}

// 每次切页都刷一次：新建应用后会跳到 /app/chat/{id}，列表要能看到新的那一条
watch(() => route.path, loadMyApps)
watch(() => loginUserStore.loginUser.id, loadMyApps)

onMounted(() => {
  loadMyApps()
  // 公告数据也用于侧栏未读红点；与进站弹窗共用同一份缓存，不会重复请求
  ensureLoaded()
})

// ---------------------------------------------------------------- 账户

const doLogout = async () => {
  const res = await userLogout()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({ userName: '未登录' })
    message.success('退出登录成功', 1)
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
.app-aside {
  width: 240px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 实色：半透明会让背景装饰透到账户区，读不清。
     桌面应用的侧栏本就该有实体感，靠右侧描边与主区分隔。 */
  background: var(--ai-surface);
  border-right: 1px solid var(--ai-border-soft);
}

/* 品牌区：高度与右列的 .window-bar 对齐，整条都是窗口拖动区，
   所以这里不能放可点击元素 */
.aside-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 16px;
  flex-shrink: 0;
}

.brand-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.brand-name {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: var(--ai-title);
}

.aside-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 12px 12px;
}

/* 主操作 */
.create-entry {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  margin-bottom: 14px;
  border: 1px solid rgba(var(--ai-accent-rgb), 0.3);
  border-radius: 10px;
  background: var(--ai-chip-bg);
  color: var(--ai-primary-strong);
  font-size: 13.5px;
  cursor: pointer;
  transition: background-color 0.16s, border-color 0.16s;
}

.create-entry:hover {
  background: var(--ai-chip-bg-hover);
  border-color: rgba(var(--ai-accent-rgb), 0.5);
}

/* 分组 */
.aside-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 14px;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  font-size: 11.5px;
  letter-spacing: 0.4px;
  color: var(--ai-muted);
}

.group-count {
  color: var(--ai-muted);
  opacity: 0.75;
}

.group-empty {
  margin: 2px 10px 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-muted);
}

/* 行 */
.nav-row {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  color: var(--ai-text);
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.14s, color 0.14s;
}

.nav-row:hover {
  background: rgba(var(--ai-ink-rgb), 0.08);
  color: var(--ai-title);
}

.nav-row.is-active {
  background: var(--ai-chip-bg);
  color: var(--ai-primary-strong);
}

.row-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* 未读公告数：贴右侧，小到不打扰但一眼能看到 */
.unread-badge {
  margin-left: auto;
  flex: none;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #d9534f;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
}

.row-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-row {
  height: 32px;
}

.app-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(var(--ai-ink-rgb), 0.26);
}

.nav-row.is-active .app-dot {
  background: var(--ai-primary);
}

.app-label {
  font-size: 12.5px;
}

/* 主题切换 */
.theme-switch {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 22px 8px;
}

.theme-label {
  font-size: 11.5px;
  letter-spacing: 0.4px;
  color: var(--ai-muted);
}

.theme-dots {
  display: flex;
  align-items: center;
  gap: 7px;
}

.theme-dot {
  width: 14px;
  height: 14px;
  padding: 0;
  border: 1px solid rgba(var(--ai-ink-rgb), 0.25);
  border-radius: 50%;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.theme-dot:hover {
  transform: scale(1.18);
}

.theme-dot.is-active {
  transform: scale(1.1);
  box-shadow:
    0 0 0 2px var(--ai-surface),
    0 0 0 3.5px rgba(var(--ai-ink-rgb), 0.55);
}

/* 账户区 */
.aside-foot {
  flex-shrink: 0;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--ai-border-soft);
}

.account-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.14s;
}

.account-trigger:hover {
  background: rgba(var(--ai-ink-rgb), 0.08);
}

.account-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.account-name {
  font-size: 13px;
  color: var(--ai-title);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-sub {
  font-size: 11.5px;
  color: var(--ai-muted);
}

.vip-badge {
  margin-left: 4px;
  padding: 0 4px;
  font-style: normal;
  border-radius: 4px;
  background: rgba(232, 180, 140, 0.28);
  color: var(--ai-primary-strong);
}

.account-more {
  font-size: 13px;
  color: var(--ai-muted);
  flex-shrink: 0;
}

</style>
