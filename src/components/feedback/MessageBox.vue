<script setup lang="ts">
/**
 * 全局提示容器组件
 * 固定在页面顶部中央，由 Message API 控制内容
 */
import { ref } from 'vue'
import { LoaderCircle } from '@lucide/vue'
import type { Component } from 'vue'
import {
  feedbackIconMap,
  feedbackIconColorMap,
  DEFAULT_FEEDBACK_ICON,
  DEFAULT_FEEDBACK_ICON_COLOR,
} from '@/components/feedback/constants'

interface MessageItem {
  content: string
  type?: 'success' | 'info' | 'warning' | 'error' | 'loading'
  key?: string | number
  onClose?: () => void
}

/** 响应式消息列表 */
const messages = ref<MessageItem[]>([])

/** 图标映射：复用共享语义映射，并扩展 loading */
const messageIconMap: Record<string, Component> = {
  ...feedbackIconMap,
  loading: LoaderCircle,
}

/** 图标颜色映射：复用共享语义映射，并扩展 loading */
const messageIconColorMap: Record<string, string> = {
  ...feedbackIconColorMap,
  loading: 'text-blue-500',
}

/** 按 type 获取图标（带 fallback） */
function getIcon(type?: string): Component {
  return messageIconMap[type || 'info'] || DEFAULT_FEEDBACK_ICON
}

/** 按 type 获取图标颜色（带 fallback） */
function getColor(type?: string): string {
  return messageIconColorMap[type || 'info'] || DEFAULT_FEEDBACK_ICON_COLOR
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
            :is="getIcon(msg.type)"
            :size="16"
            class="flex-shrink-0"
            :class="[
              getColor(msg.type),
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
