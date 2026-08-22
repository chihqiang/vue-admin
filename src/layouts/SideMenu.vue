/**
 * 侧边栏菜单组件
 * 直接从路由表(router.options.routes)读取菜单树，路由即菜单
 * 支持：一级菜单展开/折叠、子菜单高亮、当前路由匹配
 * 图标使用 @lucide/vue，通过动态组件渲染
 */
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as LucideIcons from '@lucide/vue'
import type { RouteRecordRaw } from 'vue-router'

const route = useRoute()
const router = useRouter()

/**
 * 取出 BasicLayout(根 path === '/')下的 children 作为菜单树
 * 这些 children 即业务分组（仪表盘/表单页/...），带 children 的为可展开父级
 */
const menuTree = computed<RouteRecordRaw[]>(() => {
  const root = router.options.routes.find((r) => r.path === '/')
  return root?.children ?? []
})

/** 过滤掉 hideInMenu 的菜单项 */
const visibleMenus = computed(() =>
  menuTree.value.filter((m) => !m.meta?.hideInMenu),
)

/** 当前展开的一级菜单 path 列表（手风琴模式：一次只展开一个） */
const openKeys = ref<string[]>([])

/** 当前选中的叶子菜单 path */
const selectedKeys = ref<string[]>([])

/** 初始化：根据当前路由展开对应的父菜单并高亮 */
function initFromRoute() {
  const currentPath = route.path
  // 找到当前路由所属的一级分组
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

/** 切换一级菜单展开/收起（手风琴模式） */
function toggleMenu(path: string) {
  if (openKeys.value.includes(path)) {
    openKeys.value = openKeys.value.filter((p) => p !== path)
  } else {
    openKeys.value = [path]
  }
}

/** 点击叶子菜单，跳转路由 */
function handleMenuClick(item: RouteRecordRaw) {
  if (item.children && item.children.length > 0) return
  router.push(item.path)
}

/** 根据图标名动态获取 lucide 图标组件 */
function getIcon(iconName?: string) {
  if (!iconName) return null
  return (LucideIcons as Record<string, unknown>)[iconName] || null
}

/** 判断一级菜单是否激活（任一子菜单命中当前路径） */
function isActive(item: RouteRecordRaw): boolean {
  return item.children?.some((child) => route.path.startsWith(child.path)) ?? false
}

/** 判断叶子菜单是否激活 */
function isChildActive(child: RouteRecordRaw): boolean {
  return route.path === child.path || route.path.startsWith(child.path + '/')
}

/** 过滤可见的子菜单 */
function visibleChildren(item: RouteRecordRaw): RouteRecordRaw[] {
  return (item.children ?? []).filter((c) => !c.meta?.hideInMenu)
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
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50/50'
            "
            :style="{ width: 'calc(100% - 16px)' }"
            @click="toggleMenu(item.path)"
          >
            <!-- 图标 -->
            <component
              v-if="getIcon(item.meta?.icon)"
              :is="getIcon(item.meta?.icon)"
              :size="16"
            />
            <span class="flex-1 text-left">{{ item.meta?.title }}</span>
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
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50/50'
                "
                :style="{ width: 'calc(100% - 16px)' }"
                @click="handleMenuClick(child)"
              >
                {{ child.meta?.title }}
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
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50/50'
            "
            :style="{ width: 'calc(100% - 16px)' }"
            @click="handleMenuClick(item)"
          >
            <component
              v-if="getIcon(item.meta?.icon)"
              :is="getIcon(item.meta?.icon)"
              :size="16"
            />
            <span class="flex-1 text-left">{{ item.meta?.title }}</span>
          </button>
        </li>
      </template>
    </ul>
  </nav>
</template>
