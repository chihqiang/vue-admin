/**
 * 用户信息与权限 Mock
 * - GET /api/user/info  返回当前 token 对应用户的完整信息（含角色/权限）
 * - 权限结构与参考项目保持一致：role.permissions 是具体权限集合，前端可直接使用 permissionList 做鉴权
 */
import Mock from 'mockjs'
import { builder } from '../util'
import type { Permission, UserInfo, UserRole } from '@/api/login'

/**
 * 生成管理员角色权限（permissionId 与后续菜单一一对应，方便前端做菜单鉴权）
 */
function buildAdminRole(): UserRole {
  // [key: string]: unknown 索引签名 + Omit 组合下 TS 推断会丢失已知字段，
  // 这里直接用一个不含 actionList 的显式 interface 做中转
  type RawPerm = {
    roleId: string
    permissionId: string
    permissionName: string
    [key: string]: unknown
  }
  const raw: RawPerm[] = [
    {
      roleId: 'admin',
      permissionId: 'dashboard',
      permissionName: '仪表盘',
    },
    {
      roleId: 'admin',
      permissionId: 'form',
      permissionName: '表单页',
    },
    {
      roleId: 'admin',
      permissionId: 'list',
      permissionName: '列表页',
    },
    {
      roleId: 'admin',
      permissionId: 'profile',
      permissionName: '详情页',
    },
    {
      roleId: 'admin',
      permissionId: 'result',
      permissionName: '结果页',
    },
    {
      roleId: 'admin',
      permissionId: 'exception',
      permissionName: '异常页',
    },
    {
      roleId: 'admin',
      permissionId: 'account',
      permissionName: '个人中心',
    },
    {
      roleId: 'admin',
      permissionId: 'user',
      permissionName: '用户管理',
    },
    {
      roleId: 'admin',
      permissionId: 'role',
      permissionName: '角色管理',
    },
  ]
  // 默认每个权限给一组通用动作
  const fullActions = ['add', 'query', 'get', 'update', 'delete']
  const permissions: Permission[] = raw.map((p) => ({
    ...p,
    actionList: fullActions,
  }))
  return {
    id: 'admin',
    name: '管理员',
    describe: '拥有所有权限',
    status: 1,
    creatorId: 'system',
    createTime: 1497160610259,
    deleted: 0,
    permissions,
    permissionList: permissions.map((p) => p.permissionId),
  }
}

/**
 * 超级管理员角色（admin + 所有自定义模块）
 */
function buildSuperRole(): UserRole {
  const role = buildAdminRole()
  role.id = 'super'
  role.name = '超级管理员'
  role.describe = '超级管理员：拥有所有模块权限'
  role.permissions.push({
    roleId: 'super',
    permissionId: 'permission',
    permissionName: '权限管理',
    actionList: ['add', 'get', 'update', 'delete'],
  })
  role.permissions.push({
    roleId: 'super',
    permissionId: 'support',
    permissionName: '系统运维',
    actionList: ['add', 'get', 'update', 'delete', 'export'],
  })
  role.permissionList = role.permissions.map((p) => p.permissionId)
  return role
}

const info = (options: { url?: string; headers?: Record<string, string> }) => {
  // 根据 request 拦截器注入的 Authorization token 判断身份
  const authHeader =
    (options.headers && options.headers['Authorization']) ||
    (options.headers && options.headers['authorization']) ||
    ''
  // Authorization: Bearer mock-token-admin-xxx
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const isSuper = token.includes('super')
  const role = isSuper ? buildSuperRole() : buildAdminRole()
  const who: 'admin' | 'super' = isSuper ? 'super' : 'admin'

  const userInfo: UserInfo = {
    id: '4291d7da9005377ec9aec4a71ea837f',
    name: who === 'admin' ? '系统管理员' : '超级管理员',
    username: who,
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
      encodeURIComponent(who),
    status: 1,
    telephone: who === 'admin' ? '13800000001' : '13900000002',
    lastLoginIp: Mock.mock(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/),
    lastLoginTime: Date.now(),
    creatorId: 'system',
    createTime: 1497160610259,
    deleted: 0,
    roleId: who,
    lang: 'zh-CN',
    merchantCode: 'TLif2btpzg079h15bk',
    role,
  }
  console.debug('[mock] /user/info -> return user', userInfo.username)
  return builder(userInfo)
}

// /api/user/info（可能带 query）也能被命中，所以去掉 $ 结尾限制
Mock.mock(/\/user\/info/, 'get', info)
