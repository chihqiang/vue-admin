<script setup lang="ts">
/**
 * 统计卡片 StatCard
 *
 * 特性：
 * - layout: horizontal（图标在左）/ vertical（图标在上）
 * - size: sm / md / lg 控制整体尺寸
 * - #prefix 插槽替代 icon prop（可放任意内容）
 * - #value 插槽自定义数值渲染（如加单位、动画数字）
 * - #suffix 插槽放趋势/操作按钮等
 * - click 事件 + clickable 开关
 * - bordered / shadow 开关
 */
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    /** 标签文字 */
    label: string
    /** 数值 */
    value: string | number
    /** 前缀图标组件（也可用 #prefix 插槽完全自定义） */
    icon?: Component
    /** 图标背景色系 */
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
    /** 布局方向 */
    layout?: 'horizontal' | 'vertical'
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg'
    /** 是否可点击 */
    clickable?: boolean
    /** 是否显示边框 */
    bordered?: boolean
    /** 是否显示阴影 */
    shadow?: boolean
  }>(),
  {
    color: 'blue',
    layout: 'horizontal',
    size: 'md',
    clickable: false,
    bordered: true,
    shadow: false,
  },
)

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

/** 主题色映射 */
const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-500',
  green: 'bg-green-50 text-green-500',
  purple: 'bg-purple-50 text-purple-500',
  orange: 'bg-orange-50 text-orange-500',
  red: 'bg-red-50 text-red-500',
}

/** 尺寸映射 */
const sizeMap = {
  sm: { icon: 'w-9 h-9', iconSize: 16, value: 'text-base', label: 'text-xs', padding: 'p-3', gap: 'gap-2' },
  md: { icon: 'w-12 h-12', iconSize: 22, value: 'text-xl', label: 'text-sm', padding: 'p-5', gap: 'gap-4' },
  lg: { icon: 'w-14 h-14', iconSize: 26, value: 'text-2xl', label: 'text-sm', padding: 'p-6', gap: 'gap-4' },
}
</script>

<template>
  <div
    class="rounded-lg bg-white transition-all"
    :class="[
      sizeMap[size].padding,
      bordered ? 'border border-gray-100' : '',
      shadow ? 'shadow-sm' : '',
      clickable ? 'hover:shadow-md hover:border-blue-200 cursor-pointer' : '',
      layout === 'horizontal' ? `flex items-center ${sizeMap[size].gap}` : 'flex flex-col ' + sizeMap[size].gap,
    ]"
    @click="clickable && emit('click', $event)"
  >
    <!-- 前缀区域：#prefix 插槽优先，其次 icon prop -->
    <slot name="prefix">
      <div
        v-if="icon"
        class="rounded-lg flex items-center justify-center flex-shrink-0"
        :class="colorMap[color], sizeMap[size].icon"
      >
        <component :is="icon" :size="sizeMap[size].iconSize" />
      </div>
    </slot>

    <!-- 文字内容 -->
    <div class="flex-1 min-w-0" :class="layout === 'vertical' ? 'text-center' : ''">
      <p class="text-gray-400 mb-1" :class="sizeMap[size].label">{{ label }}</p>
      <!-- value 插槽：可自定义数值渲染 -->
      <slot name="value" :value="value">
        <p class="font-semibold text-gray-800" :class="sizeMap[size].value">{{ value }}</p>
      </slot>
      <!-- suffix 插槽：趋势、操作等 -->
      <slot name="suffix" />
    </div>
  </div>
</template>
