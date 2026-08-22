<script setup lang="ts">
/**
 * 统计卡片
 * 图标 + 标签 + 数值 + 趋势涨跌
 * 用于 Dashboard、Monitor、BasicList 等页面顶部统计区域
 */
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    /** 标签文字 */
    label: string
    /** 数值 */
    value: string | number
    /** 图标组件 */
    icon?: Component
    /** 主题色 */
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
    /** 趋势文字（如 "12%"） */
    trend?: string
    /** 趋势方向：true=上涨(绿色)，false=下跌(红色) */
    trendUp?: boolean
  }>(),
  {
    color: 'blue',
    trend: '',
    trendUp: true,
  },
)

/** 主题色映射 */
const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-500',
  green: 'bg-green-50 text-green-500',
  purple: 'bg-purple-50 text-purple-500',
  orange: 'bg-orange-50 text-orange-500',
  red: 'bg-red-50 text-red-500',
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-100 p-5 flex items-center gap-4">
    <!-- 图标 -->
    <div
      v-if="icon"
      class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
      :class="colorMap[color]"
    >
      <component :is="icon" :size="22" />
    </div>
    <!-- 文字内容 -->
    <div class="flex-1 min-w-0">
      <p class="text-sm text-gray-400 mb-1">{{ label }}</p>
      <p class="text-xl font-semibold text-gray-800">{{ value }}</p>
      <p
        v-if="trend"
        class="text-xs mt-0.5"
        :class="trendUp ? 'text-green-500' : 'text-red-500'"
      >
        {{ trendUp ? '↑' : '↓' }} {{ trend }}
      </p>
    </div>
  </div>
</template>
