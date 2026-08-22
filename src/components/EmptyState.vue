<script setup lang="ts">
/**
 * 空状态占位 EmptyState
 *
 * 特性：
 * - #icon 插槽：自定义图标（默认 SVG 空盒子）
 * - #description 插槽：自定义描述文字（覆盖 text prop）
 * - #action 插槽：底部操作按钮区域
 * - image prop：传入图片 URL 替代图标
 * - size: sm / md / lg 控制图标和间距
 */
withDefaults(
  defineProps<{
    /** 描述文字 */
    text?: string
    /** 自定义图片 URL（替代默认图标） */
    image?: string
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    text: '暂无数据',
    image: '',
    size: 'md',
  },
)

/** 尺寸映射 */
const sizeMap = {
  sm: { icon: 36, padding: 'py-6', text: 'text-xs', gap: 'mb-2' },
  md: { icon: 48, padding: 'py-12', text: 'text-sm', gap: 'mb-3' },
  lg: { icon: 64, padding: 'py-16', text: 'text-base', gap: 'mb-4' },
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-gray-400"
    :class="sizeMap[size].padding"
  >
    <!-- 图标区域：#icon 插槽 > image prop > 默认 SVG -->
    <div :class="sizeMap[size].gap">
      <slot name="icon">
        <img
          v-if="image"
          :src="image"
          :style="{ width: sizeMap[size].icon + 'px', height: sizeMap[size].icon + 'px' }"
          alt="空状态"
        />
        <svg
          v-else
          :width="sizeMap[size].icon"
          :height="sizeMap[size].icon"
          viewBox="0 0 64 64"
          fill="none"
          class="text-gray-300"
        >
          <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" stroke-width="2" />
          <path d="M8 24h48" stroke="currentColor" stroke-width="2" />
          <circle cx="16" cy="18" r="1.5" fill="currentColor" />
          <circle cx="20" cy="18" r="1.5" fill="currentColor" />
          <path d="M24 36h16M24 42h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </slot>
    </div>

    <!-- 描述文字：#description 插槽 > text prop -->
    <p :class="sizeMap[size].text">
      <slot name="description">{{ text }}</slot>
    </p>

    <!-- 操作按钮区域 -->
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
