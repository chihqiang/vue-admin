/**
 * 侧边栏菜单组件
 * 从 menuRoutes 配置递归渲染菜单树
 * 支持：一级菜单展开/折叠、子菜单高亮、当前路由匹配
 * 图标使用 @lucide/vue，通过动态组件渲染
 */
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as LucideIcons from '@lucide/vue'
import { menuRoutes, type MenuRoute } from '@/config/menu'

const route = useRoute()
const router = useRouter()

/** 当前展开的一级菜单 path（一次只展开一个，手风琴模式） */
const openKeys = ref<string[]>([])

/** 当前选中的菜单项 path */
const selectedKeys = ref<string[]>([])

/** 初始化：根据当前路由展开对应的父菜单并高亮 */
function initFromRoute() {
  const currentPath = route.path
  // 查找当前路由所属的一级菜单
  for (const item of menuRoutes) {
    if (item.children) {
      const match = item.children.some((child) => currentPath.startsWith(child.path))
      if (match) {
        openKeys.value = [item.path]
        break
      }
    } else if (currentPath === item.path) {
      openKeys.value = [item.path]
      break
    }
  }
  selectedKeys.value = [currentPath]
}

// 路由变化时重新计算
watch(() => route.path, initFromRoute, { immediate: true })

/** 过滤掉 hideInMenu 的菜单项 */
const visibleMenus = computed(() =>
  menuRoutes.filter((m) => !m.meta.hideInMenu),
)

/** 切换一级菜单展开/收起（手风琴模式） */
function toggleMenu(path: string) {
  if (openKeys.value.includes(path)) {
    // 如果只有一个子项或当前展开的就是它，收起
    openKeys.value = openKeys.value.filter((p) => p !== path)
  } else {
    openKeys.value = [path]
  }
}

/** 点击叶子菜单，跳转路由 */
function handleMenuClick(item: MenuRoute) {
  if (item.children && item.children.length > 0) return
  router.push(item.path)
}

/** 根据图标名动态获取 lucide 图标组件 */
function getIcon(iconName?: string) {
  if (!iconName) return null
  // 兼容 lucide/vue 的命名方式
  return (LucideIcons as Record<string, unknown>)[iconName] || null
}

/** 判断菜单项是否激活 */
function isActive(item: MenuRoute): boolean {
  if (item.children) {
    return item.children.some((child) => route.path.startsWith(child.path))
  }
  return route.path === item.path
}

/** 判断子菜单是否激活 */
function isChildActive(child: MenuRoute): boolean {
  return route.path === child.path || route.path.startsWith(child.path + '/')
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
              v-if="getIcon(item.meta.icon)"
              :is="getIcon(item.meta.icon)"
              :size="16"
            />
            <span class="flex-1 text-left">{{ item.meta.title }}</span>
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
              v-for="child in item.children.filter((c) => !c.meta.hideInMenu)"
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
                {{ child.meta.title }}
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
              v-if="getIcon(item.meta.icon)"
              :is="getIcon(item.meta.icon)"
              :size="16"
            />
            <span class="flex-1 text-left">{{ item.meta.title }}</span>
          </button>
        </li>
      </template>
    </ul>
  </nav>
</template>
