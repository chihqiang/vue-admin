/**
 * 仓库管理表单子组件
 * 包含：仓库名、仓库域名、仓库管理员、审批人、生效日期、仓库类型
 * 通过 expose 暴露 validate 方法供父组件汇总校验
 */
<script setup lang="ts">
import { reactive } from 'vue'
import { Input, Select } from '@/components/ui'

/** 表单数据 */
const form = reactive({
  /** 仓库名 */
  name: '',
  /** 仓库域名 */
  url: '',
  /** 仓库管理员 */
  owner: '',
  /** 审批人 */
  approver: '',
  /** 生效日期-起 */
  dateStart: '',
  /** 生效日期-止 */
  dateEnd: '',
  /** 仓库类型 */
  type: '',
})

/** 校验错误 */
const errors = reactive<Record<string, string>>({})

/** 管理员选项 */
const ownerOptions = [
  { label: '王同学', value: '王同学' },
  { label: '李同学', value: '李同学' },
  { label: '黄同学', value: '黄同学' },
]

/** 审批人选项 */
const approverOptions = [
  { label: '王晓丽', value: '王晓丽' },
  { label: '李军', value: '李军' },
]

/** 仓库类型选项 */
const typeOptions = [
  { label: '公开', value: '公开' },
  { label: '私密', value: '私密' },
]

/** 校验 */
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = '请输入仓库名称'
  if (!form.url.trim()) {
    errors.url = '请输入仓库域名'
  } else if (!form.url.startsWith('user-')) {
    errors.url = '需要以 user- 开头'
  }
  if (!form.owner) errors.owner = '请选择管理员'
  if (!form.approver) errors.approver = '请选择审批人'
  if (!form.dateStart || !form.dateEnd) errors.dateRange = '请选择生效日期'
  if (!form.type) errors.type = '请选择仓库类型'
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
      <!-- 仓库名 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">仓库名</label>
        <Input v-model="form.name" placeholder="请输入仓库名称" :custom-class="errClass(errors.name)" />
        <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
      </div>

      <!-- 仓库域名 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">仓库域名</label>
        <Input v-model="form.url" placeholder="请输入" :custom-class="errClass(errors.url)">
          <template #prefix><span class="text-xs text-gray-500">http://</span></template>
          <template #suffix><span class="text-xs text-gray-500">.com</span></template>
        </Input>
        <p v-if="errors.url" class="text-xs text-red-500 mt-1">{{ errors.url }}</p>
      </div>

      <!-- 仓库管理员 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">仓库管理员</label>
        <Select v-model="form.owner" :options="ownerOptions" placeholder="请选择管理员" :custom-class="errClass(errors.owner)" />
        <p v-if="errors.owner" class="text-xs text-red-500 mt-1">{{ errors.owner }}</p>
      </div>
    </div>

    <!-- 第二行 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 审批人 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">审批人</label>
        <Select v-model="form.approver" :options="approverOptions" placeholder="请选择审批人" :custom-class="errClass(errors.approver)" />
        <p v-if="errors.approver" class="text-xs text-red-500 mt-1">{{ errors.approver }}</p>
      </div>

      <!-- 生效日期 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">生效日期</label>
        <div class="flex items-center gap-2">
          <Input v-model="form.dateStart" type="date" :custom-class="errClass(errors.dateRange)" />
          <span class="text-gray-400">~</span>
          <Input v-model="form.dateEnd" type="date" :custom-class="errClass(errors.dateRange)" />
        </div>
        <p v-if="errors.dateRange" class="text-xs text-red-500 mt-1">{{ errors.dateRange }}</p>
      </div>

      <!-- 仓库类型 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">仓库类型</label>
        <Select v-model="form.type" :options="typeOptions" placeholder="请选择仓库类型" :custom-class="errClass(errors.type)" />
        <p v-if="errors.type" class="text-xs text-red-500 mt-1">{{ errors.type }}</p>
      </div>
    </div>
  </form>
</template>
