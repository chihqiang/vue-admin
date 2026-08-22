<script setup lang="ts">
/**
 * 分页 Pagination
 *
 * 特性：
 * - v-model:current 当前页
 * - total 总条数
 * - pageSize 每页条数
 * - showSizeChanger 显示条数选择器
 * - showQuickJumper 显示快速跳转
 * - pageSizeOptions 条数选项
 *
 * 事件：
 * - @change: 页码变化 (current, pageSize)
 * - @sizeChange: 条数变化
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current?: number
    total?: number
    pageSize?: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    pageSizeOptions?: number[]
  }>(),
  {
    current: 1,
    total: 0,
    pageSize: 10,
    showSizeChanger: false,
    showQuickJumper: false,
    pageSizeOptions: () => [10, 20, 50, 100],
  },
)

const emit = defineEmits<{
  'update:current': [value: number]
  change: [current: number, pageSize: number]
  sizeChange: [pageSize: number]
}>()

/** 总页数 */
const totalPages = computed(() => Math.ceil(props.total / props.pageSize) || 1)

/** 显示的页码列表 */
const pageList = computed(() => {
  const pages: (number | '...')[] = []
  const cur = props.current
  const total = totalPages.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (cur > 4) pages.push('...')

  const start = Math.max(2, cur - 2)
  const end = Math.min(total - 1, cur + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  if (cur < total - 3) pages.push('...')
  pages.push(total)
  return pages
})

function goTo(page: number | '...') {
  if (page === '...') return
  if (page < 1 || page > totalPages.value || page === props.current) return
  emit('update:current', page)
  emit('change', page, props.pageSize)
}

function prev() {
  if (props.current > 1) goTo(props.current - 1)
}

function next() {
  if (props.current < totalPages.value) goTo(props.current + 1)
}

function handleSizeChange(e: Event) {
  const newSize = Number((e.target as HTMLSelectElement).value)
  emit('sizeChange', newSize)
  emit('change', 1, newSize)
  emit('update:current', 1)
}
</script>

<template>
  <div class="flex items-center gap-1 text-sm">
    <!-- 条数选择器 -->
    <select
      v-if="showSizeChanger"
      class="h-7 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
      :value="pageSize"
      @change="handleSizeChange"
    >
      <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }} 条/页</option>
    </select>

    <!-- 总数 -->
    <span class="text-gray-400 text-xs mr-2">共 {{ total }} 条</span>

    <!-- 上一页 -->
    <button
      class="w-7 h-7 flex items-center justify-center rounded border transition-colors"
      :class="current <= 1 ? 'text-gray-300 cursor-not-allowed border-gray-100' : 'text-gray-600 hover:text-blue-500 hover:border-blue-300 border-gray-200'"
      :disabled="current <= 1"
      @click="prev"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
    </button>

    <!-- 页码 -->
    <template v-for="(page, i) in pageList" :key="i">
      <span v-if="page === '...'" class="w-7 h-7 flex items-center justify-center text-gray-400">...</span>
      <button
        v-else
        class="w-7 h-7 flex items-center justify-center rounded border transition-colors text-xs"
        :class="page === current
          ? 'bg-blue-500 text-white border-blue-500'
          : 'text-gray-600 hover:text-blue-500 hover:border-blue-300 border-gray-200'"
        @click="goTo(page)"
      >
        {{ page }}
      </button>
    </template>

    <!-- 下一页 -->
    <button
      class="w-7 h-7 flex items-center justify-center rounded border transition-colors"
      :class="current >= totalPages ? 'text-gray-300 cursor-not-allowed border-gray-100' : 'text-gray-600 hover:text-blue-500 hover:border-blue-300 border-gray-200'"
      :disabled="current >= totalPages"
      @click="next"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
    </button>

    <!-- 快速跳转 -->
    <div v-if="showQuickJumper" class="flex items-center gap-1 ml-2 text-xs text-gray-500">
      <span>跳至</span>
      <input
        type="number"
        class="w-12 h-7 px-2 text-center border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
        @keyup.enter="goTo(Number(($event.target as HTMLInputElement).value))"
      />
      <span>页</span>
    </div>
  </div>
</template>
