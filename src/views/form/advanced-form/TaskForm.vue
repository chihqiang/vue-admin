/**
 * 任务管理表单子组件
 * 包含：任务名、任务描述、执行人、责任人、提醒时间、任务类型
 * 通过 expose 暴露 validate 方法供父组件汇总校验
 */
<script setup lang="ts">
import { reactive } from 'vue'
import { Input, Select } from '@/components'

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

/** 执行人选项 */
const ownerOptions = [
  { label: '黄丽丽', value: '黄丽丽' },
  { label: '李大刀', value: '李大刀' },
]

/** 责任人选项 */
const approverOptions = [
  { label: '王伟', value: '王伟' },
  { label: '李红军', value: '李红军' },
]

/** 任务类型选项 */
const typeOptions = [
  { label: '定时执行', value: '定时执行' },
  { label: '周期执行', value: '周期执行' },
]

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

/** 错误态边框样式 */
function errClass(err?: string) {
  return err ? 'border-red-300 ring-2 ring-red-100 focus:border-red-400 focus:ring-red-100' : ''
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
        <Input v-model="form.name" placeholder="请输入任务名称" :custom-class="errClass(errors.name)" />
        <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
      </div>

      <!-- 任务描述 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">任务描述</label>
        <Input v-model="form.description" placeholder="请输入任务描述" :custom-class="errClass(errors.description)" />
        <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
      </div>

      <!-- 执行人 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">执行人</label>
        <Select v-model="form.owner" :options="ownerOptions" placeholder="请选择执行人" :custom-class="errClass(errors.owner)" />
        <p v-if="errors.owner" class="text-xs text-red-500 mt-1">{{ errors.owner }}</p>
      </div>
    </div>

    <!-- 第二行 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 责任人 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">责任人</label>
        <Select v-model="form.approver" :options="approverOptions" placeholder="请选择责任人" :custom-class="errClass(errors.approver)" />
        <p v-if="errors.approver" class="text-xs text-red-500 mt-1">{{ errors.approver }}</p>
      </div>

      <!-- 提醒时间 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">提醒时间</label>
        <Input v-model="form.dateTime" type="datetime-local" :custom-class="errClass(errors.dateTime)" />
        <p v-if="errors.dateTime" class="text-xs text-red-500 mt-1">{{ errors.dateTime }}</p>
      </div>

      <!-- 任务类型 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">任务类型</label>
        <Select v-model="form.type" :options="typeOptions" placeholder="请选择任务类型" :custom-class="errClass(errors.type)" />
        <p v-if="errors.type" class="text-xs text-red-500 mt-1">{{ errors.type }}</p>
      </div>
    </div>
  </form>
</template>
