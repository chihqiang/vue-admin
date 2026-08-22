/**
 * 权限管理页面 /system/permission
 *
 * 功能：
 *   - 权限列表展示（树形/列表两种模式）
 *   - 新增/编辑权限
 *   - 删除权限
 *   - 超级管理员专属（permission: 'permission'）
 */
<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Edit, Trash2, KeyRound } from '@lucide/vue'
import { Button, Card, Table, Tag, Modal, Input, message, confirm } from '@/components'

interface PermissionItem {
  id: string
  name: string
  key: string
  module: string
  type: 'menu' | 'button'
  actions: string[]
  describe: string
  createTime: string
}

const allData = ref<PermissionItem[]>([
  { id: '1', name: '仪表盘', key: 'dashboard', module: 'dashboard', type: 'menu', actions: ['query'], describe: '仪表盘模块访问权限', createTime: '2024-01-01' },
  { id: '2', name: '表单页', key: 'form', module: 'form', type: 'menu', actions: ['query', 'add', 'update'], describe: '表单页模块访问权限', createTime: '2024-01-01' },
  { id: '3', name: '列表页', key: 'list', module: 'list', type: 'menu', actions: ['query', 'add', 'update', 'delete'], describe: '列表页模块访问权限', createTime: '2024-01-01' },
  { id: '4', name: '用户管理', key: 'user', module: 'system', type: 'menu', actions: ['add', 'query', 'get', 'update', 'delete'], describe: '用户管理访问权限', createTime: '2024-01-01' },
  { id: '5', name: '角色管理', key: 'role', module: 'system', type: 'menu', actions: ['add', 'query', 'get', 'update', 'delete'], describe: '角色管理访问权限', createTime: '2024-01-01' },
  { id: '6', name: '权限管理', key: 'permission', module: 'system', type: 'menu', actions: ['add', 'get', 'update', 'delete'], describe: '权限管理访问权限（仅超管）', createTime: '2024-01-01' },
  { id: '7', name: '新增用户', key: 'user:add', module: 'system', type: 'button', actions: ['add'], describe: '用户管理-新增按钮', createTime: '2024-01-02' },
  { id: '8', name: '删除用户', key: 'user:delete', module: 'system', type: 'button', actions: ['delete'], describe: '用户管理-删除按钮', createTime: '2024-01-02' },
])

const columns = [
  { title: '权限名称', dataIndex: 'name', width: '15%' },
  { title: '权限标识', dataIndex: 'key', width: '15%' },
  { title: '所属模块', dataIndex: 'module', width: '10%', align: 'center' as const },
  { title: '类型', dataIndex: 'type', width: '8%', align: 'center' as const },
  { title: '操作权限', dataIndex: 'actions', width: '20%' },
  { title: '描述', dataIndex: 'describe', width: '20%' },
  { title: '创建时间', dataIndex: 'createTime', width: '7%', align: 'center' as const },
  { title: '操作', dataIndex: 'action', width: '5%', align: 'center' as const },
]

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增权限')
const editingId = ref<string | null>(null)
const formData = ref({
  name: '',
  key: '',
  module: '',
  type: 'menu' as 'menu' | 'button',
  describe: '',
})

function handleAdd() {
  editingId.value = null
  modalTitle.value = '新增权限'
  formData.value = { name: '', key: '', module: '', type: 'menu', describe: '' }
  modalVisible.value = true
}

function handleEdit(item: PermissionItem) {
  editingId.value = item.id
  modalTitle.value = '编辑权限'
  formData.value = { name: item.name, key: item.key, module: item.module, type: item.type, describe: item.describe }
  modalVisible.value = true
}

function handleSubmit() {
  if (!formData.value.name || !formData.value.key) {
    message.warning('请填写权限名称和标识')
    return
  }
  if (editingId.value) {
    const item = allData.value.find((p) => p.id === editingId.value)
    if (item) Object.assign(item, formData.value)
    message.success('编辑成功')
  } else {
    allData.value.push({
      id: String(Date.now()),
      ...formData.value,
      actions: ['query'],
      createTime: new Date().toISOString().split('T')[0] || '',
    })
    message.success('新增成功')
  }
  modalVisible.value = false
}

function handleDelete(item: PermissionItem) {
  confirm({
    title: '确认删除',
    content: `确定要删除权限"${item.name}"吗？删除后已分配的角色将失去此权限`,
    onOk: () => {
      allData.value = allData.value.filter((p) => p.id !== item.id)
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
          <KeyRound :size="16" />
          共 {{ allData.length }} 个权限项
        </div>
        <Button type="primary" v-permission="'permission'" @click="handleAdd">
          <template #icon><Plus :size="14" /></template>
          新增权限
        </Button>
      </div>
    </Card>

    <Card>
      <Table :data="allData" :columns="columns" row-key="id" bordered>
        <template #cell-type="{ row }">
          <Tag :color="(row as PermissionItem).type === 'menu' ? 'blue' : 'green'">
            {{ (row as PermissionItem).type === 'menu' ? '菜单' : '按钮' }}
          </Tag>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex flex-wrap gap-1">
            <Tag v-for="action in (row as PermissionItem).actions" :key="action" size="sm">{{ action }}</Tag>
          </div>
        </template>
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button v-permission="'permission'" class="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="编辑" @click="handleEdit(row as PermissionItem)">
              <Edit :size="14" />
            </button>
            <button v-permission="'permission'" class="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="删除" @click="handleDelete(row as PermissionItem)">
              <Trash2 :size="14" />
            </button>
          </div>
        </template>
      </Table>
    </Card>

    <Modal :open="modalVisible" :title="modalTitle" @update:open="modalVisible = $event" @ok="handleSubmit">
      <div class="space-y-4 py-2">
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">权限名称</label>
          <Input v-model="formData.name" placeholder="如：用户管理" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">权限标识</label>
          <Input v-model="formData.key" placeholder="如：user / user:add" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">所属模块</label>
          <Input v-model="formData.module" placeholder="如：system" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">类型</label>
          <select v-model="formData.type" class="flex-1 h-8 px-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="menu">菜单</option>
            <option value="button">按钮</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">描述</label>
          <Input v-model="formData.describe" placeholder="权限描述" class="flex-1" />
        </div>
      </div>
    </Modal>
  </div>
</template>
