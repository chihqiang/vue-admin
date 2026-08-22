/**
 * 多标签页状态管理（Pinia Setup Store）
 *
 * 功能：
 *   - 打开新路由时自动添加标签
 *   - 关闭标签（单个 / 其他 / 全部）
 *   - 标签切换跳转到对应路由
 *   - 标签列表不持久化（刷新后从当前路由重建）
 *
 * 约定：
 *   - 固定标签（affix）不可关闭（如首页）
 *   - 非菜单页（hideInMenu）不添加标签
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

/** 标签项 */
export interface TabItem {
  /** 路由路径（唯一标识） */
  path: string
  /** 路由名称 */
  name: string
  /** 标签标题 */
  title: string
  /** 是否固定标签（不可关闭） */
  affix?: boolean
  /** 完整路由信息（含 query） */
  fullPath: string
}

export const useTabsStore = defineStore('tabs', () => {
  /** 标签列表 */
  const tabs = ref<TabItem[]>([])

  /** 当前激活的标签路径 */
  const activePath = ref<string>('')

  /**
   * 添加标签（如果已存在则不重复添加）
   * 由路由后置守卫调用
   */
  function addTab(route: RouteLocationNormalized) {
    const path = route.path
    // 非菜单页不加标签
    if (route.meta?.hideInMenu) return
    // 无标题的页面不加标签
    if (!route.meta?.title) return

    activePath.value = path

    // 已存在则只更新 fullPath（query 可能变化）
    const existing = tabs.value.find((t) => t.path === path)
    if (existing) {
      existing.fullPath = route.fullPath
      return
    }

    // 新增标签
    tabs.value.push({
      path,
      name: String(route.name || ''),
      title: route.meta.title as string,
      affix: route.meta?.affix as boolean | undefined,
      fullPath: route.fullPath,
    })
  }

  /**
   * 关闭指定标签
   * @returns 如果关闭的是当前激活标签，返回上一个标签的 fullPath 供跳转；否则返回 null
   */
  function closeTab(path: string): string | null {
    const index = tabs.value.findIndex((t) => t.path === path)
    if (index === -1) return null
    const tab = tabs.value[index]!
    // 固定标签不可关闭
    if (tab.affix) return null

    tabs.value.splice(index, 1)

    // 如果关闭的是当前激活的标签，返回相邻标签
    if (activePath.value === path) {
      const next = tabs.value[index] || tabs.value[index - 1]
      activePath.value = next?.path || ''
      return next?.fullPath || '/'
    }
    return null
  }

  /** 关闭其他标签（保留当前激活的和固定的） */
  function closeOthers() {
    tabs.value = tabs.value.filter(
      (t) => t.affix || t.path === activePath.value,
    )
  }

  /** 关闭所有非固定标签 */
  function closeAll(): string {
    const affixTab = tabs.value.find((t) => t.affix)
    tabs.value = tabs.value.filter((t) => t.affix)
    activePath.value = affixTab?.path || ''
    return affixTab?.fullPath || '/'
  }

  /** 重置（登出时清理） */
  function reset() {
    tabs.value = []
    activePath.value = ''
  }

  return {
    tabs,
    activePath,
    addTab,
    closeTab,
    closeOthers,
    closeAll,
    reset,
  }
})
