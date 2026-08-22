/**
 * 用户状态（Pinia Setup Store 写法）
 * 提供：
 *   - Login：调用接口登录，保存 token 到 localStorage + store
 *   - GetInfo：根据 token 拉取用户信息、角色、权限列表
 *   - Logout：调用登出接口，清 token、清用户信息
 *   - isLogin：是否已登录（token 存在且未过期）
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getInfo, login as apiLogin, logout as apiLogout } from '@/api/login'
import { ACCESS_TOKEN, TOKEN_EXPIRE_MS } from '@/constants'
import type { LoginParams, LoginByMobileParams, UserInfo } from '@/types/user'
import { timeFix } from '@/utils/util'

/** Token 在 localStorage 里的过期时间戳 key */
const TOKEN_EXPIRE_KEY = 'Access-Token-Expire'

export const useUserStore = defineStore('user', () => {
  // ============ State ============

  /** 登录凭证 */
  const token = ref<string>(localStorage.getItem(ACCESS_TOKEN) || '')

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
    const expire = Number(localStorage.getItem(TOKEN_EXPIRE_KEY) || 0)
    if (!expire) return true // 老数据，无过期时间，兼容处理
    return Date.now() < expire
  })

  /** 角色 id（admin/super） */
  const roleId = computed(() => info.value?.roleId || '')

  // ============ Actions ============

  /**
   * 登录
   * @param params 账号密码 或 手机号验证码
   */
  async function Login(
    params: LoginParams | LoginByMobileParams,
    rememberMe = false,
  ) {
    const result = await apiLogin(params)
    // 保存 token 与过期时间
    token.value = result.token
    const expireMs = Date.now() + (rememberMe ? TOKEN_EXPIRE_MS : 24 * 60 * 60 * 1000)
    localStorage.setItem(ACCESS_TOKEN, result.token)
    localStorage.setItem(TOKEN_EXPIRE_KEY, String(expireMs))
    return result
  }

  /**
   * 拉取当前登录用户的基本信息 + 角色 + 权限
   * 一般在进入主路由 / 刷新页面时调用
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
   * 登出：通知后端 + 清理本地
   */
  async function Logout() {
    try {
      await apiLogout()
    } finally {
      // 无论接口成功与否，都清掉本地登录态
      clearState()
    }
  }

  /** 清理所有状态（退出登录/401 过期时调用） */
  function clearState() {
    token.value = ''
    name.value = ''
    welcome.value = ''
    avatar.value = ''
    username.value = ''
    info.value = null
    permissions.value = []
    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem(TOKEN_EXPIRE_KEY)
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
    Logout,
    clearState,
  }
})
