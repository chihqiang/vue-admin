/**
 * 通知公告页面 /message/notify
 *
 * 展示系统公告和通知，支持类型筛选和标记已读
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell, CheckCheck, Inbox } from '@lucide/vue'
import { Button, Card, Tag, Pagination, message } from '@/components'

interface NotifyItem {
  id: number
  title: string
  content: string
  type: 'system' | 'business' | 'maintenance'
  priority: 'normal' | 'important' | 'urgent'
  sender: string
  read: boolean
  createTime: string
}

const allData = ref<NotifyItem[]>([
  { id: 1, title: '系统升级公告', content: '系统将于 2024-08-25 凌晨 2:00-4:00 进行升级维护，届时系统将暂停服务，请提前做好相关准备。', type: 'system', priority: 'urgent', sender: '系统管理员', read: false, createTime: '2024-08-22 10:00' },
  { id: 2, title: '新功能上线通知', content: '消息中心模块已上线，支持站内信和通知公告功能，欢迎使用。', type: 'business', priority: 'normal', sender: '产品组', read: false, createTime: '2024-08-21 15:00' },
  { id: 3, title: '安全提醒：修改密码', content: '检测到您的密码已超过 90 天未修改，建议尽快修改密码以保障账户安全。', type: 'system', priority: 'important', sender: '安全中心', read: false, createTime: '2024-08-20 09:00' },
  { id: 4, title: '数据库维护完成', content: '数据库维护已完成，系统恢复正常运行。感谢您的耐心等待。', type: 'maintenance', priority: 'normal', sender: '运维团队', read: true, createTime: '2024-08-19 06:00' },
  { id: 5, title: '月度运营数据报告', content: '8 月份运营数据已生成，请前往仪表盘查看详细分析报告。', type: 'business', priority: 'normal', sender: '运营组', read: true, createTime: '2024-08-18 10:00' },
  { id: 6, title: '权限变更通知', content: '您的角色权限已更新，新增了"日志管理"模块的访问权限。', type: 'system', priority: 'important', sender: '系统管理员', read: true, createTime: '2024-08-15 14:00' },
])

const typeFilter = ref<'all' | 'unread' | 'system' | 'business' | 'maintenance'>('all')

const filteredData = computed(() => {
  switch (typeFilter.value) {
    case 'unread': return allData.value.filter((n) => !n.read)
    case 'system': return allData.value.filter((n) => n.type === 'system')
    case 'business': return allData.value.filter((n) => n.type === 'business')
    case 'maintenance': return allData.value.filter((n) => n.type === 'maintenance')
    default: return allData.value
  }
})

const currentPage = ref(1)
const pageSize = ref(5)
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const unreadCount = computed(() => allData.value.filter((n) => !n.read).length)

const typeText: Record<string, string> = {
  system: '系统',
  business: '业务',
  maintenance: '维护',
}

const priorityColor: Record<string, string> = {
  urgent: 'red',
  important: 'amber',
  normal: 'blue',
}

function markAsRead(item: NotifyItem) {
  item.read = true
  message.success('已标记为已读')
}

function markAllAsRead() {
  allData.value.forEach((n) => (n.read = true))
  message.success('全部已标记为已读')
}

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'system', label: '系统' },
  { key: 'business', label: '业务' },
  { key: 'maintenance', label: '维护' },
] as const
</script>

<template>
  <div class="p-6">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <Card>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Bell :size="20" class="text-blue-500" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ allData.length }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">全部通知</div>
          </div>
        </div>
      </Card>
      <Card>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <Inbox :size="20" class="text-amber-500" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ unreadCount }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">未读通知</div>
          </div>
        </div>
      </Card>
      <Card>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCheck :size="20" class="text-green-500" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ allData.length - unreadCount }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">已读通知</div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 筛选 + 操作栏 -->
    <Card class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-3 py-1.5 text-sm rounded-md transition-colors"
            :class="typeFilter === tab.key
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
            @click="typeFilter = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <Button size="sm" @click="markAllAsRead" :disabled="unreadCount === 0">
          <template #icon><CheckCheck :size="14" /></template>
          全部已读
        </Button>
      </div>
    </Card>

    <!-- 通知列表 -->
    <Card>
      <div class="divide-y divide-gray-50 dark:divide-gray-700">
        <div
          v-for="item in pagedData"
          :key="item.id"
          class="px-4 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <!-- 未读标记 -->
                <span v-if="!item.read" class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ item.title }}</span>
                <Tag :color="priorityColor[item.priority]" size="sm">
                  {{ item.priority === 'urgent' ? '紧急' : item.priority === 'important' ? '重要' : '普通' }}
                </Tag>
                <Tag size="sm">{{ typeText[item.type] }}</Tag>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ item.content }}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span>发送人：{{ item.sender }}</span>
                <span>{{ item.createTime }}</span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <Button v-if="!item.read" size="sm" type="link" @click="markAsRead(item)">标为已读</Button>
            </div>
          </div>
        </div>
        <!-- 空状态 -->
        <div v-if="filteredData.length === 0" class="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
          暂无通知
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <Pagination :total="filteredData.length" :page-size="pageSize" :current-page="currentPage" @update:current-page="currentPage = $event" />
      </div>
    </Card>
  </div>
</template>
