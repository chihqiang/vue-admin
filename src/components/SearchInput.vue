<script setup lang="ts">
/**
 * 搜索输入框
 * 带搜索图标的输入框，支持 v-model 双向绑定
 */

withDefaults(
  defineProps<{
    /** 输入框占位文字 */
    placeholder?: string
    /** 输入框宽度 */
    width?: string
  }>(),
  {
    placeholder: '请输入',
    width: 'w-56',
  },
)

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="relative" :class="width">
    <input
      v-model="model"
      type="text"
      :placeholder="placeholder"
      class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
    />
    <!-- 搜索图标 -->
    <svg
      class="absolute left-2.5 top-2 text-gray-400 pointer-events-none"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  </div>
</template>
