import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        //target: 'http://localhost:8082', //单体后端
        target: 'http://localhost:8100', //微服务gateway地址
        //target: 'http://192.168.100.100:8080', //微服务higress地址
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
