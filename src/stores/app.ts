/**
 * 应用全局 UI 状态（Pinia Setup Store）
 *
 * 承载不随用户变化的"界面状态"：
 *   - 侧边栏折叠：collapsed（持久化到 localStorage，刷新保留）
 *   - 主题模式：theme（light / dark / auto，持久化 + 跟随系统）
 *
 * 未来可扩展：语言、顶栏是否固定等全局 UI 偏好。
 */
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { storageGet, storageGetJSON, storageSetJSON } from '@/utils/storage'

/** localStorage 中 collapsed 字段的 key */
export const APP_COLLAPSED_KEY = 'App-Collapsed'

/** localStorage 中 theme 字段的 key */
export const APP_THEME_KEY = 'App-Theme'

/** 主题模式 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/** TailwindCSS v4 通过 @custom-variant dark 使用 .dark 父选择器 */
const DARK_CLASS = 'dark'

/** 媒体查询：prefers-color-scheme: dark */
const darkMediaQuery =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

/** 读取系统当前颜色偏好 */
function systemPrefersDark(): boolean {
  return darkMediaQuery?.matches ?? false
}

/** 将 theme 模式实际应用到 <html> 根元素 */
function applyThemeToDOM(mode: ThemeMode): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  const shouldDark = mode === 'dark' || (mode === 'auto' && systemPrefersDark())
  html.classList.toggle(DARK_CLASS, shouldDark)
}

export const useAppStore = defineStore('app', () => {
  // ============ State ============

  /** 侧边栏是否折叠（从持久化读取初始值） */
  const collapsed = ref<boolean>(readCollapsed())

  /** 主题模式（从持久化读取初始值） */
  const theme = ref<ThemeMode>(readTheme())

  // ============ Getters ============

  /** 当前实际是否暗色（auto 会解析为 light / dark） */
  const isDark = computed(() => {
    return theme.value === 'dark' || (theme.value === 'auto' && systemPrefersDark())
  })

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

  /** 读取持久化的 theme 值；读不到或异常则默认 auto */
  function readTheme(): ThemeMode {
    const raw = storageGetJSON<ThemeMode>(APP_THEME_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw
    return 'auto'
  }

  /** 切换折叠状态 */
  function toggleCollapse() {
    collapsed.value = !collapsed.value
  }

  /** 显式设置折叠状态（供响应式断点或快捷键使用） */
  function setCollapsed(value: boolean) {
    collapsed.value = value
  }

  /** 设置主题模式 */
  function setTheme(mode: ThemeMode) {
    theme.value = mode
  }

  /** 在 light / dark 之间切换（auto 算作当前实际值） */
  function toggleTheme() {
    theme.value = isDark.value ? 'light' : 'dark'
  }

  // ============ 持久化 + DOM 应用 ============

  /** 应用主题到 DOM（初始挂载 + theme 变化时） */
  watch(
    theme,
    (val) => {
      applyThemeToDOM(val)
      storageSetJSON(APP_THEME_KEY, val)
    },
    { immediate: true },
  )

  /** collapsed 持久化 */
  watch(
    collapsed,
    (val) => {
      storageSetJSON(APP_COLLAPSED_KEY, val)
    },
    { immediate: false },
  )

  // ============ 系统主题变化监听（auto 模式下实时切换） ============
  if (darkMediaQuery) {
    darkMediaQuery.addEventListener('change', () => {
      if (theme.value === 'auto') {
        applyThemeToDOM('auto')
      }
    })
  }

  return {
    // state
    collapsed,
    theme,
    // getters
    isDark,
    // actions
    toggleCollapse,
    setCollapsed,
    setTheme,
    toggleTheme,
  }
})
