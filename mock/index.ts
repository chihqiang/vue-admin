/**
 * Mock 入口
 *
 * 约定：
 *   - 仅开发环境加载，生产构建通过 tree-shaking 移除
 *   - 开发环境菜单路由直接读本地 routes.ts，不走 mock 接口
 *   - mock 只拦截 auth（登录/注册）和 user/info（用户信息）等接口
 *
 * axios 的 baseURL 是 '/api'，mock 用正则匹配路径（不含 baseURL）。
 */
import Mock from 'mockjs'

export async function setupMock() {
  await import('./services/auth')
  await import('./services/user')
  await import('./services/workplace')
  await import('./services/menu')

  Mock.setup({
    timeout: '300-900',
  })

  console.log('%c[mock] mounted', 'color:#1677ff;font-weight:bold;')
}
