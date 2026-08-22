<script setup lang="ts">
/**
 * 徽标 Badge
 *
 * 特性：
 * - count: 数字（超过 overflow 显示 overflow+）
 * - overflow: 溢出值（默认 99）
 * - dot: 只显示小红点
 * - color: 自定义颜色
 * - size: sm / md
 * - offset: 偏移 [x, y]
 * - showZero: count 为 0 时是否显示
 * - #default: 被标记的内容
 *
 * 事件：
 * - @click: 点击徽标
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    count?: number
    overflow?: number
    dot?: boolean
    color?: string
    size?: 'sm' | 'md'
    offset?: [number, number]
    showZero?: boolean
  }>(),
  {
    count: 0,
    overflow: 99,
    dot: false,
    color: '#ff4d4f',
    size: 'md',
    offset: () => [0, 0] as [number, number],
    showZero: false,
  },
)

const emit = defineEmits<{ click: [e: MouseEvent] }>()

/** 是否显示 */
const visible = computed(() => {
  if (props.dot) return true
  if (props.count === 0) return props.showZero
  return true
})

/** 显示文本 */
const displayText = computed(() => {
  if (props.dot) return ''
  if (props.count > props.overflow) return `${props.overflow}+`
  return String(props.count)
})

/** 徽标样式 */
const badgeStyle = computed(() => ({
  backgroundColor: props.color,
  ...(() => {
    const [x, y] = props.offset
    return { transform: `translate(${x}px, ${y}px)` }
  })(),
}))
</script>

<template>
  <div class="relative inline-flex items-center">
    <!-- 内容 -->
    <slot />

    <!-- 徽标 -->
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-0"
      leave-to-class="opacity-0 scale-0"
    >
      <span
        v-if="visible"
        class="absolute top-0 right-0 flex items-center justify-center text-white font-medium leading-none cursor-pointer"
        :class="[
          dot ? '' : 'rounded-full',
          size === 'sm' ? 'text-[10px] min-w-4 h-4 px-1' : 'text-xs min-w-5 h-5 px-1.5',
          dot ? (size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5') : '',
        ]"
        :style="dot ? { ...badgeStyle, borderRadius: '50%' } : badgeStyle"
        :transform="`translate(${offset[0]}px, ${offset[1]}px)`"
        @click="emit('click', $event)"
      >
        {{ displayText }}
      </span>
    </Transition>
  </div>
</template>
