/**
 * 站内信页面 /message/inbox
 *
 * 个人站内信列表，支持收件箱/发件箱切换
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Mail, Send, Trash2, Plus } from '@lucide/vue'
import { Button, Card, Tag, Modal, Input, message } from '@/components'

interface MailItem {
  id: number
  from: string
  to: string
  subject: string
  content: string
  read: boolean
  starred: boolean
  createTime: string
}

/** 0=收件箱, 1=发件箱 */
const tab = ref<0 | 1>(0)

const inboxData = ref<MailItem[]>([
  { id: 1, from: '系统管理员', to: '我', subject: '欢迎加入', content: '欢迎使用 vue-admin 后台管理系统，如有问题请联系管理员。', read: false, starred: false, createTime: '2024-08-22 10:00' },
  { id: 2, from: '产品组', to: '我', subject: '需求评审通知', content: '本周五下午 2:00 需求评审会议，请准时参加。', read: false, starred: true, createTime: '2024-08-21 16:00' },
  { id: 3, from: '运维团队', to: '我', subject: '服务器维护通知', content: '本周日凌晨 2:00-4:00 服务器维护，请提前保存工作。', read: true, starred: false, createTime: '2024-08-20 14:00' },
  { id: 4, from: 'HR', to: '我', subject: '绩效考核提醒', content: '请在本月底前完成绩效自评。', read: true, starred: false, createTime: '2024-08-18 09:00' },
])

const sentData = ref<MailItem[]>([
  { id: 1, from: '我', to: '系统管理员', subject: '权限申请', content: '申请日志管理模块的访问权限。', read: true, starred: false, createTime: '2024-08-21 17:00' },
  { id: 2, from: '我', to: '产品组', subject: 'Re: 需求评审通知', content: '收到，会准时参加。', read: true, starred: false, createTime: '2024-08-21 16:30' },
])

const currentData = computed(() => tab.value === 0 ? inboxData.value : sentData.value)
const unreadCount = computed(() => inboxData.value.filter((m) => !m.read).length)

// 详情弹窗
const detailVisible = ref(false)
const detailItem = ref<MailItem | null>(null)

function openDetail(item: MailItem) {
  detailItem.value = { ...item }
  if (!item.read && tab.value === 0) {
    item.read = true
  }
  detailVisible.value = true
}

// 写信弹窗
const composeVisible = ref(false)
const composeForm = ref({ to: '', subject: '', content: '' })

function openCompose() {
  composeForm.value = { to: '', subject: '', content: '' }
  composeVisible.value = true
}

function sendMail() {
  if (!composeForm.value.to || !composeForm.value.subject) {
    message.warning('请填写收件人和主题')
    return
  }
  sentData.value.unshift({
    id: Date.now(),
    from: '我',
    to: composeForm.value.to,
    subject: composeForm.value.subject,
    content: composeForm.value.content,
    read: true,
    starred: false,
    createTime: new Date().toLocaleString('zh-CN'),
  })
  message.success('发送成功')
  composeVisible.value = false
}

function deleteMail(item: MailItem) {
  if (tab.value === 0) {
    inboxData.value = inboxData.value.filter((m) => m.id !== item.id)
  } else {
    sentData.value = sentData.value.filter((m) => m.id !== item.id)
  }
  message.success('删除成功')
}

function toggleStar(item: MailItem) {
  item.starred = !item.starred
}
</script>

<template>
  <div class="p-6">
    <Card class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <button
            class="px-4 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5"
            :class="tab === 0
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
            @click="tab = 0"
          >
            <Mail :size="14" />
            收件箱
            <span v-if="unreadCount > 0" class="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{{ unreadCount }}</span>
          </button>
          <button
            class="px-4 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5"
            :class="tab === 1
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
            @click="tab = 1"
          >
            <Send :size="14" />
            发件箱
          </button>
        </div>
        <Button type="primary" @click="openCompose">
          <template #icon><Plus :size="14" /></template>
          写信
        </Button>
      </div>
    </Card>

    <Card>
      <div class="divide-y divide-gray-50 dark:divide-gray-700">
        <div
          v-for="item in currentData"
          :key="item.id"
          class="px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
          @click="openDetail(item)"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <!-- 未读标记 -->
              <span v-if="!item.read && tab === 0" class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span v-else class="w-2 flex-shrink-0" />
              <!-- 星标 -->
              <button class="flex-shrink-0" @click.stop="toggleStar(item)">
                <svg
                  :class="item.starred ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'"
                  class="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
              <!-- 发件人/收件人 -->
              <span class="text-sm text-gray-600 dark:text-gray-300 w-24 flex-shrink-0 truncate">
                {{ tab === 0 ? item.from : item.to }}
              </span>
              <!-- 主题 -->
              <span
                class="text-sm truncate"
                :class="item.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100 font-medium'"
              >
                {{ item.subject }}
              </span>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ item.createTime }}</span>
              <button
                class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="删除"
                @click.stop="deleteMail(item)"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
        <!-- 空状态 -->
        <div v-if="currentData.length === 0" class="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
          {{ tab === 0 ? '收件箱为空' : '发件箱为空' }}
        </div>
      </div>
    </Card>

    <!-- 邮件详情弹窗 -->
    <Modal :open="detailVisible" title="邮件详情" @update:open="detailVisible = $event" :show-ok="false" cancel-text="关闭">
      <div v-if="detailItem" class="space-y-3 py-2">
        <div class="flex items-center gap-2">
          <Tag color="blue">{{ tab === 0 ? '发件人' : '收件人' }}</Tag>
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ tab === 0 ? detailItem.from : detailItem.to }}</span>
        </div>
        <div class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ detailItem.subject }}</div>
        <div class="text-xs text-gray-400 dark:text-gray-500">{{ detailItem.createTime }}</div>
        <div class="border-t border-gray-100 dark:border-gray-700 pt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {{ detailItem.content }}
        </div>
      </div>
    </Modal>

    <!-- 写信弹窗 -->
    <Modal :open="composeVisible" title="写站内信" @update:open="composeVisible = $event" @ok="sendMail">
      <div class="space-y-4 py-2">
        <div class="flex items-center gap-3">
          <label class="w-16 text-sm text-gray-500 dark:text-gray-400">收件人</label>
          <Input v-model="composeForm.to" placeholder="请输入收件人用户名" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-16 text-sm text-gray-500 dark:text-gray-400">主题</label>
          <Input v-model="composeForm.subject" placeholder="请输入主题" class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-16 text-sm text-gray-500 dark:text-gray-400 pt-2">内容</label>
          <textarea
            v-model="composeForm.content"
            placeholder="请输入内容"
            rows="5"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>
