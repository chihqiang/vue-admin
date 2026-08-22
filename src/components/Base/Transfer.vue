<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * 穿梭框 Transfer
 *
 * 特性：
 * - dataSource: 全部数据 { key, title, disabled, chosen? }[]
 * - targetKeys: 右侧 key 列表（v-model）
 * - titles: 左右标题 [左, 右]
 * - filterable: 可搜索
 * - #render: 自定义渲染项 ({ item, direction })
 *
 * 事件：
 * - @change: (targetKeys, direction, moveKeys)
 */
import { ref, computed } from 'vue'
import { ChevronRight, ChevronLeft, Search } from '@lucide/vue'

interface TransferItem {
  key: string | number
  title: string
  disabled?: boolean
  chosen?: boolean
}

const props = withDefaults(
  defineProps<{
    dataSource?: TransferItem[]
    targetKeys?: (string | number)[]
    titles?: [string, string]
    filterable?: boolean
  }>(),
  {
    dataSource: () => [],
    targetKeys: () => [],
    titles: () => ['源列表', '目标列表'],
    filterable: false,
  },
)

const emit = defineEmits<{
  'update:targetKeys': [keys: (string | number)[]]
  change: [targetKeys: (string | number)[], direction: 'left' | 'right', moveKeys: (string | number)[]]
}>()

/** 左侧选中 */
const leftChecked = ref<Set<string | number>>(new Set())
/** 右侧选中 */
const rightChecked = ref<Set<string | number>>(new Set())

/** 搜索关键词 */
const leftSearch = ref('')
const rightSearch = ref('')

/** 左侧数据（未选中） */
const leftData = computed(() =>
  props.dataSource
    .filter((item) => !props.targetKeys.includes(item.key))
    .filter((item) => !leftSearch.value || item.title.includes(leftSearch.value)),
)

/** 右侧数据（已选中） */
const rightData = computed(() =>
  props.dataSource
    .filter((item) => props.targetKeys.includes(item.key))
    .filter((item) => !rightSearch.value || item.title.includes(rightSearch.value)),
)

function toggleLeft(key: string | number) {
  if (leftChecked.value.has(key)) leftChecked.value.delete(key)
  else leftChecked.value.add(key)
}

function toggleRight(key: string | number) {
  if (rightChecked.value.has(key)) rightChecked.value.delete(key)
  else rightChecked.value.add(key)
}

function moveToRight() {
  const moveKeys = [...leftChecked.value]
  const newTargetKeys = [...props.targetKeys, ...moveKeys]
  emit('update:targetKeys', newTargetKeys)
  emit('change', newTargetKeys, 'right', moveKeys)
  leftChecked.value.clear()
}

function moveToLeft() {
  const moveKeys = [...rightChecked.value]
  const newTargetKeys = props.targetKeys.filter((k) => !moveKeys.includes(k))
  emit('update:targetKeys', newTargetKeys)
  emit('change', newTargetKeys, 'left', moveKeys)
  rightChecked.value.clear()
}
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- 左侧 -->
    <div class="flex-1 border border-gray-100 rounded-md">
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-50">
        <span class="text-sm font-medium">{{ titles[0] }}</span>
        <span class="text-xs text-gray-400">{{ leftChecked.size }}/{{ leftData.length }}</span>
      </div>
      <div v-if="filterable" class="px-2 py-1.5 border-b border-gray-50">
        <div class="flex items-center gap-1.5">
          <Search :size="14" class="text-gray-300" />
          <input v-model="leftSearch" placeholder="搜索" class="flex-1 text-sm outline-none bg-transparent" />
        </div>
      </div>
      <div class="max-h-64 overflow-auto py-1">
        <label
          v-for="item in leftData"
          :key="item.key"
          class="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
          :class="item.disabled ? 'opacity-50 cursor-not-allowed' : ''"
          @click="!item.disabled && toggleLeft(item.key)"
        >
          <input type="checkbox" :checked="leftChecked.has(item.key)" :disabled="item.disabled" @click.stop />
          <span class="text-sm text-gray-700">{{ item.title }}</span>
        </label>
      </div>
    </div>

    <!-- 中间按钮 -->
    <div class="flex flex-col gap-2">
      <button
        class="w-8 h-8 flex items-center justify-center border rounded-md transition-colors"
        :class="leftChecked.size > 0 ? 'border-blue-300 text-blue-500 hover:bg-blue-50 cursor-pointer' : 'border-gray-100 text-gray-300 cursor-not-allowed'"
        :disabled="leftChecked.size === 0"
        @click="moveToRight"
      >
        <ChevronRight :size="16" />
      </button>
      <button
        class="w-8 h-8 flex items-center justify-center border rounded-md transition-colors"
        :class="rightChecked.size > 0 ? 'border-blue-300 text-blue-500 hover:bg-blue-50 cursor-pointer' : 'border-gray-100 text-gray-300 cursor-not-allowed'"
        :disabled="rightChecked.size === 0"
        @click="moveToLeft"
      >
        <ChevronLeft :size="16" />
      </button>
    </div>

    <!-- 右侧 -->
    <div class="flex-1 border border-gray-100 rounded-md">
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-50">
        <span class="text-sm font-medium">{{ titles[1] }}</span>
        <span class="text-xs text-gray-400">{{ rightChecked.size }}/{{ rightData.length }}</span>
      </div>
      <div v-if="filterable" class="px-2 py-1.5 border-b border-gray-50">
        <div class="flex items-center gap-1.5">
          <Search :size="14" class="text-gray-300" />
          <input v-model="rightSearch" placeholder="搜索" class="flex-1 text-sm outline-none bg-transparent" />
        </div>
      </div>
      <div class="max-h-64 overflow-auto py-1">
        <label
          v-for="item in rightData"
          :key="item.key"
          class="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
          :class="item.disabled ? 'opacity-50 cursor-not-allowed' : ''"
          @click="!item.disabled && toggleRight(item.key)"
        >
          <input type="checkbox" :checked="rightChecked.has(item.key)" :disabled="item.disabled" @click.stop />
          <span class="text-sm text-gray-700">{{ item.title }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
