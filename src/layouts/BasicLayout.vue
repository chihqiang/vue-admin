/**
 * 基础布局组件
 * 结构：左侧边栏（Logo + 菜单）+ 右侧（顶栏 + 标签栏 + 内容区）
 *
 * - 侧边栏折叠状态由 stores/app 统一管理（带持久化，刷新保留用户偏好）
 * - 内容区使用 KeepAlive 缓存路由组件，配合 meta.keepAlive 控制单页缓存
 * - 多标签页由 stores/tabs 管理，路由切换时自动添加/移除
 */
<script setup lang="ts">
import { computed } from 'vue'
import { ShieldCheck } from '@lucide/vue'
import SideMenu from '@/layouts/SideMenu.vue'
import HeaderBar from '@/layouts/HeaderBar.vue'
import TabBar from '@/layouts/TabBar.vue'
import { useAppStore } from '@/stores/app'
import { useTabsStore } from '@/stores/tabs'

const appStore = useAppStore()
const tabsStore = useTabsStore()

/** 切换折叠状态（由顶栏 emit 触发） */
function handleToggle() {
  appStore.toggleCollapse()
}

/**
 * KeepAlive include 列表
 * 只有 meta.keepAlive === true 的路由 name 才会被缓存
 * 如果 meta.keepAlive 未设置，默认缓存所有页面（更符合后台系统习惯）
 */
const keepAliveNames = computed(() => {
  // 获取当前所有已打开标签对应的路由 name
  // 这样 KeepAlive 只缓存用户访问过的页面，避免全量缓存
  return tabsStore.tabs
    .filter((t) => t.name)
    .map((t) => t.name)
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <!-- ========== 侧边栏 ========== -->
    <aside
      class="flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transition-all duration-300 flex flex-col"
      :class="appStore.collapsed ? 'w-16' : 'w-56'"
    >
      <!-- Logo 区 -->
      <div
        class="flex items-center gap-2 h-14 px-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0"
      >
        <ShieldCheck :size="24" class="text-blue-500 flex-shrink-0" />
        <span
          v-show="!appStore.collapsed"
          class="text-base font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap"
        >
          vue-admin
        </span>
      </div>

      <!-- 菜单区（可滚动） -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <SideMenu />
      </div>
    </aside>

    <!-- ========== 右侧主区域 ========== -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶栏 -->
      <HeaderBar :collapsed="appStore.collapsed" @toggle-collapse="handleToggle" />

      <!-- 多标签栏 -->
      <TabBar />

      <!-- 内容区（KeepAlive 缓存） -->
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <router-view v-slot="{ Component, route: r }">
          <KeepAlive :include="keepAliveNames">
            <component :is="Component" :key="r.fullPath" />
          </KeepAlive>
        </router-view>
      </main>
    </div>
  </div>
</template>
