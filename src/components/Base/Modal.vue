<script setup lang="ts">
/**
 * 对话框组件 Modal
 *
 * 特性：
 * - v-model:open 双向绑定控制显示/隐藏
 * - title 支持 string 或 #title 插槽
 * - #default 为内容区
 * - #footer 为底部按钮区（不传则使用默认确定/取消）
 * - maskClosable: 点击遮罩是否关闭
 * - centered: 垂直居中
 * - width: 对话框宽度
 * - okText / cancelText: 按钮文字
 * - okLoading: 确定按钮加载中
 * - closable: 是否显示关闭按钮
 * - destroyOnClose: 关闭时销毁内容
 *
 * 事件：
 * - @ok: 点击确定
 * - @cancel: 点击取消/关闭
 * - @close: 完全关闭后
 *
 * 用法：
 *   <Modal v-model:open="visible" title="标题" @ok="handleOk">
 *     内容
 *   </Modal>
 */
import { watch, nextTick, ref, useSlots } from 'vue'
import { X } from '@lucide/vue'
import Button from './Button.vue'

const props = withDefaults(
  defineProps<{
    /** 是否显示（v-model:open） */
    open?: boolean
    /** 标题 */
    title?: string
    /** 宽度 */
    width?: string
    /** 垂直居中 */
    centered?: boolean
    /** 点击遮罩关闭 */
    maskClosable?: boolean
    /** 显示关闭按钮 */
    closable?: boolean
    /** 确定按钮文字 */
    okText?: string
    /** 取消按钮文字 */
    cancelText?: string
    /** 确定按钮加载中 */
    okLoading?: boolean
    /** 关闭时销毁内容 */
    destroyOnClose?: boolean
    /** 是否显示底部按钮 */
    footer?: boolean
  }>(),
  {
    open: false,
    title: '',
    width: '420px',
    centered: true,
    maskClosable: true,
    closable: true,
    okText: '确定',
    cancelText: '取消',
    okLoading: false,
    destroyOnClose: false,
    footer: true,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  ok: []
  cancel: []
  close: []
}>()

const slots = useSlots()

/** 内部显示状态（用于动画） */
const innerVisible = ref(false)
/** 是否需要渲染 DOM */
const shouldRender = ref(false)

// 监听 open 变化，控制渲染和动画
watch(
  () => props.open,
  (val) => {
    if (val) {
      shouldRender.value = true
      nextTick(() => {
        innerVisible.value = true
      })
    } else {
      innerVisible.value = false
      setTimeout(() => {
        shouldRender.value = false
        emit('close')
      }, 200)
    }
  },
  { immediate: true },
)

/** 关闭 */
function close() {
  emit('update:open', false)
  emit('cancel')
}

/** 点击遮罩 */
function handleMaskClick() {
  if (props.maskClosable) close()
}

/** 点击确定 */
function handleOk() {
  emit('ok')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="shouldRender"
      class="fixed inset-0 z-50 flex"
      :class="centered ? 'items-center justify-center' : 'items-start justify-center pt-24'"
    >
      <!-- 遮罩层 -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="innerVisible"
          class="absolute inset-0 bg-black/45"
          @click="handleMaskClick"
        ></div>
      </Transition>

      <!-- 对话框主体 -->
      <Transition
        enter-active-class="transition-all duration-200"
        leave-active-class="transition-all duration-200"
        enter-from-class="opacity-0 scale-95"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="innerVisible"
          class="relative bg-white rounded-lg shadow-xl"
          :style="{ width }"
        >
          <!-- 标题栏 -->
          <div
            v-if="title || slots.title || closable"
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
            <h3 class="text-base font-medium text-gray-800">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              v-if="closable"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="close"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- 内容区 -->
          <div class="px-6 py-4">
            <slot v-if="!destroyOnClose || innerVisible" />
          </div>

          <!-- 底部按钮区 -->
          <div v-if="footer" class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
            <slot name="footer">
              <Button @click="close">{{ cancelText }}</Button>
              <Button type="primary" :loading="okLoading" @click="handleOk">
                {{ okText }}
              </Button>
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
