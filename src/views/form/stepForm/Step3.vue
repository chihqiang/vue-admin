/**
 * 第三步：操作成功结果页
 * 展示转账信息摘要，提供"再转一笔"和"查看账单"按钮
 */
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CheckCircle } from '@lucide/vue'
import { Button } from '@/components/ui'

const props = defineProps<{
  /** 前面步骤收集的表单数据 */
  formData: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'prevStep'): void
  (e: 'finish'): void
}>()

const router = useRouter()

/** 再转一笔 */
function finish() {
  emit('finish')
}

/** 查看账单 */
function toOrderList() {
  router.push('/list/basic')
}
</script>

<template>
  <div class="max-w-[560px] mx-auto py-10 text-center">
    <!-- 成功图标 -->
    <div class="flex justify-center mb-4">
      <CheckCircle :size="48" class="text-green-500" />
    </div>

    <!-- 标题 -->
    <h2 class="text-xl font-medium text-gray-800 mb-2">操作成功</h2>
    <p class="text-sm text-gray-500 mb-8">预计两小时内到账</p>

    <!-- 转账信息 -->
    <div class="text-left bg-gray-50 rounded-lg p-6 mb-8">
      <div class="flex items-start gap-2 mb-4">
        <span class="w-28 text-sm text-gray-400 flex-shrink-0">付款账户：</span>
        <span class="text-sm text-gray-700">{{ props.formData.paymentUser || '-' }}</span>
      </div>
      <div class="flex items-start gap-2 mb-4">
        <span class="w-28 text-sm text-gray-400 flex-shrink-0">收款账户：</span>
        <span class="text-sm text-gray-700">{{ props.formData.receiverAccount || '-' }}</span>
      </div>
      <div class="flex items-start gap-2 mb-4">
        <span class="w-28 text-sm text-gray-400 flex-shrink-0">收款人姓名：</span>
        <span class="text-sm text-gray-700">{{ props.formData.receiverName || '-' }}</span>
      </div>
      <div class="flex items-start gap-2">
        <span class="w-28 text-sm text-gray-400 flex-shrink-0">转账金额：</span>
        <span class="text-sm text-gray-700">
          <span class="text-xl font-medium">{{ Number(props.formData.amount || 0).toLocaleString() }}</span> 元
        </span>
      </div>
    </div>

    <!-- 按钮 -->
    <div class="flex justify-center gap-3">
      <Button type="primary" @click="finish">再转一笔</Button>
      <Button type="default" @click="toOrderList">查看账单</Button>
    </div>
  </div>
</template>
