<script setup lang="ts">
/**
 * 页面级 Loading 组件
 *
 * 路由切换时 Suspense 的 fallback 内容，显示一个居中的骨架屏式 loading。
 */
</script>

<template>
  <div class="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center gap-3">
      <!-- 旋转 loading -->
      <div
        class="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"
      />
      <span class="text-sm text-gray-400 dark:text-gray-500">页面加载中...</span>
    </div>
  </div>
</template>

<style scoped>
.border-3 {
  border-width: 3px;
}
</style>
