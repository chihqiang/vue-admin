/**
 * 用户管理页面 /system/user
 *
 * 功能：
 *   - 用户列表（表格 + 搜索 + 分页）
 *   - 新增/编辑用户（弹窗表单）
 *   - 删除用户（确认弹窗）
 *   - 按钮级权限控制（v-permission）
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Edit, Trash2, Search } from '@lucide/vue'
import { Button, Card, Input, Table, Tag, Pagination, Modal, message, confirm } from '@/components'

// ========== 搜索 ==========
const searchText = ref('')

// ========== 用户数据 ==========
interface UserItem {
  id: number
  username: string
  name: string
  role: string
  email: string
  phone: string
  status: 'active' | 'disabled'
  createTime: string
}

const allData = ref<UserItem[]>([
  { id: 1, username: 'admin', name: '系统管理员', role: 'admin', email: 'admin@example.com', phone: '13800000001', status: 'active', createTime: '2024-01-01 10:00' },
  { id: 2, username: 'super', name: '超级管理员', role: 'super', email: 'super@example.com', phone: '13900000002', status: 'active', createTime: '2024-01-01 10:05' },
  { id: 3, username: 'zhangsan', name: '张三', role: 'editor', email: 'zhangsan@example.com', phone: '13700000003', status: 'active', createTime: '2024-03-15 09:30' },
  { id: 4, username: 'lisi', name: '李四', role: 'viewer', email: 'lisi@example.com', phone: '13600000004', status: 'disabled', createTime: '2024-05-20 14:20' },
  { id: 5, username: 'wangwu', name: '王五', role: 'editor', email: 'wangwu@example.com', phone: '13500000005', status: 'active', createTime: '2024-06-10 16:45' },
  { id: 6, username: 'zhaoliu', name: '赵六', role: 'viewer', email: 'zhaoliu@example.com', phone: '13400000006', status: 'active', createTime: '2024-07-01 11:15' },
  { id: 7, username: 'qianqi', name: '钱七', role: 'editor', email: 'qianqi@example.com', phone: '13300000007', status: 'active', createTime: '2024-07-20 08:00' },
  { id: 8, username: 'sunba', name: '孙八', role: 'viewer', email: 'sunba@example.com', phone: '13200000008', status: 'disabled', createTime: '2024-08-01 13:30' },
])

const filteredData = computed(() => {
  if (!searchText.value) return allData.value
  const q = searchText.value.toLowerCase()
  return allData.value.filter(
    (u) => u.username.toLowerCase().includes(q) || u.name.includes(q) || u.email.includes(q),
  )
})

// ========== 分页 ==========
const currentPage = ref(1)
const pageSize = ref(5)
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ========== 表格列 ==========
const columns = [
  { title: '用户名', dataIndex: 'username', width: '15%' },
  { title: '姓名', dataIndex: 'name', width: '12%' },
  { title: '角色', dataIndex: 'role', width: '10%', align: 'center' as const },
  { title: '邮箱', dataIndex: 'email', width: '20%' },
  { title: '手机号', dataIndex: 'phone', width: '15%', align: 'center' as const },
  { title: '状态', dataIndex: 'status', width: '10%', align: 'center' as const },
  { title: '创建时间', dataIndex: 'createTime', width: '13%', align: 'center' as const },
  { title: '操作', dataIndex: 'action', width: '5%', align: 'center' as const },
]

// ========== 新增/编辑弹窗 ==========
const modalVisible = ref(false)
const modalTitle = ref('新增用户')
const editingId = ref<number | null>(null)
const formData = ref({
  username: '',
  name: '',
  role: 'viewer',
  email: '',
  phone: '',
  status: 'active' as 'active' | 'disabled',
})

function handleAdd() {
  editingId.value = null
  modalTitle.value = '新增用户'
  formData.value = { username: '', name: '', role: 'viewer', email: '', phone: '', status: 'active' }
  modalVisible.value = true
}

function handleEdit(item: UserItem) {
  editingId.value = item.id
  modalTitle.value = '编辑用户'
  formData.value = { username: item.username, name: item.name, role: item.role, email: item.email, phone: item.phone, status: item.status }
  modalVisible.value = true
}

function handleSubmit() {
  if (!formData.value.username || !formData.value.name) {
    message.warning('请填写用户名和姓名')
    return
  }
  if (editingId.value) {
    const item = allData.value.find((u) => u.id === editingId.value)
    if (item) {
      Object.assign(item, formData.value)
    }
    message.success('编辑成功')
  } else {
    const newId = Math.max(...allData.value.map((u) => u.id)) + 1
    allData.value.push({
      id: newId,
      ...formData.value,
      createTime: new Date().toLocaleString('zh-CN'),
    })
    message.success('新增成功')
  }
  modalVisible.value = false
}

function handleDelete(item: UserItem) {
  confirm({
    title: '确认删除',
    content: `确定要删除用户"${item.name}"吗？`,
    onOk: () => {
      allData.value = allData.value.filter((u) => u.id !== item.id)
      message.success('删除成功')
    },
  })
}

// ========== 角色标签颜色映射 ==========
const roleColor: Record<string, string> = {
  super: 'red',
  admin: 'blue',
  editor: 'green',
  viewer: 'gray',
}
</script>

<template>
  <div class="p-6">
    <!-- 搜索栏 -->
    <Card class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Input
            v-model="searchText"
            placeholder="搜索用户名/姓名/邮箱"
            class="w-64"
            @keydown.enter="currentPage = 1"
          >
            <template #prefix>
              <Search :size="14" class="text-gray-400" />
            </template>
          </Input>
          <Button @click="searchText = ''">重置</Button>
        </div>
        <Button type="primary" v-permission="'user'" @click="handleAdd">
          <template #icon><Plus :size="14" /></template>
          新增用户
        </Button>
      </div>
    </Card>

    <!-- 表格 -->
    <Card>
      <Table :data="pagedData" :columns="columns" row-key="id" bordered>
        <!-- 角色列 -->
        <template #cell-role="{ row }">
          <Tag :color="roleColor[(row as UserItem).role] || 'gray'">{{ (row as UserItem).role }}</Tag>
        </template>

        <!-- 状态列 -->
        <template #cell-status="{ row }">
          <Tag :color="(row as UserItem).status === 'active' ? 'green' : 'red'">
            {{ (row as UserItem).status === 'active' ? '正常' : '禁用' }}
          </Tag>
        </template>

        <!-- 操作列 -->
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button
              v-permission="'user'"
              class="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              title="编辑"
              @click="handleEdit(row as UserItem)"
            >
              <Edit :size="14" />
            </button>
            <button
              v-permission="'user'"
              class="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="删除"
              @click="handleDelete(row as UserItem)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </template>
      </Table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <Pagination
          :total="filteredData.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @update:current-page="currentPage = $event"
        />
      </div>
    </Card>

    <!-- 新增/编辑弹窗 -->
    <Modal
      :open="modalVisible"
      :title="modalTitle"
      @update:open="modalVisible = $event"
      @ok="handleSubmit"
    >
      <div class="space-y-4 py-2">
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">用户名</label>
          <Input v-model="formData.username" placeholder="请输入用户名" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">姓名</label>
          <Input v-model="formData.name" placeholder="请输入姓名" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">角色</label>
          <select
            v-model="formData.role"
            class="flex-1 h-8 px-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="super">超级管理员</option>
            <option value="admin">管理员</option>
            <option value="editor">编辑</option>
            <option value="viewer">访客</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">邮箱</label>
          <Input v-model="formData.email" placeholder="请输入邮箱" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">手机号</label>
          <Input v-model="formData.phone" placeholder="请输入手机号" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">状态</label>
          <select
            v-model="formData.status"
            class="flex-1 h-8 px-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="active">正常</option>
            <option value="disabled">禁用</option>
          </select>
        </div>
      </div>
    </Modal>
  </div>
</template>
