/**
 * 通用表格组件 DataTable
 * 通过 columns 配置列，data 提供数据，内置分页和空状态
 *
 * 用法示例：
 * <DataTable :columns="columns" :data="list" :page-size="5" row-key="id">
 *   <!-- 自定义某列内容 -->
 *   <template #cell-name="{ row }">{{ row.name }}</template>
 *   <!-- 操作列 -->
 *   <template #cell-action="{ row }">
 *     <button @click="edit(row)">编辑</button>
 *   </template>
 * </DataTable>
 */
<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { TableColumn } from '@/types/table'

const props = withDefaults(
  defineProps<{
    /** 列配置数组 */
    columns: TableColumn[]
    /** 表格数据 */
    data: T[]
    /** 行数据的唯一标识字段名 */
    rowKey?: string
    /** 每页条数 */
    pageSize?: number
    /** 是否显示分页 */
    showPagination?: boolean
    /** 空状态提示文字 */
    emptyText?: string
  }>(),
  {
    rowKey: 'id',
    pageSize: 10,
    showPagination: true,
    emptyText: '暂无数据',
  },
)

// ========== 分页 ==========
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(props.data.length / props.pageSize.value) || 1)
const pagedData = computed(() => {
  if (!props.showPagination) return props.data
  const start = (currentPage.value - 1) * props.pageSize
  return props.data.slice(start, start + props.pageSize)
})

/** 上一页 */
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
/** 下一页 */
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

/** 对齐样式映射 */
const alignClass: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}
</script>

<template>
  <div class="w-full">
    <!-- 表格 -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <!-- 表头 -->
        <thead>
          <tr class="border-b border-gray-100">
            <th
              v-for="col in columns"
              :key="col.dataIndex"
              class="py-3 px-4 text-sm font-medium text-gray-500"
              :class="alignClass[col.align || 'left']"
              :style="col.width ? { width: col.width } : undefined"
            >
              {{ col.title }}
            </th>
          </tr>
        </thead>
        <!-- 表体 -->
        <tbody>
          <tr
            v-for="(row, rowIndex) in pagedData"
            :key="row[rowKey as string] ?? rowIndex"
            class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.dataIndex"
              class="py-3 px-4 text-sm text-gray-700"
              :class="alignClass[col.align || 'left']"
            >
              <!-- 具名列插槽：#cell-{dataIndex} -->
              <slot :name="`cell-${col.dataIndex}`" :row="row" :index="rowIndex">
                {{ row[col.dataIndex] ?? '-' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态 -->
    <div
      v-if="pagedData.length === 0"
      class="text-center py-12 text-gray-400 text-sm"
    >
      {{ emptyText }}
    </div>

    <!-- 分页 -->
    <div
      v-if="showPagination && data.length > 0"
      class="flex items-center justify-between px-4 py-3 border-t border-gray-100"
    >
      <span class="text-xs text-gray-400">共 {{ data.length }} 条</span>
      <div class="flex items-center gap-2">
        <button
          class="p-1 text-gray-400 rounded hover:text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <ChevronLeft :size="16" />
        </button>
        <span class="text-sm text-gray-500">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="p-1 text-gray-400 rounded hover:text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
