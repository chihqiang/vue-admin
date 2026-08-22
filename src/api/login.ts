/**
 * 登录/登出/验证码/用户信息 相关接口
 * 每个方法直接返回解包后的 result（在 request 拦截器里统一处理 code !== 0 的情况）
 */
import request from '@/utils/request'

/** 登录接口参数（账号密码方式） */
export interface LoginParams {
  /** 用户名 */
  username?: string
  /** 邮箱（与 username 二选一） */
  email?: string
  /** 登录密码 */
  password: string
  /** 是否记住我 */
  remember_me?: boolean
}

/** 登录接口参数（手机号 + 验证码方式） */
export interface LoginByMobileParams {
  /** 手机号 */
  mobile: string
  /** 短信验证码 */
  captcha: string
}

/** 登录成功返回的用户信息 + token */
export interface LoginResult {
  id: string
  name: string
  username: string
  avatar: string
  status: number
  telephone: string
  lastLoginIp: string
  lastLoginTime: number
  creatorId: string
  createTime: number
  deleted: number
  roleId: string
  lang: string
  token: string
}

/** 获取短信验证码返回 */
export interface SmsCaptchaResult {
  /** 6 位数字验证码（开发/演示环境直接返回给前端） */
  captcha: string
}

/** 两步验证开关 */
export interface TwoStepResult {
  /** 0 = 关闭，1 = 开启 */
  stepCode: 0 | 1
}

/** 用户角色权限项（单个） */
export interface Permission {
  roleId: string
  permissionId: string
  permissionName: string
  /** 每个权限点拥有的动作集合，例如 ['add','query','get','update','delete'] */
  actionList: string[]
  [key: string]: unknown
}

/** 用户角色 */
export interface UserRole {
  id: string
  name: string
  describe: string
  status: number
  creatorId: string
  createTime: number
  deleted: number
  permissions: Permission[]
  /** 扁平的 permissionId 列表，方便前端快速判断权限 */
  permissionList: string[]
}

/** 用户信息（登录后拉取） */
export interface UserInfo extends Omit<LoginResult, 'token'> {
  merchantCode?: string
  role: UserRole
}

/**
 * 账号密码登录
 * @param params LoginParams
 */
export function login(params: LoginParams | LoginByMobileParams) {
  return request.post<unknown, LoginResult>('/auth/login', params)
}

/**
 * 发送短信验证码（手机号登录用）
 * @param params { mobile: string }
 */
export function getSmsCaptcha(params: { mobile: string }) {
  return request.post<unknown, SmsCaptchaResult>('/account/sms', params)
}

/**
 * 查询两步验证是否开启
 */
export function get2step() {
  return request.post<unknown, TwoStepResult>('/auth/2step-code', {})
}

/**
 * 获取当前登录用户的基本信息 + 角色 + 权限
 * 需要带上 token（request 拦截器会自动注入）
 */
export function getInfo() {
  return request.get<unknown, UserInfo>('/user/info')
}

/**
 * 登出（通知后端清理该 token，然后前端再清本地）
 */
export function logout() {
  return request.post<unknown, unknown>('/auth/logout', {})
}
