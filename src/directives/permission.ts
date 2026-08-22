/**
 * 按钮级权限指令 v-permission
 *
 * 用法：
 *   v-permission="'user:add'"           — 拥有 user:add 权限才显示
 *   v-permission="'user:add,user:edit'" — 拥有任一权限即显示（逗号分隔=逻辑或）
 *   v-permission="['user:add','user:edit']" — 数组形式，任一即可
 *   v-permission.all="['user:add','user:edit']" — 修饰符 .all，需要同时拥有
 *
 * 无权限时元素会被从 DOM 中移除（display:none 的替代方案，
 * 防止用户通过 DevTools 切换 display 来越权操作）。
 */
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'
import { hasAnyPermission, hasAllPermissions } from '@/utils/permission'

/** 检查权限是否通过 */
function checkPermission(
  value: string | string[] | undefined,
  modifierAll: boolean,
): boolean {
  if (!value) return true

  const userStore = useUserStore()
  const userPermissions = userStore.permissions

  if (modifierAll) {
    return hasAllPermissions(userPermissions, value)
  }
  return hasAnyPermission(userPermissions, value)
}

/**
 * v-permission 指令
 * 无权限时移除元素（通过移除 comment 占位）
 */
export const permissionDirective: Directive<HTMLElement> = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const modifierAll = !!binding.modifiers.all
    if (!checkPermission(binding.value, modifierAll)) {
      el.parentNode?.removeChild(el)
    }
  },

  /**
   * 在 Vue 中组件更新时也需要重新检查权限
   * 如果用户切换了账号，权限可能发生变化
   */
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const modifierAll = !!binding.modifiers.all
    if (!checkPermission(binding.value, modifierAll) && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  },
}

/**
 * 函数式权限检查（供 setup 中编程式使用）
 *
 * @example
 * const canAdd = usePermission('user:add')
 * // canAdd.value === true/false
 */
export function usePermission(permission: string | string[], all = false): boolean {
  return checkPermission(permission, all)
}
