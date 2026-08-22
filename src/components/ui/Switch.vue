<script setup lang="ts">
/**
 * 开关 Switch
 *
 * 特性：
 * - v-model:checked 双向绑定
 * - disabled
 * - loading
 * - size: sm / md
 * - checkedText / uncheckedText: 开/关文字
 *
 * 事件：
 * - @change: 值变化
 */
import { LoaderCircle } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    checked?: boolean
    disabled?: boolean
    loading?: boolean
    size?: 'sm' | 'md'
    checkedText?: string
    uncheckedText?: string
  }>(),
  {
    checked: false,
    disabled: false,
    loading: false,
    size: 'md',
    checkedText: '',
    uncheckedText: '',
  },
)

const emit = defineEmits<{
  'update:checked': [value: boolean]
  change: [value: boolean]
}>()

function toggle() {
  if (props.disabled || props.loading) return
  const val = !props.checked
  emit('update:checked', val)
  emit('change', val)
}

// 尺寸
const sizeClass = props.size === 'sm'
  ? { wrap: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4', text: 'text-xs' }
  : { wrap: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5', text: 'text-xs' }
</script>

<template>
  <button
    type="button"
    class="relative inline-flex items-center rounded-full transition-colors duration-200 flex-shrink-0"
    :class="[
      sizeClass.wrap,
      checked ? 'bg-blue-500' : 'bg-gray-300',
      disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
    @click="toggle"
  >
    <!-- 文字 -->
    <span
      v-if="checkedText || uncheckedText"
      class="absolute inset-0 flex items-center justify-center text-white"
      :class="[sizeClass.text, checked ? 'left-0 pl-1.5' : 'right-0 pr-1.5']"
    >
      {{ checked ? checkedText : uncheckedText }}
    </span>
    <!-- 圆点 -->
    <span
      class="absolute left-0.5 top-0.5 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center"
      :class="[sizeClass.thumb, checked ? sizeClass.translate : '']"
    >
      <LoaderCircle v-if="loading" :size="10" class="animate-spin text-blue-500" />
    </span>
  </button>
</template>
