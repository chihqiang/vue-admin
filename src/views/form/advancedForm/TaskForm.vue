/**
 * 任务管理表单子组件
 * 包含：任务名、任务描述、执行人、责任人、提醒时间、任务类型
 * 通过 expose 暴露 validate 方法供父组件汇总校验
 */
<script setup lang="ts">
import { reactive } from 'vue'

/** 表单数据 */
const form = reactive({
  /** 任务名 */
  name: '',
  /** 任务描述 */
  description: '',
  /** 执行人 */
  owner: '',
  /** 责任人 */
  approver: '',
  /** 提醒时间 */
  dateTime: '',
  /** 任务类型 */
  type: '',
})

/** 校验错误 */
const errors = reactive<Record<string, string>>({})

/** 校验 */
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = '请输入任务名称'
  if (!form.description.trim()) errors.description = '请输入任务描述'
  if (!form.owner) errors.owner = '请选择执行人'
  if (!form.approver) errors.approver = '请选择责任人'
  if (!form.dateTime) errors.dateTime = '请选择提醒时间'
  if (!form.type) errors.type = '请选择任务类型'
  return Object.keys(errors).length === 0
}

/** 获取表单数据 */
function getFormData() {
  return { ...form }
}

// 暴露给父组件
defineExpose({ validate, getFormData, errors })
</script>

<template>
  <form class="space-y-4">
    <!-- 第一行 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 任务名 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">任务名</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="请输入任务名称"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.name ? 'border-red-300' : 'border-gray-200'"
        />
        <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
      </div>

      <!-- 任务描述 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">任务描述</label>
        <input
          v-model="form.description"
          type="text"
          placeholder="请输入任务描述"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.description ? 'border-red-300' : 'border-gray-200'"
        />
        <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
      </div>

      <!-- 执行人 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">执行人</label>
        <select
          v-model="form.owner"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.owner ? 'border-red-300' : 'border-gray-200'"
        >
          <option value="">请选择执行人</option>
          <option value="黄丽丽">黄丽丽</option>
          <option value="李大刀">李大刀</option>
        </select>
        <p v-if="errors.owner" class="text-xs text-red-500 mt-1">{{ errors.owner }}</p>
      </div>
    </div>

    <!-- 第二行 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 责任人 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">责任人</label>
        <select
          v-model="form.approver"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.approver ? 'border-red-300' : 'border-gray-200'"
        >
          <option value="">请选择责任人</option>
          <option value="王伟">王伟</option>
          <option value="李红军">李红军</option>
        </select>
        <p v-if="errors.approver" class="text-xs text-red-500 mt-1">{{ errors.approver }}</p>
      </div>

      <!-- 提醒时间 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">提醒时间</label>
        <input
          v-model="form.dateTime"
          type="datetime-local"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.dateTime ? 'border-red-300' : 'border-gray-200'"
        />
        <p v-if="errors.dateTime" class="text-xs text-red-500 mt-1">{{ errors.dateTime }}</p>
      </div>

      <!-- 任务类型 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">任务类型</label>
        <select
          v-model="form.type"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.type ? 'border-red-300' : 'border-gray-200'"
        >
          <option value="">请选择任务类型</option>
          <option value="定时执行">定时执行</option>
          <option value="周期执行">周期执行</option>
        </select>
        <p v-if="errors.type" class="text-xs text-red-500 mt-1">{{ errors.type }}</p>
      </div>
    </div>
  </form>
</template>
