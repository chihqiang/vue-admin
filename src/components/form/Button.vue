<script setup lang="ts">
/**
 * 通用按钮组件 Button
 *
 * 设计参考 ant-design Button 的 API，用 TailwindCSS 实现。
 *
 * 特性：
 * - type: primary / default / dashed / text / link
 * - size: sm / md / lg
 * - danger: 危险样式（红色系）
 * - block: 撑满父容器宽度
 * - disabled: 禁用
 * - loading: 加载中（显示旋转图标，禁用点击）
 * - iconPlacement: start / end（图标位置）
 *
 * 插槽：
 * - #icon: 自定义图标
 * - #default: 按钮内容
 *
 * 事件：
 * - @click: 点击事件（loading/disabled 时不触发）
 */
import { computed, useSlots } from 'vue'
import { LoaderCircle } from '@lucide/vue'

type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'
type IconPlacement = 'start' | 'end'

const props = withDefaults(
  defineProps<{
    /** 按钮类型 */
    type?: ButtonType
    /** 尺寸 */
    size?: ButtonSize
    /** 危险样式 */
    danger?: boolean
    /** 撑满宽度 */
    block?: boolean
    /** 禁用 */
    disabled?: boolean
    /** 加载中 */
    loading?: boolean
    /** 图标位置 */
    iconPlacement?: IconPlacement
    /** 原生 type 属性 */
    htmlType?: 'button' | 'submit' | 'reset'
    /** 自定义 class */
    customClass?: string
  }>(),
  {
    type: 'default',
    size: 'md',
    danger: false,
    block: false,
    disabled: false,
    loading: false,
    iconPlacement: 'start',
    htmlType: 'button',
    customClass: '',
  },
)

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const slots = useSlots()

/** 是否有图标 */
const hasIcon = computed(() => !!slots.icon || props.loading)

/** 是否禁用（loading 时也禁用点击） */
const isDisabled = computed(() => props.disabled || props.loading)

// ========== 尺寸样式 ==========
const sizeClass = computed(() => {
  const map: Record<ButtonSize, string> = {
    sm: 'h-7 px-2.5 text-xs gap-1',
    md: 'h-8 px-4 text-sm gap-1.5',
    lg: 'h-10 px-5 text-base gap-2',
  }
  return map[props.size]
})

const iconSize = computed(() => {
  const map: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 18 }
  return map[props.size]
})

// ========== 类型样式 ==========
const typeClass = computed(() => {
  // text
  if (props.type === 'text') {
    return props.danger
      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
  }
  // link
  if (props.type === 'link') {
    return props.danger
      ? 'text-red-500 hover:text-red-600'
      : 'text-blue-500 hover:text-blue-600'
  }
  // primary
  if (props.type === 'primary') {
    return props.danger
      ? 'bg-red-500 text-white border border-red-500 hover:bg-red-600 active:bg-red-700'
      : 'bg-blue-500 text-white border border-blue-500 hover:bg-blue-600 active:bg-blue-700'
  }
    // dashed
  if (props.type === 'dashed') {
    return props.danger
      ? 'bg-white dark:bg-gray-800 text-red-500 border border-dashed border-red-300 dark:border-red-700 hover:border-red-500 hover:text-red-600'
      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-500'
  }

  // default
  return props.danger
    ? 'bg-white dark:bg-gray-800 text-red-500 border border-red-300 dark:border-red-700 hover:border-red-500 hover:text-red-600'
    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-500'
})

/** 点击事件 */
function handleClick(e: MouseEvent) {
  if (isDisabled.value) {
    e.preventDefault()
    return
  }
  emit('click', e)
}
</script>

<template>
  <button
    :type="htmlType"
    :disabled="disabled"
    class="inline-flex items-center justify-center font-medium whitespace-nowrap select-none focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-md transition-colors duration-200"
    :class="[
      sizeClass,
      typeClass,
      block ? 'w-full' : '',
      isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      customClass,
    ]"
    @click="handleClick"
  >
    <!-- 前缀图标 -->
    <template v-if="iconPlacement === 'start'">
      <LoaderCircle v-if="loading" :size="iconSize" class="animate-spin" />
      <slot v-else name="icon" />
    </template>

    <!-- 按钮内容 -->
    <slot />

    <!-- 后缀图标 -->
    <template v-if="iconPlacement === 'end' && hasIcon">
      <LoaderCircle v-if="loading" :size="iconSize" class="animate-spin" />
      <slot v-else name="icon" />
    </template>
  </button>
</template>
