<script setup lang="ts">
/**
 * 标签 Tag
 *
 * 特性：
 * - color: 预设颜色 (blue/green/red/orange/purple/cyan/pink/gray) 或自定义 hex
 * - variant: filled / outline / dot
 * - size: sm / md
 * - closable: 可关闭
 * - bordered: 是否带边框
 * - #default 自定义内容
 * - #icon 前缀图标
 *
 * 事件：
 * - @close: 关闭时
 */
import { computed } from 'vue'
import { X } from '@lucide/vue'

type PresetColor = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'cyan' | 'pink' | 'gray'

const props = withDefaults(
  defineProps<{
    color?: PresetColor | string
    variant?: 'filled' | 'outline' | 'dot'
    size?: 'sm' | 'md'
    closable?: boolean
    bordered?: boolean
  }>(),
  {
    color: 'gray',
    variant: 'filled',
    size: 'md',
    closable: false,
    bordered: true,
  },
)

const emit = defineEmits<{
  close: [e: MouseEvent]
}>()



/** 判断是否为预设颜色 */
const isPreset = computed(() => ['blue', 'green', 'red', 'orange', 'purple', 'cyan', 'pink', 'gray'].includes(props.color))

/** 预设颜色映射 */
const colorMap: Record<string, { filled: string; outline: string; dot: string }> = {
  blue: { filled: 'bg-blue-50 text-blue-600', outline: 'text-blue-500', dot: 'bg-blue-500' },
  green: { filled: 'bg-green-50 text-green-600', outline: 'text-green-500', dot: 'bg-green-500' },
  red: { filled: 'bg-red-50 text-red-600', outline: 'text-red-500', dot: 'bg-red-500' },
  orange: { filled: 'bg-orange-50 text-orange-600', outline: 'text-orange-500', dot: 'bg-orange-500' },
  purple: { filled: 'bg-purple-50 text-purple-600', outline: 'text-purple-500', dot: 'bg-purple-500' },
  cyan: { filled: 'bg-cyan-50 text-cyan-600', outline: 'text-cyan-500', dot: 'bg-cyan-500' },
  pink: { filled: 'bg-pink-50 text-pink-600', outline: 'text-pink-500', dot: 'bg-pink-500' },
  gray: { filled: 'bg-gray-50 text-gray-600', outline: 'text-gray-500', dot: 'bg-gray-400' },
}

const tagClass = computed(() => {
  if (!isPreset.value) {
    // 自定义颜色
    const hex = props.color as string
    if (props.variant === 'outline') {
      return { style: `color: ${hex}; border-color: ${hex}33;`, class: '' }
    }
    if (props.variant === 'dot') {
      return { style: '', class: '' }
    }
    return { style: `color: ${hex}; background: ${hex}15;`, class: '' }
  }

  const c = colorMap[props.color as string]
  if (!c) return { style: '', class: 'bg-gray-50 text-gray-600' }
  if (props.variant === 'outline') return { style: '', class: c.outline }
  return { style: '', class: c.filled }
})

const sizeClass = computed(() => props.size === 'sm' ? 'text-xs px-1.5 py-0.5 gap-1' : 'text-sm px-2 py-0.5 gap-1.5')
</script>

<template>
  <span
    class="inline-flex items-center rounded font-medium"
    :class="[sizeClass, tagClass.class, bordered && variant !== 'dot' ? 'border' : '']"
    :style="tagClass.style"
  >
    <!-- dot 模式 -->
    <span v-if="variant === 'dot'" class="w-1.5 h-1.5 rounded-full mr-1" :class="isPreset ? colorMap[color]?.dot : ''" :style="!isPreset ? `background: ${color}` : ''"></span>
    <!-- 图标 -->
    <slot v-else name="icon" />
    <!-- 内容 -->
    <slot />
    <!-- 关闭按钮 -->
    <button v-if="closable" class="ml-0.5 hover:opacity-70 transition-opacity" @click="emit('close', $event)">
      <X :size="size === 'sm' ? 11 : 13" />
    </button>
  </span>
</template>
