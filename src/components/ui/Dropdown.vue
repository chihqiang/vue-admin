<script setup lang="ts">
/**
 * 下拉菜单 Dropdown
 *
 * 特性：
 * - trigger: hover / click
 * - placement: bottom-start / bottom-end / top-start / top-end
 * - items: { key, label, icon, disabled, divider }[]
 * - #default 触发内容
 *
 * 事件：
 * - @select: 选择菜单项 (key)
 *
 * 用法：
 *   <Dropdown :items="items" @select="onSelect">
 *     <button>菜单</button>
 *   </Dropdown>
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { Component } from 'vue'
import { ChevronDown } from '@lucide/vue'

interface DropdownItem {
  key: string | number
  label: string
  icon?: Component
  disabled?: boolean
  divider?: boolean
}

const props = withDefaults(
  defineProps<{
    items?: DropdownItem[]
    trigger?: 'hover' | 'click'
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  }>(),
  {
    items: () => [],
    trigger: 'hover',
    placement: 'bottom-end',
  },
)

const emit = defineEmits<{
  select: [key: string | number]
}>()

const visible = ref(false)
const rootRef = ref<HTMLDivElement>()

function show() {
  if (props.trigger === 'hover') visible.value = true
}

function hide() {
  if (props.trigger === 'hover') visible.value = false
}

function toggle() {
  if (props.trigger === 'click') visible.value = !visible.value
}

function handleSelect(item: DropdownItem) {
  if (item.disabled) return
  emit('select', item.key)
  visible.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    visible.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

/** 定位 */
const placementClass = {
  'bottom-start': 'top-full left-0 mt-1',
  'bottom-end': 'top-full right-0 mt-1',
  'top-start': 'bottom-full left-0 mb-1',
  'top-end': 'bottom-full right-0 mb-1',
}
</script>

<template>
  <div
    ref="rootRef"
    class="relative inline-block"
    @mouseenter="show"
    @mouseleave="hide"
  >
    <!-- 触发器 -->
    <div @click="toggle">
      <slot />
    </div>

    <!-- 下拉菜单 -->
    <Transition
      enter-active-class="transition-all duration-150"
      leave-active-class="transition-all duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="visible"
        class="absolute z-50 min-w-40 bg-white border border-gray-100 rounded-md shadow-lg py-1"
        :class="placementClass[placement]"
      >
        <template v-for="item in items" :key="item.key">
          <!-- 分割线 -->
          <div v-if="item.divider" class="my-1 border-t border-gray-100"></div>
          <!-- 菜单项 -->
          <button
            v-else
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors"
            :class="item.disabled
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-500'"
            @click="handleSelect(item)"
          >
            <component :is="item.icon" v-if="item.icon" :size="14" />
            <span>{{ item.label }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>
