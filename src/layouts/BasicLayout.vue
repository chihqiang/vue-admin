/**
 * 基础布局组件
 * 结构：左侧边栏（Logo + 菜单）+ 右侧（顶栏 + 内容区 router-view）
 * 支持侧边栏折叠/展开
 */
<script setup lang="ts">
import { ref } from 'vue'
import { ShieldCheck } from '@lucide/vue'
import SideMenu from '@/components/layout/SideMenu.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'

/** 侧边栏是否折叠 */
const collapsed = ref(false)

/** 切换折叠状态 */
function handleToggle() {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- ========== 侧边栏 ========== -->
    <aside
      class="flex-shrink-0 bg-white border-r border-gray-100 transition-all duration-300 flex flex-col"
      :class="collapsed ? 'w-16' : 'w-56'"
    >
      <!-- Logo 区 -->
      <div
        class="flex items-center gap-2 h-14 px-4 border-b border-gray-100 flex-shrink-0"
      >
        <ShieldCheck :size="24" class="text-blue-500 flex-shrink-0" />
        <span
          v-show="!collapsed"
          class="text-base font-semibold text-gray-800 whitespace-nowrap"
        >
          vue-tailwind-template
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
      <HeaderBar :collapsed="collapsed" @toggle-collapse="handleToggle" />

      <!-- 内容区 -->
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
