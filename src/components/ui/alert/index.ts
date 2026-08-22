import { createVNode, render } from 'vue'
import type { AppContext } from 'vue'
import AlertContainer from './AlertContainer.vue'

/** 重导出内联 Alert 组件，保持 `import { Alert } from '@/components/ui'` 可用 */
export { default as Alert } from './Alert.vue'

/** 提示类型 */
type AlertType = 'success' | 'info' | 'warning' | 'error'

/** 命令式 Alert 配置 */
interface AlertConfig {
  /** 标题 */
  title?: string
  /** 描述内容 */
  description?: string
  /** 类型 */
  type?: AlertType
  /** 是否显示图标（默认 true） */
  showIcon?: boolean
  /** 是否可关闭（默认 true） */
  closable?: boolean
  /** 自动关闭延时（秒），0 为不自动关闭（默认 0） */
  duration?: number
  /** 唯一 key */
  key?: string | number
  /** 关闭回调 */
  onClose?: () => void
}

/** 单条 Alert 实例 */
interface AlertInstance {
  close: () => void
}

/** 全局容器实例 */
let container: HTMLDivElement | null = null
let appContext: AppContext | null = null
let alertList: AlertConfig[] = []
let containerEl: any = null

/** 生成唯一 ID */
let seed = 0
function genId() {
  return `alert_${++seed}`
}

/** 创建容器 */
function ensureContainer() {
  if (container) return

  container = document.createElement('div')
  container.className = 'alert-container'
  document.body.appendChild(container)

  const vnode = createVNode(AlertContainer)
  if (appContext) {
    vnode.appContext = appContext
  }
  render(vnode, container)
  // 使用 exposed 而非 proxy 访问 defineExpose 暴露的方法，避免 proxy 代理链上 update 不可达
  containerEl = vnode.component?.exposed
}

/** 移除 Alert */
function removeAlert(key: string | number) {
  alertList = alertList.filter((a) => a.key !== key)
  containerEl?.update(alertList)
}

/** 打开一条 Alert */
function open(config: AlertConfig): AlertInstance {
  ensureContainer()

  const key = config.key ?? genId()
  const duration = config.duration ?? 0

  const alert: AlertConfig = {
    type: 'info',
    showIcon: true,
    closable: true,
    ...config,
    key,
  }

  alertList.push(alert)
  containerEl?.update(alertList)

  // 自动关闭
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  if (duration > 0) {
    closeTimer = setTimeout(() => {
      close()
    }, duration * 1000)
  }

  function close() {
    if (closeTimer) clearTimeout(closeTimer)
    removeAlert(key)
    config.onClose?.()
  }

  return { close }
}

/** 预设类型方法 */
function typeOpen(type: AlertType, config: AlertConfig): AlertInstance {
  return open({ ...config, type })
}

// ========== 导出命令式 API ==========

const alert = {
  /** 通用 Alert */
  open,
  /** 成功 */
  success: (config: AlertConfig) => typeOpen('success', config),
  /** 信息 */
  info: (config: AlertConfig) => typeOpen('info', config),
  /** 警告 */
  warning: (config: AlertConfig) => typeOpen('warning', config),
  /** 错误 */
  error: (config: AlertConfig) => typeOpen('error', config),
  /** 销毁指定 Alert */
  destroy: (key?: string | number) => {
    if (key !== undefined) {
      removeAlert(key)
    } else {
      alertList = []
      containerEl?.update(alertList)
    }
  },
  /** 设置应用上下文（用于注入全局配置等） */
  setAppContext: (ctx: AppContext) => {
    appContext = ctx
  },
}

export default alert
export { alert }
