/**
 * 菜单/动态路由 Mock
 *
 * 根据用户 token 判断身份，返回对应权限的菜单列表
 * - admin：标准管理员（不含权限管理）
 * - super：超级管理员（含权限管理）
 */
import Mock from 'mockjs'
import { builder } from '../util'
import { asyncRoutes } from '@/router/routes'
import type { AsyncMenuItem } from '@/router/asyncRoutes'

/** 根据用户角色过滤菜单（隐藏无权限的菜单项） */
function filterMenusByPermission(menus: AsyncMenuItem[], permissions: string[]): AsyncMenuItem[] {
  return menus
    .filter((menu) => {
      // 无 permission 要求 → 通过
      if (!menu.permission) return true
      // 有 permission → 检查是否在权限列表中
      return permissions.includes(menu.permission)
    })
    .map((menu) => ({
      ...menu,
      // 递归过滤子菜单
      children: menu.children ? filterMenusByPermission(menu.children, permissions) : undefined,
    }))
    .filter((menu) => {
      // 父级菜单过滤后如果没有子菜单了，也不显示
      if (menu.children !== undefined && menu.children.length === 0) return false
      return true
    })
}

/** admin 的权限列表 */
const ADMIN_PERMISSIONS = ['dashboard', 'form', 'list', 'profile', 'result', 'account', 'user', 'role']

/** super 的权限列表（比 admin 多 permission） */
const SUPER_PERMISSIONS = [...ADMIN_PERMISSIONS, 'permission', 'support']

const menus = (options: { headers?: Record<string, string> }) => {
  const authHeader =
    (options.headers && options.headers['Authorization']) ||
    (options.headers && options.headers['authorization']) ||
    ''
  // Authorization: Bearer mock-token-admin-xxx
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const isSuper = token.includes('super')
  const permissions = isSuper ? SUPER_PERMISSIONS : ADMIN_PERMISSIONS

  const filtered = filterMenusByPermission(asyncRoutes, permissions)
  console.debug('[mock] /user/menus -> return', filtered.length, 'top-level menus for', isSuper ? 'super' : 'admin')
  return builder(filtered)
}

// 注册 mock
Mock.mock(/\/user\/menus/, 'get', menus)
