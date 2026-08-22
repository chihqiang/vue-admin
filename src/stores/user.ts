/**
 * 用户状态（Pinia Setup Store 写法）
 *
 * 持久化介质：统一走 @/utils/storage（底层 localStorage，SSR 安全），
 * 业务层不再直接访问 localStorage。
 *
 * 提供：
 *   - Login：调用接口登录，保存 token 到 storage + store
 *   - GetInfo：根据 token 拉取用户信息、角色、权限列表（无条件发起请求）
 *   - refreshUserInfo：已拉取过则跳过，否则调用 GetInfo（路由守卫用，避免每次路由切换都请求）
 *   - Logout：调用登出接口，清 token、清用户信息
 *   - isLogin：是否已登录（token 存在且未过期）
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getInfo, login as apiLogin, logout as apiLogout } from '@/api/login'
import type { LoginParams, LoginByMobileParams, UserInfo } from '@/api/login'
import { timeFix } from '@/utils/util'
import { storageGet, storageRemove, storageSet } from '@/utils/storage'

/** 本地存储里 Token 的 key */
export const ACCESS_TOKEN = 'Access-Token'

/** Token 默认过期时间：7 天（毫秒） */
export const TOKEN_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000

/** Token 在 storage 里的过期时间戳 key */
const TOKEN_EXPIRE_KEY = 'Access-Token-Expire'

export const useUserStore = defineStore('user', () => {
  // ============ State ============

  /** 登录凭证（启动时从持久化读取） */
  const token = ref<string>(readToken())

  /** 展示名（如 系统管理员） */
  const name = ref<string>('')

  /** 登录后的问候语：早上好 / 下午好 ... */
  const welcome = ref<string>('')

  /** 头像 URL */
  const avatar = ref<string>('')

  /** 登录用户名（admin/super 等） */
  const username = ref<string>('')

  /** 当前登录用户完整信息（登录 + 拉取用户信息之后才有） */
  const info = ref<UserInfo | null>(null)

  /** permissionId 列表，扁平化后方便判断权限 */
  const permissions = ref<string[]>([])

  // ============ Getters ============

  /** 是否已登录（有 token 且未过期） */
  const isLogin = computed(() => {
    if (!token.value) return false
    const expireRaw = storageGet(TOKEN_EXPIRE_KEY)
    const expire = Number(expireRaw || 0)
    if (!expire) return true // 老数据，无过期时间，兼容处理
    return Date.now() < expire
  })

  /** 角色 id（admin/super） */
  const roleId = computed(() => info.value?.roleId || '')

  // ============ 内部工具 ============

  function readToken(): string {
    return storageGet(ACCESS_TOKEN) ?? ''
  }

  function writeToken(newToken: string, expireMs: number): void {
    storageSet(ACCESS_TOKEN, newToken)
    storageSet(TOKEN_EXPIRE_KEY, String(Date.now() + expireMs))
  }

  function clearToken(): void {
    storageRemove(ACCESS_TOKEN)
    storageRemove(TOKEN_EXPIRE_KEY)
  }

  // ============ Actions ============

  /**
   * 登录
   * @param params 账号密码 或 手机号验证码
   * @param rememberMe 是否记住我（false 时过期时间=24 小时，true 时=7 天）
   */
  async function Login(
    params: LoginParams | LoginByMobileParams,
    rememberMe = false,
  ) {
    const result = await apiLogin(params)
    // 保存 token 与过期时间
    token.value = result.token
    const expireMs = rememberMe ? TOKEN_EXPIRE_MS : 24 * 60 * 60 * 1000
    writeToken(result.token, expireMs)
    return result
  }

  /**
   * 拉取当前登录用户的基本信息 + 角色 + 权限
   * 一般在进入主路由 / 刷新页面时调用（无条件拉取）。
   */
  async function GetInfo() {
    const result = await getInfo()
    info.value = result
    name.value = result.name
    username.value = result.username
    avatar.value = result.avatar
    welcome.value = `${timeFix()}，${result.name}`
    permissions.value = result.role?.permissionList || []
    return result
  }

  /**
   * 懒加载用户信息：已拉取则直接返回，否则调用 GetInfo。
   * 路由守卫每次切换路由都会调用这个方法，避免同一用户重复请求。
   */
  async function refreshUserInfo(force = false): Promise<UserInfo> {
    if (!force && info.value) return info.value
    return GetInfo()
  }

  /**
   * 登出：通知后端 + 清理本地
   * 无论后端成功与否，最终都会清掉本地登录态。
   */
  async function Logout() {
    try {
      await apiLogout()
    } finally {
      clearState()
    }
  }

  /** 清理所有状态（退出登录 / 401 过期 / 切换账号时调用） */
  function clearState() {
    token.value = ''
    name.value = ''
    welcome.value = ''
    avatar.value = ''
    username.value = ''
    info.value = null
    permissions.value = []
    clearToken()
  }

  return {
    // state
    token,
    name,
    welcome,
    avatar,
    username,
    info,
    permissions,
    // getters
    isLogin,
    roleId,
    // actions
    Login,
    GetInfo,
    refreshUserInfo,
    Logout,
    clearState,
  }
})
