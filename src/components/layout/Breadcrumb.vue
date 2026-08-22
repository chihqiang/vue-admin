<script setup lang="ts" generic="T extends string | number">
/**
 * 面包屑 Breadcrumb
 *
 * 特性：
 * - items: { title, to, icon }[] 配置式
 * - separator: 分隔符（默认 /）
 * - #default: 自定义内容（配合 BreadcrumbItem 使用）
 *
 * 用法：
 *   <Breadcrumb :items="[{ title: '首页', to: '/' }, { title: '列表' }]" />
 */
import type { Component } from 'vue'
import { useRouter } from 'vue-router'

interface BreadcrumbItem {
  title: string
  to?: string
  icon?: Component
}

withDefaults(
  defineProps<{
    items?: BreadcrumbItem[]
    separator?: string
  }>(),
  {
    items: () => [],
    separator: '/',
  },
)

const router = useRouter()

function handleClick(item: BreadcrumbItem) {
  if (item.to) router.push(item.to)
}
</script>

<template>
  <nav class="flex items-center text-sm">
    <template v-for="(item, index) in items" :key="index">
      <!-- 面包屑项 -->
      <div
        class="flex items-center gap-1"
        :class="index === items.length - 1 ? 'text-gray-500' : 'text-blue-500 hover:text-blue-600 cursor-pointer'"
        @click="handleClick(item)"
      >
        <component v-if="item.icon" :is="item.icon" :size="14" />
        <span>{{ item.title }}</span>
      </div>
      <!-- 分隔符 -->
      <span
        v-if="index < items.length - 1"
        class="mx-2 text-gray-300"
      >
        {{ separator }}
      </span>
    </template>
  </nav>
</template>
