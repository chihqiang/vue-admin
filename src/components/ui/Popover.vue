<script setup lang="ts">
/**
 * 气泡卡片 Popover
 *
 * 特性：
 * - content: 内容（string 或 #content 插槽）
 * - title: 标题（string 或 #title 插槽，仅 card 变体显示）
 * - trigger: hover / click / focus
 * - placement: top / bottom / left / right（含 start/end 变体，共 12 种）
 * - variant: 'card'（白底带标题，默认）/ 'tooltip'（深灰小字带箭头，等价于 Tooltip）
 *
 * Tooltip 是该组件 variant='tooltip' 的薄封装，两者共用同一套实现以避免重复。
 *
 * 用法：
 *   <Popover title="标题" content="内容" trigger="hover">
 *     <button>悬停</button>
 *   </Popover>
 */
import { ref, useSlots, computed, onMounted, onBeforeUnmount } from 'vue'

type PopoverPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topStart'
  | 'topEnd'
  | 'bottomStart'
  | 'bottomEnd'
  | 'leftStart'
  | 'leftEnd'
  | 'rightStart'
  | 'rightEnd'

type PopoverVariant = 'card' | 'tooltip'

const props = withDefaults(
  defineProps<{
    title?: string
    content?: string
    trigger?: 'hover' | 'click' | 'focus'
    placement?: PopoverPlacement
    variant?: PopoverVariant
  }>(),
  {
    title: '',
    content: '',
    trigger: 'hover',
    placement: 'top',
    variant: 'card',
  },
)

const slots = useSlots()
const visible = ref(false)
const rootRef = ref<HTMLElement>()

function show() {
  visible.value = true
}

function hide() {
  visible.value = false
}

function toggle() {
  visible.value = !visible.value
}

/** trigger=click 时点击外部关闭（对齐 antd Popover 行为） */
function handleDocumentClick(e: MouseEvent) {
  if (props.trigger !== 'click' || !visible.value) return
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    hide()
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick))

/** 浮层定位（tooltip 与 card 共用同一套 placement） */
const placementClass: Record<PopoverPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  topStart: 'bottom-full left-0 mb-2',
  topEnd: 'bottom-full right-0 mb-2',
  bottomStart: 'top-full left-0 mt-2',
  bottomEnd: 'top-full right-0 mt-2',
  leftStart: 'right-full top-0 mr-2',
  leftEnd: 'right-full bottom-0 mr-2',
  rightStart: 'left-full top-0 ml-2',
  rightEnd: 'left-full bottom-0 ml-2',
}

/** tooltip 变体的箭头样式（仅 tooltip 显示） */
const arrowClass: Record<PopoverPlacement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-700 border-t-4 border-x-4 border-x-transparent border-b-0',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-gray-700 border-b-4 border-x-4 border-x-transparent border-t-0',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-700 border-l-4 border-y-4 border-y-transparent border-r-0',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-gray-700 border-r-4 border-y-4 border-y-transparent border-l-0',
  topStart: 'top-full left-2 border-t-gray-700 border-t-4 border-x-4 border-x-transparent border-b-0',
  topEnd: 'top-full right-2 border-t-gray-700 border-t-4 border-x-4 border-x-transparent border-b-0',
  bottomStart: 'bottom-full left-2 border-b-gray-700 border-b-4 border-x-4 border-x-transparent border-t-0',
  bottomEnd: 'bottom-full right-2 border-b-gray-700 border-b-4 border-x-4 border-x-transparent border-t-0',
  leftStart: 'left-full top-2 border-l-gray-700 border-l-4 border-y-4 border-y-transparent border-r-0',
  leftEnd: 'left-full bottom-2 border-l-gray-700 border-l-4 border-y-4 border-y-transparent border-r-0',
  rightStart: 'right-full top-2 border-r-gray-700 border-r-4 border-y-4 border-y-transparent border-l-0',
  rightEnd: 'right-full bottom-2 border-r-gray-700 border-r-4 border-y-4 border-y-transparent border-l-0',
}

const isTooltip = computed(() => props.variant === 'tooltip')
</script>

<template>
  <div
    ref="rootRef"
    class="relative inline-block"
    @mouseenter="trigger === 'hover' && show()"
    @mouseleave="trigger === 'hover' && hide()"
    @click="trigger === 'click' && toggle()"
    @focusin="trigger === 'focus' && show()"
    @focusout="trigger === 'focus' && hide()"
  >
    <slot />

    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <!-- tooltip 变体：深灰小字 + 箭头 -->
      <div
        v-if="visible && isTooltip"
        class="absolute z-50 whitespace-nowrap pointer-events-none"
        :class="placementClass[placement]"
      >
        <div class="relative bg-gray-700 text-white text-xs px-2.5 py-1.5 rounded shadow-lg max-w-xs">
          <slot name="content">{{ content }}</slot>
          <!-- 箭头 -->
          <span class="absolute w-0 h-0" :class="arrowClass[placement]"></span>
        </div>
      </div>

      <!-- card 变体：白底带标题 -->
      <div
        v-else-if="visible"
        class="absolute z-50 w-64 bg-white rounded-md shadow-lg border border-gray-100 pointer-events-auto"
        :class="placementClass[placement]"
      >
        <!-- 标题 -->
        <div
          v-if="title || slots.title"
          class="px-3 py-2 border-b border-gray-50 text-sm font-medium text-gray-800"
        >
          <slot name="title">{{ title }}</slot>
        </div>
        <!-- 内容 -->
        <div class="px-3 py-2 text-sm text-gray-600">
          <slot name="content">{{ content }}</slot>
        </div>
      </div>
    </Transition>
  </div>
</template>
