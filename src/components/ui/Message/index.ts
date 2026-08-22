import { createVNode, render } from 'vue'
import type { AppContext } from 'vue'
import MessageContainer from './MessageContainer.vue'

/** 消息类型 */
type MessageType = 'success' | 'info' | 'warning' | 'error' | 'loading'

/** 消息配置 */
interface MessageConfig {
  /** 内容 */
  content: string
  /** 类型 */
  type?: MessageType
  /** 自动关闭延时（毫秒），0 为不自动关闭 */
  duration?: number
  /** 唯一 key */
  key?: string | number
  /** 关闭回调 */
  onClose?: () => void
}

/** 单条消息实例 */
interface MessageInstance {
  close: () => void
}

/** 全局容器实例 */
let container: HTMLDivElement | null = null
let appContext: AppContext | null = null

/** 消息列表（响应式，通过 container 组件内部管理） */
let messageList: MessageConfig[] = []
let containerEl: any = null

/** 生成唯一 ID */
let seed = 0
function genId() {
  return `message_${++seed}`
}

/** 创建容器 */
function ensureContainer() {
  if (container) return

  container = document.createElement('div')
  container.className = 'message-container'
  document.body.appendChild(container)

  const vnode = createVNode(MessageContainer)
  if (appContext) {
    vnode.appContext = appContext
  }
  render(vnode, container)
  containerEl = vnode.component?.proxy
}

/** 移除消息 */
function removeMessage(key: string | number) {
  messageList = messageList.filter((m) => m.key !== key)
  containerEl?.update(messageList)
}

/** 打开一条消息 */
function open(config: MessageConfig): MessageInstance {
  ensureContainer()

  const key = config.key ?? genId()
  const duration = config.duration ?? 3

  const message: MessageConfig = {
    type: 'info',
    ...config,
    key,
  }

  messageList.push(message)
  containerEl?.update(messageList)

  // 自动关闭
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  if (duration > 0) {
    closeTimer = setTimeout(() => {
      close()
    }, duration * 1000)
  }

  function close() {
    if (closeTimer) clearTimeout(closeTimer)
    removeMessage(key)
    config.onClose?.()
  }

  return { close }
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
  destroy: (key?: string | number) => {
    if (key !== undefined) {
      removeMessage(key)
    } else {
      messageList = []
      containerEl?.update(messageList)
    }
  },
  /** 设置应用上下文（用于注入全局配置等） */
  setAppContext: (ctx: AppContext) => {
    appContext = ctx
  },
}

export default message
export { message }
