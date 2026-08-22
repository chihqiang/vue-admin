/**
 * HTTP 请求封装（基于 axios）
 * - 统一注入 Token 请求头
 * - 统一解包后端 { code, msg, data, request_id? } 结构
 * - code !== 200 按业务异常抛出
 * - 401 自动清理登录态并提示重新登录
 */
import axios, { type AxiosError, type AxiosResponse } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN } from '@/constants'
import type { ApiResponse } from '@/types/api'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀；开发时走相对路径，由 mock 直接拦截（或后续走 Vite proxy）
  baseURL: '/api',
  timeout: 10000,
})

// 异常统一处理
function errorHandler(error: AxiosError<ApiResponse>): Promise<never> {
  if (error.response) {
    const status = error.response.status
    const data = error.response.data
    const token = localStorage.getItem(ACCESS_TOKEN)

    if (status === 403) {
      const msg = (data && data.msg) || '无权访问该资源'
      console.error('[403 Forbidden]', msg)
      window.alert(msg)
    }
    if (status === 401) {
      const msg = (data && data.msg) || '登录状态已过期，请重新登录'
      console.error('[401 Unauthorized]', msg)
      if (token) {
        localStorage.removeItem(ACCESS_TOKEN)
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      }
      window.alert(msg)
    }
  }
  return Promise.reject(error)
}

// 请求拦截：注入 token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN)
    if (token && config.headers) {
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
