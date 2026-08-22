<script setup lang="ts">
/**
 * 错误边界组件
 *
 * 捕获子组件渲染过程中的异常，显示友好的错误占位界面，
 * 避免整页白屏或静默失败。提供"刷新页面"和"返回首页"按钮。
 *
 * 使用方式（包裹异步路由组件）：
 * <ErrorBoundary>
 *   <router-view />
 * </ErrorBoundary>
 *
 * 捕获时机：onErrorCaptured 捕获后代组件渲染生命周期中的错误。
 *   注意：事件处理器和异步错误不会被捕获（需要全局 errorHandler 兜底）。
 */
import { onErrorCaptured, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle } from '@lucide/vue'

const router = useRouter()

/** 是否捕获到错误 */
const hasError = ref(false)

/** 错误信息 */
const errorMessage = ref<string>('')

onErrorCaptured((err: unknown) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : String(err)
  console.error('[ErrorBoundary]', err)
  // 阻止错误继续向上传播
  return false
})

/** 重试（清除错误状态，重新渲染子组件） */
function handleRetry() {
  hasError.value = false
  errorMessage.value = ''
}

/** 返回首页 */
function goHome() {
  hasError.value = false
  errorMessage.value = ''
  router.push('/')
}
</script>

<template>
  <!-- 正常渲染 -->
  <slot v-if="!hasError" />

  <!-- 错误占位 -->
  <div
    v-else
    class="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8"
  >
    <div class="flex flex-col items-center text-center">
      <AlertTriangle :size="64" class="text-amber-500" />
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-4">
        页面渲染异常
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md break-all">
        {{ errorMessage }}
      </p>
      <div class="flex gap-3 mt-6">
        <button
          class="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          @click="handleRetry"
        >
          重试
        </button>
        <button
          class="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          @click="goHome"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>
