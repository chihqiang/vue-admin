/**
 * 应用全局 UI 状态（Pinia Setup Store）
 *
 * 承载不随用户变化的"界面状态"：
 *   - 侧边栏折叠：collapsed（持久化到 localStorage，刷新保留）
 *
 * 未来可扩展：主题（light/dark）、语言、顶栏是否固定等全局 UI 偏好。
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { storageGet, storageSetJSON } from '@/utils/storage'

/** localStorage 中 collapsed 字段的 key */
export const APP_COLLAPSED_KEY = 'App-Collapsed'

export const useAppStore = defineStore('app', () => {
  // ============ State ============

  /** 侧边栏是否折叠（从持久化读取初始值） */
  const collapsed = ref<boolean>(readCollapsed())

  // ============ Actions ============

  /** 读取持久化的 collapsed 值；读不到或异常则默认 false */
  function readCollapsed(): boolean {
    const raw = storageGet(APP_COLLAPSED_KEY)
    if (raw === null) return false
    try {
      return JSON.parse(raw) === true
    } catch {
      return false
    }
  }

  /** 切换折叠状态 */
  function toggleCollapse() {
    collapsed.value = !collapsed.value
  }

  /** 显式设置折叠状态（供响应式断点或快捷键使用） */
  function setCollapsed(value: boolean) {
    collapsed.value = value
  }

  // ============ 持久化（变化即写回 storage）============
  watch(
    collapsed,
    (val) => {
      storageSetJSON(APP_COLLAPSED_KEY, val)
    },
    { immediate: false },
  )

  return {
    collapsed,
    toggleCollapse,
    setCollapsed,
  }
})
