<script setup lang="ts">
/**
 * 输入框组件 Input
 *
 * 特性：
 * - v-model 双向绑定
 * - size: sm / md / lg
 * - disabled / readonly
 * - #prefix 前缀插槽（图标等）
 * - #suffix 后缀插槽（图标等）
 * - allowClear: 可清除
 * - showCount: 显示字数统计
 * - maxlength: 最大长度
 * - type: text / password / number / textarea（textarea 模式渲染多行输入）
 * - rows: textarea 行数（仅 type=textarea 生效，默认 2）
 * - variant: outlined / borderless / filled
 *
 * 事件：
 * - @input / @change / @focus / @blur / @enter
 */
import { computed, ref, useSlots } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    type?: string
    placeholder?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    readonly?: boolean
    allowClear?: boolean
    showCount?: boolean
    maxlength?: number
    variant?: 'outlined' | 'borderless' | 'filled'
    customClass?: string
    /** textarea 行数，仅 type=textarea 时生效 */
    rows?: number
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '请输入',
    size: 'md',
    disabled: false,
    readonly: false,
    allowClear: false,
    showCount: false,
    variant: 'outlined',
    customClass: '',
    rows: 2,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [e: Event]
  focus: [e: FocusEvent]
  blur: [e: FocusEvent]
  enter: [e: KeyboardEvent]
  clear: []
}>()

const slots = useSlots()
const focused = ref(false)

const isTextarea = computed(() => props.type === 'textarea')
const hasPrefix = computed(() => !!slots.prefix)
const hasSuffix = computed(() => !!slots.suffix || props.allowClear || props.showCount)
const showClear = computed(() => props.allowClear && props.modelValue !== '' && !props.disabled)

// 尺寸（textarea 模式仅用 px/padding，不用固定高度）
const sizeClass = computed(() => {
  if (isTextarea.value) {
    return { sm: 'text-xs px-2.5 py-1.5', md: 'text-sm px-3 py-1.5', lg: 'text-base px-3.5 py-2' }[props.size]
  }
  return { sm: 'h-7 text-xs px-2.5', md: 'h-8 text-sm px-3', lg: 'h-10 text-base px-3.5' }[props.size]
})

// 变体样式
const variantClass = computed(() => {
  if (props.variant === 'borderless') return 'border-0 bg-transparent'
  if (props.variant === 'filled') return 'border border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-gray-100'
  return 'border border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400'
})

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()

function handleInput(e: Event) {
  const val = (e.target as HTMLInputElement | HTMLTextAreaElement).value
  emit('update:modelValue', val)
  emit('change', e)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}

function handleFocus(e: FocusEvent) {
  focused.value = true
  emit('focus', e)
}

function handleBlur(e: FocusEvent) {
  focused.value = false
  emit('blur', e)
}

function handleEnter(e: KeyboardEvent) {
  // textarea 模式下不触发 enter（Enter 用于换行）
  if (isTextarea.value) return
  if (e.key === 'Enter') emit('enter', e)
}

/** 暴露 focus 方法 */
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

<template>
  <!-- textarea 模式：relative 容器，字数统计/清除按钮绝对定位右下角 -->
  <div
    v-if="isTextarea"
    class="relative w-full rounded-md transition-colors"
    :class="[
      sizeClass,
      variantClass,
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
      focused && variant === 'outlined' ? 'ring-2 ring-blue-200' : '',
      customClass,
    ]"
  >
    <textarea
      ref="inputRef"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      class="block w-full bg-transparent border-0 outline-none placeholder-gray-300 resize-y"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- 字数统计 + 清除（绝对定位右下角） -->
    <div
      v-if="showCount || showClear"
      class="absolute bottom-1.5 right-2 flex items-center gap-1.5 text-xs text-gray-400"
    >
      <span v-if="showCount">
        {{ String(modelValue ?? '').length }}{{ maxlength ? `/${maxlength}` : '' }}
      </span>
      <button
        v-if="showClear"
        type="button"
        class="text-gray-300 hover:text-gray-500"
        @click="handleClear"
      >
        <X :size="14" />
      </button>
    </div>
  </div>

  <!-- 普通输入模式 -->
  <div
    v-else
    class="inline-flex items-center w-full rounded-md transition-colors"
    :class="[
      sizeClass,
      variantClass,
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
      focused && variant === 'outlined' ? 'ring-2 ring-blue-200' : '',
      customClass,
    ]"
  >
    <!-- 前缀 -->
    <span v-if="hasPrefix" class="flex items-center mr-1.5 text-gray-400 flex-shrink-0">
      <slot name="prefix" />
    </span>

    <!-- 输入框 -->
    <input
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      class="flex-1 min-w-0 bg-transparent border-0 outline-none placeholder-gray-300"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup="handleEnter"
    />

    <!-- 字数统计 -->
    <span v-if="showCount" class="text-xs text-gray-400 mr-1.5 flex-shrink-0">
      {{ String(modelValue ?? '').length }}{{ maxlength ? `/${maxlength}` : '' }}
    </span>

    <!-- 清除按钮 -->
    <button
      v-if="showClear"
      type="button"
      class="flex items-center text-gray-300 hover:text-gray-500 flex-shrink-0 mr-0.5"
      @click="handleClear"
    >
      <X :size="14" />
    </button>

    <!-- 后缀 -->
    <span v-if="hasSuffix && !showClear" class="flex items-center ml-1.5 text-gray-400 flex-shrink-0">
      <slot name="suffix" />
    </span>
  </div>
</template>
