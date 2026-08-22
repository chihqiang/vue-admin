<script setup lang="ts">
/**
 * 500 服务器错误页面
 */
import { useRouter } from 'vue-router'
import { ServerCrash } from '@lucide/vue'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
    <ServerCrash :size="80" class="text-gray-300 dark:text-gray-600" />
    <div class="text-6xl font-bold text-gray-200 dark:text-gray-700 mt-4">500</div>
    <div class="text-lg text-gray-500 dark:text-gray-400 mt-4">抱歉，服务器出了点问题</div>
    <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">服务器遇到错误，请稍后再试</p>
    <div class="flex gap-3 mt-6">
      <button
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        @click="router.push('/')"
      >
        返回首页
      </button>
      <button
        class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        @click="router.go(0)"
      >
        刷新页面
      </button>
    </div>
  </div>
</template>
