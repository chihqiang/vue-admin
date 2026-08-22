/**
 * 分步表单页面 /form/step-form
 * 通过步骤条引导用户完成填写转账信息 → 确认转账 → 完成
 * 子组件 Step1/Step2/Step3 通过 emit 事件控制流程
 */
<script setup lang="ts">
import { ref } from 'vue'
import { Card, Steps } from '@/components/ui'
import Step1 from './Step1.vue'
import Step2 from './Step2.vue'
import Step3 from './Step3.vue'

/** 当前步骤索引（0/1/2） */
const currentTab = ref(0)

/** 步骤条配置 */
const steps = [
  { title: '填写转账信息' },
  { title: '确认转账信息' },
  { title: '完成' },
]

/** 第一步收集的表单数据，传递给第二步确认展示 */
const formData = ref<Record<string, unknown>>({})

/** 下一步 */
function nextStep(data?: Record<string, unknown>) {
  if (data) formData.value = data
  if (currentTab.value < 2) currentTab.value += 1
}

/** 上一步 */
function prevStep() {
  if (currentTab.value > 0) currentTab.value -= 1
}

/** 完成并重置 */
function finish() {
  currentTab.value = 0
  formData.value = {}
}
</script>

<template>
  <div class="min-h-full p-6 bg-gray-50 space-y-6">
    <!-- 页面说明 -->
    <Card>
      <p class="text-sm text-gray-500">
        将一个冗长或用户不熟悉的表单任务分成多个步骤，指导用户完成。
      </p>
    </Card>

    <!-- 步骤条 + 内容 -->
    <Card>
      <!-- 步骤条 -->
      <div class="max-w-[750px] mx-auto mb-8">
        <Steps :current="currentTab" :items="steps" />
      </div>

      <!-- 步骤内容 -->
      <div class="content">
        <Step1 v-if="currentTab === 0" @next-step="nextStep" />
        <Step2
          v-else-if="currentTab === 1"
          :form-data="formData"
          @next-step="nextStep"
          @prev-step="prevStep"
        />
        <Step3
          v-else
          :form-data="formData"
          @prev-step="prevStep"
          @finish="finish"
        />
      </div>
    </Card>
  </div>
</template>
