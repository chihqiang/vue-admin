import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

import { setToastHandler, type ToastHandler } from '@/utils/request'
import { alert, message } from '@/components'

// ========================================================================
// 启动流程：Mock 注册 → 创建 Vue 应用 → 注册 Pinia/Router → 注入 Toast Handler → mount
//
// 为什么 mock 要"先 await 再 mount"：
//   路由守卫会在应用启动后立刻触发（已登录场景首次进入需拉取 /user/info），
//   如果 mock 模块还没 finish resolve，Mock.mock 注册就还没生效，会导致
//   404。先用 await 动态 import 保证 mock 准备好了再 mount，接口就能正确拦截。
//
// 动态 import + VITE_USE_MOCK 配置带来的好处：
//   - 生产环境（import.meta.env.PROD === true）永远不会加载 mock 模块，
//     Mock.js 不会出现在最终 bundle 里。
//   - 开发环境里可通过 VITE_USE_MOCK=false 一键关掉 mock 走 Vite proxy。
// ========================================================================

async function bootstrap() {
  const useMockEnv = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'
  if (import.meta.env.DEV && useMockEnv) {
    // Mock 入口内部本身还有一层 if (import.meta.env.DEV)，这里做双重保险，
    // 保证 Rollup 能按条件静态分析并 tree-shake 掉 mock 模块。
    await import('./mock')
  }

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // 把 feedback 组件注入 request.ts（解除循环依赖风险）。
  // 注入时机：Pinia/Router 已注册，request 内部的 useUserStore()/router 都能正常取。
  const toastHandler: ToastHandler = {
    message: {
      warning: (content) => message.warning(content),
      error: (content) => message.error(content),
    },
    alert: {
      error: (config) => alert.error(config),
    },
  }
  setToastHandler(toastHandler)

  app.mount('#app')
}

void bootstrap()
