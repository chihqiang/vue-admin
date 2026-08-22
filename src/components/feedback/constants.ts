/**
 * 反馈类组件（Alert / Message / Notification）共享的图标与颜色映射
 * 三类组件的 success/info/warning/error 语义一致，统一在此维护避免重复
 */
import { CheckCircle, Info, AlertTriangle, XCircle } from '@lucide/vue'
import type { Component } from 'vue'

/** 反馈语义类型（不含 Message 的 loading 扩展） */
export type FeedbackType = 'success' | 'info' | 'warning' | 'error'

/** 语义 → 图标组件 */
export const feedbackIconMap: Record<FeedbackType, Component> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

/** 语义 → 图标颜色 class */
export const feedbackIconColorMap: Record<FeedbackType, string> = {
  success: 'text-green-500',
  info: 'text-blue-500',
  warning: 'text-orange-500',
  error: 'text-red-500',
}

/** 语义 → 容器背景/边框/文字 class（用于 Alert 这类带背景框的展示） */
export const feedbackBoxColorMap: Record<FeedbackType, string> = {
  success: 'bg-green-50 border-green-200 text-green-600',
  info: 'bg-blue-50 border-blue-200 text-blue-600',
  warning: 'bg-orange-50 border-orange-200 text-orange-600',
  error: 'bg-red-50 border-red-200 text-red-600',
}

/** 默认 info 配置（用于 fallback） */
export const DEFAULT_FEEDBACK_BOX = 'bg-blue-50 border-blue-200 text-blue-600'
export const DEFAULT_FEEDBACK_ICON = Info
export const DEFAULT_FEEDBACK_ICON_COLOR = 'text-blue-500'

/** 按 type 获取图标（带 fallback） */
export function getFeedbackIcon(type?: string): Component {
  return (type && type in feedbackIconMap
    ? feedbackIconMap[type as FeedbackType]
    : DEFAULT_FEEDBACK_ICON)
}

/** 按 type 获取图标颜色（带 fallback） */
export function getFeedbackIconColor(type?: string): string {
  return (type && type in feedbackIconColorMap
    ? feedbackIconColorMap[type as FeedbackType]
    : DEFAULT_FEEDBACK_ICON_COLOR)
}

/** 按 type 获取容器配色（带 fallback） */
export function getFeedbackBoxColor(type?: string): string {
  return (type && type in feedbackBoxColorMap
    ? feedbackBoxColorMap[type as FeedbackType]
    : DEFAULT_FEEDBACK_BOX)
}
