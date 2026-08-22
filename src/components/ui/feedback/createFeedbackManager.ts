/**
 * 反馈类容器管理工厂
 * 抽取 Alert / Message / Notification 三个命令式 API 共有的容器管理逻辑：
 * - 懒创建全局容器 vnode 并挂载到 body
 * - 维护实例列表，通过 exposed.update 同步给容器组件
 * - open/remove/destroy 的统一流程（含自动关闭定时器）
 * - setAppContext 注入全局上下文
 *
 * 各业务模块只需传入容器组件、id 前缀和默认 duration，
 * 再在此基础上包装自己的 config 类型和预设方法。
 */
import { createVNode, render } from 'vue'
import type { AppContext, Component } from 'vue'

/** 容器组件需暴露的 update 方法契约 */
interface ContainerExposed {
  update: (list: any[]) => void
}

/** 单条实例必须含有的字段（由工厂内部注入 key） */
interface BaseItem {
  key: string | number
  /** 自动关闭回调（可选，由 close 流程触发） */
  onClose?: () => void
}

/** open 返回的实例句柄 */
export interface FeedbackInstance {
  close: () => void
}

/** createFeedbackManager 选项 */
export interface FeedbackManagerOptions<Item extends BaseItem> {
  /** 容器组件 */
  container: Component
  /** 全局容器 className */
  containerClass: string
  /** 实例 id 前缀，用于 genId */
  idPrefix: string
  /** 自动关闭默认时长（秒），0 表示不自动关闭 */
  defaultDuration: number
  /** 列表项默认值（在 open 时与用户 config 合并，key 优先级最高） */
  defaultItem?: Partial<Item>
  /**
   * 容器点击关闭按钮是否触发完整 close 流程（含定时器清理 + 移除）。
   * - false（默认）：item.onClose 保持用户传入值，容器点击只触发用户回调
   *   （兼容 Alert：用户需自行在 onClose 里调用 instance.close 才会移除）
   * - true：工厂把传给容器的 item.onClose 覆写为 close，
   *   用户原始 onClose 仍在 close 流程内被调用（Notification 采用）
   */
  closeOnContainerClose?: boolean
}

export interface FeedbackManager<Item extends BaseItem> {
  /** 打开一条（已注入 key），返回可关闭句柄 */
  open: (item: Omit<Item, 'key'> & { key?: string | number }, duration?: number) => FeedbackInstance
  /** 按 key 移除一条 */
  remove: (key: string | number) => void
  /** 销毁指定 key；不传 key 则清空全部 */
  destroy: (key?: string | number) => void
  /** 取当前列表（外部只读使用） */
  list: () => Item[]
  /** 注入应用上下文（供全局配置/插件解析） */
  setAppContext: (ctx: AppContext) => void
}

/**
 * 创建一个反馈容器管理器
 * @example
 * const manager = createFeedbackManager<MessageItem>({
 *   container: MessageContainer,
 *   containerClass: 'message-container',
 *   idPrefix: 'message',
 *   defaultDuration: 3,
 * })
 */
export function createFeedbackManager<Item extends BaseItem>(
  options: FeedbackManagerOptions<Item>,
): FeedbackManager<Item> {
  const { container, containerClass, idPrefix, defaultDuration, defaultItem, closeOnContainerClose = false } = options

  let containerEl: HTMLDivElement | null = null
  let appContext: AppContext | null = null
  let exposed: ContainerExposed | null = null
  let items: Item[] = []
  let seed = 0

  function genId() {
    return `${idPrefix}_${++seed}`
  }

  /** 懒创建全局容器并挂载 */
  function ensureContainer() {
    if (containerEl) return
    containerEl = document.createElement('div')
    containerEl.className = containerClass
    document.body.appendChild(containerEl)

    const vnode = createVNode(container)
    if (appContext) vnode.appContext = appContext
    render(vnode, containerEl)
    // 使用 exposed 而非 proxy 访问 defineExpose 暴露的方法，避免 proxy 代理链上 update 不可达
    exposed = (vnode.component?.exposed as ContainerExposed | null) ?? null
  }

  /** 同步列表到容器组件 */
  function sync() {
    exposed?.update(items)
  }

  function remove(key: string | number) {
    items = items.filter((i) => i.key !== key)
    sync()
  }

  function open(item: Omit<Item, 'key'> & { key?: string | number }, duration = defaultDuration): FeedbackInstance {
    ensureContainer()

    // 保存用户原始 onClose 回调；close 流程内始终调用它
    const userOnClose = item.onClose
    // key 优先使用调用方传入，否则生成；默认值与用户配置合并，key 最后注入保证不被覆盖
    const key = item.key ?? genId()
    const merged: Item = { ...(defaultItem as object), ...item, key } as Item

    let closeTimer: ReturnType<typeof setTimeout> | undefined

    function close() {
      if (closeTimer) clearTimeout(closeTimer)
      remove(key)
      userOnClose?.()
    }

    // 若要求容器点击关闭 = 完整 close，则覆写传给容器的 onClose
    if (closeOnContainerClose) {
      ;(merged as Item).onClose = close as Item['onClose']
    }

    items.push(merged)
    sync()

    if (duration > 0) {
      closeTimer = setTimeout(close, duration * 1000)
    }

    return { close }
  }

  function destroy(key?: string | number) {
    if (key !== undefined) {
      remove(key)
    } else {
      items = []
      sync()
    }
  }

  function list() {
    return items
  }

  function setAppContext(ctx: AppContext) {
    appContext = ctx
  }

  return { open, remove, destroy, list, setAppContext }
}
