/**
 * 多标签页组件
 *
 * 功能：
 *   - 展示当前打开的标签页列表
 *   - 点击标签切换路由
 *   - 关闭标签（鼠标 hover 显示关闭按钮）
 *   - 右键菜单：关闭其他、关闭全部
 *   - 固定标签（affix）不可关闭
 */
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { useClickOutside } from '@/hooks/useClickOutside'
import { X } from '@lucide/vue'

const router = useRouter()
const tabsStore = useTabsStore()

// ========== 右键菜单 ==========
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({ left: '0px', top: '0px' })
const contextMenuPath = ref('')

const contextMenuRef = ref<HTMLElement>()

useClickOutside(contextMenuRef, () => {
  contextMenuVisible.value = false
})

function openContextMenu(e: MouseEvent, path: string) {
  e.preventDefault()
  contextMenuPath.value = path
  contextMenuStyle.value = {
    left: `${e.clientX}px`,
    top: `${e.clientY}px`,
  }
  contextMenuVisible.value = true
}

// ========== 标签操作 ==========
function handleClick(fullPath: string) {
  router.push(fullPath)
}

function handleClose(path: string, e: MouseEvent) {
  e.stopPropagation()
  const redirect = tabsStore.closeTab(path)
  if (redirect) {
    router.push(redirect)
  }
}

function handleCloseOthers() {
  contextMenuVisible.value = false
  tabsStore.closeOthers()
}

function handleCloseAll() {
  contextMenuVisible.value = false
  const redirect = tabsStore.closeAll()
  router.push(redirect)
}
</script>

<template>
  <div
    class="flex items-center bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-2 h-9 gap-1 overflow-x-auto"
  >
    <template v-for="tab in tabsStore.tabs" :key="tab.path">
      <div
        class="flex items-center gap-1 px-3 h-7 rounded text-sm cursor-pointer whitespace-nowrap transition-colors group"
        :class="
          tabsStore.activePath === tab.path
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        "
        @click="handleClick(tab.fullPath)"
        @contextmenu="openContextMenu($event, tab.path)"
      >
        <!-- 标题 -->
        <span>{{ tab.title }}</span>

        <!-- 关闭按钮（固定标签不显示） -->
        <button
          v-if="!tab.affix"
          class="ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity opacity-0 group-hover:opacity-100"
          :class="tabsStore.activePath === tab.path ? 'opacity-100' : ''"
          @click="handleClose(tab.path, $event)"
        >
          <X :size="12" />
        </button>
      </div>
    </template>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenuVisible"
        ref="contextMenuRef"
        class="fixed z-50 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1"
        :style="contextMenuStyle"
      >
        <button
          class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="handleCloseOthers"
        >
          关闭其他
        </button>
        <button
          class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="handleCloseAll"
        >
          关闭全部
        </button>
      </div>
    </Teleport>
  </div>
</template>
