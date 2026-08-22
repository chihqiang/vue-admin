/**
 * 权限判断工具
 *
 * 约定：
 * - userStore.permissions 是"扁平的 permissionId 字符串列表"
 *   （对应 UserRole.permissionList）
 * - route.meta.permission 是一个字符串：该路由需要的 permissionId
 *   如果需要"多个权限中的任一"，可以使用 ',' 分隔（逻辑或）。
 */

/** 拥有某个权限 */
export function hasPermission(userPermissions: string[], required: string): boolean {
  if (!required) return true
  if (!Array.isArray(userPermissions)) return false
  return userPermissions.includes(required)
}

/** 拥有任一权限（逗号分隔表示"或"，或传 string[]） */
export function hasAnyPermission(
  userPermissions: string[],
  required: string | string[],
): boolean {
  if (!required || (Array.isArray(required) && required.length === 0)) return true
  if (!Array.isArray(userPermissions)) return false
  const arr = Array.isArray(required)
    ? required
    : required.split(',').map((s) => s.trim()).filter(Boolean)
  return arr.some((p) => userPermissions.includes(p))
}

/** 拥有所有指定权限 */
export function hasAllPermissions(
  userPermissions: string[],
  required: string | string[],
): boolean {
  if (!required || (Array.isArray(required) && required.length === 0)) return true
  if (!Array.isArray(userPermissions)) return false
  const arr = Array.isArray(required)
    ? required
    : required.split(',').map((s) => s.trim()).filter(Boolean)
  return arr.every((p) => userPermissions.includes(p))
}

/**
 * 路由级 permission 检查
 * - meta.permission 为空：视为公共路由，通过
 * - 否则用 hasAnyPermission 匹配（支持 'A,B' 写法表示任一即可）
 */
export function checkRoutePermission(
  userPermissions: string[],
  required?: string,
): boolean {
  if (!required) return true
  return hasAnyPermission(userPermissions, required)
}
