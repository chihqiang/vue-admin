/**
 * 登录页面
 * 风格：浅灰底 + 柔光光斑 + 居中白色登录卡片
 * 组装子组件：LoginHeader / AccountLoginForm / MobileLoginForm / SocialLogin / LoginFooter
 *
 * 每个登录方式的校验+API 调用逻辑由对应子组件（AccountLoginForm / MobileLoginForm）自行管理，
 * 父组件只负责协调 Tab 切换、错误提示、登录成功后的跳转。
 */
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LogIn } from '@lucide/vue'
import { useUserStore } from '@/stores/user'
import { timeFix } from '@/utils/util'
import { Alert, Button, message } from '@/components'
import LoginHeader from './components/LoginHeader.vue'
import AccountLoginForm from './components/AccountLoginForm.vue'
import MobileLoginForm from './components/MobileLoginForm.vue'
import SocialLogin from './components/SocialLogin.vue'
import LoginFooter from './components/LoginFooter.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/** 是否开发环境（控制测试账号提示显示） */
const isDev = import.meta.env.DEV

// ========== Tab 切换 ==========
/** 当前激活的 Tab：tab1=账号密码登录，tab2=手机号登录 */
const activeTab = ref<'tab1' | 'tab2'>('tab1')

// ========== 登录状态 ==========
const loggingIn = ref(false)
const isLoginError = ref(false)
const errorMessage = ref('')

// ========== 子组件引用 ==========
const accountFormRef = ref<InstanceType<typeof AccountLoginForm>>()
const mobileFormRef = ref<InstanceType<typeof MobileLoginForm>>()

/** Tab 切换时清理错误状态 */
function onTabChange(key: 'tab1' | 'tab2') {
  activeTab.value = key
  isLoginError.value = false
  accountFormRef.value?.clearErrors()
  mobileFormRef.value?.clearErrors()
}

/**
 * 登录成功后跳转目标
 * - 优先回跳到被 401 拦截前所在的页面（来自 query.redirect）
 * - 校验只允许同源相对路径（以 / 开头），避免开放重定向风险
 * - 无 redirect 时跳首页
 */
function getRedirectTarget(): string {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/')
    ? redirect
    : '/'
}

/** 登录提交：委托给当前激活的表单组件执行登录，父组件只处理结果 */
async function handleSubmit() {
  isLoginError.value = false
  loggingIn.value = true

  try {
    if (activeTab.value === 'tab1') {
      await accountFormRef.value?.submitLogin()
    } else {
      await mobileFormRef.value?.submitLogin()
    }
    // 登录成功：欢迎语 + 跳转
    message.success(`${timeFix()}，欢迎回来，${userStore.name}！`)
    await router.push(getRedirectTarget())
  } catch (e) {
    isLoginError.value = true
    errorMessage.value = (e instanceof Error && e.message) || '登录失败，请稍后再试'
  } finally {
    loggingIn.value = false
  }
}
</script>

<template>
  <!-- 整体容器：浅灰底 + 径向渐变蓝光 + 装饰光斑 -->
  <div
    class="relative min-h-screen w-full overflow-hidden bg-[#f0f2f5] bg-[radial-gradient(ellipse_at_top,_#e6f4ff_0%,_#f0f2f5_55%)]"
  >
    <!-- 背景装饰光斑 -->
    <div
      class="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl"
    ></div>

    <!-- 内容区 -->
    <div class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4">
      <!-- 头部：Logo + 标题 -->
      <LoginHeader />

      <!-- 登录卡片 -->
      <main class="mx-auto w-full max-w-[368px]">
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
          <div v-if="isLoginError" class="mb-5">
            <Alert type="error" :description="errorMessage" />
          </div>

          <!-- Tab1：账号密码登录 -->
          <div v-show="activeTab === 'tab1'">
            <AccountLoginForm ref="accountFormRef" />
          </div>

          <!-- Tab2：手机号登录 -->
          <div v-show="activeTab === 'tab2'">
            <MobileLoginForm ref="mobileFormRef" />
          </div>

          <!-- 登录按钮 -->
          <div class="mt-6">
            <Button
              type="primary"
              size="lg"
              block
              :loading="loggingIn"
              :disabled="loggingIn"
              custom-class="!h-10 !text-[16px]"
              @click="handleSubmit"
            >
              <template #icon><LogIn :size="18" /></template>
              {{ loggingIn ? '登录中...' : '登 录' }}
            </Button>
          </div>

          <!-- 第三方登录 + 注册 -->
          <SocialLogin />

          <!-- 测试账号提示（仅开发环境显示） -->
          <div
            v-if="isDev"
            class="mt-5 rounded-lg bg-blue-50/80 p-3 text-[12px] leading-relaxed text-blue-600 ring-1 ring-blue-200/60"
          >
            <p class="mb-1 font-medium">Mock 环境测试账号：</p>
            <p>超级管理员：<code class="font-mono">super</code> / <code class="font-mono">super</code>（所有权限）</p>
            <p>普通用户：<code class="font-mono">user</code> / <code class="font-mono">user</code>（无系统管理/日志）</p>
          </div>
        </section>
      </main>

      <!-- 页脚 -->
      <LoginFooter />
    </div>
  </div>
</template>
