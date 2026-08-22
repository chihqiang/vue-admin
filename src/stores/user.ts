/**
 * 用户状态（Pinia Setup Store）
 *
 * 职责：
 *   - 管理 token 持久化（localStorage + 过期时间）
 *   - 管理用户信息（name / avatar / username / role / permissions）
 *   - 管理动态路由加载状态（menus / dynamicRoutesLoaded）
 *   - 登录 / 登出 / 清理状态
 *
 * 设计原则：
 *   - Store 不直接依赖 vue-router（不注入 addRoute / transform）
 *   - 路由注册由 router 模块负责（调用 store 数据后自行 addRoute）
 *   - Store 只提供数据（menus）和状态标记（dynamicRoutesLoaded）
 *
 * 持久化介质：统一走 @/utils/storage（底层 localStorage，SSR 安全）
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getInfo, login as apiLogin, logout as apiLogout } from '@/api/login'
import { getUserMenus } from '@/api/menu'
import type { LoginParams, LoginByMobileParams, UserInfo } from '@/api/login'
import type { AsyncMenuItem } from '@/router/asyncRoutes'
import { asyncRoutes } from '@/router/routes'
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

  /** 动态路由菜单（从后端获取） */
  const menus = ref<AsyncMenuItem[]>([])

  /** 是否已加载过动态路由 */
  const dynamicRoutesLoaded = ref<boolean>(false)

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
  async function login(params: LoginParams | LoginByMobileParams, rememberMe = false) {
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
  async function fetchUserInfo() {
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
   * 获取动态路由菜单数据
   * - 优先从后端 /user/menus 获取
   * - 失败时降级到本地 routes.ts 兜底数据
   *
   * Store 只负责获取和存储菜单数据，不负责路由注册。
   * 路由注册由 router 守卫调用此方法后自行处理。
   */
  async function fetchMenus(): Promise<AsyncMenuItem[]> {
    if (dynamicRoutesLoaded.value && menus.value.length > 0) {
      return menus.value
    }

    try {
      const menuList = await getUserMenus()
      console.log('[userStore] getUserMenus 返回:', menuList)
      // 防御性检查：确保返回的是数组
      if (Array.isArray(menuList) && menuList.length > 0) {
        menus.value = menuList
      } else {
        console.warn('[userStore] getUserMenus 返回数据非数组或为空，降级到本地路由:', menuList)
        menus.value = asyncRoutes
      }
    } catch (err) {
      console.warn('[userStore] getUserMenus 失败，降级到本地路由:', err)
      menus.value = asyncRoutes
    }

    dynamicRoutesLoaded.value = true
    return menus.value
  }

  /**
   * 懒加载用户信息：已拉取则直接返回，否则调用 fetchUserInfo。
   * 路由守卫每次切换路由都会调用这个方法，避免同一用户重复请求。
   */
  async function refreshUserInfo(force = false): Promise<UserInfo> {
    if (!force && info.value) return info.value
    return fetchUserInfo()
  }

  /**
   * 外部直接设置 token（注册成功后使用）
   * 默认使用 7 天过期
   */
  function setToken(newToken: string): void {
    token.value = newToken
    writeToken(newToken, TOKEN_EXPIRE_MS)
  }

  /**
   * 登出：通知后端 + 清理本地
   * 无论后端成功与否，最终都会清掉本地登录态。
   */
  async function logout() {
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
    menus.value = []
    dynamicRoutesLoaded.value = false
    clearToken()
    // 清理标签页（延迟 import 避免循环依赖）
    import('@/stores/tabs').then(({ useTabsStore }) => {
      useTabsStore().reset()
    })
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
    menus,
    dynamicRoutesLoaded,
    // getters
    isLogin,
    roleId,
    // actions
    login,
    fetchUserInfo,
    fetchMenus,
    refreshUserInfo,
    setToken,
    logout,
    clearState,
  }
})
