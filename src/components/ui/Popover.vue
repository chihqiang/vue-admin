<script setup lang="ts">
/**
 * 气泡卡片 Popover
 *
 * 特性：
 * - content: 内容（string 或 #content 插槽）
 * - title: 标题（string 或 #title 插槽）
 * - trigger: hover / click / focus
 * - placement: top / bottom / left / right (含 start/end 变体)
 * - #default: 触发内容
 *
 * 用法：
 *   <Popover title="标题" content="内容" trigger="hover">
 *     <button>悬停</button>
 *   </Popover>
 */
import { ref, useSlots } from 'vue'

withDefaults(
  defineProps<{
    title?: string
    content?: string
    trigger?: 'hover' | 'click' | 'focus'
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'topStart' | 'topEnd' | 'bottomStart' | 'bottomEnd'
  }>(),
  {
    title: '',
    content: '',
    trigger: 'hover',
    placement: 'top',
  },
)

const slots = useSlots()
const visible = ref(false)

function show() {
  visible.value = true
}

function hide() {
  visible.value = false
}

function toggle() {
  visible.value = !visible.value
}

const placementClass: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  topStart: 'bottom-full left-0 mb-2',
  topEnd: 'bottom-full right-0 mb-2',
  bottomStart: 'top-full left-0 mt-2',
  bottomEnd: 'top-full right-0 mt-2',
}
</script>

<template>
  <div
    class="relative inline-block"
    @mouseenter="trigger === 'hover' && show()"
    @mouseleave="trigger === 'hover' && hide()"
    @click="trigger === 'click' && toggle()"
    @focus="trigger === 'focus' && show()"
    @blur="trigger === 'focus' && hide()"
  >
    <slot />

    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="absolute z-50 w-64 bg-white rounded-md shadow-lg border border-gray-100 pointer-events-auto"
        :class="placementClass[placement]"
      >
        <!-- 标题 -->
        <div v-if="title || slots.title" class="px-3 py-2 border-b border-gray-50 text-sm font-medium text-gray-800">
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
