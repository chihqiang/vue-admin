<script setup lang="ts">
/**
 * 文字提示 Tooltip
 *
 * Tooltip 是 Popover 的 `variant='tooltip'` 薄封装，两者共用同一套浮层实现，
 * 避免重复代码。视觉差异由 Popover 内部的 variant 区分：
 * - tooltip：深灰背景小字 + 箭头 + 无标题
 * - card：白底带标题（即 Popover 默认行为）
 *
 * 特性：
 * - content: 提示文字（string 或 #content 插槽）
 * - placement: top / bottom / left / right（含 start/end 变体，共 12 种）
 * - trigger: hover / click / focus
 *
 * 用法：
 *   <Tooltip content="提示文字" placement="top">
 *     <button>悬停看提示</button>
 *   </Tooltip>
 */
import Popover from './Popover.vue'

withDefaults(
  defineProps<{
    content?: string
    placement?:
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
    trigger?: 'hover' | 'click' | 'focus'
  }>(),
  {
    content: '',
    placement: 'top',
    trigger: 'hover',
  },
)
</script>

<template>
  <Popover
    :content="content"
    :placement="placement"
    :trigger="trigger"
    variant="tooltip"
  >
    <slot />
    <template v-if="$slots.content" #content><slot name="content" /></template>
  </Popover>
</template>
