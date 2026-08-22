<script setup lang="ts">
/**
 * 确认框容器组件
 * 由 confirm 命令式 API 控制内容，参考 ant-design Modal.confirm
 */
import { ref } from 'vue'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from '@lucide/vue'
import type { Component } from 'vue'
import Button from './Button.vue'

/** 确认框类型 */
export type ConfirmType = 'confirm' | 'info' | 'success' | 'warning' | 'error'

/** 单个确认框配置 */
export interface ConfirmConfig {
  /** 标题 */
  title?: string
  /** 内容（字符串） */
  content?: string
  /** 类型 */
  type?: ConfirmType
  /** 确定按钮文字 */
  okText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 确定按钮类型（primary / danger） */
  okType?: 'primary' | 'danger'
  /** 是否显示取消按钮（confirm 默认 true，info/success/warning/error 默认 false） */
  cancelable?: boolean
  /** 唯一 key */
  key?: string | number
  /** 确定回调 */
  onOk?: () => void | Promise<void>
  /** 取消回调 */
  onCancel?: () => void
  /** 完全关闭后回调 */
  onClose?: () => void
}

/** 内部条目：配置 + 状态 */
interface ConfirmItem extends ConfirmConfig {
  /** 内部 key */
  _key: string | number
  /** 是否显示（控制动画） */
  visible: boolean
  /** 确定按钮 loading */
  okLoading: boolean
}

/** 图标映射 */
const iconMap: Record<Exclude<ConfirmType, 'confirm'>, Component> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

/** 图标颜色映射 */
const iconColorMap: Record<Exclude<ConfirmType, 'confirm'>, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-orange-500',
  error: 'text-red-500',
}

/** 响应式条目列表 */
const items = ref<ConfirmItem[]>([])

/** 暴露给命令式 API：增删 */
function add(config: ConfirmConfig & { _key: string | number }): void {
  items.value.push({
    type: 'confirm',
    okText: '确定',
    cancelText: '取消',
    okType: 'primary',
    cancelable: config.type === 'confirm',
    visible: false,
    okLoading: false,
    ...config,
    _key: config._key,
  })
  // 下一帧触发进入动画
  requestAnimationFrame(() => {
    const target = items.value.find((it) => it._key === config._key)
    if (target) target.visible = true
  })
}

/** 触发离开动画，再彻底移除 */
function removeByKey(key: string | number, onClose?: () => void) {
  const target = items.value.find((it) => it._key === key)
  if (!target) return
  target.visible = false
  setTimeout(() => {
    items.value = items.value.filter((it) => it._key !== key)
    onClose?.()
  }, 200)
}

/** 点击确定：支持异步 onOk，期间显示 loading；完成后关闭 */
async function handleOk(item: ConfirmItem) {
  if (item.okLoading) return
  if (item.onOk) {
    item.okLoading = true
    try {
      await item.onOk()
    } finally {
      item.okLoading = false
    }
  }
  removeByKey(item._key, item.onClose)
}

/** 点击取消 */
function handleCancel(item: ConfirmItem) {
  item.onCancel?.()
  removeByKey(item._key, item.onClose)
}

/** 点击遮罩：默认不关闭确认框（与 antd 行为一致），仅 info/success/warning/error 可点遮罩关闭 */
function handleMaskClick(item: ConfirmItem) {
  if (item.type !== 'confirm') handleCancel(item)
}

defineExpose({ add, removeByKey })
</script>

<template>
  <Teleport to="body">
    <div
      v-for="item in items"
      :key="item._key"
      class="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      <!-- 遮罩层 -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="item.visible"
          class="absolute inset-0 bg-black/45"
          @click="handleMaskClick(item)"
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
          v-if="item.visible"
          class="relative bg-white rounded-lg shadow-xl w-[420px]"
        >
          <!-- 标题栏 + 关闭按钮 -->
          <div class="flex items-start justify-between px-6 pt-4">
            <h3 class="text-base font-medium text-gray-800 flex items-center gap-2">
              <!-- 类型图标（confirm 不显示图标，与 antd 默认行为一致） -->
              <component
                v-if="item.type && item.type !== 'confirm'"
                :is="iconMap[item.type as Exclude<ConfirmType, 'confirm'>]"
                :size="18"
                :class="iconColorMap[item.type as Exclude<ConfirmType, 'confirm'>]"
              />
              {{ item.title }}
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="handleCancel(item)"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- 内容区 -->
          <div v-if="item.content" class="px-6 py-4 pl-12 text-sm text-gray-600 leading-relaxed">
            {{ item.content }}
          </div>
          <div v-else class="pb-2"></div>

          <!-- 底部按钮区 -->
          <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
            <Button v-if="item.cancelable" @click="handleCancel(item)">
              {{ item.cancelText }}
            </Button>
            <Button
              :type="item.okType === 'danger' ? 'default' : 'primary'"
              :danger="item.okType === 'danger'"
              :loading="item.okLoading"
              @click="handleOk(item)"
            >
              {{ item.okText }}
            </Button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
