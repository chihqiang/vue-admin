import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNprogress } from '@/hooks/useNprogress'
import { checkRoutePermission } from '@/utils/permission'
import { alert } from '@/components'

const { start: startProgress, done: doneProgress } = useNprogress()

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
    /**
     * 权限标识（对应 userStore.permissions 中的 permissionId）
     * 多个用英文逗号分隔表示"任一即可"（逻辑或）
     */
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
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册', requiresAuth: false, hideInMenu: true },
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
            component: () => import('@/views/form/step-form/StepForm.vue'),
            meta: { title: '分步表单' },
          },
          {
            path: '/form/advanced-form',
            name: 'AdvancedForm',
            component: () => import('@/views/form/advanced-form/AdvancedForm.vue'),
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
  // ============ 404 兜底路由 ============
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/exception/NotFound.vue'),
    meta: { title: '404', requiresAuth: false, hideInMenu: true, hideInBreadcrumb: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * 全局前置守卫（按优先级依次检查）：
 *   1. 启动 NProgress
 *   2. requiresAuth → 未登录跳 /login（带 redirect）
 *   3. 已登录 & info 未拉取 → refreshUserInfo() 懒加载 /user/info
 *   4. meta.permission → 无权限弹 alert 并回首页
 *   5. 已登录却访问 /login → 直接跳首页
 */
router.beforeEach(async (to) => {
  startProgress()

  const userStore = useUserStore()
  // 父级 meta 会被 vue-router 合并到 matched 链上
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const isLogin = userStore.isLogin

  // ---------- 2. 登录鉴权 ----------
  if (requiresAuth && !isLogin) {
    doneProgress() // 被重定向，提前结束进度条
    return {
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    }
  }

  // ---------- 5. 已登录还访问登录页 → 跳首页 ----------
  if (to.path === '/login' && isLogin) {
    doneProgress()
    return { path: '/' }
  }

  // ---------- 3. 已登录但用户信息为空 → 懒拉取 ----------
  if (isLogin && requiresAuth && !userStore.info) {
    try {
      await userStore.refreshUserInfo()
    } catch (err) {
      // 拉取失败（比如 token 过期但本地还以为有效）→ 交给 request.ts 的 401 处理
      console.warn('[router] refreshUserInfo failed，交给 401 流程处理：', err)
    }
  }

  // ---------- 4. 路由级权限校验 ----------
  // 从 matched 链中按"最深层且声明了 permission"的那个为准。
  const requiredPermission = [...to.matched].reverse().find((r) => r.meta?.permission)?.meta
    ?.permission
  if (
    isLogin &&
    requiredPermission &&
    !checkRoutePermission(userStore.permissions, requiredPermission)
  ) {
    doneProgress()
    alert.error({
      title: '无访问权限',
      description: `您没有访问 "${to.meta?.title || to.path}" 所需的权限（${requiredPermission}）`,
    })
    return { path: '/' }
  }

  return true
})

// 全局后置守卫：完成进度条 + 统一设置页面标题（无需 i18n，全中文）
router.afterEach((to) => {
  doneProgress()
  const baseTitle = 'vue-admin'
  const pageTitle = to.meta?.title || ''
  document.title = pageTitle ? `${pageTitle} - ${baseTitle}` : baseTitle
})

export default router
