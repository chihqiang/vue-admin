import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 路由 & 菜单元信息类型扩展
 * 路由就是菜单，菜单就是路由：所有菜单所需字段都放进 route.meta
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 页面/菜单标题（中文，无国际化） */
    title?: string
    /** lucide 图标组件名（仅一级菜单用，如 LayoutDashboard） */
    icon?: string
    /** 是否在侧边栏菜单中隐藏（如登录页、布局根） */
    hideInMenu?: boolean
    /** 是否在面包屑中隐藏 */
    hideInBreadcrumb?: boolean
    /** 是否需要登录才能访问 */
    requiresAuth?: boolean
    /** 权限标识（后续接权限时用） */
    permission?: string
  }
}

/**
 * 路由配置（= 菜单配置）
 * 约定：所有文案都是中文，不做国际化
 * 结构：
 *   /login           → 独立登录页（无 Layout，hideInMenu）
 *   /                → BasicLayout 嵌套布局（requiresAuth）
 *     /dashboard/*   → 仪表盘分组
 *     /form/*        → 表单页分组
 *     /list/*        → 列表页分组
 *     /profile/*     → 个人页分组
 *
 * 分组节点（如 /dashboard）无 component，只承担菜单层级 + redirect，
 * 访问分组根路径会自动跳到默认子页；侧边栏由此树形结构直接渲染。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false, hideInMenu: true },
  },
  {
    // 所有需要 Layout 的页面都挂在这个路由的 children 下
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard/analysis',
    // 父级声明 requiresAuth，子路由默认继承鉴权要求
    meta: { requiresAuth: true, hideInMenu: true },
    children: [
      // ============ 仪表盘 ============
      {
        path: '/dashboard',
        name: 'Dashboard',
        redirect: '/dashboard/analysis',
        meta: { title: '仪表盘', icon: 'LayoutDashboard' },
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
            path: '/dashboard/monitor',
            name: 'DashboardMonitor',
            component: () => import('@/views/dashboard/Monitor.vue'),
            meta: { title: '监控页' },
          },
        ],
      },
      // ============ 表单页 ============
      {
        path: '/form',
        name: 'Form',
        redirect: '/form/basic-form',
        meta: { title: '表单页', icon: 'FileText' },
        children: [
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
        ],
      },
      // ============ 列表页 ============
      {
        path: '/list',
        name: 'List',
        redirect: '/list/basic',
        meta: { title: '列表页', icon: 'Table' },
        children: [
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
      // ============ 个人页 ============
      {
        path: '/profile',
        name: 'Profile',
        redirect: '/profile/advanced',
        meta: { title: '个人页', icon: 'User' },
        children: [
          {
            path: '/profile/advanced',
            name: 'ProfileAdvanced',
            component: () => import('@/views/profile/ProfileAdvanced.vue'),
            meta: { title: '个人中心' },
          },
          {
            path: '/profile/basic',
            name: 'ProfileBasic',
            component: () => import('@/views/profile/ProfileBasic.vue'),
            meta: { title: '基本设置' },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * 全局前置守卫：登录鉴权
 * - meta.requiresAuth 为 true 的路由必须登录
 * - 未登录访问受保护页面 → 跳转 /login，并把原目标带在 redirect 上
 * - 已登录访问 /login → 直接进首页，避免重复登录
 *
 * 登录态判断统一走 useUserStore().isLogin（含过期校验），
 * 不在路由层直接读写 localStorage，token 由 store 统一管理
 */
router.beforeEach((to) => {
  // 父级 meta 会被 vue-router 合并到 matched 链上
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const isLogin = useUserStore().isLogin

  if (requiresAuth && !isLogin) {
    return {
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    }
  }

  if (to.path === '/login' && isLogin) {
    // 已登录还访问登录页，直接跳首页
    return { path: '/' }
  }

  return true
})

// 全局后置守卫：统一设置页面标题（无需 i18n，全中文）
router.afterEach((to) => {
  const baseTitle = 'vue-tailwind-template'
  const pageTitle = to.meta?.title || ''
  document.title = pageTitle ? `${pageTitle} - ${baseTitle}` : baseTitle
})

export default router
