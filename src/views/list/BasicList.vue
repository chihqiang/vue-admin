/**
 * 基础列表页 /list/basic
 * 顶部统计卡片 + 状态筛选 + 搜索 + 标准列表（头像/标题/描述/负责人/时间/进度条）+ 分页
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, MoreVertical, Edit, Trash2 } from '@lucide/vue'

// ========== 统计信息 ==========
const statsCards = [
  { label: '我的待办', value: '8 个任务' },
  { label: '本周任务平均处理时间', value: '32 分钟' },
  { label: '本周完成任务数', value: '24 个' },
]

// ========== 筛选 ==========
const statusFilter = ref<'all' | 'processing' | 'waiting'>('all')
const searchText = ref('')

// ========== 列表数据 ==========
interface ListItem {
  id: number
  title: string
  avatar: string
  description: string
  owner: string
  startAt: string
  /** 进度 0-100 */
  progress: number
  /** 状态 */
  status: 'processing' | 'waiting' | 'done'
}

const allData = ref<ListItem[]>([
  { id: 1, title: 'Alipay', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=l1&backgroundColor=1890ff', description: '那是一种内在的东西，他们到达不了，也无法触及的', owner: '付晓晓', startAt: '2024-08-20 22:44', progress: 90, status: 'processing' },
  { id: 2, title: 'Angular', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=l2&backgroundColor=dd4444', description: '希望是一个好东西，也许是最好的，好东西是不会消亡的', owner: '曲丽丽', startAt: '2024-08-18 22:44', progress: 54, status: 'processing' },
  { id: 3, title: 'Ant Design', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=l3&backgroundColor=722ed1', description: '生命就像一盒巧克力，结果往往出人意料', owner: '林东东', startAt: '2024-08-15 22:44', progress: 66, status: 'waiting' },
  { id: 4, title: 'vue-tailwind-template', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=l4&backgroundColor=42b883', description: '城镇中有那么多的酒馆，她却偏偏走进了我的酒馆', owner: '周星星', startAt: '2024-08-12 22:44', progress: 30, status: 'processing' },
  { id: 5, title: 'Bootstrap', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=l5&backgroundColor=7952b3', description: '那时候我只会想自己想要什么，从不想自己拥有什么', owner: '吴加好', startAt: '2024-08-10 22:44', progress: 100, status: 'done' },
  { id: 6, title: 'Vite', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=l6&backgroundColor=646cff', description: '前端构建工具的新一代方案，基于原生 ESM 实现快速开发', owner: '郑晨', startAt: '2024-08-08 22:44', progress: 75, status: 'processing' },
  { id: 7, title: 'Pinia', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=l7&backgroundColor=fdd835', description: 'Vue 官方推荐的状态管理库，TypeScript 友好', owner: '冯磊', startAt: '2024-08-05 22:44', progress: 45, status: 'waiting' },
  { id: 8, title: 'TypeScript', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=l8&backgroundColor=3178c6', description: 'JavaScript 的超集，提供静态类型检查', owner: '许文', startAt: '2024-08-02 22:44', progress: 88, status: 'processing' },
])

// ========== 筛选逻辑 ==========
const filteredData = computed(() => {
  let list = allData.value
  if (statusFilter.value !== 'all') list = list.filter((d) => d.status === statusFilter.value)
  if (searchText.value) list = list.filter((d) => d.title.toLowerCase().includes(searchText.value.toLowerCase()) || d.owner.includes(searchText.value))
  return list
})

// ========== 分页 ==========
const currentPage = ref(1)
const pageSize = ref(5)
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ========== 操作 ==========
/** 新增（模拟） */
function handleAdd() {
  window.alert('打开新增弹窗')
}

/** 编辑 */
function handleEdit(item: ListItem) {
  window.alert(`编辑：${item.title}`)
}

/** 删除 */
function handleDelete(item: ListItem) {
  if (confirm(`确认删除「${item.title}」？`)) {
    allData.value = allData.value.filter((d) => d.id !== item.id)
  }
}

// ========== 状态映射 ==========
const statusTextMap: Record<string, string> = {
  processing: '进行中',
  waiting: '等待中',
  done: '已完成',
}
const statusColorMap: Record<string, string> = {
  processing: 'text-blue-600 bg-blue-50',
  waiting: 'text-orange-500 bg-orange-50',
  done: 'text-green-600 bg-green-50',
}
const progressBarColor: Record<string, string> = {
  processing: 'bg-blue-500',
  waiting: 'bg-orange-400',
  done: 'bg-green-500',
}
</script>

<template>
  <div class="min-h-full bg-gray-50 p-6 space-y-6">
    <!-- ========== 统计卡片 ========== -->
    <div class="bg-white rounded-lg border border-gray-100 px-6 py-5">
      <div class="grid grid-cols-1 sm:grid-cols-3 divide-x divide-gray-100">
        <div
          v-for="(stat, i) in statsCards"
          :key="i"
          class="px-6 first:pl-0"
          :class="{ 'border-l border-gray-100': i > 0 }"
        >
          <p class="text-sm text-gray-400 mb-1">{{ stat.label }}</p>
          <p class="text-xl font-semibold text-gray-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- ========== 标准列表 ========== -->
    <div class="bg-white rounded-lg border border-gray-100">
      <!-- 标题 + 筛选操作 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-800">标准列表</h3>
        <div class="flex items-center gap-3">
          <!-- 状态筛选 -->
          <div class="flex items-center border border-gray-200 rounded-md overflow-hidden">
            <button
              v-for="opt in [
                { value: 'all', label: '全部' },
                { value: 'processing', label: '进行中' },
                { value: 'waiting', label: '等待中' },
              ]"
              :key="opt.value"
              class="px-3 py-1.5 text-xs transition-colors"
              :class="statusFilter === opt.value ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-500 hover:bg-gray-50'"
              @click="statusFilter = opt.value as 'all' | 'processing' | 'waiting'"
            >
              {{ opt.label }}
            </button>
          </div>
          <!-- 搜索 -->
          <div class="relative">
            <input
              v-model="searchText"
              type="text"
              placeholder="请输入"
              class="w-56 pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
            <Search :size="14" class="absolute left-2.5 top-2 text-gray-400" />
          </div>
        </div>
      </div>

      <!-- 新增按钮 -->
      <div class="px-6 pt-4">
        <button
          class="w-full py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:text-blue-500 hover:border-blue-400 transition-colors flex items-center justify-center gap-1"
          @click="handleAdd"
        >
          <Plus :size="14" />
          添加
        </button>
      </div>

      <!-- 列表 -->
      <div class="px-6 py-4">
        <div
          v-for="item in pagedData"
          :key="item.id"
          class="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0"
        >
          <!-- 头像 -->
          <img
            :src="item.avatar"
            class="w-12 h-12 rounded-lg flex-shrink-0"
            alt="图标"
          />
          <!-- 主内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-medium text-gray-800 hover:text-blue-500 cursor-pointer">{{ item.title }}</span>
              <span
                class="px-2 py-0.5 text-xs rounded"
                :class="statusColorMap[item.status]"
              >
                {{ statusTextMap[item.status] }}
              </span>
            </div>
            <p class="text-sm text-gray-400">{{ item.description }}</p>
          </div>
          <!-- 右侧信息 -->
          <div class="flex items-center gap-8 flex-shrink-0">
            <!-- 负责人 -->
            <div class="text-center">
              <p class="text-xs text-gray-400 mb-1">负责人</p>
              <p class="text-sm text-gray-600">{{ item.owner }}</p>
            </div>
            <!-- 开始时间 -->
            <div class="text-center">
              <p class="text-xs text-gray-400 mb-1">开始时间</p>
              <p class="text-sm text-gray-600">{{ item.startAt }}</p>
            </div>
            <!-- 进度 -->
            <div class="w-40">
              <div class="flex items-center justify-between mb-1">
                <p class="text-xs text-gray-400">进度</p>
                <p class="text-xs text-gray-500">{{ item.progress }}%</p>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="progressBarColor[item.status]"
                  :style="{ width: item.progress + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <!-- 操作 -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              class="text-sm text-blue-500 hover:text-blue-600"
              @click="handleEdit(item)"
            >
              <Edit :size="16" />
            </button>
            <button
              class="text-sm text-red-500 hover:text-red-600"
              @click="handleDelete(item)"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="pagedData.length === 0" class="text-center py-12 text-gray-400 text-sm">
          暂无数据
        </div>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <span class="text-xs text-gray-400">共 {{ filteredData.length }} 条</span>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1 text-sm border border-gray-200 rounded text-gray-600 hover:text-blue-500 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </button>
          <span class="text-sm text-gray-500">{{ currentPage }} / {{ totalPages }}</span>
          <button
            class="px-3 py-1 text-sm border border-gray-200 rounded text-gray-600 hover:text-blue-500 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
