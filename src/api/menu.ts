/**
 * 菜单/动态路由接口
 *
 * 登录后根据用户权限获取可访问的菜单列表，前端据此动态注册路由
 */
import request from '@/utils/request'
import type { AsyncMenuItem } from '@/router/asyncRoutes'

/**
 * 获取当前用户的动态菜单（路由列表）
 * 后端根据用户角色返回有权限的菜单树
 */
export function getUserMenus() {
  return request.get<AsyncMenuItem[]>('/user/menus')
}
