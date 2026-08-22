<script setup lang="ts">
/**
 * 进度条 Progress
 *
 * 特性：
 * - percent: 百分比 (0-100)
 * - type: line / circle
 * - size: sm / md / lg
 * - status: active / success / exception / normal
 * - showInfo: 显示百分比文字
 * - strokeColor: 自定义进度条颜色
 * - strokeWidth: 线宽
 * - #format: 自定义显示文字 ({ percent })
 *
 * 事件：
 * - @complete: 100% 时触发
 */
import { computed, watch, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    percent?: number
    type?: 'line' | 'circle'
    size?: 'sm' | 'md' | 'lg'
    status?: 'active' | 'success' | 'exception' | 'normal'
    showInfo?: boolean
    strokeColor?: string
    strokeWidth?: number
  }>(),
  {
    percent: 0,
    type: 'line',
    size: 'md',
    status: 'normal',
    showInfo: true,
    strokeColor: '',
    strokeWidth: 6,
  },
)

const emit = defineEmits<{ complete: [] }>()

watch(
  () => props.percent,
  (val) => {
    if (val >= 100) emit('complete')
  },
)

const slots = useSlots()

/** 颜色 */
const barColor = computed(() => {
  if (props.strokeColor) return props.strokeColor
  if (props.status === 'success') return '#52c41a'
  if (props.status === 'exception') return '#ff4d4f'
  return '#1677ff'
})

const heightClass = computed(() => ({ sm: 'h-1', md: 'h-1.5', lg: 'h-2' }[props.size]))
</script>

<template>
  <!-- 线形 -->
  <div v-if="type === 'line'" class="inline-flex items-center w-full gap-2">
    <div class="flex-1 bg-gray-100 rounded-full overflow-hidden" :class="heightClass">
      <div
        class="h-full rounded-full transition-all duration-300"
        :style="{ width: `${Math.min(percent, 100)}%`, backgroundColor: barColor }"
        :class="status === 'active' ? 'animate-pulse' : ''"
      ></div>
    </div>
    <span v-if="showInfo" class="text-xs text-gray-500 w-10 text-right">
      <slot name="format" :percent="percent">{{ percent }}%</slot>
    </span>
  </div>

  <!-- 圆形 -->
  <div v-else class="relative inline-flex items-center justify-center">
    <svg :width="strokeWidth * 10 + 20" :height="strokeWidth * 10 + 20" class="-rotate-90">
      <circle
        :cx="(strokeWidth * 10 + 20) / 2"
        :cy="(strokeWidth * 10 + 20) / 2"
        :r="(strokeWidth * 10 + 20) / 2 - strokeWidth / 2 - 2"
        fill="none"
        stroke="#f0f0f0"
        :stroke-width="strokeWidth"
      />
      <circle
        :cx="(strokeWidth * 10 + 20) / 2"
        :cy="(strokeWidth * 10 + 20) / 2"
        :r="(strokeWidth * 10 + 20) / 2 - strokeWidth / 2 - 2"
        fill="none"
        :stroke="barColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="2 * Math.PI * ((strokeWidth * 10 + 20) / 2 - strokeWidth / 2 - 2)"
        :stroke-dashoffset="2 * Math.PI * ((strokeWidth * 10 + 20) / 2 - strokeWidth / 2 - 2) * (1 - Math.min(percent, 100) / 100)"
        class="transition-all duration-300"
      />
    </svg>
    <span v-if="showInfo" class="absolute text-xs font-medium text-gray-600">
      <slot name="format" :percent="percent">{{ percent }}%</slot>
    </span>
  </div>
</template>
