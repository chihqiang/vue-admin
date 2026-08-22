<script setup lang="ts">
/**
 * 文字提示 Tooltip
 *
 * 特性：
 * - content: 提示文字（string 或 #content 插槽）
 * - placement: top / bottom / left / right
 * - trigger: hover / click
 * - color: 文字色（默认白色）
 * - bgColor: 背景色（默认深灰）
 *
 * 用法：
 *   <Tooltip content="提示文字" placement="top">
 *     <button>悬停看提示</button>
 *   </Tooltip>
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    content?: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    trigger?: 'hover' | 'click'
  }>(),
  {
    content: '',
    placement: 'top',
    trigger: 'hover',
  },
)

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

/** trigger=click 时点击外部关闭（对齐 antd Tooltip 行为） */
function handleDocumentClick(e: MouseEvent) {
  if (props.trigger !== 'click' || !visible.value) return
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    hide()
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick))

/** 定位样式 */
const placementClass = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

/** 箭头样式 */
const arrowClass = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-700 border-t-4 border-x-4 border-x-transparent border-b-0',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-700 border-b-4 border-x-4 border-x-transparent border-t-0',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-700 border-l-4 border-y-4 border-y-transparent border-r-0',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-700 border-r-4 border-y-4 border-y-transparent border-l-0',
}
</script>

<template>
  <div
    ref="rootRef"
    class="relative inline-block"
    @mouseenter="trigger === 'hover' && show()"
    @mouseleave="trigger === 'hover' && hide()"
    @click="trigger === 'click' && toggle()"
  >
    <!-- 触发内容 -->
    <slot />

    <!-- 提示气泡 -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="absolute z-50 whitespace-nowrap pointer-events-none"
        :class="placementClass[placement]"
      >
        <div class="relative bg-gray-700 text-white text-xs px-2.5 py-1.5 rounded shadow-lg">
          <slot name="content">{{ content }}</slot>
          <!-- 箭头 -->
          <span
            class="absolute w-0 h-0"
            :class="arrowClass[placement]"
          ></span>
        </div>
      </div>
    </Transition>
  </div>
</template>
