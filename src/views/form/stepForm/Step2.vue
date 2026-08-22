/**
 * 第二步：确认转账信息 + 输入支付密码
 * 展示第一步填写的只读信息，提交后模拟延迟跳第三步
 */
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { Alert, Input, Button } from '@/components/ui'

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
    <div class="mb-6">
      <Alert type="warning" description="确认转账后，资金将直接打入对方账户，无法退回。" />
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
      <label class="w-24 text-sm text-gray-700 text-right pt-1.5 flex-shrink-0">支付密码</label>
      <div class="flex-1">
        <Input
          v-model="paymentPassword"
          type="password"
          placeholder="请输入支付密码"
          custom-class="w-4/5"
        />
        <p v-if="passwordError" class="text-xs text-red-500 mt-1">{{ passwordError }}</p>
      </div>
    </div>

    <!-- 按钮 -->
    <div class="ml-28 flex gap-2">
      <Button type="primary" :loading="loading" @click="nextStep">
        {{ loading ? '提交中...' : '提交' }}
      </Button>
      <Button type="default" @click="prevStep">上一步</Button>
    </div>
  </div>
</template>
