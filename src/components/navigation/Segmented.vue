<script setup lang="ts" generic="T extends string | number">
/**
 * 分段控制器 Segmented
 *
 * 参考：https://ant.design/components/segmented-cn
 *
 * 特性：
 * - v-model:value / v-model 双向绑定
 * - options: { label, value, disabled, payload }[] 配置式
 * - block: 撑满父容器宽度
 * - size: sm / md / lg
 *
 * 事件：
 * - @change: 值变化 (value, option)
 *
 * 插槽：
 * - #label: 自定义选项内容 ({ option })
 */
import { computed } from 'vue'

interface SegmentedOption<T> {
  label: string
  value: T
  disabled?: boolean
  payload?: unknown
}

const props = withDefaults(
  defineProps<{
    /** v-model:value 选中值 */
    value?: T
    /** 兼容 v-model（无参数） */
    modelValue?: T
    options?: SegmentedOption<T>[]
    block?: boolean
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  {
    options: () => [],
    block: false,
    size: 'md',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:value': [value: T]
  'update:modelValue': [value: T]
  change: [value: T, option: SegmentedOption<T>]
}>()

/** 当前选中值（兼容 value / modelValue） */
const currentValue = computed<T | undefined>(() => (props.value !== undefined ? props.value : props.modelValue))

/** 尺寸样式 */
const sizeClass = computed(() => ({
  sm: { wrap: 'p-0.5 text-xs', item: 'h-6 px-2.5' },
  md: { wrap: 'p-1 text-sm', item: 'h-7 px-3' },
  lg: { wrap: 'p-1 text-base', item: 'h-9 px-4' },
}[props.size]))

function selectOption(option: SegmentedOption<T>) {
  if (props.disabled || option.disabled) return
  if (option.value === currentValue.value) return
  emit('update:value', option.value)
  emit('update:modelValue', option.value)
  emit('change', option.value, option)
}
</script>

<template>
  <div
    class="inline-flex items-center bg-gray-100 rounded-md"
    :class="[sizeClass.wrap, block ? 'w-full' : '', disabled ? 'opacity-50 cursor-not-allowed' : '']"
  >
    <div
      v-for="option in options"
      :key="option.value"
      class="inline-flex items-center justify-center cursor-pointer rounded transition-colors"
      :class="[
        sizeClass.item,
        block ? 'flex-1' : '',
        option.disabled
          ? 'text-gray-300 cursor-not-allowed'
          : option.value === currentValue
            ? 'bg-white text-blue-600 shadow-sm font-medium'
            : 'text-gray-600 hover:text-gray-800',
      ]"
      @click="selectOption(option)"
    >
      <slot name="label" :option="option">{{ option.label }}</slot>
    </div>
  </div>
</template>
