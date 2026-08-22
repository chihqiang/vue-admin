import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 将大体积第三方依赖拆分到独立 chunk，避免单个 vendor 包过大、提升首屏按需加载效率
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // ECharts 体积较大，单独分包
          if (id.includes('echarts') || id.includes('vue-echarts') || id.includes('zrender')) {
            return 'echarts'
          }
          // 图标库按需引入但仍较多，单独分包
          if (id.includes('@lucide')) {
            return 'lucide'
          }
          // Vue 核心生态（vue / vue-router / pinia）合并为 vue-vendor
          if (
            id.includes('/vue/') ||
            id.includes('/@vue/') ||
            id.includes('vue-router') ||
            id.includes('pinia')
          ) {
            return 'vue-vendor'
          }
          return undefined
        },
      },
    },
  },
})
