/**
 * 第一步：填写转账信息
 * 付款账户、收款账户（支付方式+账号）、收款人姓名、转账金额
 * 校验通过后 emit nextStep + 表单数据
 */
<script setup lang="ts">
import { reactive, ref } from 'vue'

const emit = defineEmits<{
  (e: 'nextStep', data: Record<string, unknown>): void
}>()

/** 表单数据 */
const form = reactive({
  /** 付款账户 */
  paymentUser: '',
  /** 收款支付方式 */
  payType: 'alipay',
  /** 收款账户 */
  receiverAccount: 'test@example.com',
  /** 收款人姓名 */
  receiverName: 'Alex',
  /** 转账金额 */
  amount: '5000',
})

/** 校验错误 */
const errors = reactive<Record<string, string>>({})

/** 付款账户选项 */
const paymentOptions = [
  { label: 'ant-design@alipay.com', value: 'ant-design@alipay.com' },
]

/** 支付方式选项 */
const payTypeOptions = [
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wexinpay' },
]

/** 校验 */
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.paymentUser) errors.paymentUser = '付款账户必须填写'
  if (!form.receiverAccount) errors.receiverAccount = '收款账户必须填写'
  if (!form.receiverName.trim()) errors.receiverName = '收款人名称必须核对'
  if (!form.amount) errors.amount = '转账金额必须填写'
  return Object.keys(errors).length === 0
}

/** 下一步 */
function nextStep() {
  if (!validate()) return
  emit('nextStep', { ...form })
}
</script>

<template>
  <div>
    <!-- 表单 -->
    <div class="max-w-[500px] mx-auto py-10">
      <!-- 付款账户 -->
      <div class="flex items-start gap-4 mb-6">
        <label class="w-24 text-sm text-gray-700 text-right pt-2 flex-shrink-0">付款账户</label>
        <div class="flex-1">
          <select
            v-model="form.paymentUser"
            class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            :class="errors.paymentUser ? 'border-red-300' : 'border-gray-200'"
          >
            <option value="">请选择付款账户</option>
            <option v-for="opt in paymentOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <p v-if="errors.paymentUser" class="text-xs text-red-500 mt-1">{{ errors.paymentUser }}</p>
        </div>
      </div>

      <!-- 收款账户 -->
      <div class="flex items-start gap-4 mb-6">
        <label class="w-24 text-sm text-gray-700 text-right pt-2 flex-shrink-0">收款账户</label>
        <div class="flex-1 flex">
          <select
            v-model="form.payType"
            class="w-28 px-3 py-2 text-sm border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 border-gray-200 flex-shrink-0"
          >
            <option v-for="opt in payTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <input
            v-model="form.receiverAccount"
            type="text"
            placeholder="请输入收款账户"
            class="flex-1 px-3 py-2 text-sm border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            :class="errors.receiverAccount ? 'border-red-300' : 'border-gray-200'"
          />
        </div>
      </div>
      <div v-if="errors.receiverAccount" class="ml-28 -mt-4 mb-6">
        <p class="text-xs text-red-500">{{ errors.receiverAccount }}</p>
      </div>

      <!-- 收款人姓名 -->
      <div class="flex items-start gap-4 mb-6">
        <label class="w-24 text-sm text-gray-700 text-right pt-2 flex-shrink-0">收款人姓名</label>
        <div class="flex-1">
          <input
            v-model="form.receiverName"
            type="text"
            placeholder="请输入收款人姓名"
            class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            :class="errors.receiverName ? 'border-red-300' : 'border-gray-200'"
          />
          <p v-if="errors.receiverName" class="text-xs text-red-500 mt-1">{{ errors.receiverName }}</p>
        </div>
      </div>

      <!-- 转账金额 -->
      <div class="flex items-start gap-4 mb-6">
        <label class="w-24 text-sm text-gray-700 text-right pt-2 flex-shrink-0">转账金额</label>
        <div class="flex-1 relative">
          <span class="absolute left-3 top-2.5 text-sm text-gray-400">￥</span>
          <input
            v-model="form.amount"
            type="number"
            placeholder="请输入金额"
            class="w-full pl-7 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            :class="errors.amount ? 'border-red-300' : 'border-gray-200'"
          />
          <p v-if="errors.amount" class="text-xs text-red-500 mt-1">{{ errors.amount }}</p>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="ml-28">
        <button
          type="button"
          @click="nextStep"
          class="px-6 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          下一步
        </button>
      </div>
    </div>

    <!-- 分割线 -->
    <hr class="border-gray-100 my-4" />

    <!-- 说明 -->
    <div class="px-8 text-gray-400">
      <h3 class="text-base mb-3">说明</h3>
      <h4 class="text-sm mb-1">转账到支付宝账户</h4>
      <p class="text-sm leading-relaxed mb-3">
        如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。
      </p>
      <h4 class="text-sm mb-1">转账到银行卡</h4>
      <p class="text-sm leading-relaxed">
        如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。
      </p>
    </div>
  </div>
</template>
