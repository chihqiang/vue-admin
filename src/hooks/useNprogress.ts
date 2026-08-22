/**
 * NProgress 进度条 Hook
 *
 * 封装 nprogress，提供响应式的进度条控制：
 * - start(): 开始进度条
 * - done(): 完成进度条
 * - configure(options): 配置进度条参数
 *
 * 典型用途：路由切换、接口请求时显示顶部进度条
 */
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

/** 默认配置：关闭旋转图标，使用平滑过渡 */
NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

/** 进度条配置选项（透传 nprogress） */
type NProgressOptions = Parameters<typeof NProgress.configure>[0]

/**
 * 进度条 Hook
 * @returns start - 开始进度条
 * @returns done - 完成进度条
 * @returns configure - 配置进度条参数
 */
export function useNprogress() {
  /** 开始进度条 */
  const start = () => NProgress.start()

  /** 完成进度条 */
  const done = () => NProgress.done()

  /** 配置进度条参数（如 minimum、template、easing 等） */
  const configure = (options: NProgressOptions) => NProgress.configure(options)

  return { start, done, configure }
}
