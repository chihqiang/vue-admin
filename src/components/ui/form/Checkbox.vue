<script setup lang="ts">
/**
 * 复选框 Checkbox
 *
 * 特性：
 * - v-model:checked 双向绑定
 * - disabled
 * - indeterminate: 半选状态
 * - #default 自定义文字
 *
 * 事件：
 * - @change: 值变化
 */
import { Check, Minus } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    checked?: boolean
    disabled?: boolean
    indeterminate?: boolean
  }>(),
  {
    checked: false,
    disabled: false,
    indeterminate: false,
  },
)

const emit = defineEmits<{
  'update:checked': [value: boolean]
  change: [e: Event]
}>()

function toggle() {
  if (props.disabled) return
  emit('update:checked', !props.checked)
}

function handleClick(e: Event) {
  if (props.disabled) return
  emit('change', e)
  toggle()
}
</script>

<template>
  <label
    class="inline-flex items-center gap-1.5 cursor-pointer select-none"
    :class="disabled ? 'cursor-not-allowed opacity-50' : ''"
    @click="handleClick"
  >
    <!-- 框 -->
    <span
      class="w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0"
      :class="[
        indeterminate || checked
          ? 'bg-blue-500 border-blue-500 text-white'
          : 'border-gray-300 bg-white',
      ]"
    >
      <Check v-if="checked && !indeterminate" :size="12" />
      <Minus v-if="indeterminate" :size="12" />
    </span>
    <!-- 文字 -->
    <span v-if="$slots.default" class="text-sm text-gray-700">
      <slot />
    </span>
  </label>
</template>
