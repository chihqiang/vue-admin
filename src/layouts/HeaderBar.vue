/**
 * 顶栏组件
 * 包含：折叠按钮、面包屑、用户头像下拉菜单
 */
<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu as MenuIcon,
  ChevronRight,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
} from '@lucide/vue'
import { useUserStore } from '@/stores/user'
import { menuRoutes } from '@/config/menu'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// ========== 折叠侧边栏 ==========
const props = withDefaults(
  defineProps<{
    /** 侧边栏是否折叠 */
    collapsed?: boolean
  }>(),
  { collapsed: false },
)
const emit = defineEmits<{
  (e: 'toggle-collapse'): void
}>()

function toggleCollapse() {
  emit('toggle-collapse')
}

// ========== 面包屑 ==========
/** 根据当前路由路径生成面包屑数据 */
const breadcrumbs = computed(() => {
  const currentPath = route.path
  const crumbs: { title: string; path?: string }[] = []

  // 遍历菜单树找到当前路径对应的层级
  for (const menu of menuRoutes) {
    if (currentPath.startsWith(menu.path)) {
      crumbs.push({ title: menu.meta.title })

      if (menu.children) {
        for (const child of menu.children) {
          if (currentPath === child.path || currentPath.startsWith(child.path + '/')) {
            crumbs.push({ title: child.meta.title, path: child.path })
            break
          }
        }
      }
      break
    }
  }

  // 如果没匹配到菜单配置，尝试用路由 meta.title
  if (crumbs.length === 0 && route.meta.title) {
    crumbs.push({ title: route.meta.title as string })
  }

  return crumbs
})

// ========== 用户下拉菜单 ==========
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement>()

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

/** 点击外部关闭下拉菜单 */
function handleClickOutside(e: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}

document.addEventListener('click', handleClickOutside)
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

/** 跳转到个人中心 */
function goProfile() {
  userMenuOpen.value = false
  router.push('/account/center')
}

/** 跳转到账户设置 */
function goSettings() {
  userMenuOpen.value = false
  router.push('/account/settings')
}

/** 退出登录 */
async function handleLogout() {
  userMenuOpen.value = false
  await userStore.Logout()
  router.push('/login')
}
</script>

<template>
  <header
    class="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100 shadow-sm"
  >
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="flex items-center gap-3">
      <!-- 折叠按钮 -->
      <button
        class="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
        @click="toggleCollapse"
      >
        <MenuIcon :size="20" />
      </button>

      <!-- 面包屑 -->
      <nav class="flex items-center text-sm">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <!-- 分隔箭头 -->
          <ChevronRight
            v-if="index > 0"
            :size="14"
            class="mx-1 text-gray-300"
          />
          <!-- 当前页（最后一级）不可点 -->
          <span
            v-if="index === breadcrumbs.length - 1"
            class="text-gray-700 font-medium"
          >
            {{ crumb.title }}
          </span>
          <!-- 可点击的上级 -->
          <router-link
            v-else-if="crumb.path"
            :to="crumb.path"
            class="text-gray-500 hover:text-blue-500"
          >
            {{ crumb.title }}
          </router-link>
          <span v-else class="text-gray-500">{{ crumb.title }}</span>
        </template>
      </nav>
    </div>

    <!-- 右侧：用户菜单 -->
    <div ref="userMenuRef" class="relative">
      <button
        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        @click.stop="toggleUserMenu"
      >
        <!-- 头像 -->
        <img
          v-if="userStore.avatar"
          :src="userStore.avatar"
          class="w-7 h-7 rounded-full bg-gray-100"
          alt="avatar"
        />
        <div
          v-else
          class="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs"
        >
          <UserIcon :size="16" />
        </div>
        <!-- 用户名 -->
        <span class="text-sm text-gray-700">{{ userStore.name || '用户' }}</span>
        <ChevronDown :size="14" class="text-gray-400" />
      </button>

      <!-- 下拉菜单 -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="userMenuOpen"
          class="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
        >
          <button
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            @click="goProfile"
          >
            <UserIcon :size="14" />
            个人中心
          </button>
          <button
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            @click="goSettings"
          >
            <Settings :size="14" />
            账户设置
          </button>
          <div class="border-t border-gray-100 my-1" />
          <button
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
            @click="handleLogout"
          >
            <LogOut :size="14" />
            退出登录
          </button>
        </div>
      </Transition>
    </div>
  </header>
</template>
