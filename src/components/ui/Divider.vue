<script setup lang="ts">
/**
 * 分割线 Divider
 *
 * 特性：
 * - type: horizontal / vertical
 * - dashed: 虚线
 * - orientation: 文字位置 (left / center / right)
 * - #default: 嵌入文字内容
 */
withDefaults(
  defineProps<{
    type?: 'horizontal' | 'vertical'
    dashed?: boolean
    orientation?: 'left' | 'center' | 'right'
  }>(),
  {
    type: 'horizontal',
    dashed: false,
    orientation: 'center',
  },
)
</script>

<template>
  <!-- 水平分割线 -->
  <div v-if="type === 'horizontal'" class="relative w-full my-4">
    <div
      class="border-t"
      :class="dashed ? 'border-dashed border-gray-200' : 'border-gray-100'"
    ></div>
    <!-- 嵌入文字 -->
    <div
      v-if="$slots.default"
      class="absolute top-0 flex items-center px-3 text-sm text-gray-400 bg-white"
      :class="{
        'left-0 -translate-y-1/2': orientation === 'left',
        'left-1/2 -translate-x-1/2 -translate-y-1/2': orientation === 'center',
        'right-0 -translate-y-1/2': orientation === 'right',
      }"
    >
      <slot />
    </div>
  </div>

  <!-- 垂直分割线 -->
  <div
    v-else
    class="inline-block h-4 mx-2 border-l"
    :class="dashed ? 'border-dashed border-gray-200' : 'border-gray-200'"
  ></div>
</template>
