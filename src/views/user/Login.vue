<script setup lang="ts">
/**
 * 登录页面
 * 风格：浅灰底 + 柔光光斑 + 居中白色登录卡片
 * 包含：账号密码登录、手机号登录两种模式，记住我，忘记密码，第三方登录入口等
 */
import { reactive, ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
// 引入 @lucide/vue 图标
import {
  User,
  Lock,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  CircleAlert,
  LoaderCircle,
  LogIn,
  ShieldCheck,
} from '@lucide/vue'
// 引入 store、接口、工具
import { useUserStore } from '@/stores/user'
import { getSmsCaptcha } from '@/api/login'
import { md5, timeFix } from '@/utils/util'

const router = useRouter()
const userStore = useUserStore()

// ========== 基本交互状态 ==========

/** 当前激活的 Tab：tab1=账号密码登录，tab2=手机号登录 */
const activeTab = ref<'tab1' | 'tab2'>('tab1')

/** 登录按钮是否加载中（防重复提交） */
const loggingIn = ref(false)

/** 登录是否失败（用于展示顶部错误提示条） */
const isLoginError = ref(false)
const errorMessage = ref('账户或密码错误')

// ========== 表单数据 ==========
/** 账号密码模式表单 */
const accountForm = reactive({
  username: '',
  password: '',
  rememberMe: true,
})

/** 手机号模式表单 */
const mobileForm = reactive({
  mobile: '',
  captcha: '',
})

/** 密码是否明文显示（小眼睛图标控制） */
const passwordVisible = ref(false)

// ========== 手机号验证码相关 ==========
/** 发送验证码按钮是否被禁用 */
const smsDisabled = ref(false)
/** 倒计时剩余秒数 */
const smsCountdown = ref(60)
let smsTimer: number | null = null

/** 组件卸载前清理定时器，防止内存泄漏 */
onBeforeUnmount(() => {
  if (smsTimer) window.clearInterval(smsTimer)
})

// ========== 校验错误（简化版表单校验） ==========
const errors = reactive<{
  username?: string
  password?: string
  mobile?: string
  captcha?: string
}>({})

/** 校验用户名 */
function validateUsername() {
  if (!accountForm.username.trim()) {
    errors.username = '请输入用户名或邮箱'
    return false
  }
  errors.username = undefined
  return true
}

/** 校验密码 */
function validatePassword() {
  if (!accountForm.password) {
    errors.password = '请输入密码'
    return false
  }
  if (accountForm.password.length < 6) {
    errors.password = '密码长度至少 6 位'
    return false
  }
  errors.password = undefined
  return true
}

/** 校验手机号格式（中国大陆 11 位，以 1 开头） */
function validateMobile() {
  if (!mobileForm.mobile.trim()) {
    errors.mobile = '请输入手机号'
    return false
  }
  const reg = /^1[3-9]\d{9}$/
  if (!reg.test(mobileForm.mobile)) {
    errors.mobile = '请输入正确的手机号'
    return false
  }
  errors.mobile = undefined
  return true
}

/** 校验验证码 */
function validateCaptcha() {
  if (!mobileForm.captcha.trim()) {
    errors.captcha = '请输入验证码'
    return false
  }
  if (mobileForm.captcha.length !== 6) {
    errors.captcha = '验证码为 6 位数字'
    return false
  }
  errors.captcha = undefined
  return true
}

// ========== 事件处理 ==========

/** Tab 切换时清理错误状态 */
function onTabChange(key: 'tab1' | 'tab2') {
  activeTab.value = key
  isLoginError.value = false
  Object.keys(errors).forEach((k) => delete errors[k as keyof typeof errors])
}

/** 获取短信验证码：对接接口 + 开启倒计时，失败自动恢复按钮 */
async function handleGetCaptcha() {
  if (!validateMobile() || smsDisabled.value) return

  try {
    const res = await getSmsCaptcha({ mobile: mobileForm.mobile })
    // 为了便于测试，直接弹一个提示显示收到的验证码（正式环境可移除）
    window.alert(`验证码已发送（测试环境验证码为：${res.captcha}）`)
  } catch (e) {
    window.alert(
      e instanceof Error ? e.message : '验证码发送失败，请稍后重试',
    )
    return
  }

  smsDisabled.value = true
  smsCountdown.value = 60

  // 开启倒计时
  smsTimer = window.setInterval(() => {
    smsCountdown.value -= 1
    if (smsCountdown.value <= 0) {
      smsDisabled.value = false
      smsCountdown.value = 60
      if (smsTimer) {
        window.clearInterval(smsTimer)
        smsTimer = null
      }
    }
  }, 1000)
}

/** 登录提交：调用 store.Login -> store.GetInfo -> 跳首页 + 欢迎提示 */
async function handleSubmit() {
  isLoginError.value = false
  let valid = false

  if (activeTab.value === 'tab1') {
    // 账号密码登录校验
    valid = validateUsername() && validatePassword()
  } else {
    // 手机号登录校验
    valid = validateMobile() && validateCaptcha()
  }
  if (!valid) return

  loggingIn.value = true

  try {
    if (activeTab.value === 'tab1') {
      // 判断账号是邮箱还是用户名
      const emailRegex = /^([\w-])+@([\w-])+((\.[\w-]{2,3}){1,2})$/
      const isEmail = emailRegex.test(accountForm.username)
      await userStore.Login(
        {
          [isEmail ? 'email' : 'username']: accountForm.username,
          password: md5(accountForm.password),
          remember_me: accountForm.rememberMe,
        },
        accountForm.rememberMe,
      )
    } else {
      await userStore.Login({
        mobile: mobileForm.mobile,
        captcha: mobileForm.captcha,
      })
    }

    // 登录成功后立即拉取用户信息（含角色权限）
    await userStore.GetInfo()

    // 欢迎提示（使用 timeFix 得出时间段问候）
    window.alert(`${timeFix()}，欢迎回来，${userStore.name}！`)

    // 进入主路由
    await router.push('/')
  } catch (e) {
    isLoginError.value = true
    errorMessage.value =
      (e instanceof Error && e.message) || '登录失败，请稍后再试'
  } finally {
    loggingIn.value = false
  }
}

// ========== 辅助计算 ==========
/** 获取验证码按钮文字（倒计时期间显示 X s） */
const captchaBtnText = computed(() => {
  if (!smsDisabled.value) return '获取验证码'
  return `${smsCountdown.value} s`
})
</script>

<template>
  <!--
    整体登录页容器
    - 背景色：浅灰 #f0f2f5 + 顶部径向渐变蓝光
    - 背景装饰：用 CSS 渐变 + 伪元素实现柔和光斑装饰效果（纯 tailwind 自定义，不依赖图片）
  -->
  <div
    class="relative min-h-screen w-full overflow-hidden bg-[#f0f2f5] bg-[radial-gradient(ellipse_at_top,_#e6f4ff_0%,_#f0f2f5_55%)]"
  >
    <!-- 顶部装饰：右上角落的柔和光斑，增加层次感（纯 CSS，不依赖图片） -->
    <div
      class="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl"
    ></div>

    <!-- 中间内容区 -->
    <div class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4">
      <!-- 顶部：Logo + 标题 + 描述 -->
      <div class="mt-16 mb-10 flex flex-col items-center text-center">
        <a href="/" class="flex items-center gap-3">
          <!-- Logo 图标：蓝色渐变盾牌，表达安全/可信的品牌气质 -->
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/20"
          >
            <ShieldCheck :size="26" :stroke-width="2.2" />
          </div>
          <span
            class="text-[30px] font-semibold leading-[44px] tracking-tight text-[rgba(0,0,0,0.85)]"
            style="font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif"
          >
            vue-tailwind-template
          </span>
        </a>
        <p class="mt-3 text-sm text-[rgba(0,0,0,0.45)]">
          基于 Vue 3 + TypeScript + TailwindCSS 的企业级中后台脚手架
        </p>
      </div>

      <!-- 登录卡片主体：宽度 368px，居中 -->
      <main class="mx-auto w-full max-w-[368px]">
        <!--
          登录卡片区
          浅灰白底 + 轻微阴影 + 细边框，视觉干净且聚焦
        -->
        <section
          class="rounded-2xl bg-white/70 p-8 shadow-[0_6px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/5 backdrop-blur"
        >
          <!-- Tab 切换 -->
          <div class="mb-6 border-b border-gray-200">
            <div class="-mb-px flex gap-8">
              <button
                type="button"
                class="relative pb-3 text-[15px] transition-colors"
                :class="
                  activeTab === 'tab1'
                    ? 'font-medium text-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                "
                @click="onTabChange('tab1')"
              >
                账号密码登录
                <span
                  v-if="activeTab === 'tab1'"
                  class="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-blue-600"
                ></span>
              </button>
              <button
                type="button"
                class="relative pb-3 text-[15px] transition-colors"
                :class="
                  activeTab === 'tab2'
                    ? 'font-medium text-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                "
                @click="onTabChange('tab2')"
              >
                手机号登录
                <span
                  v-if="activeTab === 'tab2'"
                  class="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-blue-600"
                ></span>
              </button>
            </div>
          </div>

          <!-- 登录失败错误提示条 -->
          <div
            v-if="isLoginError"
            class="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            <CircleAlert :size="18" class="mt-0.5 shrink-0 text-red-500" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- ===== Tab1：账号密码登录 ===== -->
          <div v-show="activeTab === 'tab1'" class="space-y-5">
            <!-- 用户名输入框 -->
            <div>
              <div
                class="flex h-10 items-center rounded-md border bg-white px-3 transition-all"
                :class="
                  errors.username
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
                "
              >
                <User :size="16" class="mr-2 shrink-0 text-gray-400" />
                <input
                  v-model="accountForm.username"
                  type="text"
                  class="h-full w-full border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                  placeholder="请输入用户名或邮箱"
                  @blur="validateUsername"
                  @input="errors.username && validateUsername()"
                />
              </div>
              <p v-if="errors.username" class="mt-1 text-xs text-red-500">
                {{ errors.username }}
              </p>
            </div>

            <!-- 密码输入框（带显隐切换小眼睛） -->
            <div>
              <div
                class="flex h-10 items-center rounded-md border bg-white px-3 transition-all"
                :class="
                  errors.password
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
                "
              >
                <Lock :size="16" class="mr-2 shrink-0 text-gray-400" />
                <input
                  v-model="accountForm.password"
                  :type="passwordVisible ? 'text' : 'password'"
                  class="h-full w-full border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                  placeholder="请输入密码"
                  @blur="validatePassword"
                  @input="errors.password && validatePassword()"
                />
                <button
                  type="button"
                  class="ml-2 text-gray-400 transition-colors hover:text-gray-600"
                  @click="passwordVisible = !passwordVisible"
                  tabindex="-1"
                >
                  <EyeOff v-if="passwordVisible" :size="16" />
                  <Eye v-else :size="16" />
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-xs text-red-500">
                {{ errors.password }}
              </p>
            </div>
          </div>

          <!-- ===== Tab2：手机号登录 ===== -->
          <div v-show="activeTab === 'tab2'" class="space-y-5">
            <!-- 手机号输入框 -->
            <div>
              <div
                class="flex h-10 items-center rounded-md border bg-white px-3 transition-all"
                :class="
                  errors.mobile
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
                "
              >
                <Smartphone :size="16" class="mr-2 shrink-0 text-gray-400" />
                <input
                  v-model="mobileForm.mobile"
                  type="tel"
                  maxlength="11"
                  class="h-full w-full border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                  placeholder="请输入手机号"
                  @blur="validateMobile"
                  @input="errors.mobile && validateMobile()"
                />
              </div>
              <p v-if="errors.mobile" class="mt-1 text-xs text-red-500">
                {{ errors.mobile }}
              </p>
            </div>

            <!-- 验证码 + 获取验证码按钮（2 列布局：16 / 8） -->
            <div class="grid grid-cols-10 gap-4">
              <div class="col-span-6">
                <div
                  class="flex h-10 items-center rounded-md border bg-white px-3 transition-all"
                  :class="
                    errors.captcha
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
                  "
                >
                  <Mail :size="16" class="mr-2 shrink-0 text-gray-400" />
                  <input
                    v-model="mobileForm.captcha"
                    type="text"
                    maxlength="6"
                    class="h-full w-full border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                    placeholder="请输入验证码"
                    @blur="validateCaptcha"
                    @input="errors.captcha && validateCaptcha()"
                  />
                </div>
                <p v-if="errors.captcha" class="mt-1 text-xs text-red-500">
                  {{ errors.captcha }}
                </p>
              </div>
              <div class="col-span-4">
                <button
                  type="button"
                  :disabled="smsDisabled"
                  class="h-10 w-full rounded-md border border-blue-500 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  @click="handleGetCaptcha"
                >
                  {{ captchaBtnText }}
                </button>
              </div>
            </div>
          </div>

          <!-- 记住我 + 忘记密码（仅账号密码模式显示） -->
          <div
            v-show="activeTab === 'tab1'"
            class="mt-5 flex items-center justify-between text-sm"
          >
            <label class="inline-flex cursor-pointer items-center gap-2 text-gray-600">
              <input
                v-model="accountForm.rememberMe"
                type="checkbox"
                class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>记住我</span>
            </label>
            <a
              href="#"
              class="text-gray-500 transition-colors hover:text-blue-600"
              @click.prevent="() => {}"
            >
              忘记密码？
            </a>
          </div>

          <!-- 登录按钮 -->
          <div class="mt-6">
            <button
              type="button"
              :disabled="loggingIn"
              class="flex h-10 w-full items-center justify-center rounded-md bg-blue-500 px-4 text-[16px] font-medium text-white shadow-sm transition-all hover:bg-blue-600 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              @click="handleSubmit"
            >
              <LoaderCircle
                v-if="loggingIn"
                :size="18"
                class="mr-2 animate-spin text-white"
              />
              <LogIn v-else :size="18" class="mr-2" />
              <span>{{ loggingIn ? '登录中...' : '登 录' }}</span>
            </button>
          </div>

          <!-- 其他登录方式 + 注册入口 -->
          <div class="mt-6 flex items-center justify-between text-sm">
            <div class="flex items-center gap-3 text-gray-400">
              <span class="whitespace-nowrap">其他登录方式：</span>
              <!-- 支付宝（天蓝色圆形图标） -->
              <a
                href="#"
                class="flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold text-white transition-transform hover:scale-110"
                style="background-color: #1677ff"
                title="支付宝"
                @click.prevent="() => {}"
              >
                支
              </a>
              <!-- 淘宝（橙色圆形图标） -->
              <a
                href="#"
                class="flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold text-white transition-transform hover:scale-110"
                style="background-color: #ff5000"
                title="淘宝"
                @click.prevent="() => {}"
              >
                淘
              </a>
              <!-- 微博（红色圆形图标） -->
              <a
                href="#"
                class="flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold text-white transition-transform hover:scale-110"
                style="background-color: #e6162d"
                title="微博"
                @click.prevent="() => {}"
              >
                微
              </a>
            </div>
            <a
              href="#"
              class="text-blue-600 transition-colors hover:text-blue-700"
              @click.prevent="() => {}"
            >
              注册账户
            </a>
          </div>
        </section>
      </main>

      <!-- 页脚：帮助 / 隐私 / 条款 + 版权 -->
      <footer class="mt-auto pt-12 pb-8 text-center">
        <div class="mb-2 text-sm text-gray-500">
          <a href="#" class="transition-colors hover:text-blue-600" @click.prevent>帮助</a>
          <span class="mx-5 text-gray-300">/</span>
          <a href="#" class="transition-colors hover:text-blue-600" @click.prevent>隐私</a>
          <span class="mx-5 text-gray-300">/</span>
          <a href="#" class="transition-colors hover:text-blue-600" @click.prevent>条款</a>
        </div>
        <div class="text-sm text-gray-400">Copyright © 2024 vue-tailwind-template</div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* 对 checkbox 的默认样式做一点细节优化 */
input[type='checkbox'] {
  accent-color: #1677ff;
}
</style>
