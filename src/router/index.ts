import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由配置
 * 约定：所有文案都是中文，不做国际化
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { title: '登录' },
  },
  {
    // 临时的首页占位路由，用来承接登录成功后的跳转
    path: '/',
    name: 'Home',
    component: () => import('@/App.vue'),
    meta: { title: '首页' },
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
