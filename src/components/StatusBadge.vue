<script setup lang="ts">
/**
 * 状态标签/徽章
 * 根据状态类型渲染不同颜色的标签
 * 用于列表、表格、卡片等位置的状态展示
 */

withDefaults(
  defineProps<{
    /** 标签文字 */
    text: string
    /** 状态类型 */
    type?: 'blue' | 'green' | 'orange' | 'red' | 'gray'
  }>(),
  {
    type: 'blue',
  },
)

/** 状态色映射 */
const colorMap: Record<string, string> = {
  blue: 'text-blue-600 bg-blue-50',
  green: 'text-green-600 bg-green-50',
  orange: 'text-orange-500 bg-orange-50',
  red: 'text-red-600 bg-red-50',
  gray: 'text-gray-500 bg-gray-50',
}
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 text-xs rounded"
    :class="colorMap[type]"
  >
    {{ text }}
  </span>
</template>
