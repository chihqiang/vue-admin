<script setup lang="ts" generic="T extends string | number">
/**
 * 步骤条 Steps
 *
 * 特性：
 * - current: 当前步骤（从 0 开始）
 * - items: { title, description, icon }[]
 * - size: sm / md
 * - direction: horizontal / vertical
 * - status: 当前步骤状态 (wait / process / finish / error)
 * - 步骤内容：通过具名插槽 `#step-{index}` 渲染对应步骤的内容，仅当前步骤显示
 *
 * 事件：
 * - @change: 点击步骤时 (index)
 */
import { computed, useSlots } from 'vue'
import type { Component } from 'vue'

interface StepItem {
  title: string
  description?: string
  icon?: Component
}

const props = withDefaults(
  defineProps<{
    current?: number
    items?: StepItem[]
    size?: 'sm' | 'md'
    direction?: 'horizontal' | 'vertical'
    status?: 'wait' | 'process' | 'finish' | 'error'
  }>(),
  {
    current: 0,
    items: () => [],
    size: 'md',
    direction: 'horizontal',
    status: 'process',
  },
)

const emit = defineEmits<{
  change: [index: number]
}>()

/** 获取每个步骤的状态 */
function getStepStatus(index: number): 'wait' | 'process' | 'finish' | 'error' {
  if (index < props.current) return 'finish'
  if (index === props.current) return props.status
  return 'wait'
}

/** 点击步骤 */
function handleClick(index: number) {
  emit('change', index)
}

// 图标和颜色映射
const statusConfig = {
  wait: { dot: 'bg-gray-200', text: 'text-gray-400', border: 'border-gray-200' },
  process: { dot: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  finish: { dot: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  error: { dot: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
}

const slots = useSlots()

/** 是否传入了任意步骤内容插槽（#step-{index}） */
const hasStepContent = computed(() =>
  props.items.some((_, i) => !!slots[`step-${i}`]),
)
</script>

<template>
  <div>
    <!-- 步骤条 -->
    <div
      class="flex"
      :class="direction === 'horizontal' ? 'flex-row' : 'flex-col'"
    >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="flex"
      :class="direction === 'horizontal'
        ? 'flex-1 flex-col'
        : 'w-full pb-8 last:pb-0'"
    >
      <div class="flex" :class="direction === 'horizontal' ? 'items-start' : 'items-start'">
        <!-- 步骤圆点 -->
        <div class="flex flex-col items-center" :class="direction === 'horizontal' ? '' : 'flex-row'">
          <button
            class="w-8 h-8 rounded-full flex items-center justify-center font-medium border-2 transition-all flex-shrink-0"
            :class="[
              size === 'sm' ? 'w-6 h-6 text-xs' : 'text-sm',
              statusConfig[getStepStatus(index)].border,
              statusConfig[getStepStatus(index)].text,
              getStepStatus(index) === 'process' ? 'bg-blue-50' : 'bg-white',
            ]"
            @click="handleClick(index)"
          >
            <!-- 自定义图标 -->
            <component v-if="item.icon" :is="item.icon" :size="14" />
            <!-- 完成图标 -->
            <svg v-else-if="getStepStatus(index) === 'finish'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <!-- 序号 -->
            <span v-else>{{ index + 1 }}</span>
          </button>
        </div>

        <!-- 标题和描述 -->
        <div class="ml-3 flex-1 min-w-0" :class="direction === 'horizontal' ? 'mb-2' : ''">
          <div class="font-medium text-sm" :class="statusConfig[getStepStatus(index)].text">
            {{ item.title }}
          </div>
          <div v-if="item.description" class="text-xs text-gray-400 mt-0.5">
            {{ item.description }}
          </div>
        </div>
      </div>

      <!-- 连接线 -->
      <div
        v-if="index < items.length - 1"
        class="flex-1 mx-4 my-2 border-t-2 transition-colors"
        :class="[
          direction === 'vertical' ? 'ml-4 mt-1 mb-1 border-l-2 border-t-0 h-8' : '',
          getStepStatus(index) === 'finish' ? 'border-blue-500' : 'border-gray-200',
        ]"
      ></div>
    </div>
    </div>

    <!-- 步骤内容区（可选）：通过具名插槽 #step-{index} 渲染当前步骤内容 -->
    <div v-if="hasStepContent" class="mt-8">
      <template v-for="(item, index) in items" :key="`content-${index}`">
        <div v-show="index === current">
          <slot :name="`step-${index}`" :current="current" :item="item" />
        </div>
      </template>
    </div>
  </div>
</template>
