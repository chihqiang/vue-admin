/**
 * 动态路由配置
 *
 * 职责：
 *   - 定义 AsyncMenuItem 接口（后端返回的菜单项结构）
 *   - 提供 transformAsyncRoutes：将 AsyncMenuItem[] 转为 vue-router RouteRecordRaw[]
 *   - 通过 import.meta.glob 预加载 views 下的组件，保证动态注册时能正确匹配
 *
 * 路由数据定义在 routes.ts 中，不在本文件维护。
 */
import type { RouteRecordRaw } from 'vue-router'

/**
 * 后端返回的菜单项结构
 */
export interface AsyncMenuItem {
  /** 菜单/路由名称（唯一标识，如 'dashboard'） */
  name: string
  /** 菜单标题（中文） */
  title: string
  /** lucide 图标组件名（仅一级菜单用） */
  icon?: string
  /** 路由路径（如 '/dashboard/analysis'） */
  path: string
  /** 组件路径（相对于 src/views/，如 'dashboard/Analysis'） */
  component?: string
  /** 重定向路径（父级菜单用，如 '/dashboard/analysis'） */
  redirect?: string
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean
  /** 权限标识 */
  permission?: string
  /** 是否缓存 */
  keepAlive?: boolean
  /** 是否固定标签 */
  affix?: boolean
  /** 子菜单 */
  children?: AsyncMenuItem[]
}

/**
 * 组件映射表
 * key = AsyncMenuItem.component 的值
 * value = 路由的 component 函数（懒加载）
 *
 * 使用 glob 预加载所有 views 下的 .vue 文件，
 * 避免后端返回任意路径导致的安全问题（只能匹配预定义的组件）
 */
const modules = import.meta.glob('../views/**/*.vue')

/**
 * 根据组件路径获取懒加载函数
 * @param component 相对路径（如 'dashboard/Analysis'）
 */
function resolveComponent(component: string): () => Promise<unknown> {
  const key = `../views/${component}.vue`
  const loader = modules[key]
  if (!loader) {
    console.warn(`[asyncRoutes] 组件未找到: ${component}，请检查路径`)
    // 返回 404 组件作为兜底
    return () => import('@/views/exception/NotFound.vue')
  }
  return loader as () => Promise<unknown>
}

/**
 * 将后端菜单项转换为 vue-router 路由记录
 */
function transformMenuItem(item: AsyncMenuItem): RouteRecordRaw {
  const route = {
    path: item.path,
    name: item.name,
    ...(item.redirect ? { redirect: item.redirect } : {}),
    meta: {
      title: item.title,
      ...(item.icon ? { icon: item.icon } : {}),
      ...(item.hideInMenu ? { hideInMenu: item.hideInMenu } : {}),
      ...(item.permission ? { permission: item.permission } : {}),
      ...(item.keepAlive ? { keepAlive: item.keepAlive } : {}),
      ...(item.affix ? { affix: item.affix } : {}),
    },
  } as RouteRecordRaw

  // 有子菜单 → 父级路由（无 component）
  if (item.children && item.children.length > 0) {
    route.children = item.children.map(transformMenuItem)
  } else if (item.component) {
    // 叶子菜单 → 懒加载组件
    route.component = resolveComponent(item.component)
  }

  return route
}

/**
 * 将后端菜单列表转换为路由记录数组
 */
export function transformAsyncRoutes(items: AsyncMenuItem[]): RouteRecordRaw[] {
  if (!Array.isArray(items)) {
    console.warn('[asyncRoutes] transformAsyncRoutes: items 不是数组', items)
    return []
  }
  return items.map(transformMenuItem)
}
