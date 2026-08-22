/**
 * HTTP 请求封装（基于 axios）
 * - 统一注入 Token 请求头
 * - 统一解包后端 { code, msg, data, request_id? } 结构
 * - code !== 200 按业务异常抛出
 * - 401 自动清理登录态并跳转登录页（携带 redirect 回跳）
 */
import axios, { type AxiosError, type AxiosResponse } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN } from '@/stores/user'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import { alert, message } from '@/components'

/**
 * 通用的 HTTP 响应体结构（后端统一返回格式）
 * {
 *   code: 业务状态码（200 表示成功，非 200 表示业务异常）
 *   msg: 提示信息
 *   data: 数据载荷（可能为 null）
 *   request_id: 请求追踪 ID（可选字段，后端不一定返回）
 * }
 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码，200 表示成功 */
  code: number
  /** 提示信息 */
  msg: string
  /** 数据载荷 */
  data: T
  /** 请求追踪 ID（可选） */
  request_id?: string
}

/** 后端返回分页结构 */
export interface PageResult<T> {
  list: T[]
  total: number
  pageNo: number
  pageSize: number
}

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀；开发时走相对路径，由 mock 直接拦截（或后续走 Vite proxy）
  baseURL: '/api',
  timeout: 10000,
})

/** 防止 401 后并发触发多次跳转 */
let isRedirecting = false

/** 401 统一处理：清登录态 → message 提示 → 跳登录页（带 redirect 回跳参数） */
function handleUnauthorized(msg: string) {
  const userStore = useUserStore()
  console.error('[401 Unauthorized]', msg)
  // 已有 token 才提示过期（避免未登录场景反复弹）
  if (userStore.token) {
    // clearState 统一清理 store state + localStorage（由 user store 内部负责持久化）
    userStore.clearState()
    // 用 message（短暂自动消失）而非 alert：alert 默认不自动关，
    // 且通过 Teleport 渲染到 body，SPA 跳转后不会随之卸载，会残留在新页面
    message.warning(msg)
  }
  // 已在跳转流程中则不再重复处理
  if (isRedirecting) return
  // 已在登录页（如登录请求本身返回 401）则只提示，不跳转，避免重复导航
  if (router.currentRoute.value.path === '/login') return
  isRedirecting = true
  // 用 vue-router 跳转，保持 SPA 状态；query.redirect 供登录成功后回跳
  const redirect = router.currentRoute.value.fullPath
  router
    .push({
      path: '/login',
      query: redirect && redirect !== '/' ? { redirect } : undefined,
    })
    .finally(() => {
      isRedirecting = false
    })
}

// 异常统一处理
function errorHandler(error: AxiosError<ApiResponse>): Promise<never> {
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    if (status === 403) {
      const msg = data?.msg || '无权访问该资源'
      console.error('[403 Forbidden]', msg)
      alert.error({ title: '无访问权限', description: msg })
    } else if (status === 401) {
      const msg = data?.msg || '登录状态已过期，请重新登录'
      handleUnauthorized(msg)
    } else {
      // 其他 HTTP 错误统一提示
      const msg = data?.msg || `请求失败（${status}）`
      console.error(`[${status}]`, msg)
      alert.error({ title: '请求失败', description: msg })
    }
  } else if (error.request) {
    // 网络层错误：未收到响应（断网 / 超时 / 跨域）
    const msg = error.code === 'ECONNABORTED' ? '请求超时，请检查网络' : '网络异常，请稍后重试'
    console.error('[Network Error]', msg)
    alert.error({ title: '网络异常', description: msg })
  } else {
    console.error('[Request Error]', error.message)
  }
  return Promise.reject(error)
}

// 请求拦截：注入 token（从 userStore 取，不直接读 localStorage）
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore().token
    if (token && config.headers) {
      // ACCESS_TOKEN 为后端约定的请求头名（'Access-Token'）
      config.headers[ACCESS_TOKEN] = token
    }
    return config
  },
  errorHandler,
)

// 响应拦截：统一解包 ApiResponse
// code === 200 -> 返回 data
// code !== 200 -> 抛业务错误（error.message = 后端 msg）
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const body = response.data
    // 非标准结构（如二进制流）直接返回 data
    if (!body || typeof body !== 'object' || !('code' in body)) {
      return body as unknown as AxiosResponse
    }
    if (body.code === 200) {
      // 返回 data，调用方直接拿到业务数据
      return body.data as unknown as AxiosResponse
    }
    // 业务错误
    const error = new Error(body.msg || '请求失败')
    error.name = 'BizError'
    ;(error as unknown as { bizCode: number }).bizCode = body.code
    return Promise.reject(error)
  },
  errorHandler,
)

export default request
export { request as axios }
