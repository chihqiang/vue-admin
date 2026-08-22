import { createVNode, render } from 'vue'
import type { AppContext, Component } from 'vue'
import NotificationContainer from './NotificationContainer.vue'

/** 通知类型 */
type NotificationType = 'success' | 'info' | 'warning' | 'error'

/** 弹出位置 */
type Placement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

/** 通知配置 */
interface NotificationConfig {
  /** 标题 */
  title: string
  /** 描述内容 */
  description?: string
  /** 类型 */
  type?: NotificationType
  /** 自定义图标 */
  icon?: Component
  /** 弹出位置（默认右上角） */
  placement?: Placement
  /** 自动关闭延时（秒），0 为不自动关闭 */
  duration?: number
  /** 唯一 key */
  key?: string | number
  /** 关闭回调 */
  onClose?: () => void
  /** 操作按钮文字 */
  btnText?: string
  /** 操作按钮点击回调 */
  onBtnClick?: () => void
}

/** 全局容器实例 */
let container: HTMLDivElement | null = null
let appContext: AppContext | null = null
let notificationList: NotificationConfig[] = []
let containerEl: any = null

/** 生成唯一 ID */
let seed = 0
function genId() {
  return `notification_${++seed}`
}

/** 创建容器 */
function ensureContainer() {
  if (container) return

  container = document.createElement('div')
  container.className = 'notification-container'
  document.body.appendChild(container)

  const vnode = createVNode(NotificationContainer)
  if (appContext) {
    vnode.appContext = appContext
  }
  render(vnode, container)
  // 使用 exposed 而非 proxy 访问 defineExpose 暴露的方法，避免 proxy 代理链上 update 不可达
  containerEl = vnode.component?.exposed
}

/** 移除通知 */
function removeNotification(key: string | number) {
  notificationList = notificationList.filter((n) => n.key !== key)
  containerEl?.update(notificationList)
}

/** 打开一条通知 */
function open(config: NotificationConfig) {
  ensureContainer()

  const key = config.key ?? genId()
  const duration = config.duration ?? 4.5

  const notification: NotificationConfig = {
    placement: 'topRight',
    ...config,
    key,
  }

  notificationList.push(notification)
  containerEl?.update(notificationList)

  // 自动关闭
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  if (duration > 0) {
    closeTimer = setTimeout(() => {
      close()
    }, duration * 1000)
  }

  function close() {
    if (closeTimer) clearTimeout(closeTimer)
    removeNotification(key)
    config.onClose?.()
  }

  // 覆写 onClose 为实际的 close（包含定时器清理）
  notification.onClose = close

  return { close }
}

/** 预设类型方法 */
function typeOpen(type: NotificationType, config: NotificationConfig) {
  return open({ ...config, type })
}

// ========== 导出 API ==========

const notification = {
  /** 通用通知 */
  open,
  /** 成功 */
  success: (config: NotificationConfig) => typeOpen('success', config),
  /** 信息 */
  info: (config: NotificationConfig) => typeOpen('info', config),
  /** 警告 */
  warning: (config: NotificationConfig) => typeOpen('warning', config),
  /** 错误 */
  error: (config: NotificationConfig) => typeOpen('error', config),
  /** 销毁指定通知 */
  destroy: (key?: string | number) => {
    if (key !== undefined) {
      removeNotification(key)
    } else {
      notificationList = []
      containerEl?.update(notificationList)
    }
  },
  /** 设置应用上下文 */
  setAppContext: (ctx: AppContext) => {
    appContext = ctx
  },
}

export default notification
export { notification }
