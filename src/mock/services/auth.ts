/**
 * 认证相关 Mock：登录 / 登出 / 短信验证码 / 两步验证开关
 *
 * 账号密码登录规则（明文，方便测试）：
 * - 用户名：admin   密码：admin
 * - 用户名：super   密码：super
 * - 也支持邮箱形式：admin@example.com / super@example.com，密码同上
 *
 * 手机号登录规则：
 * - 任意格式正确的 11 位手机号 + 验证码 123456 即可成功（实际发送的验证码会由 mock 随机返回）
 */
import Mock from 'mockjs'
import { builder, failBuilder, getBody } from '../util'
import type { LoginParams, LoginByMobileParams, RegisterParams } from '@/api/login'

// 账号 → 明文密码映射
const VALID_CREDENTIALS: Record<string, string> = {
  admin: 'admin',
  super: 'super',
}

const login = (options: { body?: string }) => {
  const body = getBody<LoginParams | LoginByMobileParams>(options)
  console.debug('[mock] /auth/login -> body =', body)

  // ---- 手机号 + 验证码登录 ----
  if ('mobile' in body && body.mobile) {
    const { mobile, captcha } = body as LoginByMobileParams
    // 验证码 = 123456 约定通过；真实环境下由 mock 随机返回，前端需要展示给用户以便测试
    if (!/^1[3-9]\d{9}$/.test(mobile) || captcha !== '123456') {
      return failBuilder('手机号或验证码不正确（测试验证码：123456）', 401, {
        isLogin: true,
      })
    }
    return successLoginResult('admin')
  }

  // ---- 账号 / 邮箱 + 密码登录 ----
  const { username, email, password } = body as LoginParams
  const account = username || email || ''
  // 邮箱形式时取 @ 前的用户名部分匹配
  const accountKey = account.includes('@') ? (account.split('@')[0] ?? '') : account
  const expected = VALID_CREDENTIALS[accountKey]
  if (!expected || password !== expected) {
    return failBuilder('账户或密码错误', 401, { isLogin: true })
  }
  return successLoginResult(accountKey === 'super' ? 'super' : 'admin')
}

/** 构造登录成功的响应体 */
function successLoginResult(who: 'admin' | 'super') {
  const name = who === 'admin' ? '系统管理员' : '超级管理员'
  return builder(
    {
      id: Mock.mock('@guid'),
      name,
      username: who,
      password: '',
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
      // 这里 token 随便写一个，真实场景由后端签发 JWT
      token: `mock-token-${who}-${Date.now()}`,
    },
    '登录成功',
  )
}

const logout = () => builder({}, '登出成功')

const smsCaptcha = (options: { body?: string }) => {
  const { mobile } = getBody<{ mobile?: string }>(options)
  const captcha = Mock.mock('@integer(100000, 999999)').toString()
  // 方便前端测试：控制台直接打印下发的验证码
  console.info(`[mock] 已向手机号 ${mobile ?? '未提供'} 发送验证码：${captcha}`)
  return builder({ captcha })
}

const twofactor = () =>
  builder({
    // 0 = 关闭两步验证（登录页就不走二次弹窗验证了）
    stepCode: 0 as const,
  })

/** 注册 */
const register = (options: { body?: string }) => {
  const body = getBody<RegisterParams>(options)
  console.debug('[mock] /auth/register -> body =', body)

  const { username, email, password, confirmPassword } = body

  // 校验
  if (!username?.trim()) {
    return failBuilder('用户名不能为空')
  }
  if (!email?.trim()) {
    return failBuilder('邮箱不能为空')
  }
  if (!/^([\w-])+@([\w-])+((\.[\w-]{2,3}){1,2})$/.test(email)) {
    return failBuilder('邮箱格式不正确')
  }
  if (!password || password.length < 6) {
    return failBuilder('密码至少 6 位')
  }
  if (password !== confirmPassword) {
    return failBuilder('两次输入的密码不一致')
  }

  // 检查用户名是否已注册
  if (VALID_CREDENTIALS[username]) {
    return failBuilder('该用户名已被注册')
  }

  return builder(
    {
      id: Mock.mock('@guid'),
      name: username,
      username,
      password: '',
      avatar:
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
        encodeURIComponent(username),
      status: 1,
      telephone: '',
      lastLoginIp: Mock.mock(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/),
      lastLoginTime: Date.now(),
      creatorId: 'system',
      createTime: Date.now(),
      deleted: 0,
      roleId: 'admin',
      lang: 'zh-CN',
      token: `mock-token-${username}-${Date.now()}`,
    },
    '注册成功',
  )
}

// 注册 mock
// axios baseURL 是 '/api'，所以实际请求 URL 形如 '/api/auth/login'
// 这里用包含匹配（不以 $ 结尾），兼容后续可能加的 query 与 baseURL
Mock.mock(/\/auth\/login/, 'post', login)
Mock.mock(/\/auth\/logout/, 'post', logout)
Mock.mock(/\/account\/sms/, 'post', smsCaptcha)
Mock.mock(/\/auth\/2step-code/, 'post', twofactor)
Mock.mock(/\/auth\/register/, 'post', register)
