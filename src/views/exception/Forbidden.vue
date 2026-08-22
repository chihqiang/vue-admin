<script setup lang="ts">
/**
 * 403 无权限页面
 */
import { useRouter } from 'vue-router'
import { ShieldX } from '@lucide/vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
    <ShieldX :size="80" class="text-gray-300 dark:text-gray-600" />
    <div class="text-6xl font-bold text-gray-200 dark:text-gray-700 mt-4">403</div>
    <div class="text-lg text-gray-500 dark:text-gray-400 mt-4">抱歉，您没有权限访问此页面</div>
    <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
      当前用户：{{ userStore.name || '未登录' }}，请联系管理员获取权限
    </p>
    <div class="flex gap-3 mt-6">
      <button
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        @click="router.push('/')"
      >
        返回首页
      </button>
      <button
        class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        @click="router.back()"
      >
        返回上一页
      </button>
    </div>
  </div>
</template>
