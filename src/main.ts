import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/styles/themes.css'
import '@/styles/desktop.css'

import '@/access'

import { initTheme } from '@/utils/theme'

// 主题要在挂载前定好，避免首屏闪一下默认配色再跳转
initTheme()

// 桌面壳里预加载脚本会注入 window.desktop。
// 打个标记让 CSS 能区分"壳"和"浏览器"——隐藏原生标题栏后，
// 顶栏需要额外留出窗口按钮的位置，并且要能拖动窗口。
if (typeof window !== 'undefined' && window.desktop?.isDesktop) {
  document.documentElement.classList.add('is-desktop')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')
