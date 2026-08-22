/**
 * 登录页面
 * 风格：浅灰底 + 柔光光斑 + 居中白色登录卡片
 * 组装子组件：LoginHeader / AccountLoginForm / MobileLoginForm / SocialLogin / LoginFooter
 */
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogIn } from '@lucide/vue'
import { useUserStore } from '@/stores/user'
import { md5, timeFix } from '@/utils/util'
import { Alert, Button, message } from '@/components/ui'
import LoginHeader from './components/LoginHeader.vue'
import AccountLoginForm from './components/AccountLoginForm.vue'
import MobileLoginForm from './components/MobileLoginForm.vue'
import SocialLogin from './components/SocialLogin.vue'
import LoginFooter from './components/LoginFooter.vue'

const router = useRouter()
const userStore = useUserStore()

// ========== Tab 切换 ==========
/** 当前激活的 Tab：tab1=账号密码登录，tab2=手机号登录 */
const activeTab = ref<'tab1' | 'tab2'>('tab1')

// ========== 登录状态 ==========
const loggingIn = ref(false)
const isLoginError = ref(false)
const errorMessage = ref('账户或密码错误')

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

/** 登录提交 */
async function handleSubmit() {
  isLoginError.value = false

  if (activeTab.value === 'tab1') {
    // 账号密码登录
    if (!accountFormRef.value?.validate()) return
    const data = accountFormRef.value.getFormData()

    loggingIn.value = true
    try {
      // 判断账号是邮箱还是用户名
      const emailRegex = /^([\w-])+@([\w-])+((\.[\w-]{2,3}){1,2})$/
      const isEmail = emailRegex.test(data.username)
      await userStore.Login(
        {
          [isEmail ? 'email' : 'username']: data.username,
          password: md5(data.password),
          remember_me: data.rememberMe,
        },
        data.rememberMe,
      )
      await userStore.GetInfo()
      message.success(`${timeFix()}，欢迎回来，${userStore.name}！`)
      await router.push('/')
    } catch (e) {
      isLoginError.value = true
      errorMessage.value = (e instanceof Error && e.message) || '登录失败，请稍后再试'
    } finally {
      loggingIn.value = false
    }
  } else {
    // 手机号登录
    if (!mobileFormRef.value?.validate()) return
    const data = mobileFormRef.value.getFormData()

    loggingIn.value = true
    try {
      await userStore.Login({
        mobile: data.mobile,
        captcha: data.captcha,
      })
      await userStore.GetInfo()
      message.success(`${timeFix()}，欢迎回来，${userStore.name}！`)
      await router.push('/')
    } catch (e) {
      isLoginError.value = true
      errorMessage.value = (e instanceof Error && e.message) || '登录失败，请稍后再试'
    } finally {
      loggingIn.value = false
    }
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
        </section>
      </main>

      <!-- 页脚 -->
      <LoginFooter />
    </div>
  </div>
</template>
