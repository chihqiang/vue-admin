<script setup lang="ts">
/**
 * 失败结果页
 */
import { useRouter } from 'vue-router'
import { XCircle } from '@lucide/vue'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8">
    <div class="w-full max-w-md">
      <div class="flex flex-col items-center text-center">
        <XCircle :size="64" class="text-red-500" />
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-4">
          操作失败
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          提交内容未通过审核，请核对信息后重新提交
        </p>
      </div>

      <!-- 错误详情 -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-400 dark:text-gray-500">错误代码</span>
          <span class="text-red-500">VALIDATION_ERROR</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-400 dark:text-gray-500">错误信息</span>
          <span class="text-gray-700 dark:text-gray-300">表单内容校验未通过</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-400 dark:text-gray-500">提交时间</span>
          <span class="text-gray-700 dark:text-gray-300">{{ new Date().toLocaleString('zh-CN') }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-center gap-3 mt-6">
        <button
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          @click="router.back()"
        >
          返回修改
        </button>
        <button
          class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          @click="router.push('/')"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>
