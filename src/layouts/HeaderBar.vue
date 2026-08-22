/**
 * 顶栏组件
 * 包含：折叠按钮、面包屑、用户头像下拉菜单
 */
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu as MenuIcon,
  ChevronRight,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from '@lucide/vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { resetRouter } from '@/router'
import { useClickOutside } from '@/hooks/useClickOutside'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// ========== 折叠侧边栏 ==========
withDefaults(
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
/**
 * 直接基于 route.matched（vue-router 解析出的匹配链）生成
 * 自动跳过 hideInBreadcrumb 和布局根（hideInMenu）的节点，
 * 最后一级不可点，中间级可点回父路径
 */
const breadcrumbs = computed(() => {
  return route.matched
    .filter((r) => !r.meta?.hideInBreadcrumb && !r.meta?.hideInMenu && r.meta?.title)
    .map((r) => ({
      title: r.meta.title as string,
      // 当前页（链尾）不提供 path，模板里会渲染为不可点
      path: r.path || undefined,
    }))
})

// ========== 用户下拉菜单 ==========
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement>()

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

/** 点击外部关闭下拉菜单 */
useClickOutside(userMenuRef, () => {
  userMenuOpen.value = false
})

/** 跳转到个人中心 */
function goProfile() {
  userMenuOpen.value = false
  router.push('/profile/advanced')
}

/** 跳转到账户设置 */
function goSettings() {
  userMenuOpen.value = false
  router.push('/profile/basic')
}

/** 退出登录 */
async function handleLogout() {
  userMenuOpen.value = false
  await userStore.logout()
  resetRouter()
  router.push('/login')
}
</script>

<template>
  <header
    class="flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm"
  >
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="flex items-center gap-3">
      <!-- 折叠按钮 -->
      <button
        class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        @click="toggleCollapse"
      >
        <MenuIcon :size="20" />
      </button>

      <!-- 主题切换按钮 -->
      <button
        class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        :title="appStore.isDark ? '切换到浅色' : '切换到深色'"
        @click="appStore.toggleTheme()"
      >
        <Sun v-if="appStore.isDark" :size="18" />
        <Moon v-else :size="18" />
      </button>

      <!-- 面包屑 -->
      <nav class="flex items-center text-sm">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <!-- 分隔箭头 -->
          <ChevronRight
            v-if="index > 0"
            :size="14"
            class="mx-1 text-gray-300 dark:text-gray-600"
          />
          <!-- 当前页（最后一级）不可点 -->
                    <span v-if="index === breadcrumbs.length - 1"
            class="text-gray-700 dark:text-gray-200 font-medium"
          >
            {{ crumb.title }}
          </span>
          <!-- 可点击的上级 -->
          <router-link
            v-else-if="crumb.path"
            :to="crumb.path"
            class="text-gray-500 dark:text-gray-400 hover:text-blue-500"
          >
            {{ crumb.title }}
          </router-link>
          <span v-else class="text-gray-500 dark:text-gray-400">{{ crumb.title }}</span>
        </template>
      </nav>
    </div>

    <!-- 右侧：用户菜单 -->
    <div ref="userMenuRef" class="relative">
      <button
        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
        <span class="text-sm text-gray-700 dark:text-gray-200">{{ userStore.name || '用户' }}</span>
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
          class="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50"
        >
          <button
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            @click="goProfile"
          >
            <UserIcon :size="14" />
            个人中心
          </button>
          <button
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            @click="goSettings"
          >
            <Settings :size="14" />
            账户设置
          </button>
          <div class="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button
            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
