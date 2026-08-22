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
    component: () => import('@/views/auth/Login.vue'),
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
      {
        path: '/dashboard/workplace',
        name: 'DashboardWorkplace',
        component: () => import('@/views/dashboard/Workplace.vue'),
        meta: { title: '工作台' },
      },
      {
        path: '/form/basic-form',
        name: 'BasicForm',
        component: () => import('@/views/form/BasicForm.vue'),
        meta: { title: '基础表单' },
      },
      {
        path: '/form/step-form',
        name: 'StepForm',
        component: () => import('@/views/form/stepForm/StepForm.vue'),
        meta: { title: '分步表单' },
      },
      {
        path: '/form/advanced-form',
        name: 'AdvancedForm',
        component: () => import('@/views/form/advancedForm/AdvancedForm.vue'),
        meta: { title: '高级表单' },
      },
      {
        path: '/profile/basic',
        name: 'ProfileBasic',
        component: () => import('@/views/profile/ProfileBasic.vue'),
        meta: { title: '基本设置' },
      },
      {
        path: '/profile/advanced',
        name: 'ProfileAdvanced',
        component: () => import('@/views/profile/ProfileAdvanced.vue'),
        meta: { title: '个人中心' },
      },
      {
        path: '/dashboard/monitor',
        name: 'DashboardMonitor',
        component: () => import('@/views/dashboard/Monitor.vue'),
        meta: { title: '监控页' },
      },
      {
        path: '/list/basic',
        name: 'BasicList',
        component: () => import('@/views/list/BasicList.vue'),
        meta: { title: '基础列表' },
      },
      {
        path: '/list/search',
        name: 'SearchList',
        component: () => import('@/views/list/SearchList.vue'),
        meta: { title: '搜索列表' },
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
