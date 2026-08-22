import type { AppContext } from 'vue'
import MessageContainer from './MessageContainer.vue'
import { createFeedbackManager } from '@/components/ui/feedback/createFeedbackManager'

/** 消息类型 */
export type MessageType = 'success' | 'info' | 'warning' | 'error' | 'loading'

/** 消息配置 */
export interface MessageConfig {
  /** 内容 */
  content: string
  /** 类型 */
  type?: MessageType
  /** 自动关闭延时（秒），0 为不自动关闭 */
  duration?: number
  /** 唯一 key */
  key?: string | number
  /** 关闭回调 */
  onClose?: () => void
}

/** 单条消息实例 */
export interface MessageInstance {
  close: () => void
}

/** 容器内部使用的列表项（含注入的 key） */
interface MessageItem extends MessageConfig {
  key: string | number
}

const manager = createFeedbackManager<MessageItem>({
  container: MessageContainer,
  containerClass: 'message-container',
  idPrefix: 'message',
  defaultDuration: 3,
  defaultItem: { type: 'info' },
})

/** 打开一条消息 */
function open(config: MessageConfig): MessageInstance {
  return manager.open({ ...config }, config.duration)
}

/** 预设类型方法 */
function typeOpen(type: MessageType, content: string, duration?: number): MessageInstance {
  return open({ content, type, duration })
}

// ========== 导出 API ==========

const message = {
  /** 通用消息 */
  open,
  /** 成功 */
  success: (content: string, duration?: number) => typeOpen('success', content, duration),
  /** 信息 */
  info: (content: string, duration?: number) => typeOpen('info', content, duration),
  /** 警告 */
  warning: (content: string, duration?: number) => typeOpen('warning', content, duration),
  /** 错误 */
  error: (content: string, duration?: number) => typeOpen('error', content, duration),
  /** 加载中（默认不自动关闭） */
  loading: (content: string, duration = 0) => typeOpen('loading', content, duration),
  /** 销毁指定消息 */
  destroy: (key?: string | number) => manager.destroy(key),
  /** 设置应用上下文（用于注入全局配置等） */
  setAppContext: (ctx: AppContext) => manager.setAppContext(ctx),
}

export default message
export { message }
