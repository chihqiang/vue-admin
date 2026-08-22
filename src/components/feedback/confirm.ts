/**
 * 命令式确认框 API
 * 参考 ant-design 的 Modal.confirm / Modal.info / Modal.success / Modal.warning / Modal.error
 *
 * 用法：
 *   import { confirm } from '@/components'
 *   confirm({ title: '确认删除？', content: '删除后不可恢复', onOk: () => doDelete() })
 *
 *   import { Modal } from '@/components'
 *   Modal.info({ title: '提示', content: '已保存' })
 *   Modal.success({ title: '成功', content: '提交成功' })
 *   Modal.warning({ title: '警告', content: '请先选择' })
 *   Modal.error({ title: '错误', content: '网络异常' })
 *
 * onOk 支持 async：返回 Promise 期间确定按钮显示 loading。
 *
 * 实现说明：复用 Modal 组件，避免与 ConfirmContainer 重复。
 */
import { createVNode, render, reactive, h } from 'vue'
import type { AppContext, Component } from 'vue'
import Modal from './Modal.vue'
import Button from '../form/Button.vue'
import { feedbackIconMap, feedbackIconColorMap } from './constants'

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

/** 图标映射：复用反馈组件共享映射，保证跨组件视觉一致 */
const iconMap: Partial<Record<Exclude<ConfirmType, 'confirm'>, Component>> = {
  info: feedbackIconMap.info,
  success: feedbackIconMap.success,
  warning: feedbackIconMap.warning,
  error: feedbackIconMap.error,
}

/** 图标颜色映射：复用反馈组件共享映射 */
const iconColorMap: Partial<Record<Exclude<ConfirmType, 'confirm'>, string>> = {
  info: feedbackIconColorMap.info,
  success: feedbackIconColorMap.success,
  warning: feedbackIconColorMap.warning,
  error: feedbackIconColorMap.error,
}

let appContext: AppContext | null = null

/**
 * 内部统一入口：基于 Modal 渲染
 * 每次调用创建一个临时 div + 一个匿名组件，setup 返回的 render 函数读取响应式 state，
 * 通过 #title / #footer slot 控制图标与按钮。
 */
function open(config: ConfirmConfig & { type: ConfirmType }) {
  // 临时挂载容器
  const div = document.createElement('div')
  document.body.appendChild(div)

  // 响应式状态：open 触发 Modal 进入/离开动画，okLoading 控制按钮 loading
  const state = reactive({
    open: true,
    okLoading: false,
  })

  /** Modal 完全关闭后调用，销毁 vnode 与容器 div */
  function destroy() {
    render(null, div)
    div.remove()
  }

  /** 关闭：触发离开动画；Modal 200ms 后会 emit('close') → 调用 destroy */
  function close() {
    state.open = false
  }

  /** 点击确定：支持异步，期间 loading */
  async function handleOk() {
    if (state.okLoading) return
    if (config.onOk) {
      state.okLoading = true
      try {
        await config.onOk()
      } finally {
        state.okLoading = false
      }
    }
    close()
  }

  /** 点击取消（X 按钮、遮罩、底部取消按钮统一走这里） */
  function handleCancel() {
    config.onCancel?.()
    close()
  }

  /** Modal 完全关闭后销毁容器 */
  function handleClose() {
    config.onClose?.()
    destroy()
  }

  const icon = iconMap[config.type as Exclude<ConfirmType, 'confirm'>]
  const iconColor = iconColorMap[config.type as Exclude<ConfirmType, 'confirm'>] ?? ''
  const isConfirm = config.type === 'confirm'
  // 是否显示取消按钮：confirm 默认 true，其他默认 false；显式 cancelable 优先
  const showCancel = config.cancelable ?? isConfirm
  const finalOkText = config.okText ?? (isConfirm ? '确定' : '知道了')
  const finalCancelText = config.cancelText ?? '取消'

  // 匿名组件：setup 返回 render 函数，读取响应式 state 触发重渲染
  const Inner = {
    setup() {
      return () =>
        h(
          Modal,
          {
            open: state.open,
            centered: true,
            // confirm 点击遮罩不关闭，info/success/warning/error 可关
            maskClosable: !isConfirm,
            closable: true,
            destroyOnClose: true,
            // 同步 v-model:open（X 按钮、遮罩触发 Modal 内部 close() 时回写）
            'onUpdate:open': (val: boolean) => {
              state.open = val
            },
            onOk: handleOk,
            onCancel: handleCancel,
            onClose: handleClose,
          },
          {
            // 标题：图标 + 文字（confirm 无图标）
            title: () =>
              h('span', { class: 'flex items-center gap-2' }, [
                icon ? h(icon, { size: 18, class: iconColor }) : null,
                config.title ?? '',
              ]),
            // 内容
            default: () => config.content,
            // 底部按钮：confirm 有取消 + 确定，其他只有确定
            footer: () =>
              h('div', { class: 'flex justify-end gap-2' }, [
                showCancel
                  ? h(
                      Button,
                      { onClick: handleCancel },
                      () => finalCancelText,
                    )
                  : null,
                h(
                  Button,
                  {
                    type: config.okType === 'danger' ? 'default' : 'primary',
                    danger: config.okType === 'danger',
                    loading: state.okLoading,
                    onClick: handleOk,
                  },
                  () => finalOkText,
                ),
              ]),
          },
        )
    },
  }

  const vnode = createVNode(Inner)
  if (appContext) vnode.appContext = appContext
  render(vnode, div)

  return { close }
}

/** confirm：带取消按钮，默认确定按钮 primary */
export function confirm(config: ConfirmConfig) {
  return open({ type: 'confirm', okType: 'primary', ...config })
}

/** info：信息提示，无取消按钮，蓝色信息图标 */
export function info(config: ConfirmConfig) {
  return open({ type: 'info', cancelable: false, ...config })
}

/** success：成功提示，无取消按钮，绿色对勾图标 */
export function success(config: ConfirmConfig) {
  return open({ type: 'success', cancelable: false, ...config })
}

/** warning：警告提示，无取消按钮，橙色三角图标 */
export function warning(config: ConfirmConfig) {
  return open({ type: 'warning', cancelable: false, ...config })
}

/** error：错误提示，无取消按钮，红色错误图标 */
export function error(config: ConfirmConfig) {
  return open({ type: 'error', cancelable: false, ...config })
}

/** 设置应用上下文（用于注入全局配置等） */
export function setAppContext(ctx: AppContext) {
  appContext = ctx
}

export default confirm
