/**
 * 操作日志页面 /log/operation
 *
 * 展示系统内用户的操作记录，支持搜索和筛选
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Download } from '@lucide/vue'
import { Button, Card, Input, Table, Tag, Pagination, Select } from '@/components'

interface LogItem {
  id: number
  user: string
  module: string
  action: string
  method: string
  params: string
  ip: string
  location: string
  status: 'success' | 'fail'
  duration: number
  createTime: string
}

const allData = ref<LogItem[]>([
  { id: 1, user: 'admin', module: '用户管理', action: '新增用户', method: 'POST /api/system/user', params: '{ "username": "test" }', ip: '192.168.1.100', location: '内网', status: 'success', duration: 45, createTime: '2024-08-22 10:30:15' },
  { id: 2, user: 'admin', module: '角色管理', action: '编辑角色', method: 'PUT /api/system/role/2', params: '{ "name": "管理员" }', ip: '192.168.1.100', location: '内网', status: 'success', duration: 32, createTime: '2024-08-22 10:25:10' },
  { id: 3, user: 'super', module: '权限管理', action: '删除权限', method: 'DELETE /api/system/permission/5', params: '{}', ip: '192.168.1.101', location: '内网', status: 'success', duration: 28, createTime: '2024-08-22 09:15:20' },
  { id: 4, user: 'zhangsan', module: '表单页', action: '提交表单', method: 'POST /api/form/submit', params: '{ "title": "测试" }', ip: '10.0.0.50', location: '办公网', status: 'success', duration: 156, createTime: '2024-08-22 08:45:00' },
  { id: 5, user: 'lisi', module: '用户管理', action: '删除用户', method: 'DELETE /api/system/user/4', params: '{}', ip: '10.0.0.51', location: '办公网', status: 'fail', duration: 89, createTime: '2024-08-21 18:30:00' },
  { id: 6, user: 'admin', module: '列表页', action: '导出数据', method: 'GET /api/list/export', params: '?type=excel', ip: '192.168.1.100', location: '内网', status: 'success', duration: 320, createTime: '2024-08-21 16:20:30' },
  { id: 7, user: 'wangwu', module: '角色管理', action: '分配权限', method: 'PUT /api/system/role/3/permissions', params: '{ "permissions": ["dashboard"] }', ip: '10.0.0.52', location: '办公网', status: 'success', duration: 67, createTime: '2024-08-21 14:10:00' },
])

const searchText = ref('')
const moduleFilter = ref('')
const statusFilter = ref('')

const filteredData = computed(() => {
  let list = allData.value
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    list = list.filter((l) => l.user.toLowerCase().includes(q) || l.action.includes(q))
  }
  if (moduleFilter.value) list = list.filter((l) => l.module === moduleFilter.value)
  if (statusFilter.value) list = list.filter((l) => l.status === statusFilter.value)
  return list
})

const currentPage = ref(1)
const pageSize = ref(5)
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const columns = [
  { title: '操作用户', dataIndex: 'user', width: '10%' },
  { title: '模块', dataIndex: 'module', width: '10%', align: 'center' as const },
  { title: '操作', dataIndex: 'action', width: '10%' },
  { title: '请求方法', dataIndex: 'method', width: '15%' },
  { title: 'IP', dataIndex: 'ip', width: '10%', align: 'center' as const },
  { title: '位置', dataIndex: 'location', width: '8%', align: 'center' as const },
  { title: '状态', dataIndex: 'status', width: '7%', align: 'center' as const },
  { title: '耗时', dataIndex: 'duration', width: '8%', align: 'center' as const },
  { title: '操作时间', dataIndex: 'createTime', width: '15%', align: 'center' as const },
  { title: '操作', dataIndex: 'action_btn', width: '7%', align: 'center' as const },
]

const moduleOptions = [
  { label: '全部', value: '' },
  { label: '用户管理', value: '用户管理' },
  { label: '角色管理', value: '角色管理' },
  { label: '权限管理', value: '权限管理' },
  { label: '表单页', value: '表单页' },
  { label: '列表页', value: '列表页' },
]

const statusOptions = [
  { label: '全部', value: '' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' },
]

function handleExport() {
  // 导出逻辑
  const csv = ['操作用户,模块,操作,状态,时间']
  filteredData.value.forEach((l) => {
    csv.push(`${l.user},${l.module},${l.action},${l.status === 'success' ? '成功' : '失败'},${l.createTime}`)
  })
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `operation-log-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="p-6">
    <!-- 搜索栏 -->
    <Card class="mb-4">
      <div class="flex items-center gap-3 flex-wrap">
        <Input v-model="searchText" placeholder="搜索用户/操作" class="w-56">
          <template #prefix><Search :size="14" class="text-gray-400" /></template>
        </Input>
        <Select v-model="moduleFilter" :options="moduleOptions" placeholder="模块" class="w-32" />
        <Select v-model="statusFilter" :options="statusOptions" placeholder="状态" class="w-28" />
        <Button @click="searchText = ''; moduleFilter = ''; statusFilter = ''">重置</Button>
        <div class="flex-1" />
        <Button @click="handleExport">
          <template #icon><Download :size="14" /></template>
          导出
        </Button>
      </div>
    </Card>

    <!-- 表格 -->
    <Card>
      <Table :data="pagedData" :columns="columns" row-key="id" bordered>
        <template #cell-status="{ row }">
          <Tag :color="(row as LogItem).status === 'success' ? 'green' : 'red'">
            {{ (row as LogItem).status === 'success' ? '成功' : '失败' }}
          </Tag>
        </template>
        <template #cell-duration="{ row }">
          <span class="text-gray-500 dark:text-gray-400">{{ (row as LogItem).duration }}ms</span>
        </template>
        <template #cell-action_btn>
          <Button size="sm" type="link">详情</Button>
        </template>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination :total="filteredData.length" :page-size="pageSize" :current-page="currentPage" @update:current-page="currentPage = $event" />
      </div>
    </Card>
  </div>
</template>
