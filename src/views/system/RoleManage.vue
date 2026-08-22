/**
 * 角色管理页面 /system/role
 *
 * 功能：
 *   - 角色列表
 *   - 新增/编辑角色
 *   - 分配权限（权限树选择）
 *   - 删除角色
 */
<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Edit, Trash2, Users } from '@lucide/vue'
import { Button, Card, Table, Tag, Pagination, Modal, Input, message, confirm } from '@/components'

interface RoleItem {
  id: string
  name: string
  key: string
  describe: string
  status: 'active' | 'disabled'
  userCount: number
  createTime: string
}

const allData = ref<RoleItem[]>([
  { id: '1', name: '超级管理员', key: 'super', describe: '拥有系统所有权限', status: 'active', userCount: 1, createTime: '2024-01-01' },
  { id: '2', name: '管理员', key: 'admin', describe: '拥有大部分管理权限，不含权限管理', status: 'active', userCount: 3, createTime: '2024-01-01' },
  { id: '3', name: '编辑', key: 'editor', describe: '可编辑内容，不可管理系统配置', status: 'active', userCount: 8, createTime: '2024-02-10' },
  { id: '4', name: '访客', key: 'viewer', describe: '只读权限，仅可查看数据', status: 'active', userCount: 15, createTime: '2024-03-01' },
  { id: '5', name: '临时角色', key: 'temp', describe: '临时授权使用', status: 'disabled', userCount: 0, createTime: '2024-07-15' },
])

const columns = [
  { title: '角色名称', dataIndex: 'name', width: '15%' },
  { title: '角色标识', dataIndex: 'key', width: '10%', align: 'center' as const },
  { title: '描述', dataIndex: 'describe', width: '25%' },
  { title: '用户数', dataIndex: 'userCount', width: '10%', align: 'center' as const },
  { title: '状态', dataIndex: 'status', width: '10%', align: 'center' as const },
  { title: '创建时间', dataIndex: 'createTime', width: '15%', align: 'center' as const },
  { title: '操作', dataIndex: 'action', width: '15%', align: 'center' as const },
]

const currentPage = ref(1)
const pageSize = ref(10)

// 新增/编辑
const modalVisible = ref(false)
const modalTitle = ref('新增角色')
const editingId = ref<string | null>(null)
const formData = ref({ name: '', key: '', describe: '', status: 'active' as 'active' | 'disabled' })

function handleAdd() {
  editingId.value = null
  modalTitle.value = '新增角色'
  formData.value = { name: '', key: '', describe: '', status: 'active' }
  modalVisible.value = true
}

function handleEdit(item: RoleItem) {
  editingId.value = item.id
  modalTitle.value = '编辑角色'
  formData.value = { name: item.name, key: item.key, describe: item.describe, status: item.status }
  modalVisible.value = true
}

function handleSubmit() {
  if (!formData.value.name || !formData.value.key) {
    message.warning('请填写角色名称和标识')
    return
  }
  if (editingId.value) {
    const item = allData.value.find((r) => r.id === editingId.value)
    if (item) Object.assign(item, formData.value)
    message.success('编辑成功')
  } else {
    allData.value.push({
      id: String(Date.now()),
      ...formData.value,
      userCount: 0,
      createTime: new Date().toISOString().split('T')[0] || '',
    })
    message.success('新增成功')
  }
  modalVisible.value = false
}

function handleDelete(item: RoleItem) {
  if (item.userCount > 0) {
    message.warning(`该角色下有 ${item.userCount} 个用户，无法删除`)
    return
  }
  confirm({
    title: '确认删除',
    content: `确定要删除角色"${item.name}"吗？`,
    onOk: () => {
      allData.value = allData.value.filter((r) => r.id !== item.id)
      message.success('删除成功')
    },
  })
}
</script>

<template>
  <div class="p-6">
    <Card class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Users :size="16" />
          共 {{ allData.length }} 个角色
        </div>
        <Button type="primary" v-permission="'role'" @click="handleAdd">
          <template #icon><Plus :size="14" /></template>
          新增角色
        </Button>
      </div>
    </Card>

    <Card>
      <Table :data="allData" :columns="columns" row-key="id" bordered>
        <template #cell-status="{ row }">
          <Tag :color="(row as RoleItem).status === 'active' ? 'green' : 'red'">
            {{ (row as RoleItem).status === 'active' ? '正常' : '禁用' }}
          </Tag>
        </template>
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-2">
            <Button size="sm" type="text" v-permission="'role'" @click="handleEdit(row as RoleItem)">
              <template #icon><Edit :size="14" /></template>
              编辑
            </Button>
            <Button size="sm" type="text" danger v-permission="'role'" @click="handleDelete(row as RoleItem)">
              <template #icon><Trash2 :size="14" /></template>
              删除
            </Button>
          </div>
        </template>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination :total="allData.length" :page-size="pageSize" :current-page="currentPage" @update:current-page="currentPage = $event" />
      </div>
    </Card>

    <Modal :open="modalVisible" :title="modalTitle" @update:open="modalVisible = $event" @ok="handleSubmit">
      <div class="space-y-4 py-2">
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">角色名称</label>
          <Input v-model="formData.name" placeholder="请输入角色名称" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">角色标识</label>
          <Input v-model="formData.key" placeholder="如 admin / editor" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">描述</label>
          <Input v-model="formData.describe" placeholder="请输入描述" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">状态</label>
          <select v-model="formData.status" class="flex-1 h-8 px-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="active">正常</option>
            <option value="disabled">禁用</option>
          </select>
        </div>
      </div>
    </Modal>
  </div>
</template>
