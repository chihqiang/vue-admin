/**
 * Mock 工具函数
 * 提供统一的响应体 builder、body/query 解析等
 */
import Mock from 'mockjs'
import type { ApiResponse } from '@/types/api'

/**
 * 构造统一的响应体
 * @param data    业务数据
 * @param msg     提示文案
 * @param code    业务状态码（200 成功）
 */
export function builder<T>(data: T, msg = '成功', code = 200): ApiResponse<T> {
  return {
    code,
    msg,
    data,
    // request_id 为可选字段，mock 环境生成一个随机 ID 方便调试
    request_id: Mock.mock('@guid'),
  }
}

/**
 * 构造失败的响应体（便捷方法）
 * @param msg     错误提示文案
 * @param code    业务状态码（非 200）
 * @param data    附加数据（一般 null）
 */
export function failBuilder<T = null>(
  msg: string,
  code = 500,
  data: T | null = null,
): ApiResponse<T | null> {
  return {
    code,
    msg,
    data,
    request_id: Mock.mock('@guid'),
  }
}

/**
 * 解析 mockjs options.body（字符串形式的 JSON）
 */
export function getBody<T = Record<string, unknown>>(options: { body?: string }): T {
  if (!options.body) return {} as T
  try {
    return JSON.parse(options.body) as T
  } catch {
    return {} as T
  }
}
