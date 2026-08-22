/**
 * 注册页面
 * 风格与登录页保持一致：浅灰底 + 柔光光斑 + 居中白色卡片
 * 注册成功后返回 token，自动跳转首页
 */
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Mail, Lock, Eye, EyeOff } from '@lucide/vue'
import { Input, Button, message } from '@/components'
import { register } from '@/api/login'
import { useUserStore } from '@/stores/user'
import LoginHeader from './components/LoginHeader.vue'
import LoginFooter from './components/LoginFooter.vue'

const router = useRouter()
const userStore = useUserStore()

// ========== 表单数据 ==========
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const registering = ref(false)

// ========== 校验 ==========
const errors = reactive<{
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
}>({})

function validateUsername() {
  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    return false
  }
  if (form.username.trim().length < 2) {
    errors.username = '用户名至少 2 个字符'
    return false
  }
  errors.username = undefined
  return true
}

function validateEmail() {
  if (!form.email.trim()) {
    errors.email = '请输入邮箱'
    return false
  }
  const reg = /^([\w-])+@([\w-])+((\.[\w-]{2,3}){1,2})$/
  if (!reg.test(form.email)) {
    errors.email = '邮箱格式不正确'
    return false
  }
  errors.email = undefined
  return true
}

function validatePassword() {
  if (!form.password) {
    errors.password = '请输入密码'
    return false
  }
  if (form.password.length < 6) {
    errors.password = '密码至少 6 位'
    return false
  }
  errors.password = undefined
  return true
}

function validateConfirmPassword() {
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    return false
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = '两次输入的密码不一致'
    return false
  }
  errors.confirmPassword = undefined
  return true
}

function validate() {
  return (
    validateUsername() &&
    validateEmail() &&
    validatePassword() &&
    validateConfirmPassword()
  )
}

async function handleRegister() {
  if (!validate()) return

  registering.value = true
  try {
    const result = await register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    })
    // 注册成功后保存 token，自动拉取用户信息并跳转首页
    userStore.setToken(result.token)
    await userStore.fetchUserInfo()
    message.success('注册成功，欢迎加入！')
    await router.push('/')
  } catch (e) {
    message.error(e instanceof Error ? e.message : '注册失败，请稍后再试')
  } finally {
    registering.value = false
  }
}

/** 错误态输入框样式 */
function errorClass(err?: string) {
  return err
    ? 'border-red-400 ring-2 ring-red-100 hover:border-red-400 focus:border-red-400 focus:ring-red-100'
    : ''
}
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f7fa] via-[#eef2f7] to-[#e8edf5] px-4"
  >
    <!-- 柔光光斑装饰 -->
    <div
      class="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-white/60 to-transparent blur-3xl"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-tl from-white/60 to-transparent blur-3xl"
    />

    <div
      class="relative w-full max-w-[420px] rounded-2xl bg-white/90 px-10 pb-12 pt-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-md"
    >
      <!-- 头部 -->
      <LoginHeader description="创建新账户，开始使用" />

      <!-- 注册表单 -->
      <div class="mt-8 space-y-5">
        <!-- 用户名 -->
        <div>
          <Input
            v-model="form.username"
            size="lg"
            placeholder="请输入用户名"
            :custom-class="errorClass(errors.username)"
            @blur="validateUsername"
            @change="errors.username && validateUsername()"
          >
            <template #prefix><User :size="16" /></template>
          </Input>
          <p v-if="errors.username" class="mt-1 text-xs text-red-500">
            {{ errors.username }}
          </p>
        </div>

        <!-- 邮箱 -->
        <div>
          <Input
            v-model="form.email"
            size="lg"
            placeholder="请输入邮箱"
            :custom-class="errorClass(errors.email)"
            @blur="validateEmail"
            @change="errors.email && validateEmail()"
          >
            <template #prefix><Mail :size="16" /></template>
          </Input>
          <p v-if="errors.email" class="mt-1 text-xs text-red-500">
            {{ errors.email }}
          </p>
        </div>

        <!-- 密码 -->
        <div>
          <Input
            v-model="form.password"
            :type="passwordVisible ? 'text' : 'password'"
            size="lg"
            placeholder="请输入密码（至少 6 位）"
            :custom-class="errorClass(errors.password)"
            @blur="validatePassword"
            @change="errors.password && validatePassword()"
          >
            <template #prefix><Lock :size="16" /></template>
            <template #suffix>
              <button
                type="button"
                class="text-gray-400 transition-colors hover:text-gray-600"
                tabindex="-1"
                @click="passwordVisible = !passwordVisible"
              >
                <EyeOff v-if="passwordVisible" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </template>
          </Input>
          <p v-if="errors.password" class="mt-1 text-xs text-red-500">
            {{ errors.password }}
          </p>
        </div>

        <!-- 确认密码 -->
        <div>
          <Input
            v-model="form.confirmPassword"
            :type="confirmPasswordVisible ? 'text' : 'password'"
            size="lg"
            placeholder="请再次输入密码"
            :custom-class="errorClass(errors.confirmPassword)"
            @blur="validateConfirmPassword"
            @change="errors.confirmPassword && validateConfirmPassword()"
          >
            <template #prefix><Lock :size="16" /></template>
            <template #suffix>
              <button
                type="button"
                class="text-gray-400 transition-colors hover:text-gray-600"
                tabindex="-1"
                @click="confirmPasswordVisible = !confirmPasswordVisible"
              >
                <EyeOff v-if="confirmPasswordVisible" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </template>
          </Input>
          <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">
            {{ errors.confirmPassword }}
          </p>
        </div>
      </div>

      <!-- 注册按钮 -->
      <Button
        type="primary"
        size="lg"
        block
        class="mt-8"
        :loading="registering"
        @click="handleRegister"
      >
        注 册
      </Button>

      <!-- 已有账号？去登录 -->
      <div class="mt-6 text-center">
        <span class="text-sm text-gray-400">已有账号？</span>
        <router-link
          to="/login"
          class="ml-1 text-sm text-blue-600 transition-colors hover:text-blue-700"
        >
          去登录
        </router-link>
      </div>

      <!-- 页脚 -->
      <LoginFooter />
    </div>
  </div>
</template>