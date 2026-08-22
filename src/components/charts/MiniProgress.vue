/**
 * 迷你进度条组件
 * 展示目标进度和实际进度，带目标刻度线
 * 参考原项目 MiniProgress，使用 TailwindCSS 重写
 */
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 目标值百分比 */
    target?: number
    /** 实际进度百分比 */
    percentage?: number
    /** 进度条高度（px） */
    height?: number
    /** 进度条颜色 */
    color?: string
  }>(),
  {
    target: 0,
    percentage: 0,
    height: 10,
    color: '#13C2C2',
  },
)

/** 进度条实际宽度 */
const barWidth = computed(() => `${props.percentage}%`)
/** 目标刻度线位置 */
const targetLeft = computed(() => `${props.target}%`)
/** 进度条容器高度（转成 style） */
const barHeight = computed(() => `${props.height}px`)
</script>

<template>
  <div class="w-full">
    <div class="relative w-full bg-gray-100 rounded-full" :style="{ height: barHeight }">
      <!-- 实际进度 -->
      <div
        class="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
        :style="{ width: barWidth, backgroundColor: color }"
      />

      <!-- 目标刻度线 -->
      <div
        class="absolute top-0 -translate-x-1/2 w-0.5 bg-gray-700"
        :style="{ left: targetLeft, height: barHeight }"
      />
    </div>
  </div>
</template>
