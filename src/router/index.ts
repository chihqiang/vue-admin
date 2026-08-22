import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由配置
 * 约定：所有文案都是中文，不做国际化
 * 结构：
 *   /login           → 独立登录页（无 Layout）
 *   /                → BasicLayout 嵌套布局
 *     /dashboard/analysis  → 分析页
 *     (后续新增页面挂到 Layout children 下)
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { title: '登录' },
  },
  {
    // 所有需要 Layout 的页面都挂在这个路由的 children 下
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard/analysis',
    children: [
      {
        path: '/dashboard/analysis',
        name: 'DashboardAnalysis',
        component: () => import('@/views/dashboard/Analysis.vue'),
        meta: { title: '分析页' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局路由守卫：统一设置页面标题（无需 i18n，全中文）
router.afterEach((to) => {
  const baseTitle = 'vue-tailwind-template'
  const pageTitle = (to.meta?.title as string) || ''
  document.title = pageTitle ? `${pageTitle} - ${baseTitle}` : baseTitle
})

export default router
