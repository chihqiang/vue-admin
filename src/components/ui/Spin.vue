<script setup lang="ts">
/**
 * 加载中 Spin
 *
 * 特性：
 * - size: sm / md / lg / number
 * - tip: 提示文字
 * - delay: 延迟显示（毫秒）
 * - #default: 被包裹的内容
 *
 * 用法：
 *   <Spin :spinning="loading" tip="加载中...">
 *     <div>内容</div>
 *   </Spin>
 */
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { LoaderCircle } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    spinning?: boolean
    size?: 'sm' | 'md' | 'lg' | number
    tip?: string
    delay?: number
  }>(),
  {
    spinning: true,
    size: 'md',
    tip: '',
    delay: 0,
  },
)

const visible = ref(props.spinning)
let delayTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.spinning,
  (val) => {
    if (val && props.delay > 0) {
      delayTimer = setTimeout(() => (visible.value = true), props.delay)
    } else {
      if (delayTimer) clearTimeout(delayTimer)
      visible.value = val
    }
  },
)

// 卸载时清理延迟定时器，避免在已卸载组件上修改 visible
onBeforeUnmount(() => {
  if (delayTimer) clearTimeout(delayTimer)
})

// 尺寸（computed 响应式，props.size 变化时同步更新）
const sizePx = computed(() =>
  typeof props.size === 'number' ? props.size : { sm: 14, md: 20, lg: 32 }[props.size],
)
</script>

<template>
  <!-- 包裹模式 -->
  <div v-if="$slots.default" class="relative">
    <div :class="visible ? 'opacity-50 pointer-events-none' : ''" class="transition-opacity">
      <slot />
    </div>
    <!-- 遮罩 -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="visible" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40">
        <LoaderCircle :size="sizePx" class="animate-spin text-blue-500" />
        <span v-if="tip" class="text-sm text-gray-500">{{ tip }}</span>
      </div>
    </Transition>
  </div>

  <!-- 独立模式 -->
  <div v-else class="inline-flex flex-col items-center gap-2">
    <LoaderCircle :size="sizePx" class="animate-spin text-blue-500" />
    <span v-if="tip" class="text-sm text-gray-500">{{ tip }}</span>
  </div>
</template>
