<template>
  <a-layout-header class="header" :class="{ 'header--scrolled': isScrolled }">
    <div class="header-inner">
      <RouterLink to="/" class="brand-link">
        <div class="header-left">
          <div class="logo-shell">
            <img class="logo" src="@/assets/logo.png" alt="Logo" />
          </div>
          <h1 class="site-title">iCodeAI</h1>
        </div>
      </RouterLink>

      <div class="nav-shell">
        <a-menu
          :selectedKeys="selectedKeys"
          mode="horizontal"
          :items="menuItems"
          :disabledOverflow="true"
          class="nav-menu"
          @click="handleMenuClick"
        />
      </div>

      <div class="user-login-status">
        <div v-if="loginUserStore.loginUser.id">
          <a-dropdown>
            <div class="user-trigger">
              <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="30" />
              <span class="user-name">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
              <span v-if="vipLevel > 0" class="vip-badge">V{{ vipLevel }}</span>
              <DownOutlined class="user-arrow" />
            </div>
            <template #overlay>
              <a-menu class="user-menu">
                <a-menu-item disabled class="user-quota-item">
                  <span class="quota-text">
                    剩余额度：<br/> <strong>{{ quota }} 次</strong>
                  </span>
                </a-menu-item>
                <a-menu-item @click="router.push('/user/profile')">
                  <UserOutlined />
                  个人信息
                </a-menu-item>
                <a-menu-item @click="doLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div v-else>
          <a-button type="primary" class="login-button" @click="router.push('/user/login')">登录</a-button>
        </div>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, h, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type MenuProps, message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { userLogout } from '@/api/userController.ts'
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  AppstoreOutlined,
  GithubOutlined,
  BlockOutlined,
  TeamOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  DownOutlined,
} from '@ant-design/icons-vue'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const route = useRoute()

const selectedKeys = ref<string[]>([route.path])

watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
  },
  { immediate: true },
)

const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/templates',
    icon: () => h(BlockOutlined),
    label: '模板广场',
    title: '模板广场',
  },
  {
    key: '/admin/userManage',
    icon: () => h(TeamOutlined),
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/appManage',
    icon: () => h(AppstoreOutlined),
    label: '应用管理',
    title: '应用管理',
  },
  {
    key: '/admin/logManage',
    icon: () => h(OrderedListOutlined),
    label: '日志管理',
    title: '日志管理',
  },
  {
    key: '/admin/statistics',
    icon: () => h(BarChartOutlined),
    label: '数据统计',
    title: '数据统计',
  },
  {
    key: 'github',
    icon: () => h(GithubOutlined),
    label: 'GitHub',
    title: 'GitHub',
  }
]

const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    const menuKey = menu?.key as string
    if (menuKey?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

const menuItems = computed<MenuProps['items']>(() => filterMenus(originItems))

const handleMenuClick: MenuProps['onClick'] = (e) => {
  const key = e.key as string
  if (key === 'github') {
    window.open('https://github.com/20223309-zhou/ai-code-platform-backend', '_blank')
    return
  }
  selectedKeys.value = [key]
  if (key.startsWith('/')) {
    router.push(key)
  }
}

const doLogout = async () => {
  const res = await userLogout()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功', 1)
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}

const isScrolled = ref(false)

const vipLevel = computed(() => loginUserStore.loginUser.vipLevel ?? 0)
const quota = computed(() => loginUserStore.loginUser.quota ?? 0)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 60
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  line-height: normal;
  padding: 0 24px;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition:
    background 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    backdrop-filter 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.header--scrolled {
  background: rgba(14, 16, 24, 0.82);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.header-inner {
  width: 100%;
  height: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
}

.brand-link {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-shell {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ai-primary);
  background: rgba(79, 124, 255, 0.08);
  animation: breathe 3s ease-in-out infinite;
}

.logo {
  width: 22px;
  height: 22px;
  object-fit: contain;
  filter: brightness(1.3);
}

.site-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ai-title);
  white-space: nowrap;
}

.nav-shell {
  justify-self: center;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.nav-menu) {
  border-bottom: none !important;
  background: transparent;
  min-width: 0;
}

:deep(.nav-menu .ant-menu-overflow) {
  justify-content: center;
  gap: 2px;
}

:deep(.nav-menu .ant-menu-item) {
  top: 0;
  height: 34px;
  line-height: 34px;
  margin: 0 !important;
  padding: 0 12px !important;
  border-radius: 6px;
  color: var(--ai-muted);
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.02em;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

:deep(.nav-menu .ant-menu-item:hover) {
  color: var(--ai-title) !important;
  background: rgba(255, 255, 255, 0.04) !important;
}

:deep(.nav-menu .ant-menu-item-selected) {
  color: var(--ai-title) !important;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.04) !important;
}

:deep(.nav-menu .ant-menu-item::after) {
  display: none !important;
}

.user-login-status {
  justify-self: end;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: flex-end;
}

.user-login-status > div {
  display: inline-flex;
  align-items: center;
  height: 100%;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 3px 10px 3px 3px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.user-trigger:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.user-trigger :deep(.ant-avatar) {
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.user-name {
  color: var(--ai-title);
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.01em;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  font-size: 10px;
  color: var(--ai-muted);
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border-radius: 4px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a1a2e;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
}

.user-quota-item {
  cursor: default !important;
  opacity: 1 !important;
}
.user-quota-item:hover {
  background: transparent !important;
}
.quota-text {
  color: var(--ai-muted);
  font-size: 13px;
}
.quota-text strong {
  color: var(--ai-primary);
  font-weight: 600;
}

.login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  line-height: 1;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #4f7cff, #2d4fc7);
  box-shadow: 0 6px 20px rgba(79, 124, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.login-button:hover,
.login-button:focus {
  background: linear-gradient(135deg, #5f8cff, #3d5fd7) !important;
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(79, 124, 255, 0.3);
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .header-inner {
    grid-template-columns: 1fr auto;
    gap: 10px;
  }

  .nav-shell {
    grid-column: 1 / -1;
    justify-content: flex-start;
    overflow-x: auto;
  }

  :deep(.nav-menu .ant-menu-overflow) {
    justify-content: flex-start;
    flex-wrap: nowrap;
  }

  .site-title {
    font-size: 16px;
  }

  .user-name {
    display: none;
  }
}
</style>

