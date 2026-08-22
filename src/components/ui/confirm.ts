/**
 * 命令式确认框 API
 * 参考 ant-design 的 Modal.confirm / Modal.info / Modal.success / Modal.warning / Modal.error
 *
 * 用法：
 *   import { confirm } from '@/components/ui'
 *   confirm({ title: '确认删除？', content: '删除后不可恢复', onOk: () => doDelete() })
 *
 *   import { Modal } from '@/components/ui'
 *   Modal.info({ title: '提示', content: '已保存' })
 *   Modal.success({ title: '成功', content: '提交成功' })
 *   Modal.warning({ title: '警告', content: '请先选择' })
 *   Modal.error({ title: '错误', content: '网络异常' })
 *
 * onOk 支持 async：返回 Promise 期间确定按钮显示 loading。
 */
import { createVNode, render } from 'vue'
import type { AppContext } from 'vue'
import ConfirmContainer from './ConfirmContainer.vue'
import type { ConfirmConfig, ConfirmType } from './ConfirmContainer.vue'

/** 全局容器 DOM */
let container: HTMLDivElement | null = null
/** 容器组件实例（暴露 add / removeByKey） */
let containerEl: any = null
let appContext: AppContext | null = null

/** 自增 id */
let seed = 0
function genKey() {
  return `confirm_${++seed}`
}

/** 创建容器（懒加载，首次调用时挂载到 body） */
function ensureContainer() {
  if (container) return

  container = document.createElement('div')
  container.className = 'confirm-container'
  document.body.appendChild(container)

  const vnode = createVNode(ConfirmContainer)
  if (appContext) vnode.appContext = appContext
  render(vnode, container)
  // 使用 exposed 访问 defineExpose 暴露的方法
  containerEl = vnode.component?.exposed
}

/** 内部统一入口 */
function open(config: ConfirmConfig & { type: ConfirmType }) {
  ensureContainer()

  const key = config.key ?? genKey()
  containerEl?.add({ ...config, _key: key })

  /** 关闭 */
  function close() {
    containerEl?.removeByKey(key)
  }

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
