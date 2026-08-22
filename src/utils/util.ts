/**
 * 常用工具函数
 */
import SparkMD5 from 'spark-md5'

/**
 * 根据当前时间返回中文问候语（早上好 / 上午好 / 中午好 / 下午好 / 晚上好）
 */
export function timeFix(): string {
  const hour = new Date().getHours()
  if (hour < 9) return '早上好'
  if (hour <= 11) return '上午好'
  if (hour <= 13) return '中午好'
  if (hour < 20) return '下午好'
  return '晚上好'
}

/**
 * 对字符串做 md5
 * @param input 原始字符串（一般是明文密码）
 * @returns 32 位小写 md5 摘要
 */
export function md5(input: string): string {
  return SparkMD5.hash(input)
}
