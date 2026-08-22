/**
 * 仓库管理表单子组件
 * 包含：仓库名、仓库域名、仓库管理员、审批人、生效日期、仓库类型
 * 通过 expose 暴露 validate 方法供父组件汇总校验
 */
<script setup lang="ts">
import { reactive } from 'vue'

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

/** 校验 */
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = '请输入仓库名称'
  if (!form.url.trim()) {
    errors.url = '请输入仓库域名'
  } else if (!/^user-/.test(form.url)) {
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
        <input
          v-model="form.name"
          type="text"
          placeholder="请输入仓库名称"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.name ? 'border-red-300' : 'border-gray-200'"
        />
        <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
      </div>

      <!-- 仓库域名 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">仓库域名</label>
        <div class="flex">
          <span class="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">http://</span>
          <input
            v-model="form.url"
            type="text"
            placeholder="请输入"
            class="flex-1 px-3 py-2 text-sm border-y border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            :class="errors.url ? 'border-red-300' : ''"
          />
          <span class="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-200 rounded-r-md">.com</span>
        </div>
        <p v-if="errors.url" class="text-xs text-red-500 mt-1">{{ errors.url }}</p>
      </div>

      <!-- 仓库管理员 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">仓库管理员</label>
        <select
          v-model="form.owner"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.owner ? 'border-red-300' : 'border-gray-200'"
        >
          <option value="">请选择管理员</option>
          <option value="王同学">王同学</option>
          <option value="李同学">李同学</option>
          <option value="黄同学">黄同学</option>
        </select>
        <p v-if="errors.owner" class="text-xs text-red-500 mt-1">{{ errors.owner }}</p>
      </div>
    </div>

    <!-- 第二行 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 审批人 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">审批人</label>
        <select
          v-model="form.approver"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.approver ? 'border-red-300' : 'border-gray-200'"
        >
          <option value="">请选择审批人</option>
          <option value="王晓丽">王晓丽</option>
          <option value="李军">李军</option>
        </select>
        <p v-if="errors.approver" class="text-xs text-red-500 mt-1">{{ errors.approver }}</p>
      </div>

      <!-- 生效日期 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">生效日期</label>
        <div class="flex items-center gap-2">
          <input
            v-model="form.dateStart"
            type="date"
            class="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            :class="errors.dateRange ? 'border-red-300' : 'border-gray-200'"
          />
          <span class="text-gray-400">~</span>
          <input
            v-model="form.dateEnd"
            type="date"
            class="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            :class="errors.dateRange ? 'border-red-300' : 'border-gray-200'"
          />
        </div>
        <p v-if="errors.dateRange" class="text-xs text-red-500 mt-1">{{ errors.dateRange }}</p>
      </div>

      <!-- 仓库类型 -->
      <div>
        <label class="block text-sm text-gray-700 mb-1">仓库类型</label>
        <select
          v-model="form.type"
          class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          :class="errors.type ? 'border-red-300' : 'border-gray-200'"
        >
          <option value="">请选择仓库类型</option>
          <option value="公开">公开</option>
          <option value="私密">私密</option>
        </select>
        <p v-if="errors.type" class="text-xs text-red-500 mt-1">{{ errors.type }}</p>
      </div>
    </div>
  </form>
</template>
