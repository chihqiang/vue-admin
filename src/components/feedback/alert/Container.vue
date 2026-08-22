<script setup lang="ts">
/**
 * 全局提示容器组件
 * 固定在页面顶部中央，由 alert 命令式 API 控制内容
 * 与 Message 的区别：Alert 带标题+描述+背景色框，更显眼，默认不自动消失
 */
import { ref } from 'vue'
import { X } from '@lucide/vue'
import {
  getFeedbackIcon,
  getFeedbackIconColor,
  getFeedbackBoxColor,
} from '@/components/feedback/constants'

type AlertType = 'success' | 'info' | 'warning' | 'error'

interface AlertItem {
  key: string | number
  type?: AlertType
  title?: string
  description?: string
  showIcon?: boolean
  closable?: boolean
  onClose?: () => void
}

/** 响应式 Alert 列表 */
const alerts = ref<AlertItem[]>([])

/** 暴露 update 方法给外部调用 */
function update(list: AlertItem[]) {
  alerts.value = list
}

defineExpose({ update })
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 w-[420px] max-w-[calc(100vw-24px)] pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300"
        leave-active-class="transition-all duration-300"
        enter-from-class="opacity-0 -translate-y-2"
        leave-to-class="opacity-0 -translate-y-2"
        move-class="transition-transform duration-300"
      >
        <div
          v-for="item in alerts"
          :key="item.key"
          class="w-full flex items-start gap-2.5 px-4 py-3 rounded-md border shadow-sm pointer-events-auto"
          :class="getFeedbackBoxColor(item.type)"
        >
          <!-- 图标 -->
          <component
            v-if="item.showIcon !== false"
            :is="getFeedbackIcon(item.type)"
            :size="18"
            class="flex-shrink-0 mt-0.5"
            :class="getFeedbackIconColor(item.type)"
          />

          <!-- 文字内容 -->
          <div class="flex-1 min-w-0">
            <div v-if="item.title" class="font-medium text-sm mb-0.5">{{ item.title }}</div>
            <div v-if="item.description" class="text-sm opacity-80">{{ item.description }}</div>
          </div>

          <!-- 关闭按钮 -->
          <button
            v-if="item.closable"
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            @click="item.onClose?.()"
          >
            <X :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
