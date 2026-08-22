<script setup lang="ts">
/**
 * 通用卡片容器 PageCard
 *
 * 特性：
 * - title 支持 string 或 #title 插槽，灵活自定义标题内容
 * - #header 插槽完全替代标题区域
 * - #extra 插槽放在标题右侧（操作按钮等）
 * - #default 插槽为卡片内容区
 * - #footer 插槽为底部区域（带上边框）
 * - loading 状态：内容区显示骨架占位
 * - bordered / shadow / hoverable 开关
 * - bodyClass / bodyStyle 自定义内容区样式
 * - noPadding 去除默认内边距，完全自定义布局
 */
import { useSlots } from 'vue'

withDefaults(
  defineProps<{
    /** 卡片标题（string 或用 #title 插槽自定义） */
    title?: string
    /** 是否显示边框 */
    bordered?: boolean
    /** 是否显示阴影 */
    shadow?: boolean
    /** 是否 hover 时上浮 */
    hoverable?: boolean
    /** 是否加载中（内容区替换为骨架） */
    loading?: boolean
    /** 去除内容区内边距 */
    noPadding?: boolean
    /** 内容区自定义 class */
    bodyClass?: string
    /** 内容区自定义 style */
    bodyStyle?: Record<string, string>
  }>(),
  {
    title: '',
    bordered: true,
    shadow: false,
    hoverable: false,
    loading: false,
    noPadding: false,
    bodyClass: '',
    bodyStyle: () => ({}),
  },
)

const slots = useSlots()

/** 是否显示头部 */
const showHeader = (title: string, s: ReturnType<typeof useSlots>) =>
  title || s.title || s.extra || s.header
</script>

<template>
  <div
    class="rounded-lg bg-white transition-all"
    :class="[
      bordered ? 'border border-gray-100' : '',
      shadow ? 'shadow-sm' : '',
      hoverable ? 'hover:shadow-md hover:border-blue-200 cursor-pointer' : '',
    ]"
  >
    <!-- 头部区域 -->
    <div
      v-if="showHeader(title, slots)"
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
    >
      <!-- 标题：优先 #title 插槽，其次 title prop，最后 #header 插槽 -->
      <slot name="title">
        <h3 v-if="title" class="text-base font-medium text-gray-800">{{ title }}</h3>
        <slot v-else name="header" />
      </slot>
      <!-- 右侧操作区 -->
      <div v-if="slots.extra" class="flex items-center gap-3">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容区 -->
    <div :class="[noPadding ? '' : 'p-6', bodyClass]" :style="bodyStyle">
      <!-- 加载中骨架 -->
      <template v-if="loading">
        <div class="space-y-3 animate-pulse">
          <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          <div class="h-4 bg-gray-100 rounded w-1/2"></div>
          <div class="h-4 bg-gray-100 rounded w-2/3"></div>
        </div>
      </template>
      <!-- 默认内容 -->
      <slot v-else />
    </div>

    <!-- 底部区域 -->
    <div v-if="slots.footer" class="px-6 py-4 border-t border-gray-100">
      <slot name="footer" />
    </div>
  </div>
</template>
