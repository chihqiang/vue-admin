<script setup lang="ts">
/**
 * 状态标签 StatusBadge
 *
 * 特性：
 * - type: 预设颜色 blue/green/orange/red/gray
 * - variant: filled（填充色）/ outline（描边）/ dot（圆点+文字）
 * - size: sm / md
 * - 默认插槽替代 text prop，可放任意内容
 * - customClass: 完全自定义颜色（覆盖预设）
 */
withDefaults(
  defineProps<{
    /** 标签文字（也可用默认插槽自定义内容） */
    text?: string
    /** 预设颜色类型 */
    type?: 'blue' | 'green' | 'orange' | 'red' | 'gray'
    /** 样式变体 */
    variant?: 'filled' | 'outline' | 'dot'
    /** 尺寸 */
    size?: 'sm' | 'md'
    /** 完全自定义 class（覆盖预设颜色） */
    customClass?: string
  }>(),
  {
    text: '',
    type: 'blue',
    variant: 'filled',
    size: 'sm',
    customClass: '',
  },
)

/** filled 颜色映射 */
const filledMap: Record<string, string> = {
  blue: 'text-blue-600 bg-blue-50',
  green: 'text-green-600 bg-green-50',
  orange: 'text-orange-500 bg-orange-50',
  red: 'text-red-600 bg-red-50',
  gray: 'text-gray-500 bg-gray-50',
}

/** outline 颜色映射 */
const outlineMap: Record<string, string> = {
  blue: 'text-blue-600 border border-blue-200',
  green: 'text-green-600 border border-green-200',
  orange: 'text-orange-500 border border-orange-200',
  red: 'text-red-600 border border-red-200',
  gray: 'text-gray-500 border border-gray-200',
}

/** dot 颜色映射 */
const dotMap: Record<string, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-500',
  red: 'text-red-600',
  gray: 'text-gray-500',
}

/** dot 圆点颜色 */
const dotBgMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
}

/** 尺寸映射 */
const sizeMap = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded"
    :class="[
      sizeMap[size],
      customClass || (variant === 'filled' ? filledMap[type] : variant === 'outline' ? outlineMap[type] : dotMap[type]),
    ]"
  >
    <!-- dot 模式的圆点 -->
    <span v-if="variant === 'dot'" class="w-1.5 h-1.5 rounded-full" :class="dotBgMap[type]"></span>
    <!-- 内容：默认插槽优先，其次 text prop -->
    <slot>{{ text }}</slot>
  </span>
</template>
