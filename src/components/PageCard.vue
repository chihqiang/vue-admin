<script setup lang="ts">
/**
 * 通用卡片容器
 * 白色圆角卡片 + 细边框 + 可选标题/操作区
 * 几乎所有页面都在用的基础容器组件
 */
import { useSlots } from 'vue'

withDefaults(
  defineProps<{
    /** 卡片标题（不传则不显示标题栏） */
    title?: string
    /** 额外内边距（默认 p-6） */
    bodyClass?: string
    /** 是否去除内边距（用于内部自定义布局） */
    noPadding?: boolean
  }>(),
  {
    title: '',
    bodyClass: '',
    noPadding: false,
  },
)

const slots = useSlots()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-100">
    <!-- 标题栏（有 title 或 header 插槽时显示） -->
    <div
      v-if="title || slots.header || slots.extra"
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
    >
      <h3 v-if="title" class="text-base font-medium text-gray-800">{{ title }}</h3>
      <slot v-else name="header" />
      <div v-if="slots.extra" class="flex items-center gap-3">
        <slot name="extra" />
      </div>
    </div>
    <!-- 内容区 -->
    <div :class="[noPadding ? '' : 'p-6', bodyClass]">
      <slot />
    </div>
    <!-- 底部插槽 -->
    <div v-if="slots.footer" class="px-6 py-4 border-t border-gray-100">
      <slot name="footer" />
    </div>
  </div>
</template>
