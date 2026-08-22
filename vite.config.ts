import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载当前 mode 的环境变量（开发时自动读取 .env.development + .env）
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || '/api'
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080'
  const useMock = String(env.VITE_USE_MOCK ?? 'true') === 'true'

  return {
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      // 给运行时代码一份拷贝，避免某些地方读不到 import.meta.env（SSR/自定义场景）
      __VITE_USE_MOCK__: JSON.stringify(useMock),
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      open: false,
      cors: true,
      // 仅当 VITE_USE_MOCK=false 时把 /api 转发到后端。
      // mock 模式下由 Mock.js 在浏览器端直接拦截 XHR，不走 proxy。
      proxy: useMock
        ? undefined
        : {
            [apiBaseUrl]: {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              // 如果后端本身没有 /api 前缀，可以在这里 rewrite：
              // rewrite: (path) => path.replace(new RegExp(`^${apiBaseUrl}`), ''),
            },
          },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
    build: {
      target: 'es2022',
      sourcemap: false,
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
  }
})
