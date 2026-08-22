/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** axios 请求前缀（开发时 /api，生产可改为后端域名） */
  readonly VITE_API_BASE_URL?: string
  /** 是否启用 Mock.js 拦截（仅开发环境生效） */
  readonly VITE_USE_MOCK?: string
  /** 后端真实地址（VITE_USE_MOCK=false 时，Vite 开发代理把 /api 转发到这里） */
  readonly VITE_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Vite 注入的全局常量（define）：是否启用 Mock */
declare const __VITE_USE_MOCK__: string | undefined
