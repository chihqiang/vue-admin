/**
 * 基础列表页 /list/basic
 * 顶部统计卡片 + 状态筛选 + 搜索 + 通用表格 + 分页
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Edit, Trash2, Search } from '@lucide/vue'
import { Card, Input, Table, Tag, Pagination } from '@/components/ui'

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
  progress: number
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
  if (searchText.value) {
    list = list.filter(
      (d) => d.title.toLowerCase().includes(searchText.value.toLowerCase()) || d.owner.includes(searchText.value),
    )
  }
  return list
})

// ========== 分页 ==========
const currentPage = ref(1)
const pageSize = ref(5)
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ========== 表格列配置 ==========
const columns = [
  { title: '标题', dataIndex: 'title', width: '25%' },
  { title: '描述', dataIndex: 'description', width: '30%' },
  { title: '负责人', dataIndex: 'owner', width: '10%', align: 'center' as const },
  { title: '开始时间', dataIndex: 'startAt', width: '15%', align: 'center' as const },
  { title: '进度', dataIndex: 'progress', width: '12%', align: 'center' as const },
  { title: '操作', dataIndex: 'action', width: '8%', align: 'center' as const },
]

// ========== 操作 ==========
function handleAdd() {
  window.alert('打开新增弹窗')
}

function handleEdit(item: ListItem) {
  window.alert(`编辑：${item.title}`)
}

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
const statusColorMap: Record<string, 'blue' | 'orange' | 'green'> = {
  processing: 'blue',
  waiting: 'orange',
  done: 'green',
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
    <Card :body-style="{ padding: '20px 24px' }">
      <div class="grid grid-cols-1 sm:grid-cols-3">
        <div
          v-for="(stat, i) in statsCards"
          :key="i"
          class="px-6"
          :class="{ 'border-l border-gray-100': i > 0 }"
        >
          <p class="text-sm text-gray-400 mb-1">{{ stat.label }}</p>
          <p class="text-xl font-semibold text-gray-800">{{ stat.value }}</p>
        </div>
      </div>
    </Card>

    <!-- ========== 标准列表 ========== -->
    <Card title="标准列表" :body-style="{ padding: '0' }">
      <!-- 标题栏右侧：筛选 + 搜索 -->
      <template #extra>
        <div class="flex items-center gap-3">
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
          <Input v-model="searchText" placeholder="请输入" allow-clear custom-class="w-48">
            <template #prefix><Search :size="14" /></template>
          </Input>
        </div>
      </template>

      <!-- 新增按钮 -->
      <div class="p-6 pb-0">
        <button
          class="w-full py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:text-blue-500 hover:border-blue-400 transition-colors flex items-center justify-center gap-1"
          @click="handleAdd"
        >
          <Plus :size="14" />
          添加
        </button>
      </div>

      <!-- 通用表格 -->
      <div class="p-6">
        <Table :columns="columns" :data="pagedData" row-key="id">
          <!-- 标题列：头像 + 标题 + 状态标签 -->
          <template #cell-title="{ row }">
            <div class="flex items-center gap-3">
              <img :src="row.avatar" class="w-10 h-10 rounded-lg flex-shrink-0" alt="图标" />
              <div>
                <span class="text-sm font-medium text-gray-800 hover:text-blue-500 cursor-pointer">{{ row.title }}</span>
                <Tag :color="statusColorMap[row.status]" size="sm" class="ml-2">{{ statusTextMap[row.status] }}</Tag>
              </div>
            </div>
          </template>

          <!-- 描述列 -->
          <template #cell-description="{ row }">
            <span class="text-sm text-gray-400">{{ row.description }}</span>
          </template>

          <!-- 负责人列 -->
          <template #cell-owner="{ row }">
            <span class="text-sm text-gray-600">{{ row.owner }}</span>
          </template>

          <!-- 开始时间列 -->
          <template #cell-startAt="{ row }">
            <span class="text-sm text-gray-600">{{ row.startAt }}</span>
          </template>

          <!-- 进度列 -->
          <template #cell-progress="{ row }">
            <div class="w-full">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-500">{{ row.progress }}%</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="progressBarColor[row.status]"
                  :style="{ width: row.progress + '%' }"
                ></div>
              </div>
            </div>
          </template>

          <!-- 操作列 -->
          <template #cell-action="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button class="text-blue-500 hover:text-blue-600" @click="handleEdit(row)">
                <Edit :size="16" />
              </button>
              <button class="text-red-500 hover:text-red-600" @click="handleDelete(row)">
                <Trash2 :size="16" />
              </button>
            </div>
          </template>
        </Table>
      </div>

      <!-- 分页 -->
      <div class="flex justify-end px-6 pb-6">
        <Pagination
          v-model:current="currentPage"
          :total="filteredData.length"
          :page-size="pageSize"
        />
      </div>
    </Card>
  </div>
</template>
