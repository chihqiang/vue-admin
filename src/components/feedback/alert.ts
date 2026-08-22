import type { AppContext } from 'vue'
import AlertBox from './AlertBox.vue'
import { createManager } from '@/components/feedback/manager'

/** 重导出内联 Alert 组件，保持 `import { Alert } from '@/components'` 可用 */
export { default as Alert } from './Alert.vue'

/** 提示类型 */
export type AlertType = 'success' | 'info' | 'warning' | 'error'

/** 命令式 Alert 配置 */
export interface AlertConfig {
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
export interface AlertInstance {
  close: () => void
}

/** 容器内部使用的列表项（含注入的 key） */
interface AlertItem extends AlertConfig {
  key: string | number
}

const manager = createManager<AlertItem>({
  container: AlertBox,
  containerClass: 'alert-container',
  idPrefix: 'alert',
  defaultDuration: 0,
  defaultItem: { type: 'info', showIcon: true, closable: true },
})

/** 打开一条 Alert */
function open(config: AlertConfig): AlertInstance {
  return manager.open({ ...config }, config.duration)
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
  destroy: (key?: string | number) => manager.destroy(key),
  /** 设置应用上下文（用于注入全局配置等） */
  setAppContext: (ctx: AppContext) => manager.setAppContext(ctx),
}

export default alert
export { alert }
