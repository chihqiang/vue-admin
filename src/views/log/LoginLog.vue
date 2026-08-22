/**
 * 登录日志页面 /log/login
 *
 * 展示用户登录/登出记录，支持搜索和筛选
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@lucide/vue'
import { Button, Card, Input, Table, Tag, Pagination, Select } from '@/components'

interface LoginLogItem {
  id: number
  user: string
  type: 'login' | 'logout'
  ip: string
  location: string
  browser: string
  os: string
  status: 'success' | 'fail'
  message: string
  createTime: string
}

const allData = ref<LoginLogItem[]>([
  { id: 1, user: 'admin', type: 'login', ip: '192.168.1.100', location: '内网', browser: 'Chrome 127', os: 'macOS 14', status: 'success', message: '登录成功', createTime: '2024-08-22 10:30:15' },
  { id: 2, user: 'super', type: 'login', ip: '192.168.1.101', location: '内网', browser: 'Chrome 127', os: 'Windows 11', status: 'success', message: '登录成功', createTime: '2024-08-22 09:15:00' },
  { id: 3, user: 'zhangsan', type: 'login', ip: '10.0.0.50', location: '北京', browser: 'Safari 17', os: 'iOS 17', status: 'success', message: '登录成功', createTime: '2024-08-22 08:45:00' },
  { id: 4, user: 'lisi', type: 'login', ip: '10.0.0.51', location: '上海', browser: 'Firefox 129', os: 'Windows 10', status: 'fail', message: '密码错误', createTime: '2024-08-22 08:30:00' },
  { id: 5, user: 'admin', type: 'logout', ip: '192.168.1.100', location: '内网', browser: 'Chrome 127', os: 'macOS 14', status: 'success', message: '登出成功', createTime: '2024-08-21 18:00:00' },
  { id: 6, user: 'wangwu', type: 'login', ip: '10.0.0.52', location: '深圳', browser: 'Edge 127', os: 'Windows 11', status: 'success', message: '登录成功', createTime: '2024-08-21 14:10:00' },
  { id: 7, user: 'unknown', type: 'login', ip: '203.0.113.50', location: '未知', browser: 'Chrome 127', os: 'Linux', status: 'fail', message: '账户不存在', createTime: '2024-08-21 03:00:00' },
])

const searchText = ref('')
const typeFilter = ref('')
const statusFilter = ref('')

const filteredData = computed(() => {
  let list = allData.value
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    list = list.filter((l) => l.user.toLowerCase().includes(q) || l.ip.includes(q))
  }
  if (typeFilter.value) list = list.filter((l) => l.type === typeFilter.value)
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
  { title: '用户', dataIndex: 'user', width: '10%' },
  { title: '类型', dataIndex: 'type', width: '8%', align: 'center' as const },
  { title: 'IP', dataIndex: 'ip', width: '12%', align: 'center' as const },
  { title: '登录位置', dataIndex: 'location', width: '10%', align: 'center' as const },
  { title: '浏览器', dataIndex: 'browser', width: '12%' },
  { title: '操作系统', dataIndex: 'os', width: '10%' },
  { title: '状态', dataIndex: 'status', width: '8%', align: 'center' as const },
  { title: '消息', dataIndex: 'message', width: '12%' },
  { title: '时间', dataIndex: 'createTime', width: '13%', align: 'center' as const },
]

const typeOptions = [
  { label: '全部', value: '' },
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' },
]

const statusOptions = [
  { label: '全部', value: '' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' },
]
</script>

<template>
  <div class="p-6">
    <Card class="mb-4">
      <div class="flex items-center gap-3 flex-wrap">
        <Input v-model="searchText" placeholder="搜索用户/IP" class="w-56">
          <template #prefix><Search :size="14" class="text-gray-400" /></template>
        </Input>
        <Select v-model="typeFilter" :options="typeOptions" placeholder="类型" class="w-28" />
        <Select v-model="statusFilter" :options="statusOptions" placeholder="状态" class="w-28" />
        <Button @click="searchText = ''; typeFilter = ''; statusFilter = ''">重置</Button>
      </div>
    </Card>

    <Card>
      <Table :data="pagedData" :columns="columns" row-key="id" bordered>
        <template #cell-type="{ row }">
          <Tag :color="(row as LoginLogItem).type === 'login' ? 'blue' : 'gray'">
            {{ (row as LoginLogItem).type === 'login' ? '登录' : '登出' }}
          </Tag>
        </template>
        <template #cell-status="{ row }">
          <Tag :color="(row as LoginLogItem).status === 'success' ? 'green' : 'red'">
            {{ (row as LoginLogItem).status === 'success' ? '成功' : '失败' }}
          </Tag>
        </template>
      </Table>
      <div class="mt-4 flex justify-end">
        <Pagination :total="filteredData.length" :page-size="pageSize" :current-page="currentPage" @update:current-page="currentPage = $event" />
      </div>
    </Card>
  </div>
</template>
