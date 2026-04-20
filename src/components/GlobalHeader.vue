<template>
  <a-layout-header class="header">
    <div class="header-inner">
      <RouterLink to="/" class="brand-link">
        <div class="header-left">
          <div class="logo-shell">
            <img class="logo" src="@/assets/logo.png" alt="Logo" />
          </div>
          <h1 class="site-title">iCodePlay AI应用生成平台</h1>
        </div>
      </RouterLink>

      <div class="nav-shell">
        <a-menu
          v-model:selectedKeys="selectedKeys"
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
              <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="36" />
              <span class="user-name">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
              <DownOutlined class="user-arrow" />
            </div>
            <template #overlay>
              <a-menu class="user-menu">
                <a-menu-item @click="doLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div v-else>
          <a-button type="primary" class="login-button" href="/user/login">登录</a-button>
        </div>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type MenuProps, message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { userLogout } from '@/api/userController.ts'
import {
  HomeOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  TeamOutlined,
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
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}
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
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--ai-border);
}

.header-inner {
  width: 100%;
  height: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
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
  gap: 12px;
}

.logo-shell {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.16), rgba(0, 245, 212, 0.1));
  box-shadow: inset 0 0 0 1px rgba(67, 97, 238, 0.12);
}

.logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.site-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ai-primary);
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
  gap: 8px;
}

:deep(.nav-menu .ant-menu-item) {
  top: 0;
  height: 40px;
  line-height: 40px;
  margin: 0 !important;
  padding: 0 16px !important;
  border-radius: 8px;
  color: var(--ai-text);
  font-weight: 500;
}

:deep(.nav-menu .ant-menu-item:hover) {
  color: var(--ai-primary-deep) !important;
  background: var(--ai-bg) !important;
}

:deep(.nav-menu .ant-menu-item-selected) {
  color: var(--ai-primary) !important;
  font-weight: 700;
  background: #f0f5ff !important;
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
  height: 44px;
  padding: 4px 12px 4px 6px;
  border-radius: 14px;
  border: 1px solid rgba(67, 97, 238, 0.22);
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.08), rgba(0, 245, 212, 0.06));
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.user-trigger :deep(.anticon) {
  display: inline-flex;
  align-items: center;
}

.user-trigger:hover {
  border-color: rgba(67, 97, 238, 0.38);
  box-shadow: 0 12px 24px rgba(67, 97, 238, 0.16);
  transform: translateY(-1px);
}

.user-trigger :deep(.ant-avatar) {
  border: 2px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 6px 14px rgba(67, 97, 238, 0.18);
}

.user-name {
  color: var(--ai-title);
  font-weight: 600;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  font-size: 12px;
  color: var(--ai-subtle);
}

.login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  line-height: 1;
  font-weight: 700;
  background: linear-gradient(135deg, var(--ai-primary), #5e7cff);
  box-shadow: 0 10px 24px rgba(67, 97, 238, 0.18);
}

.login-button:hover,
.login-button:focus {
  background: linear-gradient(135deg, var(--ai-primary-deep), var(--ai-primary)) !important;
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(58, 12, 163, 0.18);
}

@media (max-width: 768px) {
  .header {
    padding: 0 14px;
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
    font-size: 17px;
  }

  .user-name {
    display: none;
  }
}
</style>
