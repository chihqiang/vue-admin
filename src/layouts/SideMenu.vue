/**
 * 侧边栏菜单组件
 *
 * 从 userStore.menus（后端返回的动态菜单数据）读取菜单树。
 * 侧边栏不再从静态路由表读取，而是从动态加载的菜单数据渲染。
 *
 * 支持：一级菜单展开/折叠、子菜单高亮、当前路由匹配
 * 图标：从 @/utils/lucide 白名单导出集中读取（避免全量打包 @lucide/vue）。
 */
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as Icons from '@/utils/lucide'
import { useUserStore } from '@/stores/user'
import { asyncRoutes } from '@/router/routes'
import type { AsyncMenuItem } from '@/router/asyncRoutes'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/**
 * 取动态路由菜单作为菜单树
 * 如果动态路由已加载，使用后端返回的菜单；否则使用 mock 数据兜底
 */
const menuTree = computed<AsyncMenuItem[]>(() => {
  return userStore.menus.length > 0 ? userStore.menus : asyncRoutes
})

/** 过滤掉 hideInMenu 的菜单项 */
const visibleMenus = computed(() =>
  menuTree.value.filter((m) => !m.hideInMenu),
)

/** 当前展开的一级菜单 path 列表（手风琴模式：一次只展开一个） */
const openKeys = ref<string[]>([])

/** 当前选中的叶子菜单 path */
const selectedKeys = ref<string[]>([])

/** 初始化：根据当前路由展开对应的父菜单并高亮 */
function initFromRoute() {
  const currentPath = route.path
  for (const item of visibleMenus.value) {
    const match = item.children?.some((child) =>
      currentPath.startsWith(child.path),
    )
    if (match) {
      openKeys.value = [item.path]
      break
    }
  }
  selectedKeys.value = [currentPath]
}

// 路由变化时重新计算
watch(() => route.path, initFromRoute, { immediate: true })

// 菜单数据变化时也重新计算
watch(menuTree, initFromRoute, { immediate: false })

/** 切换一级菜单展开/收起（手风琴模式） */
function toggleMenu(path: string) {
  if (openKeys.value.includes(path)) {
    openKeys.value = openKeys.value.filter((p) => p !== path)
  } else {
    openKeys.value = [path]
  }
}

/** 点击叶子菜单，跳转路由 */
function handleMenuClick(item: AsyncMenuItem) {
  if (item.children && item.children.length > 0) return
  router.push(item.path)
}

/**
 * 根据图标名动态获取 lucide 图标组件
 */
function getIcon(iconName?: string) {
  if (!iconName) return null
  return (Icons as Record<string, unknown>)[iconName] || null
}

/** 判断一级菜单是否激活（任一子菜单命中当前路径） */
function isActive(item: AsyncMenuItem): boolean {
  return item.children?.some((child) => route.path.startsWith(child.path)) ?? false
}

/** 判断叶子菜单是否激活 */
function isChildActive(child: AsyncMenuItem): boolean {
  return route.path === child.path || route.path.startsWith(child.path + '/')
}

/** 过滤可见的子菜单 */
function visibleChildren(item: AsyncMenuItem): AsyncMenuItem[] {
  return (item.children ?? []).filter((c) => !c.hideInMenu)
}
</script>

<template>
  <nav class="h-full py-2">
    <ul class="space-y-0.5">
      <template v-for="item in visibleMenus" :key="item.path">
        <!-- 有子菜单：可展开的父级 -->
        <li v-if="item.children && item.children.length">
          <!-- 父级标题 -->
          <button
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-lg mx-2"
            :class="
              isActive(item)
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-gray-700'
            "
            :style="{ width: 'calc(100% - 16px)' }"
            @click="toggleMenu(item.path)"
          >
            <!-- 图标 -->
            <component
              v-if="getIcon(item.icon)"
              :is="getIcon(item.icon)"
              :size="16"
            />
            <span class="flex-1 text-left">{{ item.title }}</span>
            <!-- 展开/收起箭头 -->
            <svg
              class="w-3 h-3 transition-transform"
              :class="openKeys.includes(item.path) ? 'rotate-90' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- 子菜单（展开时显示） -->
          <ul
            v-show="openKeys.includes(item.path)"
            class="mt-0.5 space-y-0.5"
          >
            <li
              v-for="child in visibleChildren(item)"
              :key="child.path"
            >
              <button
                class="w-full flex items-center pl-12 pr-4 py-2 text-sm transition-colors rounded-lg mx-2"
                :class="
                  isChildActive(child)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-gray-700'
                "
                :style="{ width: 'calc(100% - 16px)' }"
                @click="handleMenuClick(child)"
              >
                {{ child.title }}
              </button>
            </li>
          </ul>
        </li>

        <!-- 无子菜单：直接跳转的叶子菜单 -->
        <li v-else>
          <button
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-lg mx-2"
            :class="
              isActive(item)
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-gray-700'
            "
            :style="{ width: 'calc(100% - 16px)' }"
            @click="handleMenuClick(item)"
          >
            <component
              v-if="getIcon(item.icon)"
              :is="getIcon(item.icon)"
              :size="16"
            />
            <span class="flex-1 text-left">{{ item.title }}</span>
          </button>
        </li>
      </template>
    </ul>
  </nav>
</template>
