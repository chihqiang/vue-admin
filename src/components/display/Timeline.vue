<script setup lang="ts">
/**
 * 时间线 Timeline
 *
 * 特性：
 * - items: { color, dot, content, time }[]
 * - mode: left / right / alternate
 * - reverse: 倒序
 * - #default: 自定义内容 ({ item, index })
 * - #dot: 自定义节点图标
 */
import { computed } from 'vue'
import type { Component } from 'vue'

interface TimelineItem {
  color?: string
  dot?: Component
  content?: string
  time?: string
}

const props = withDefaults(
  defineProps<{
    items?: TimelineItem[]
    mode?: 'left' | 'right' | 'alternate'
    reverse?: boolean
  }>(),
  {
    items: () => [],
    mode: 'left',
    reverse: false,
  },
)



const displayItems = computed(() => (props.reverse ? [...props.items].reverse() : props.items))

/** 颜色映射 */
const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-300',
}
</script>

<template>
  <div class="relative">
    <div
      v-for="(item, index) in displayItems"
      :key="index"
      class="flex gap-3 pb-4 last:pb-0 relative"
      :class="mode === 'right' ? 'flex-row-reverse' : ''"
    >
      <!-- 轴线 + 节点 -->
      <div class="relative flex flex-col items-center">
        <!-- 节点 -->
        <div class="w-3 h-3 rounded-full z-10 mt-1 flex-shrink-0" :class="colorMap[item.color || 'blue']">
          <slot name="dot" :item="item">
            <component v-if="item.dot" :is="item.dot" :size="12" class="text-white -m-px" />
          </slot>
        </div>
        <!-- 竖线 -->
        <div
          v-if="index < displayItems.length - 1"
          class="absolute top-3 bottom-0 w-0.5 bg-gray-100"
        ></div>
      </div>

      <!-- 内容 -->
      <div class="flex-1 min-w-0 pb-1">
        <div v-if="item.content" class="text-sm text-gray-700">
          <slot :item="item" :index="index">{{ item.content }}</slot>
        </div>
        <div v-if="item.time" class="text-xs text-gray-400 mt-0.5">{{ item.time }}</div>
      </div>
    </div>
  </div>
</template>
