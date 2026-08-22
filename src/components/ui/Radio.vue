<script setup lang="ts" generic="T extends string | number">
/**
 * 单选框 Radio
 *
 * 特性：
 * - v-model 双向绑定（绑定"组内当前选中的值"）
 * - value：该 radio 自身的标识值（用于与 modelValue 比较判断是否选中）
 * - disabled
 * - #default 自定义文字
 *
 * 组内单选用法：
 *   <Radio v-model="selected" :value="1">选项一</Radio>
 *   <Radio v-model="selected" :value="2">选项二</Radio>
 *
 * 事件：
 * - @change: 值变化
 */
import { Check } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    value?: T
    modelValue?: T
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T]
}>()

const isChecked = () => props.modelValue === props.value

function handleClick() {
  if (props.disabled) return
  if (props.value !== undefined) {
    emit('update:modelValue', props.value)
    emit('change', props.value)
  }
}
</script>

<template>
  <label
    class="inline-flex items-center gap-1.5 cursor-pointer select-none"
    :class="disabled ? 'cursor-not-allowed opacity-50' : ''"
    @click="handleClick"
  >
    <!-- 圆圈 -->
    <span
      class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
      :class="isChecked() ? 'border-blue-500' : 'border-gray-300'"
    >
      <span
        v-if="isChecked()"
        class="w-2 h-2 rounded-full bg-blue-500"
      ></span>
    </span>
    <!-- 文字 -->
    <span v-if="$slots.default" class="text-sm text-gray-700">
      <slot />
    </span>
  </label>
</template>
