/**
 * 数字信息组件
 * 展示主数值 + 子数值（带涨跌箭头）
 * 参考原项目 NumberInfo，使用 TailwindCSS 重写
 */
<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    /** 主数值 */
    total: number | string
    /** 子数值（涨跌幅百分比） */
    subTotal?: number
    /** 子数值方向：up=红，down=绿 */
    status?: 'up' | 'down'
  }>(),
  {
    subTotal: 0,
    status: 'up',
  },
)

const isUp = computed(() => props.status === 'up')
</script>

<template>
  <div>
    <!-- 副标题 -->
    <div
      v-if="$slots.subtitle"
      class="flex items-center text-sm text-gray-500 mb-1"
    >
      <slot name="subtitle" />
    </div>

    <!-- 主数值 -->
    <div class="flex items-baseline gap-2">
      <span class="text-2xl font-medium text-gray-800">{{ total }}</span>
      <span
        :class="isUp ? 'text-red-500' : 'text-green-500'"
        class="inline-flex items-center text-sm font-medium"
      >
        <component :is="isUp ? ArrowUp : ArrowDown" :size="12" />
        {{ subTotal }}%
      </span>
    </div>
  </div>
</template>
