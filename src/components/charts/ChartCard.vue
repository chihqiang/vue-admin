/**
 * 图表卡片容器组件
 * 用于展示带标题、总计数值、内容区和底部插槽的卡片
 * 参考原项目 ChartCard，使用 TailwindCSS 重写样式
 */
<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    /** 卡片标题 */
    title?: string
    /** 总计数值（大号展示） */
    total?: string | number
    /** 是否加载中 */
    loading?: boolean
  }>(),
  {
    title: '',
    total: '',
    loading: false,
  },
)

/** 格式化后的总计数值 */
const totalDisplay = computed(() => props.total)
</script>

<template>
  <div
    class="relative bg-white rounded-lg border border-gray-100 transition-shadow hover:shadow-md"
    :class="loading ? 'overflow-hidden' : ''"
  >
    <!-- 加载态遮罩 -->
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm"
    >
      <Loader2 :size="24" class="animate-spin text-blue-500" />
    </div>

    <!-- 头部：标题 + 操作区 -->
    <div class="flex items-center justify-between px-6 pt-5 pb-2">
      <div class="text-sm text-gray-500">{{ title }}</div>
      <div v-if="$slots.action" class="text-gray-400">
        <slot name="action" />
      </div>
    </div>

    <!-- 总计数值 -->
    <div
      v-if="totalDisplay !== ''"
      class="px-6 text-2xl font-medium text-gray-800 tracking-wide"
    >
      {{ totalDisplay }}
    </div>

    <!-- 内容区 -->
    <div v-if="$slots.default" class="px-6 py-4">
      <slot />
    </div>

    <!-- 底部 -->
    <div
      v-if="$slots.footer"
      class="px-6 py-3 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-4"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
