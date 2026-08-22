/**
 * 账号密码登录表单
 * 包含用户名、密码输入、密码显隐切换、记住我、忘记密码
 * 通过 defineExpose 暴露 validate() 和 getFormData() 供父组件调用
 */
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { User, Lock, Eye, EyeOff } from '@lucide/vue'

// ========== 表单数据 ==========
const form = reactive({
  username: '',
  password: '',
  rememberMe: true,
})

/** 密码是否明文显示 */
const passwordVisible = ref(false)

// ========== 校验 ==========
const errors = reactive<{ username?: string; password?: string }>({})

/** 校验用户名 */
function validateUsername() {
  if (!form.username.trim()) {
    errors.username = '请输入用户名或邮箱'
    return false
  }
  errors.username = undefined
  return true
}

/** 校验密码 */
function validatePassword() {
  if (!form.password) {
    errors.password = '请输入密码'
    return false
  }
  if (form.password.length < 6) {
    errors.password = '密码长度至少 6 位'
    return false
  }
  errors.password = undefined
  return true
}

/** 整体校验 */
function validate() {
  return validateUsername() && validatePassword()
}

/** 获取表单数据 */
function getFormData() {
  return { ...form }
}

/** 清空错误 */
function clearErrors() {
  errors.username = undefined
  errors.password = undefined
}

// 暴露给父组件
defineExpose({ validate, getFormData, clearErrors })
</script>

<template>
  <div class="space-y-5">
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
          v-model="form.username"
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
          v-model="form.password"
          :type="passwordVisible ? 'text' : 'password'"
          class="h-full w-full border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          placeholder="请输入密码"
          @blur="validatePassword"
          @input="errors.password && validatePassword()"
        />
        <button
          type="button"
          class="ml-2 text-gray-400 transition-colors hover:text-gray-600"
          tabindex="-1"
          @click="passwordVisible = !passwordVisible"
        >
          <EyeOff v-if="passwordVisible" :size="16" />
          <Eye v-else :size="16" />
        </button>
      </div>
      <p v-if="errors.password" class="mt-1 text-xs text-red-500">
        {{ errors.password }}
      </p>
    </div>

    <!-- 记住我 + 忘记密码 -->
    <div class="flex items-center justify-between text-sm">
      <label class="inline-flex cursor-pointer items-center gap-2 text-gray-600">
        <input
          v-model="form.rememberMe"
          type="checkbox"
          class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span>记住我</span>
      </label>
      <a
        href="#"
        class="text-gray-500 transition-colors hover:text-blue-600"
        @click.prevent
      >
        忘记密码？
      </a>
    </div>
  </div>
</template>

<style scoped>
input[type='checkbox'] {
  accent-color: #1677ff;
}
</style>
