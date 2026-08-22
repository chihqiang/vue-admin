/**
 * 分步表单页面 /form/step-form
 * 通过步骤条引导用户完成填写转账信息 → 确认转账 → 完成
 * 子组件 Step1/Step2/Step3 通过 emit 事件控制流程
 */
<script setup lang="ts">
import { ref } from 'vue'
import Step1 from './Step1.vue'
import Step2 from './Step2.vue'
import Step3 from './Step3.vue'

/** 当前步骤索引（0/1/2） */
const currentTab = ref(0)

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
  <div class="min-h-full p-6 bg-gray-50">
    <!-- 页面说明 -->
    <div class="bg-white rounded-lg border border-gray-100 p-4 mb-6">
      <p class="text-sm text-gray-500">
        将一个冗长或用户不熟悉的表单任务分成多个步骤，指导用户完成。
      </p>
    </div>

    <!-- 步骤条 + 内容 -->
    <div class="bg-white rounded-lg border border-gray-100 px-8 py-6">
      <!-- 步骤条 -->
      <div class="max-w-[750px] mx-auto mb-8">
        <div class="flex items-center">
          <!-- 步骤项 -->
          <template v-for="(step, i) in [
            { title: '填写转账信息' },
            { title: '确认转账信息' },
            { title: '完成' },
          ]" :key="i">
            <!-- 圆点 + 标题 -->
            <div class="flex items-center" :class="i < 2 ? 'flex-1' : ''">
              <div class="flex flex-col items-center">
                <!-- 圆点 -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors"
                  :class="
                    currentTab > i
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : currentTab === i
                        ? 'border-blue-500 text-blue-500'
                        : 'border-gray-200 text-gray-400'
                  "
                >
                  <span v-if="currentTab > i">&#10003;</span>
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <!-- 标题 -->
                <span
                  class="mt-2 text-sm"
                  :class="currentTab >= i ? 'text-blue-600' : 'text-gray-400'"
                >
                  {{ step.title }}
                </span>
              </div>
            </div>
            <!-- 连接线 -->
            <div
              v-if="i < 2"
              class="flex-1 h-0.5 mx-3 mb-6 transition-colors"
              :class="currentTab > i ? 'bg-blue-500' : 'bg-gray-200'"
            />
          </template>
        </div>
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
    </div>
  </div>
</template>
