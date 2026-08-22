/**
 * HTTP 请求封装（基于 axios）
 *
 * - 统一注入 Authorization 请求头（从 userStore 取 token，不直接读 localStorage）
 * - 统一解包后端 { code, msg, data, request_id? } 结构
 * - code !== 200 按业务异常抛出
 * - 401 自动清理登录态并跳转登录页（携带 redirect 回跳）
 * - 类型扩展：`request.get<T>(url)` 直接返回 `Promise<T>`（已解包 data），
 *   不再需要写 `<unknown, T>` 双泛型
 * - 解耦：全局 UI 提示（alert / message）不直接 import '@/components'，避免
 *   未来 feedback 组件用到 request 时形成循环依赖。通过 `setToastHandler()`
 *   在 main.ts 里注入。
 */
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// ========================================================================
// 1. 类型扩展：让 request.get/post/put/delete<T> 直接 Promise<T>
// ========================================================================

declare module 'axios' {
  interface AxiosInstance {
    get<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
    post<T = unknown, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>,
    ): Promise<T>
    put<T = unknown, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>,
    ): Promise<T>
    delete<T = unknown, D = unknown>(
      url: string,
      config?: AxiosRequestConfig<D>,
    ): Promise<T>
    patch<T = unknown, D = unknown>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>,
    ): Promise<T>
  }
}

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

// ========================================================================
// 2. Toast 注入：避免循环依赖 @/components
// ========================================================================

export interface ToastAlertConfig {
  title?: string
  description?: string
}
export interface ToastHandler {
  /** 非阻塞的轻提示（message.warning / error 等） */
  message: {
    warning: (content: string) => void
    error: (content: string) => void
  }
  /** 阻塞式/需要用户看的强提示（alert.error 等） */
  alert: {
    error: (config: ToastAlertConfig) => void
  }
}

let toastHandler: ToastHandler | null = null

/** 由 main.ts 在应用初始化时注入 feedback 组件实例 */
export function setToastHandler(handler: ToastHandler): void {
  toastHandler = handler
}

/** 兜底：main.ts 注入之前若报错，至少有 console 级别的输出 */
function fallbackAlertError(config: ToastAlertConfig): void {
   
  console.error('[alert.error]', config.title, config.description)
}
function fallbackMessage(content: string, level: 'error' | 'warning'): void {
  if (level === 'error') console.error('[message.error]', content)
  else console.warn('[message.warning]', content)
}
function doAlertError(config: ToastAlertConfig): void {
  if (toastHandler?.alert?.error) toastHandler.alert.error(config)
  else fallbackAlertError(config)
}
function doMessageWarning(content: string): void {
  if (toastHandler?.message?.warning) toastHandler.message.warning(content)
  else fallbackMessage(content, 'warning')
}
function doMessageError(content: string): void {
  if (toastHandler?.message?.error) toastHandler.message.error(content)
  else fallbackMessage(content, 'error')
}

// ========================================================================
// 3. axios 实例创建 + 拦截器
// ========================================================================

const request = axios.create({
  // API 请求前缀；开发时默认 /api，走 mock 或 vite proxy
  baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api',
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
    doMessageWarning(msg)
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
      doAlertError({ title: '无访问权限', description: msg })
    } else if (status === 401) {
      const msg = data?.msg || '登录状态已过期，请重新登录'
      handleUnauthorized(msg)
    } else if (status === 500) {
      const msg = data?.msg || '服务器内部错误，请稍后重试'
      console.error('[500]', msg)
      doAlertError({ title: '服务器错误', description: msg })
    } else {
      // 其他 HTTP 错误统一提示
      const msg = data?.msg || `请求失败（${status}）`
      console.error(`[${status}]`, msg)
      doAlertError({ title: '请求失败', description: msg })
    }
  } else if (error.request) {
    // 网络层错误：未收到响应（断网 / 超时 / 跨域）
    const msg = error.code === 'ECONNABORTED' ? '请求超时，请检查网络' : '网络异常，请稍后重试'
    console.error('[Network Error]', msg)
    doAlertError({ title: '网络异常', description: msg })
  } else {
    console.error('[Request Error]', error.message)
    doMessageError(error.message || '请求出错')
  }
  return Promise.reject(error)
}

// 请求拦截：注入 token（从 userStore 取，不直接读 localStorage）
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore().token
    if (token && config.headers) {
      // 使用标准 Authorization 头，Bearer token 格式
      config.headers.Authorization = `Bearer ${token}`
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
