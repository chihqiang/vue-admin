<script setup lang="ts">
/**
 * 搜索输入框 SearchInput
 *
 * 特性：
 * - v-model 双向绑定
 * - size: sm / md / lg
 * - clearable: 显示清除按钮
 * - disabled: 禁用
 * - #prefix 插槽：替换默认搜索图标（可放任意内容）
 * - #suffix 插槽：输入框右侧追加内容（如搜索按钮）
 * - @search 事件：按 Enter 或点击搜索时触发
 * - @clear 事件：清除时触发
 * - customClass: 完全自定义容器样式
 */
import { ref } from 'vue'

withDefaults(
  defineProps<{
    /** 占位文字 */
    placeholder?: string
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg'
    /** 是否可清除 */
    clearable?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 容器自定义 class（覆盖宽度等） */
    customClass?: string
  }>(),
  {
    placeholder: '请输入',
    size: 'md',
    clearable: false,
    disabled: false,
    customClass: '',
  },
)

const emit = defineEmits<{
  search: [value: string]
  clear: []
}>()

const model = defineModel<string>({ default: '' })

/** 是否显示清除按钮 */
const showClear = ref(false)

/** 尺寸映射 */
const sizeMap = {
  sm: 'h-7 text-xs pl-7 pr-3',
  md: 'h-8 text-sm pl-8 pr-3',
  lg: 'h-10 text-base pl-10 pr-4',
}

/** 前缀图标尺寸 */
const iconSizeMap = {
  sm: 12,
  md: 14,
  lg: 16,
}

/** 清除按钮位置 */
const clearRightMap = {
  sm: 'right-2',
  md: 'right-2.5',
  lg: 'right-3',
}

/** 处理搜索（Enter） */
function handleEnter() {
  emit('search', model.value)
}

/** 清除输入 */
function handleClear() {
  model.value = ''
  emit('clear')
}
</script>

<template>
  <div class="relative inline-flex items-center" :class="customClass">
    <!-- 前缀：默认搜索图标，可用 #prefix 插槽替换 -->
    <div class="absolute left-2.5 pointer-events-none flex items-center" :class="size === 'sm' ? 'left-2' : 'left-2.5'">
      <slot name="prefix">
        <svg
          :width="iconSizeMap[size]"
          :height="iconSizeMap[size]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-gray-400"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </slot>
    </div>

    <!-- 输入框 -->
    <input
      v-model="model"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
      :class="[
        sizeMap[size],
        clearable && model ? clearRightMap[size] : '',
      ]"
      @focus="showClear = true"
      @blur="showClear = false"
      @keyup.enter="handleEnter"
    />

    <!-- 清除按钮 -->
    <button
      v-if="clearable && model"
      type="button"
      class="absolute flex items-center text-gray-300 hover:text-gray-500"
      :class="clearRightMap[size]"
      @click="handleClear"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </svg>
    </button>

    <!-- 后缀插槽：搜索按钮等 -->
    <slot name="suffix" />
  </div>
</template>
