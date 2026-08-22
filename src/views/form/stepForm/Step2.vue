/**
 * 第二步：确认转账信息 + 输入支付密码
 * 展示第一步填写的只读信息，提交后模拟延迟跳第三步
 */
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps<{
  /** 第一步收集的表单数据 */
  formData: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'nextStep'): void
  (e: 'prevStep'): void
}>()

/** 支付密码 */
const paymentPassword = ref('123456')
const passwordError = ref('')
const loading = ref(false)
let timer: number | null = null

/** 提交 */
function nextStep() {
  if (!paymentPassword.value) {
    passwordError.value = '请输入支付密码'
    return
  }
  loading.value = true
  timer = window.setTimeout(() => {
    loading.value = false
    emit('nextStep')
  }, 1500)
}

/** 上一步 */
function prevStep() {
  emit('prevStep')
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="max-w-[500px] mx-auto py-10">
    <!-- 警告提示 -->
    <div class="flex items-center gap-2 mb-6 px-4 py-3 bg-orange-50 border border-orange-200 rounded-md">
      <span class="text-orange-500 text-sm">⚠</span>
      <span class="text-sm text-orange-600">确认转账后，资金将直接打入对方账户，无法退回。</span>
    </div>

    <!-- 只读信息 -->
    <div class="space-y-4 mb-6">
      <div class="flex items-start gap-4">
        <label class="w-24 text-sm text-gray-500 text-right pt-0.5 flex-shrink-0">付款账户</label>
        <span class="text-sm text-gray-700">{{ props.formData.paymentUser || '-' }}</span>
      </div>
      <div class="flex items-start gap-4">
        <label class="w-24 text-sm text-gray-500 text-right pt-0.5 flex-shrink-0">收款账户</label>
        <span class="text-sm text-gray-700">{{ props.formData.receiverAccount || '-' }}</span>
      </div>
      <div class="flex items-start gap-4">
        <label class="w-24 text-sm text-gray-500 text-right pt-0.5 flex-shrink-0">收款人姓名</label>
        <span class="text-sm text-gray-700">{{ props.formData.receiverName || '-' }}</span>
      </div>
      <div class="flex items-start gap-4">
        <label class="w-24 text-sm text-gray-500 text-right pt-0.5 flex-shrink-0">转账金额</label>
        <span class="text-sm text-gray-700">￥ {{ Number(props.formData.amount || 0).toLocaleString() }}.00</span>
      </div>
    </div>

    <!-- 分割线 -->
    <hr class="border-gray-100 mb-6" />

    <!-- 支付密码 -->
    <div class="flex items-start gap-4 mb-6">
      <label class="w-24 text-sm text-gray-700 text-right pt-2 flex-shrink-0">支付密码</label>
      <div class="flex-1">
        <input
          v-model="paymentPassword"
          type="password"
          placeholder="请输入支付密码"
          class="w-4/5 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="passwordError ? 'border-red-300' : 'border-gray-200'"
        />
        <p v-if="passwordError" class="text-xs text-red-500 mt-1">{{ passwordError }}</p>
      </div>
    </div>

    <!-- 按钮 -->
    <div class="ml-28">
      <button
        type="button"
        :disabled="loading"
        @click="nextStep"
        class="px-6 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mr-2"
      >
        {{ loading ? '提交中...' : '提交' }}
      </button>
      <button
        type="button"
        @click="prevStep"
        class="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
      >
        上一步
      </button>
    </div>
  </div>
</template>
