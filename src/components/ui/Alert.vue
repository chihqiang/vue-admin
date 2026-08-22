<script setup lang="ts">
/**
 * 提示横幅 Alert
 *
 * 特性：
 * - type: success / info / warning / error
 * - variant: outlined / filled
 * - title: 标题（string 或 #title 插槽）
 * - description: 描述文字（string 或 #description 插槽）
 * - showIcon: 是否显示图标
 * - closable: 可关闭
 * - banner: 顶部横幅模式（无边框圆角）
 * - #action: 右侧操作区
 *
 * 事件：
 * - @close: 关闭时
 */
import { ref, computed, useSlots } from 'vue'
import { CheckCircle, Info, AlertTriangle, XCircle, X } from '@lucide/vue'

type AlertType = 'success' | 'info' | 'warning' | 'error'

const props = withDefaults(
  defineProps<{
    type?: AlertType
    variant?: 'outlined' | 'filled'
    title?: string
    description?: string
    showIcon?: boolean
    closable?: boolean
    banner?: boolean
  }>(),
  {
    type: 'info',
    variant: 'outlined',
    title: '',
    description: '',
    showIcon: true,
    closable: false,
    banner: false,
  },
)

const emit = defineEmits<{
  close: []
}>()

const slots = useSlots()
const visible = ref(true)

/** 图标映射 */
const iconMap: Record<AlertType, typeof Info> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

/** 颜色映射 */
const colorMap: Record<AlertType, { outlined: string; filled: string; icon: string }> = {
  success: {
    outlined: 'bg-green-50 border-green-200 text-green-600',
    filled: 'bg-green-100 border-green-100 text-green-700',
    icon: 'text-green-500',
  },
  info: {
    outlined: 'bg-blue-50 border-blue-200 text-blue-600',
    filled: 'bg-blue-100 border-blue-100 text-blue-700',
    icon: 'text-blue-500',
  },
  warning: {
    outlined: 'bg-orange-50 border-orange-200 text-orange-600',
    filled: 'bg-orange-100 border-orange-100 text-orange-700',
    icon: 'text-orange-500',
  },
  error: {
    outlined: 'bg-red-50 border-red-200 text-red-600',
    filled: 'bg-red-100 border-red-100 text-red-700',
    icon: 'text-red-500',
  },
}

const currentIcon = computed(() => iconMap[props.type])
const currentColor = computed(() => colorMap[props.type])

function handleClose() {
  visible.value = false
  emit('close')
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200"
    leave-active-class="transition-all duration-200"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="flex items-start gap-2.5 px-4 py-3"
      :class="[
        banner ? 'rounded-none border-0' : 'rounded-md border',
        currentColor[variant],
      ]"
    >
      <!-- 图标 -->
      <component
        v-if="showIcon"
        :is="currentIcon"
        :size="18"
        class="flex-shrink-0 mt-0.5"
        :class="currentColor.icon"
      />

      <!-- 文字内容 -->
      <div class="flex-1 min-w-0">
        <div v-if="title || slots.title" class="font-medium text-sm mb-0.5">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="description || slots.description" class="text-sm opacity-80">
          <slot name="description">{{ description }}</slot>
        </div>
      </div>

      <!-- 操作区 -->
      <div v-if="slots.action" class="flex-shrink-0">
        <slot name="action" />
      </div>

      <!-- 关闭按钮 -->
      <button
        v-if="closable"
        class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        @click="handleClose"
      >
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>
