<script setup lang="ts">
/**
 * 头像 Avatar
 *
 * 特性：
 * - src: 图片地址
 * - size: sm(24) / md(32) / lg(40) / xl(64) / number
 * - shape: circle / square
 * - text: 文字头像（无 src 时显示）
 * - bgColor: 自定义背景色
 * - #default: 自定义内容（图标等）
 *
 * 事件：
 * - @error: 图片加载失败
 */
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | number
    shape?: 'circle' | 'square'
    text?: string
    bgColor?: string
  }>(),
  {
    src: '',
    size: 'md',
    shape: 'circle',
    text: '',
    bgColor: '',
  },
)

const emit = defineEmits<{ error: [] }>()

const hasError = ref(false)

const sizePx = computed(() => {
  if (typeof props.size === 'number') return props.size
  const map = { sm: 24, md: 32, lg: 40, xl: 64 }
  return map[props.size]
})

const fontSize = computed(() => Math.max(12, Math.floor(sizePx.value / 2.2)))

/** 头像背景色（文字头像时） */
const bgColors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1677ff', '#52c41a', '#eb2f96', '#13c2c2']
const bgColor = computed(() => props.bgColor || bgColors[(props.text?.charCodeAt(0) || 0) % bgColors.length])

function handleError() {
  hasError.value = true
  emit('error')
}
</script>

<template>
  <span
    class="inline-flex items-center justify-center overflow-hidden flex-shrink-0"
    :class="shape === 'circle' ? 'rounded-full' : 'rounded-md'"
    :style="{ width: `${sizePx}px`, height: `${sizePx}px`, fontSize: `${fontSize}px` }"
  >
    <!-- 图片头像 -->
    <img
      v-if="src && !hasError"
      :src="src"
      class="w-full h-full object-cover"
      @error="handleError"
    />
    <!-- 文字头像 -->
    <span
      v-else-if="text"
      class="w-full h-full flex items-center justify-center text-white font-medium"
      :style="{ backgroundColor: bgColor }"
    >
      {{ text.slice(0, 2) }}
    </span>
    <!-- 默认插槽（图标等） -->
    <span v-else class="text-gray-400">
      <slot />
    </span>
  </span>
</template>
