<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * 高级表格 Table
 *
 * 特性：
 * - data: 数据源
 * - columns: 列配置（支持 sortable / width / align / fixed）
 * - rowKey: 行 key 字段
 * - loading: 加载中
 * - size: sm / md / lg
 * - bordered: 边框
 * - scroll: 滚动配置 { x?, y? }
 * - #cell-{dataIndex}: 自定义列内容
 * - #header-{dataIndex}: 自定义表头
 * - #emptyText: 空状态自定义
 * - #expandedRowRender: 展开行
 *
 * 事件：
 * - @sort-change: 排序变化
 * - @row-click: 行点击
 * - @row-dblclick: 行双击
 */
import { ref, computed, useSlots } from 'vue'
import { ChevronUp, ChevronDown, ChevronsUpDown } from '@lucide/vue'
import type { TableColumn } from '@/types/table'

export type { TableColumn }

const props = withDefaults(
  defineProps<{
    data?: T[]
    columns?: TableColumn<T>[]
    rowKey?: string
    loading?: boolean
    size?: 'sm' | 'md' | 'lg'
    bordered?: boolean
    scroll?: { x?: string; y?: string }
  }>(),
  {
    data: () => [],
    columns: () => [],
    rowKey: 'id',
    loading: false,
    size: 'md',
    bordered: false,
    scroll: () => ({}),
  },
)

const emit = defineEmits<{
  'sort-change': [field: string, order: 'asc' | 'desc' | null]
  'row-click': [row: T, index: number]
  'row-dblclick': [row: T, index: number]
}>()

const slots = useSlots()

/** 排序状态 */
const sortField = ref<string>('')
const sortOrder = ref<'asc' | 'desc' | null>(null)

/** 排序后的数据 */
const sortedData = computed(() => {
  if (!sortField.value || !sortOrder.value) return props.data
  return [...props.data].sort((a, b) => {
    const av = a[sortField.value]
    const bv = b[sortField.value]
    if (av === bv) return 0
    const result = av > bv ? 1 : -1
    return sortOrder.value === 'asc' ? result : -result
  })
})

function toggleSort(col: TableColumn<T>) {
  if (!col.sortable) return
  if (sortField.value !== col.dataIndex) {
    sortField.value = col.dataIndex
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else if (sortOrder.value === 'desc') {
    sortField.value = ''
    sortOrder.value = null
  } else {
    sortOrder.value = 'asc'
  }
  emit('sort-change', sortField.value, sortOrder.value)
}

// 尺寸
const cellPadding = computed(() => ({ sm: 'px-2 py-1', md: 'px-3 py-2', lg: 'px-4 py-3' }[props.size]))
const alignClass = (align?: string) => ({ left: 'text-left', center: 'text-center', right: 'text-right' }[align || 'left'])

/** 渲染单元格内容 */
function renderCell(row: T, col: TableColumn<T>, index: number) {
  if (col.render) return col.render(row, index)
  return row[col.dataIndex] ?? '-'
}

const hasSlot = (name: string) => !!slots[name]
</script>

<template>
  <div class="relative w-full" :class="bordered ? 'border border-gray-100 rounded' : ''">
    <!-- 滚动容器 -->
    <div :style="{ overflowX: scroll.x ? 'auto' : 'hidden', overflowY: scroll.y ? 'auto' : 'hidden', maxHeight: scroll.y }">
      <table class="w-full border-collapse">
        <!-- 表头 -->
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th
              v-for="col in columns"
              :key="col.dataIndex"
              class="font-medium text-gray-500 whitespace-nowrap select-none"
              :class="[cellPadding, alignClass(col.align)]"
              :style="{ width: col.width, minWidth: col.width }"
            >
              <div
                class="inline-flex items-center gap-1"
                :class="col.sortable ? 'cursor-pointer hover:text-gray-700' : ''"
                @click="toggleSort(col)"
              >
                <slot :name="`header-${col.dataIndex}`">{{ col.title }}</slot>
                <!-- 排序图标 -->
                <template v-if="col.sortable">
                  <ChevronUp v-if="sortField === col.dataIndex && sortOrder === 'asc'" :size="12" class="text-blue-500" />
                  <ChevronDown v-else-if="sortField === col.dataIndex && sortOrder === 'desc'" :size="12" class="text-blue-500" />
                  <ChevronsUpDown v-else :size="12" class="text-gray-300" />
                </template>
              </div>
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody>
          <tr
            v-for="(row, index) in sortedData"
            :key="row[rowKey] ?? index"
            class="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
            @click="emit('row-click', row, index)"
            @dblclick="emit('row-dblclick', row, index)"
          >
            <td
              v-for="col in columns"
              :key="col.dataIndex"
              class="text-sm text-gray-700"
              :class="[cellPadding, alignClass(col.align)]"
            >
              <slot
                v-if="hasSlot(`cell-${col.dataIndex}`)"
                :name="`cell-${col.dataIndex}`"
                :row="row"
                :index="index"
              />
              <template v-else>{{ renderCell(row, col, index) }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && data.length === 0" class="py-12 text-center text-sm text-gray-400">
      <slot name="emptyText">暂无数据</slot>
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/50">
      <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
</template>
