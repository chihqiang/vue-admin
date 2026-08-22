<script setup lang="ts">
/**
 * 可选标签 CheckableTag
 *
 * 特性：
 * - v-model:checked 双向绑定
 * - #default 自定义内容
 *
 * 事件：
 * - @change: 选中状态变化
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    checked?: boolean
  }>(),
  {
    checked: false,
  },
)

const emit = defineEmits<{
  'update:checked': [value: boolean]
  change: [value: boolean]
}>()

function toggle() {
  const val = !props.checked
  emit('update:checked', val)
  emit('change', val)
}

const tagClass = computed(() =>
  props.checked
    ? 'bg-blue-50 text-blue-600 border-blue-200'
    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300',
)
</script>

<template>
  <span
    class="inline-flex items-center text-sm px-2 py-0.5 rounded border cursor-pointer transition-colors select-none"
    :class="tagClass"
    @click="toggle"
  >
    <slot />
  </span>
</template>
