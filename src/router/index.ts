import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTabsStore } from '@/stores/tabs'
import { useNprogress } from '@/hooks/useNprogress'
import { checkRoutePermission } from '@/utils/permission'
import { alert } from '@/components'
import { transformAsyncRoutes } from './asyncRoutes'

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
    /** 是否缓存该页面组件（配合 KeepAlive） */
    keepAlive?: boolean
    /** 标签页是否固定不可关闭（如首页） */
    affix?: boolean
  }
}

/**
 * 静态路由配置
 *
 * 约定：
 *   /login           → 独立登录页（无 Layout，hideInMenu）
 *   /register        → 独立注册页
 *   /                → BasicLayout 嵌套布局（requiresAuth）
 *     业务子路由通过动态路由 addRoute 注册
 *   /403 /500 /:404  → 异常页
 */
const staticRoutes: RouteRecordRaw[] = [
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
    // 动态路由注册时，业务路由会作为此路由的 children 添加
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard/analysis',
    meta: { requiresAuth: true, hideInMenu: true },
    // children 由动态路由运行时 addRoute 注册，初始为空
    children: [],
  },
  // ============ 异常页 ============
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/exception/Forbidden.vue'),
    meta: { title: '403', requiresAuth: false, hideInMenu: true, hideInBreadcrumb: true },
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/exception/ServerError.vue'),
    meta: { title: '500', requiresAuth: false, hideInMenu: true, hideInBreadcrumb: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/exception/NotFound.vue'),
    meta: { title: '404', requiresAuth: false, hideInMenu: true, hideInBreadcrumb: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
})

/**
 * 全局前置守卫
 *
 * 核心流程：
 *   1. 启动 NProgress
 *   2. 已登录却访问 /login → 跳首页
 *   3. 未登录访问需鉴权页面 → 跳 /login（带 redirect）
 *   4. 已登录 & 用户信息为空 → 懒拉取 /user/info
 *   5. 已登录 & 动态路由未加载 → 注册业务路由后重新匹配
 *   6. 路由级权限校验
 *
 * 关键设计——"先加载动态路由，再判断 404"：
 *   刷新页面时（如直接访问 /dashboard/analysis），动态路由还没注册，
 *   to.matched 会命中静态的 404 兜底路由（requiresAuth=false）。
 *   如果此时直接放行，就会渲染 404 页面。
 *   正确做法：已登录用户在动态路由加载完成前，不应信任 to.matched 的结果，
 *   先完成动态路由注册，再 return { ...to, replace: true } 重新匹配。
 */
router.beforeEach(async (to) => {
  startProgress()

  const userStore = useUserStore()
  const isLogin = userStore.isLogin

  // ---------- 2. 已登录还访问登录页 → 跳首页 ----------
  if (to.path === '/login' && isLogin) {
    doneProgress()
    return { path: '/' }
  }

  // ---------- 3. 未登录访问需鉴权页面 → 跳登录页 ----------
  // 不依赖 to.matched 的 requiresAuth，因为动态路由未注册时 matched 不完整。
  // 只排除明确的公开页面（login / register / 403 / 500），其余都需要登录。
  // 注意：不排除 404 兜底路由，因为动态路由未注册时真实路径（如 /dashboard/analysis）
  // 也会命中 404，此时未登录用户应跳登录页而非展示 404。
  const publicPaths = ['/login', '/register', '/403', '/500']
  const isPublicRoute = publicPaths.includes(to.path)
  if (!isLogin && !isPublicRoute) {
    doneProgress()
    return {
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    }
  }

  // ---------- 4. 已登录但用户信息为空 → 懒拉取 ----------
  if (isLogin && !userStore.info) {
    try {
      await userStore.refreshUserInfo()
    } catch (err) {
      console.warn('[router] refreshUserInfo failed，交给 401 流程处理：', err)
    }
  }

  // ---------- 5. 动态路由加载 ----------
  // 已登录但动态路由未注册时，先注册路由，再重新匹配导航目标。
  // 这一步必须在 404 判断之前，否则刷新页面会直接命中 404。
  if (isLogin && !userStore.dynamicRoutesLoaded) {
    try {
      const menus = await userStore.fetchMenus()
      const routes = transformAsyncRoutes(menus)
      routes.forEach((route) => {
        router.addRoute('Layout', route)
      })
      // 动态路由注册后，重新匹配当前导航目标。
      // 用 to.fullPath 确保只带路径和 query，不带旧的 matched 等内部属性。
      return { path: to.fullPath, replace: true }
    } catch (err) {
      console.error('[router] loadDynamicRoutes failed:', err)
      doneProgress()
      alert.error({ title: '加载失败', description: '菜单加载失败，请刷新重试' })
      return { path: '/login' }
    }
  }

  // ---------- 6. 路由级权限校验 ----------
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

  // 路由切换后自动添加标签页
  useTabsStore().addTab(to)
})

/**
 * 重置路由（退出登录时调用，移除所有动态路由）
 */
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: staticRoutes,
  })
  ;(router as unknown as { matcher: unknown }).matcher = (newRouter as unknown as { matcher: unknown }).matcher
}

export default router
