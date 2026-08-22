/**
 * 账号密码登录表单
 * 包含用户名、密码输入、密码显隐切换、记住我、忘记密码
 * 通过 defineExpose 暴露 validate() 和 getFormData() 供父组件调用
 */
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { User, Lock, Eye, EyeOff } from '@lucide/vue'
import { Input, Checkbox } from '@/components/ui'

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

/** 错误态输入框样式（覆盖默认边框） */
function errorClass(err?: string) {
  return err
    ? 'border-red-400 ring-2 ring-red-100 hover:border-red-400 focus:border-red-400 focus:ring-red-100'
    : ''
}
</script>

<template>
  <div class="space-y-5">
    <!-- 用户名输入框 -->
    <div>
      <Input
        v-model="form.username"
        size="lg"
        placeholder="请输入用户名或邮箱"
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

    <!-- 密码输入框（带显隐切换小眼睛） -->
    <div>
      <Input
        v-model="form.password"
        :type="passwordVisible ? 'text' : 'password'"
        size="lg"
        placeholder="请输入密码"
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

    <!-- 记住我 + 忘记密码 -->
    <div class="flex items-center justify-between text-sm">
      <Checkbox v-model:checked="form.rememberMe">记住我</Checkbox>
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
