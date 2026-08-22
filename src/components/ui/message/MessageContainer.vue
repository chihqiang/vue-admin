<script setup lang="ts">
/**
 * 全局提示容器组件
 * 固定在页面顶部中央，由 Message API 控制内容
 */
import { ref, watch } from 'vue'
import { CheckCircle, Info, AlertTriangle, XCircle, LoaderCircle, X } from '@lucide/vue'
import type { Component } from 'vue'

interface MessageItem {
  content: string
  type?: 'success' | 'info' | 'warning' | 'error' | 'loading'
  key?: string | number
  onClose?: () => void
}

/** 响应式消息列表 */
const messages = ref<MessageItem[]>([])

/** 图标映射 */
const iconMap: Record<string, Component> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  loading: LoaderCircle,
}

/** 颜色映射 */
const iconColorMap: Record<string, string> = {
  success: 'text-green-500',
  info: 'text-blue-500',
  warning: 'text-orange-500',
  error: 'text-red-500',
  loading: 'text-blue-500',
}

/** 暴露 update 方法给外部调用 */
function update(list: MessageItem[]) {
  messages.value = list
}

defineExpose({ update })
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300"
        leave-active-class="transition-all duration-300"
        enter-from-class="opacity-0 -translate-y-2"
        leave-to-class="opacity-0 -translate-y-2"
        move-class="transition-transform duration-300"
      >
        <div
          v-for="msg in messages"
          :key="msg.key"
          class="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-lg border border-gray-100 pointer-events-auto min-w-48"
        >
          <!-- 图标 -->
          <component
            :is="iconMap[msg.type || 'info']"
            :size="16"
            class="flex-shrink-0"
            :class="[
              iconColorMap[msg.type || 'info'],
              msg.type === 'loading' ? 'animate-spin' : '',
            ]"
          />
          <!-- 内容 -->
          <span class="text-sm text-gray-700">{{ msg.content }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
