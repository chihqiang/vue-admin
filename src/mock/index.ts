/**
 * Mock 入口
 * 约定：
 * - 非 production 环境默认启动 mock
 * - 生产构建不会打包这段（基于 import.meta.env.DEV 的 tree-shaking，以及下方显示的 if 判断）
 *
 * 注意：
 * axios 的 baseURL 统一是 '/api'，mock 匹配时用正则匹配路径（不包含 baseURL），
 * 所以注册的 mock 规则直接写 /auth/login、/user/info 这种路径即可，不需要加 '/api'。
 */
import Mock from 'mockjs'

// 只在开发环境启用 mock；生产环境不加载这部分代码
if (import.meta.env.DEV) {
  // 按顺序引入各业务 mock 模块（每个模块内部会调用 Mock.mock 注册）
  import('./services/auth')
  import('./services/user')
  import('./services/workplace')

  // 全局设置：模拟网络 300~900ms 延迟，更贴近真实环境
  Mock.setup({
    timeout: '300-900',
  })

  // 简单做一个防抖的 log，避免热更新反复打印
  const FLAG = '__VUE_TAILWIND_MOCK_MOUNTED__' as const
  if (!(window as unknown as Record<string, boolean>)[FLAG]) {
    ;(window as unknown as Record<string, boolean>)[FLAG] = true
     
    console.log('%c[mock] mounted', 'color:#1677ff;font-weight:bold;')
  }
}
