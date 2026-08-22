/**
 * 基础表单页面 /form/basic-form
 * 展示：标题、日期范围、目标描述、衡量标准、客户、邀请人、权重、公开性
 * 使用 TailwindCSS 重写，表单校验为手写轻量版（不依赖 UI 组件库）
 */
<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { Info } from '@lucide/vue'

// ========== 表单数据 ==========
const form = reactive({
  /** 标题 */
  name: '',
  /** 起止日期 */
  dateRange: ['', ''],
  /** 目标描述 */
  description: '',
  /** 衡量标准 */
  standard: '',
  /** 客户 */
  customer: '',
  /** 邀请人 */
  invites: '',
  /** 权重 */
  weight: 0,
  /** 公开性：1=公开 2=部分公开 3=私密 */
  visibility: 1,
  /** 部分公开时选中的可见范围 */
  visibleTo: [] as string[],
})

// ========== 校验错误 ==========
const errors = reactive<Record<string, string>>({})

// ========== 提交状态 ==========
const submitting = ref(false)

// ========== 选项数据 ==========
/** 部分公开时的可见范围选项 */
const visibilityOptions = [
  { label: '朋友', value: '1' },
  { label: '同事', value: '2' },
  { label: '家人', value: '3' },
]

// ========== 校验规则 ==========
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!form.name.trim()) errors.name = '请输入标题'
  if (!form.dateRange[0] || !form.dateRange[1]) errors.dateRange = '请选择起止日期'
  if (!form.description.trim()) errors.description = '请输入目标描述'
  if (!form.standard.trim()) errors.standard = '请输入衡量标准'
  if (!form.customer.trim()) errors.customer = '请输入客户名称'

  return Object.keys(errors).length === 0
}

// ========== 提交 ==========
async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    // 模拟接口提交
    await new Promise((r) => setTimeout(r, 800))
    console.log('表单提交数据：', { ...form })
    window.alert('提交成功')
  } catch {
    window.alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

/** 保存草稿 */
function handleSave() {
  console.log('保存草稿：', { ...form })
  window.alert('已保存为草稿')
}

// ========== 日期处理 ==========
/** 开始日期 */
const startDate = computed({
  get: () => form.dateRange[0],
  set: (v: string) => { form.dateRange[0] = v },
})
/** 结束日期 */
const endDate = computed({
  get: () => form.dateRange[1],
  set: (v: string) => { form.dateRange[1] = v },
})

/** 是否显示部分公开的可见范围选择 */
const showVisibleTo = computed(() => form.visibility === 2)
</script>

<template>
  <div class="min-h-full p-6 bg-gray-50">
    <!-- 页面说明 -->
    <div class="bg-white rounded-lg border border-gray-100 p-4 mb-6">
      <div class="flex items-start gap-2">
        <Info :size="16" class="text-blue-500 mt-0.5 flex-shrink-0" />
        <p class="text-sm text-gray-500">
          表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。
        </p>
      </div>
    </div>

    <!-- 表单卡片 -->
    <div class="bg-white rounded-lg border border-gray-100 px-8 py-6">
      <form @submit.prevent="handleSubmit" class="max-w-2xl mx-auto space-y-6">
        <!-- 标题 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 标题
          </label>
          <div class="flex-1">
            <input
              v-model="form.name"
              type="text"
              placeholder="给目标起个名字"
              class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
              :class="errors.name ? 'border-red-300' : 'border-gray-200'"
            />
            <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
          </div>
        </div>

        <!-- 起止日期 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 起止日期
          </label>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <input
                v-model="startDate"
                type="date"
                class="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                :class="errors.dateRange ? 'border-red-300' : 'border-gray-200'"
              />
              <span class="text-gray-400">~</span>
              <input
                v-model="endDate"
                type="date"
                class="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                :class="errors.dateRange ? 'border-red-300' : 'border-gray-200'"
              />
            </div>
            <p v-if="errors.dateRange" class="text-xs text-red-500 mt-1">{{ errors.dateRange }}</p>
          </div>
        </div>

        <!-- 目标描述 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 目标描述
          </label>
          <div class="flex-1">
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="请输入你的阶段性工作目标"
              class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
              :class="errors.description ? 'border-red-300' : 'border-gray-200'"
            />
            <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
          </div>
        </div>

        <!-- 衡量标准 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 衡量标准
          </label>
          <div class="flex-1">
            <textarea
              v-model="form.standard"
              rows="4"
              placeholder="请输入衡量标准"
              class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
              :class="errors.standard ? 'border-red-300' : 'border-gray-200'"
            />
            <p v-if="errors.standard" class="text-xs text-red-500 mt-1">{{ errors.standard }}</p>
          </div>
        </div>

        <!-- 客户 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 客户
          </label>
          <div class="flex-1">
            <input
              v-model="form.customer"
              type="text"
              placeholder="请描述你服务的客户，方便客户快速筛查"
              class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              :class="errors.customer ? 'border-red-300' : 'border-gray-200'"
            />
            <p v-if="errors.customer" class="text-xs text-red-500 mt-1">{{ errors.customer }}</p>
          </div>
        </div>

        <!-- 邀请人 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            邀请人
          </label>
          <div class="flex-1">
            <input
              v-model="form.invites"
              type="text"
              placeholder="请输入邀请人"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        <!-- 权重 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            权重
          </label>
          <div class="flex-1 flex items-center gap-2">
            <input
              v-model.number="form.weight"
              type="number"
              min="0"
              max="100"
              class="w-24 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
            <span class="text-sm text-gray-500">%</span>
          </div>
        </div>

        <!-- 公开性 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            公开性
          </label>
          <div class="flex-1">
            <!-- 单选按钮组 -->
            <div class="flex items-center gap-4">
              <label
                v-for="opt in [
                  { value: 1, label: '公开' },
                  { value: 2, label: '部分公开' },
                  { value: 3, label: '私密' },
                ]"
                :key="opt.value"
                class="flex items-center gap-1.5 cursor-pointer"
              >
                <input
                  v-model="form.visibility"
                  type="radio"
                  :value="opt.value"
                  class="w-4 h-4 text-blue-500 focus:ring-blue-200"
                />
                <span class="text-sm text-gray-700">{{ opt.label }}</span>
              </label>
            </div>
            <p class="text-xs text-gray-400 mt-1">客户、邀评人默认被分享</p>

            <!-- 部分公开时的多选 -->
            <div v-if="showVisibleTo" class="mt-3">
              <select
                v-model="form.visibleTo"
                multiple
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 min-h-[72px]"
              >
                <option
                  v-for="opt in visibilityOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
              <p class="text-xs text-gray-400 mt-1">按住 Ctrl 可多选</p>
            </div>
          </div>
        </div>

        <!-- 按钮区 -->
        <div class="flex justify-center gap-3 pt-4 border-t border-gray-50">
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ submitting ? '提交中...' : '提交' }}
          </button>
          <button
            type="button"
            @click="handleSave"
            class="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
