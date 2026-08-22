/**
 * 通用的 HTTP 响应体结构（后端统一返回格式）
 * {
 *   code: 业务状态码（200 表示成功，非 200 表示业务异常）
 *   msg: 提示信息
 *   data: 数据载荷（可能为 null）
 *   request_id: 请求追踪 ID（可选字段，后端不一定返回）
 * }
 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码，200 表示成功 */
  code: number
  /** 提示信息 */
  msg: string
  /** 数据载荷 */
  data: T
  /** 请求追踪 ID（可选） */
  request_id?: string
}

/** 后端返回分页结构 */
export interface PageResult<T> {
  list: T[]
  total: number
  pageNo: number
  pageSize: number
}
