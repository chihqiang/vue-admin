<script setup lang="ts">
/**
 * 抽屉 Drawer
 *
 * 特性：
 * - v-model:open 双向绑定
 * - title: 标题（string 或 #title 插槽）
 * - placement: right / left / top / bottom
 * - width: 宽度（left/right 时生效）
 * - height: 高度（top/bottom 时生效）
 * - closable: 显示关闭按钮
 * - maskClosable: 点击遮罩关闭
 * - destroyOnClose: 关闭时销毁内容
 * - #default: 内容区
 * - #footer: 底部区域
 *
 * 事件：
 * - @close: 完全关闭后
 */
import { ref, watch, nextTick, useSlots, onBeforeUnmount } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    placement?: 'right' | 'left' | 'top' | 'bottom'
    width?: string
    height?: string
    closable?: boolean
    maskClosable?: boolean
    destroyOnClose?: boolean
  }>(),
  {
    open: false,
    title: '',
    placement: 'right',
    width: '378px',
    height: '378px',
    closable: true,
    maskClosable: true,
    destroyOnClose: false,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const slots = useSlots()
const innerVisible = ref(false)
const shouldRender = ref(false)
/** 标记是否曾经打开过；用于避免 immediate watch 在挂载时(open=false)误触发 close 事件 */
let hasOpened = false
/** 关闭动画定时器；卸载时清理，避免在已卸载组件上修改 ref / emit */
let closeTimer: number | null = null

watch(
  () => props.open,
  (val) => {
    if (val) {
      // 打开：渲染 dom → 下一帧触发进入动画
      shouldRender.value = true
      hasOpened = true
      nextTick(() => (innerVisible.value = true))
    } else if (hasOpened) {
      // 关闭：先触发离开动画，300ms 后再 emit close；destroyOnClose=true 时销毁内容
      // hasOpened 守卫避免组件挂载时 immediate 触发本分支误发 close
      innerVisible.value = false
      if (closeTimer) window.clearTimeout(closeTimer)
      closeTimer = window.setTimeout(() => {
        if (props.destroyOnClose) {
          shouldRender.value = false
        }
        emit('close')
        closeTimer = null
      }, 300)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (closeTimer) window.clearTimeout(closeTimer)
})

function close() {
  emit('update:open', false)
}

/** 抽屉面板样式 */
const panelClass = {
  right: { enter: 'translate-x-full', position: 'right-0 top-0 h-full' },
  left: { enter: '-translate-x-full', position: 'left-0 top-0 h-full' },
  top: { enter: '-translate-y-full', position: 'left-0 top-0 w-full' },
  bottom: { enter: 'translate-y-full', position: 'left-0 bottom-0 w-full' },
}
</script>

<template>
  <Teleport to="body">
    <div v-if="shouldRender" class="fixed inset-0 z-50">
      <!-- 遮罩 -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="innerVisible" class="absolute inset-0 bg-black/45" @click="maskClosable && close()"></div>
      </Transition>

      <!-- 抽屉面板 -->
      <Transition
        enter-active-class="transition-transform duration-300"
        leave-active-class="transition-transform duration-300"
        :enter-from-class="panelClass[placement].enter"
        :leave-to-class="panelClass[placement].enter"
      >
        <div
          v-if="innerVisible"
          class="absolute bg-white shadow-xl flex flex-col"
          :class="panelClass[placement].position"
          :style="placement === 'right' || placement === 'left' ? { width } : { height }"
        >
          <!-- 标题栏 -->
          <div v-if="title || slots.title || closable" class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-base font-medium text-gray-800">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button v-if="closable" class="text-gray-400 hover:text-gray-600" @click="close">
              <X :size="18" />
            </button>
          </div>

          <!-- 内容区：destroyOnClose=true 时跟随 shouldRender 在动画结束后销毁，避免动画期内容先消失 -->
          <div class="flex-1 overflow-auto px-5 py-4">
            <slot v-if="!destroyOnClose || shouldRender" />
          </div>

          <!-- 底部 -->
          <div v-if="slots.footer" class="px-5 py-3 border-t border-gray-100">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
