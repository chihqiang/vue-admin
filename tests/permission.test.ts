/**
 * 权限工具函数单元测试
 */
import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  checkRoutePermission,
} from '@/utils/permission'

describe('hasPermission', () => {
  it('有权限时返回 true', () => {
    expect(hasPermission(['user:add'], 'user:add')).toBe(true)
  })

  it('无权限时返回 false', () => {
    expect(hasPermission(['user:query'], 'user:add')).toBe(false)
  })

  it('权限列表为空时返回 false', () => {
    expect(hasPermission([], 'user:add')).toBe(false)
  })

  it('required 为空时返回 true（无权限要求=公开）', () => {
    expect(hasPermission(['user:add'], '')).toBe(true)
  })

  it('permissions 不是数组时返回 false', () => {
    expect(hasPermission(null as unknown as string[], 'user:add')).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('拥有其中一个权限即返回 true', () => {
    expect(hasAnyPermission(['user:add', 'user:query'], 'user:delete,user:add')).toBe(true)
  })

  it('都不拥有时返回 false', () => {
    expect(hasAnyPermission(['user:query'], 'user:add,user:delete')).toBe(false)
  })

  it('数组形式参数', () => {
    expect(hasAnyPermission(['user:add'], ['user:add', 'user:delete'])).toBe(true)
  })

  it('空 required 返回 true', () => {
    expect(hasAnyPermission([], [])).toBe(true)
  })

  it('逗号分隔带空格', () => {
    expect(hasAnyPermission(['user:add'], ' user:add , user:delete ')).toBe(true)
  })
})

describe('hasAllPermissions', () => {
  it('拥有全部权限返回 true', () => {
    expect(hasAllPermissions(['user:add', 'user:delete'], ['user:add', 'user:delete'])).toBe(true)
  })

  it('缺少其中一个返回 false', () => {
    expect(hasAllPermissions(['user:add'], ['user:add', 'user:delete'])).toBe(false)
  })

  it('逗号分隔形式', () => {
    expect(hasAllPermissions(['user:add', 'user:delete'], 'user:add,user:delete')).toBe(true)
  })

  it('空 required 返回 true', () => {
    expect(hasAllPermissions([], '')).toBe(true)
  })
})

describe('checkRoutePermission', () => {
  it('无 permission 要求时通过', () => {
    expect(checkRoutePermission(['user:add'], undefined)).toBe(true)
  })

  it('有权限时通过', () => {
    expect(checkRoutePermission(['dashboard', 'user:add'], 'dashboard')).toBe(true)
  })

  it('无权限时不通过', () => {
    expect(checkRoutePermission(['user:add'], 'dashboard')).toBe(false)
  })

  it('逗号分隔=逻辑或', () => {
    expect(checkRoutePermission(['user:add'], 'dashboard,user:add')).toBe(true)
    expect(checkRoutePermission(['user:query'], 'dashboard,user:add')).toBe(false)
  })
})
