<script setup lang="ts">
/**
 * 空状态占位组件
 * 用于列表、表格、搜索结果为空时的展示
 */

withDefaults(
  defineProps<{
    /** 提示文字 */
    text?: string
    /** 图标大小 */
    iconSize?: number
  }>(),
  {
    text: '暂无数据',
    iconSize: 48,
  },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-gray-400">
    <!-- 空状态图标（SVG） -->
    <svg
      :width="iconSize"
      :height="iconSize"
      viewBox="0 0 64 64"
      fill="none"
      class="mb-3 text-gray-300"
    >
      <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" stroke-width="2" />
      <path d="M8 24h48" stroke="currentColor" stroke-width="2" />
      <circle cx="16" cy="18" r="1.5" fill="currentColor" />
      <circle cx="20" cy="18" r="1.5" fill="currentColor" />
      <path d="M24 36h16M24 42h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <p class="text-sm">{{ text }}</p>
  </div>
</template>
