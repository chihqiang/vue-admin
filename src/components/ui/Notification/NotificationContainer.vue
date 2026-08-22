<script setup lang="ts">
/**
 * 通知提醒容器组件
 * 固定在页面角落（默认右上角），由 Notification API 控制内容
 * 与 Message 的区别：Notification 带标题+描述，更丰富的展示
 */
import { ref } from 'vue'
import { CheckCircle, Info, AlertTriangle, XCircle, X } from '@lucide/vue'
import type { Component } from 'vue'

type NotificationType = 'success' | 'info' | 'warning' | 'error'
type Placement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

interface NotificationItem {
  key: string | number
  type?: NotificationType
  title: string
  description?: string
  icon?: Component
  placement?: Placement
  duration?: number
  onClose?: () => void
  btnText?: string
  onBtnClick?: () => void
}

/** 响应式通知列表 */
const notifications = ref<NotificationItem[]>([])

/** 图标映射 */
const iconMap: Record<string, Component> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

/** 颜色映射 */
const iconColorMap: Record<string, string> = {
  success: 'text-green-500',
  info: 'text-blue-500',
  warning: 'text-orange-500',
  error: 'text-red-500',
}

/** 定位样式 */
const placementClass: Record<Placement, string> = {
  topLeft: 'top-5 left-5',
  topRight: 'top-5 right-5',
  bottomLeft: 'bottom-5 left-5',
  bottomRight: 'bottom-5 right-5',
}

/** 按位置分组（同位置的通知渲染在同一列） */
function getByPlacement(placement: Placement) {
  return notifications.value.filter((n) => (n.placement || 'topRight') === placement)
}

/** 暴露方法 */
function update(list: NotificationItem[]) {
  notifications.value = list
}

function remove(key: string | number) {
  notifications.value = notifications.value.filter((n) => n.key !== key)
}

defineExpose({ update, remove })
</script>

<template>
  <Teleport to="body">
    <!-- 四个方位各自渲染 -->
    <div
      v-for="pos in (['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as Placement[])"
      :key="pos"
      class="fixed z-[9999] flex flex-col gap-3 w-96"
      :class="placementClass[pos]"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300"
        leave-active-class="transition-all duration-300"
        :enter-from-class="pos.includes('Right') ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'"
        :leave-to-class="pos.includes('Right') ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'"
        move-class="transition-transform duration-300"
      >
        <div
          v-for="item in getByPlacement(pos)"
          :key="item.key"
          class="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
        >
          <div class="flex items-start gap-3 p-4">
            <!-- 图标 -->
            <component
              v-if="item.icon || item.type"
              :is="item.icon || iconMap[item.type || 'info']"
              :size="20"
              class="flex-shrink-0 mt-0.5"
              :class="item.icon ? 'text-blue-500' : iconColorMap[item.type || 'info']"
            />

            <div class="flex-1 min-w-0">
              <!-- 标题 -->
              <div class="font-medium text-sm text-gray-800 mb-1">
                {{ item.title }}
              </div>
              <!-- 描述 -->
              <div v-if="item.description" class="text-sm text-gray-500 leading-relaxed">
                {{ item.description }}
              </div>
              <!-- 操作按钮 -->
              <div v-if="item.btnText" class="mt-2">
                <button
                  class="text-xs text-blue-500 hover:text-blue-600 font-medium"
                  @click="item.onBtnClick?.()"
                >
                  {{ item.btnText }}
                </button>
              </div>
            </div>

            <!-- 关闭按钮 -->
            <button
              class="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
              @click="item.onClose?.()"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
