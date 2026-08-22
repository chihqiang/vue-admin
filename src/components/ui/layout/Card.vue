<script setup lang="ts">
/**
 * 卡片 Card
 *
 * 特性：
 * - title: 标题（string 或 #title 插槽）
 * - bordered: 边框
 * - shadow: 阴影
 * - hoverable: 悬停上浮
 * - loading: 骨架加载
 * - size: sm / md
 * - bodyStyle: 内容区内联样式
 * - #default: 内容区
 * - #title: 自定义标题
 * - #extra: 右上角操作区
 * - #cover: 封面图
 * - #actions: 底部操作区
 * - #footer: 底部内容区
 */
import { useSlots } from 'vue'

withDefaults(
  defineProps<{
    title?: string
    bordered?: boolean
    shadow?: boolean
    hoverable?: boolean
    loading?: boolean
    size?: 'sm' | 'md'
    bodyStyle?: Record<string, string>
  }>(),
  {
    title: '',
    bordered: true,
    shadow: false,
    hoverable: false,
    loading: false,
    size: 'md',
    bodyStyle: () => ({}),
  },
)

const slots = useSlots()
</script>

<template>
  <div
    class="bg-white rounded-lg transition-all"
    :class="[
      bordered ? 'border border-gray-100' : '',
      shadow ? 'shadow-md' : '',
      hoverable ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : '',
    ]"
  >
    <!-- 封面 -->
    <div v-if="slots.cover" class="overflow-hidden rounded-t-lg">
      <slot name="cover" />
    </div>

    <!-- 标题栏 -->
    <div
      v-if="title || slots.title || slots.extra"
      class="flex items-center justify-between border-b border-gray-50"
      :class="size === 'sm' ? 'px-3 py-2' : 'px-5 py-3.5'"
    >
      <div class="font-medium text-gray-800 text-sm">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="slots.extra" class="flex items-center">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容区 -->
    <div :class="size === 'sm' ? 'p-3' : 'p-5'" :style="bodyStyle">
      <!-- 骨架 -->
      <template v-if="loading">
        <div class="space-y-2">
          <div class="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
          <div class="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
          <div class="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
        </div>
      </template>
      <slot v-else />
    </div>

    <!-- 底部操作区 -->
    <div v-if="slots.actions" class="flex items-center justify-around border-t border-gray-50 px-5 py-2.5">
      <slot name="actions" />
    </div>

    <!-- 底部内容 -->
    <div v-if="slots.footer" class="border-t border-gray-50 px-5 py-3">
      <slot name="footer" />
    </div>
  </div>
</template>
