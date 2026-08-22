import type { AppContext, Component } from 'vue'
import Container from './Container.vue'
import { createFeedbackManager } from '@/components/ui/feedback/createManager'

/** 通知类型 */
export type NotificationType = 'success' | 'info' | 'warning' | 'error'

/** 弹出位置 */
export type Placement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

/** 通知配置 */
export interface NotificationConfig {
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

/** 单条通知实例 */
export interface NotificationInstance {
  close: () => void
}

/** 容器内部使用的列表项（含注入的 key） */
interface NotificationItem extends NotificationConfig {
  key: string | number
}

const manager = createFeedbackManager<NotificationItem>({
  container: Container,
  containerClass: 'notification-container',
  idPrefix: 'notification',
  defaultDuration: 4.5,
  defaultItem: { placement: 'topRight' },
  // 容器点击关闭按钮触发完整 close 流程（含定时器清理 + 移除）
  closeOnContainerClose: true,
})

/** 打开一条通知 */
function open(config: NotificationConfig): NotificationInstance {
  return manager.open({ ...config }, config.duration)
}

/** 预设类型方法 */
function typeOpen(type: NotificationType, config: NotificationConfig): NotificationInstance {
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
  destroy: (key?: string | number) => manager.destroy(key),
  /** 设置应用上下文 */
  setAppContext: (ctx: AppContext) => manager.setAppContext(ctx),
}

export default notification
export { notification }
