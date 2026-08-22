<script setup lang="ts">
/**
 * 全局提示容器组件
 * 固定在页面顶部中央，由 alert 命令式 API 控制内容
 * 与 Message 的区别：Alert 带标题+描述+背景色框，更显眼，默认不自动消失
 */
import { ref } from 'vue'
import { CheckCircle, Info, AlertTriangle, XCircle, X } from '@lucide/vue'
import type { Component } from 'vue'

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

/** 图标映射 */
const iconMap: Record<string, Component> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

/** 颜色映射（背景 + 边框 + 文字 + 图标） */
const colorMap: Record<string, { box: string; icon: string }> = {
  success: { box: 'bg-green-50 border-green-200 text-green-600', icon: 'text-green-500' },
  info: { box: 'bg-blue-50 border-blue-200 text-blue-600', icon: 'text-blue-500' },
  warning: { box: 'bg-orange-50 border-orange-200 text-orange-600', icon: 'text-orange-500' },
  error: { box: 'bg-red-50 border-red-200 text-red-600', icon: 'text-red-500' },
}

/** 获取颜色配置（带 fallback） */
function getColor(type?: string) {
  return colorMap[type || 'info'] || { box: 'bg-blue-50 border-blue-200 text-blue-600', icon: 'text-blue-500' }
}

/** 获取图标（带 fallback） */
function getIcon(type?: string) {
  return iconMap[type || 'info'] || Info
}

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
          :class="getColor(item.type).box"
        >
          <!-- 图标 -->
          <component
            v-if="item.showIcon !== false"
            :is="getIcon(item.type)"
            :size="18"
            class="flex-shrink-0 mt-0.5"
            :class="getColor(item.type).icon"
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
