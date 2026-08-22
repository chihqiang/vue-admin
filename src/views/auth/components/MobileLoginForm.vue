/**
 * 手机号验证码登录表单
 * 包含手机号输入、验证码输入、获取验证码倒计时
 * 通过 defineExpose 暴露 validate() 和 getFormData() 供父组件调用
 */
<script setup lang="ts">
import { reactive, ref, computed, onBeforeUnmount } from 'vue'
import { Smartphone, Mail } from '@lucide/vue'
import { getSmsCaptcha } from '@/api/login'

// ========== 表单数据 ==========
const form = reactive({
  mobile: '',
  captcha: '',
})

// ========== 校验 ==========
const errors = reactive<{ mobile?: string; captcha?: string }>({})

/** 校验手机号格式（中国大陆 11 位，以 1 开头） */
function validateMobile() {
  if (!form.mobile.trim()) {
    errors.mobile = '请输入手机号'
    return false
  }
  const reg = /^1[3-9]\d{9}$/
  if (!reg.test(form.mobile)) {
    errors.mobile = '请输入正确的手机号'
    return false
  }
  errors.mobile = undefined
  return true
}

/** 校验验证码 */
function validateCaptcha() {
  if (!form.captcha.trim()) {
    errors.captcha = '请输入验证码'
    return false
  }
  if (form.captcha.length !== 6) {
    errors.captcha = '验证码为 6 位数字'
    return false
  }
  errors.captcha = undefined
  return true
}

/** 整体校验 */
function validate() {
  return validateMobile() && validateCaptcha()
}

/** 获取表单数据 */
function getFormData() {
  return { ...form }
}

/** 清空错误 */
function clearErrors() {
  errors.mobile = undefined
  errors.captcha = undefined
}

// ========== 获取验证码倒计时 ==========
const smsDisabled = ref(false)
const smsCountdown = ref(60)
let smsTimer: number | null = null

/** 获取验证码按钮文字 */
const captchaBtnText = computed(() => {
  if (!smsDisabled.value) return '获取验证码'
  return `${smsCountdown.value} s`
})

/** 获取短信验证码 */
async function handleGetCaptcha() {
  if (!validateMobile() || smsDisabled.value) return

  try {
    const res = await getSmsCaptcha({ mobile: form.mobile })
    window.alert(`验证码已发送（测试环境验证码为：${res.captcha}）`)
  } catch (e) {
    window.alert(e instanceof Error ? e.message : '验证码发送失败，请稍后重试')
    return
  }

  smsDisabled.value = true
  smsCountdown.value = 60

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

onBeforeUnmount(() => {
  if (smsTimer) window.clearInterval(smsTimer)
})

defineExpose({ validate, getFormData, clearErrors })
</script>

<template>
  <div class="space-y-5">
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
          v-model="form.mobile"
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

    <!-- 验证码 + 获取验证码按钮 -->
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
            v-model="form.captcha"
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
</template>
