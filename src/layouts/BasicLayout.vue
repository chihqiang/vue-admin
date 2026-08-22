/**
 * 基础布局组件
 * 结构：左侧边栏（Logo + 菜单）+ 右侧（顶栏 + 内容区 router-view）
 *
 * 侧边栏折叠状态由 stores/app 统一管理（带持久化，刷新保留用户偏好）。
 */
<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
import SideMenu from '@/layouts/SideMenu.vue'
import HeaderBar from '@/layouts/HeaderBar.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

/** 切换折叠状态（由顶栏 emit 触发） */
function handleToggle() {
  appStore.toggleCollapse()
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- ========== 侧边栏 ========== -->
    <aside
      class="flex-shrink-0 bg-white border-r border-gray-100 transition-all duration-300 flex flex-col"
      :class="appStore.collapsed ? 'w-16' : 'w-56'"
    >
      <!-- Logo 区 -->
      <div
        class="flex items-center gap-2 h-14 px-4 border-b border-gray-100 flex-shrink-0"
      >
        <ShieldCheck :size="24" class="text-blue-500 flex-shrink-0" />
        <span
          v-show="!appStore.collapsed"
          class="text-base font-semibold text-gray-800 whitespace-nowrap"
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

      <!-- 内容区 -->
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
