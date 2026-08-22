<script setup lang="ts" generic="T extends string | number">
/**
 * 下拉选择器 Select
 *
 * 特性：
 * - v-model 双向绑定
 * - options: { label, value, disabled }[] 配置式
 * - size: sm / md / lg
 * - disabled
 * - placeholder
 * - allowClear: 可清除
 * - #default 自定义选项渲染（{ option }）
 *
 * 事件：
 * - @change: 值变化
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Check, X } from '@lucide/vue'

interface SelectOption {
  label: string
  value: T
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: T
    options?: SelectOption[]
    placeholder?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    allowClear?: boolean
    customClass?: string
  }>(),
  {
    options: () => [],
    placeholder: '请选择',
    size: 'md',
    disabled: false,
    allowClear: false,
    customClass: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T, option: SelectOption]
}>()

const open = ref(false)
const rootRef = ref<HTMLDivElement>()

/** 当前选中的 label */
const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt?.label ?? ''
})

/** 尺寸 */
const sizeClass = computed(() => {
  const map = {
    sm: 'h-7 text-xs px-2.5',
    md: 'h-8 text-sm px-3',
    lg: 'h-10 text-base px-3.5',
  }
  return map[props.size]
})

function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
}

function selectOption(option: SelectOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value, option)
  open.value = false
}

function handleClear(e: MouseEvent) {
  e.stopPropagation()
  emit('update:modelValue', undefined as unknown as T)
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative inline-block w-full" :class="customClass">
    <!-- 触发器 -->
    <div
      class="flex items-center w-full border border-gray-200 rounded-md cursor-pointer transition-colors bg-white"
      :class="[
        sizeClass,
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-300',
        open ? 'border-blue-400 ring-2 ring-blue-200' : '',
      ]"
      @click="toggleOpen"
    >
      <!-- 选中值 / 占位 -->
      <span class="flex-1 truncate" :class="selectedLabel ? 'text-gray-800' : 'text-gray-300'">
        {{ selectedLabel || placeholder }}
      </span>

      <!-- 清除按钮 -->
      <button
        v-if="allowClear && selectedLabel && !disabled"
        type="button"
        class="text-gray-300 hover:text-gray-500 mr-0.5"
        @click="handleClear"
      >
        <X :size="14" />
      </button>

      <!-- 箭头 -->
      <ChevronDown
        :size="14"
        class="text-gray-400 transition-transform flex-shrink-0"
        :class="open ? 'rotate-180' : ''"
      />
    </div>

    <!-- 下拉面板 -->
    <Transition
      enter-active-class="transition-all duration-150"
      leave-active-class="transition-all duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg max-h-60 overflow-auto py-1"
      >
        <div
          v-for="(option, i) in options"
          :key="i"
          class="flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer transition-colors"
          :class="[
            option.disabled
              ? 'text-gray-300 cursor-not-allowed'
              : option.value === modelValue
                ? 'text-blue-500 bg-blue-50 font-medium'
                : 'text-gray-700 hover:bg-gray-50',
          ]"
          @click="selectOption(option)"
        >
          <span>{{ option.label }}</span>
          <Check v-if="option.value === modelValue" :size="14" class="flex-shrink-0" />
        </div>
        <!-- 空状态 -->
        <div v-if="options.length === 0" class="py-6 text-center text-sm text-gray-400">
          暂无数据
        </div>
      </div>
    </Transition>
  </div>
</template>
