/**
 * 趋势指示组件
 * 根据 flag 展示涨/跌箭头 + 文字
 * 参考原项目 Trend，使用 TailwindCSS + @lucide/vue 重写
 */
<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    /** 趋势方向：up=上涨，down=下跌 */
    flag: 'up' | 'down'
  }>(),
  {
    flag: 'up',
  },
)

const isUp = computed(() => props.flag === 'up')
</script>

<template>
  <div class="inline-flex items-center gap-1 text-sm">
    <span class="text-gray-400">
      <slot name="term" />
    </span>
    <span
      :class="isUp ? 'text-red-500' : 'text-green-500'"
      class="inline-flex items-center gap-0.5 font-medium"
    >
      <component :is="isUp ? TrendingUp : TrendingDown" :size="14" />
      <slot />
    </span>
  </div>
</template>
