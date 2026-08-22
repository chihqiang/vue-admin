/**
 * Mock 入口
 * 约定：
 * - 非 production 环境默认启动 mock
 * - 生产构建不会打包这段（基于 import.meta.env.DEV 的 tree-shaking）
 *
 * 注意：
 * axios 的 baseURL 统一是 '/api'，mock 匹配时正则匹配路径（不包含 baseURL），
 * 所以注册的 mock 规则直接写 /auth/login、/user/info 这种路径即可。
 *
 * 使用 async 函数 + await 确保所有 mock 规则同步注册完成，
 * main.ts 中的 await import('../mock') 会等待此函数完成，
 * 否则路由守卫首次触发 fetchMenus 时 mock 可能还没注册。
 */
import Mock from 'mockjs'

export async function setupMock() {
  // 按顺序引入各业务 mock 模块（每个模块内部会调用 Mock.mock 注册）
  await import('./services/auth')
  await import('./services/user')
  await import('./services/workplace')
  await import('./services/menu')

  // 全局设置：模拟网络 300~900ms 延迟，更贴近真实环境
  Mock.setup({
    timeout: '300-900',
  })

  console.log('%c[mock] mounted', 'color:#1677ff;font-weight:bold;')
}
