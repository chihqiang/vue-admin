/**
 * 登录/登出/验证码/用户信息 相关接口
 * 每个方法直接返回解包后的 result（在 request 拦截器里统一处理 code !== 0 的情况）
 */
import request from '@/utils/request'
import type {
  LoginParams,
  LoginByMobileParams,
  LoginResult,
  SmsCaptchaResult,
  TwoStepResult,
  UserInfo,
} from '@/types/user'

/** 接口 URL 常量 */
const URL = {
  Login: '/auth/login',
  Logout: '/auth/logout',
  TwoStepCode: '/auth/2step-code',
  SendSms: '/account/sms',
  UserInfo: '/user/info',
} as const

/**
 * 账号密码登录
 * @param params LoginParams
 */
export function login(params: LoginParams | LoginByMobileParams) {
  return request.post<unknown, LoginResult>(URL.Login, params)
}

/**
 * 发送短信验证码（手机号登录用）
 * @param params { mobile: string }
 */
export function getSmsCaptcha(params: { mobile: string }) {
  return request.post<unknown, SmsCaptchaResult>(URL.SendSms, params)
}

/**
 * 查询两步验证是否开启
 */
export function get2step() {
  return request.post<unknown, TwoStepResult>(URL.TwoStepCode, {})
}

/**
 * 获取当前登录用户的基本信息 + 角色 + 权限
 * 需要带上 token（request 拦截器会自动注入）
 */
export function getInfo() {
  return request.get<unknown, UserInfo>(URL.UserInfo)
}

/**
 * 登出（通知后端清理该 token，然后前端再清本地）
 */
export function logout() {
  return request.post<unknown, unknown>(URL.Logout, {})
}
