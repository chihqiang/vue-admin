/**
 * 个人中心 - 高级页面 /profile/advanced
 * 左侧：用户头像、昵称、简介、标签（可增删）、团队列表
 * 右侧：Tab 切换（文章/应用/项目）展示不同列表内容
 */
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Plus, Star, ThumbsUp, MessageCircle, Download, Pencil, Share2, Ellipsis } from '@lucide/vue'
import { Card, Tag, Button, Divider, Input } from '@/components'
import { useUserStore } from '@/stores/user'
import { getTeams } from '@/api/workplace'
import type { TeamMember } from '@/api/workplace'

const userStore = useUserStore()

// ========== 左侧用户信息 ==========
const avatar = ref(userStore.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar&image_size=square_hd')
const nickname = ref(userStore.name || '系统管理员')
const bio = ref('海纳百川，有容乃大')

// ========== 标签 ==========
const tags = ref(['很有想法的', '专注设计', '辣~', '大长腿', '川妹子', '海纳百川'])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref<{ focus: () => void; blur: () => void }>()

/** 删除标签 */
function handleTagClose(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}

/** 显示标签输入框 */
function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.focus())
}

/** 确认添加标签 */
function handleTagInputConfirm() {
  if (tagInputValue.value && !tags.value.includes(tagInputValue.value)) {
    tags.value.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

// ========== 团队 ==========
const teams = ref<TeamMember[]>([])
const teamLoading = ref(true)

/** 获取团队列表 */
async function fetchTeams() {
  teamLoading.value = true
  try {
    teams.value = await getTeams()
  } finally {
    teamLoading.value = false
  }
}

// ========== 右侧 Tab ==========
type TabKey = 'article' | 'app' | 'project'
const activeTab = ref<TabKey>('article')

const tabList = [
  { key: 'article' as TabKey, label: '文章 (8)' },
  { key: 'app' as TabKey, label: '应用 (8)' },
  { key: 'project' as TabKey, label: '项目 (8)' },
]

// ========== 文章列表数据 ==========
interface Article {
  id: number
  title: string
  description: string
  owner: string
  avatar: string
  updatedAt: string
  star: number
  like: number
  message: number
  tags: string[]
}

const articles = ref<Article[]>([])
const articleLoading = ref(true)

/** 生成 mock 文章数据 */
function loadArticles() {
  articleLoading.value = true
  setTimeout(() => {
    const titles = [
      'Vue 3.4 正式发布',
      'TailwindCSS v3.4 新特性解析',
      'TypeScript 5.0 完全指南',
      'Vite 5 构建工具深度解析',
      'Pinia 状态管理最佳实践',
      'ECharts 5 数据可视化实战',
      '前端性能优化策略总结',
      '响应式设计的核心原则',
    ]
    const tagOptions = [['Vue'], ['CSS'], ['TypeScript'], ['Vite'], ['Pinia'], ['ECharts'], ['性能优化'], ['响应式']]

    articles.value = titles.map((title, i) => ({
      id: i + 1,
      title,
      description: '段落示意：Vue 3 + TypeScript + TailwindCSS 是当前最流行的前端技术栈组合，能够帮助开发者快速构建现代化、高性能的 Web 应用。本文将深入探讨这些技术的设计理念与实践方法。',
      owner: '系统管理员',
      avatar: avatar.value,
      updatedAt: `2024-0${(i % 9) + 1}-1${i % 9} 12:00:00`,
      star: Math.floor(Math.random() * 200) + 50,
      like: Math.floor(Math.random() * 300) + 80,
      message: Math.floor(Math.random() * 100) + 20,
      tags: tagOptions[i] || ['前端'],
    }))
    articleLoading.value = false
  }, 600)
}

// ========== 应用列表数据 ==========
interface AppItem {
  id: number
  title: string
  avatar: string
  activeUser: number
  newUser: number
}

const apps = ref<AppItem[]>([])

function loadApps() {
  const titles = ['Alipay', 'Angular', 'Bootstrap', 'React', 'Vue', 'Webpack', 'Ant Design', 'Element UI']
  apps.value = titles.map((title, i) => ({
    id: i + 1,
    title,
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=app%20icon%20' + title + '&image_size=square_hd',
    activeUser: Math.floor(Math.random() * 50) + 10,
    newUser: Math.floor(Math.random() * 5000) + 1000,
  }))
}

// ========== 项目列表数据 ==========
interface ProjectItem {
  id: number
  title: string
  cover: string
  description: string
  updatedAt: string
  members: TeamMember[]
}

const projects = ref<ProjectItem[]>([])

function loadProjects() {
  const titles = ['企业管理系统', '电商平台', '数据分析平台', '智能客服系统', '内容管理系统', '任务调度引擎', '实时通信服务', '权限管理中心']
  const descriptions = [
    '企业级中后台管理系统，包含用户管理、权限控制、数据看板等核心模块。',
    '全功能电商平台，支持商品管理、订单处理、支付集成和物流追踪。',
    '基于大数据的可视化分析平台，提供实时数据监控和趋势预测能力。',
    'AI 驱动的智能客服系统，支持多轮对话和工单流转。',
    '灵活的内容管理系统，支持富文本编辑、多端预览和定时发布。',
    '分布式任务调度引擎，支持 cron 表达式和故障重试机制。',
    '基于 WebSocket 的实时通信服务，支持在线人数百万级并发。',
    '基于 RBAC 的权限管理中心，支持细粒度按钮级权限控制。',
  ]
  projects.value = titles.map((title, i) => ({
    id: i + 1,
    title,
    cover: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=project%20cover%20${title}&image_size=landscape_4_3`,
    description: descriptions[i] || '',
    updatedAt: `2024-0${(i % 9) + 1}-2${i % 8} 14:30:00`,
    members: teams.value.slice(0, 3),
  }))
}

// ========== 初始化 ==========
onMounted(async () => {
  await fetchTeams()
  loadArticles()
  loadApps()
  loadProjects()
})

/** Tab 切换 */
function handleTabChange(key: TabKey) {
  activeTab.value = key
}

/** 文章加载更多 */
const articleLoadingMore = ref(false)
function loadMoreArticles() {
  articleLoadingMore.value = true
  setTimeout(() => {
    const extra = articles.value.map((a) => ({ ...a, id: a.id + 100 }))
    articles.value.push(...extra)
    articleLoadingMore.value = false
  }, 600)
}
</script>

<template>
  <div class="min-h-full bg-gray-50 p-6">
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
      <!-- ========== 左侧用户信息卡片 ========== -->
      <div class="lg:col-span-2">
        <Card>
          <!-- 头像 + 昵称 -->
          <div class="text-center mb-6">
            <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-gray-100">
              <img :src="avatar" alt="头像" class="w-full h-full object-cover" />
            </div>
            <h3 class="text-xl font-medium text-gray-800">{{ nickname }}</h3>
            <p class="text-sm text-gray-400 mt-1">{{ bio }}</p>
          </div>

          <!-- 详情信息 -->
          <div class="space-y-2 mb-4 pl-6">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="w-1 h-3 bg-blue-500 rounded"></span>
              <span class="font-medium w-16 text-gray-400">职务</span>
              <span>交互专家</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="w-1 h-3 bg-blue-500 rounded"></span>
              <span class="font-medium w-16 text-gray-400">组织</span>
              <span class="text-xs">某某事业群-平台部-技术部</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="w-1 h-3 bg-blue-500 rounded"></span>
              <span class="font-medium w-16 text-gray-400">地址</span>
              <span>浙江省 杭州市</span>
            </div>
          </div>

          <Divider />

          <!-- 标签 -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-800 mb-3">标签</h4>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="(tag, i) in tags"
                :key="tag"
                :closable="i !== 0"
                size="sm"
                @close="handleTagClose(tag)"
              >{{ tag.length > 20 ? tag.slice(0, 20) + '...' : tag }}</Tag>
              <!-- 新增标签输入框 -->
              <Input
                v-if="tagInputVisible"
                ref="tagInputRef"
                v-model="tagInputValue"
                size="sm"
                custom-class="w-24"
                @blur="handleTagInputConfirm"
                @enter="handleTagInputConfirm"
              />
              <!-- 新增标签按钮 -->
              <Button
                v-else
                type="dashed"
                size="sm"
                @click="showTagInput"
              >
                <template #icon><Plus :size="11" /></template>
                添加
              </Button>
            </div>
          </div>

          <Divider dashed />

          <!-- 团队 -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-3">团队</h4>
            <!-- loading -->
            <div v-if="teamLoading" class="text-center text-sm text-gray-400 py-4">加载中...</div>
            <div v-else class="grid grid-cols-2 gap-3">
              <div
                v-for="(member, i) in teams"
                :key="i"
                class="flex items-center gap-2 group cursor-pointer"
              >
                <img
                  :src="member.avatar"
                  :alt="member.name"
                  class="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
                <span class="text-sm text-gray-600 group-hover:text-blue-500 transition-colors truncate">
                  {{ member.name }}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- ========== 右侧 Tab 内容卡片 ========== -->
      <div class="lg:col-span-5">
        <Card :body-style="{ padding: '0' }">
          <!-- Tab 头部 -->
          <div class="flex items-center border-b border-gray-100 px-6">
            <button
              v-for="tab in tabList"
              :key="tab.key"
              class="px-4 py-3 text-sm border-b-2 transition-colors"
              :class="
                activeTab === tab.key
                  ? 'text-blue-600 border-blue-500 font-medium'
                  : 'text-gray-500 border-transparent hover:text-blue-500'
              "
              @click="handleTabChange(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab 内容 -->
          <div class="p-6">
            <!-- 文章列表 -->
            <div v-if="activeTab === 'article'">
              <!-- loading -->
              <div v-if="articleLoading" class="text-center text-sm text-gray-400 py-8">加载中...</div>
              <!-- 列表 -->
              <div v-else class="space-y-6">
                <div
                  v-for="item in articles"
                  :key="item.id"
                  class="border-b border-gray-50 pb-6 last:border-0"
                >
                  <!-- 标题 -->
                  <h4 class="text-base font-medium text-gray-800 hover:text-blue-500 cursor-pointer mb-2">
                    {{ item.title }}
                  </h4>
                  <!-- 标签 -->
                  <div class="flex gap-2 mb-2">
                    <Tag
                      v-for="tag in item.tags"
                      :key="tag"
                      color="blue"
                      size="sm"
                    >{{ tag }}</Tag>
                  </div>
                  <!-- 描述 -->
                  <p class="text-sm text-gray-500 leading-relaxed mb-3">{{ item.description }}</p>
                  <!-- 作者 + 时间 -->
                  <div class="flex items-center gap-2 mb-3">
                    <img :src="item.avatar" class="w-5 h-5 rounded-full" alt="作者头像" />
                    <span class="text-xs text-gray-400">{{ item.owner }}</span>
                    <span class="text-xs text-gray-300">·</span>
                    <span class="text-xs text-gray-400">{{ item.updatedAt }}</span>
                  </div>
                  <!-- 互动数据 -->
                  <div class="flex items-center gap-5 text-xs text-gray-400">
                    <span class="flex items-center gap-1">
                      <Star :size="13" /> {{ item.star }}
                    </span>
                    <span class="flex items-center gap-1">
                      <ThumbsUp :size="13" /> {{ item.like }}
                    </span>
                    <span class="flex items-center gap-1">
                      <MessageCircle :size="13" /> {{ item.message }}
                    </span>
                  </div>
                </div>
                <!-- 加载更多 -->
                <div class="text-center pt-2">
                  <Button
                    type="default"
                    :loading="articleLoadingMore"
                    @click="loadMoreArticles"
                  >
                    {{ articleLoadingMore ? '加载中...' : '加载更多' }}
                  </Button>
                </div>
              </div>
            </div>

            <!-- 应用列表 -->
            <div v-else-if="activeTab === 'app'">
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div
                  v-for="item in apps"
                  :key="item.id"
                  class="border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                >
                  <!-- 应用头 -->
                  <div class="flex items-center gap-3 mb-3">
                    <img
                      :src="item.avatar"
                      class="w-8 h-8 rounded-lg object-cover"
                      alt="应用图标"
                    />
                    <span class="text-sm font-medium text-gray-800">{{ item.title }}</span>
                  </div>
                  <!-- 数据 -->
                  <div class="flex gap-6">
                    <div>
                      <p class="text-xs text-gray-400 mb-1">活跃用户</p>
                      <p class="text-xl font-medium text-gray-700">
                        {{ item.activeUser }}<span class="text-xs font-normal text-gray-400">万</span>
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-400 mb-1">新增用户</p>
                      <p class="text-xl font-medium text-gray-700">{{ item.newUser.toLocaleString() }}</p>
                    </div>
                  </div>
                  <!-- 操作 -->
                  <div class="flex items-center justify-around pt-3 mt-3 border-t border-gray-50">
                    <button class="text-gray-400 hover:text-blue-500"><Download :size="16" /></button>
                    <button class="text-gray-400 hover:text-blue-500"><Pencil :size="16" /></button>
                    <button class="text-gray-400 hover:text-blue-500"><Share2 :size="16" /></button>
                    <button class="text-gray-400 hover:text-blue-500"><Ellipsis :size="16" /></button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 项目列表 -->
            <div v-else-if="activeTab === 'project'">
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div
                  v-for="item in projects"
                  :key="item.id"
                  class="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                >
                  <!-- 封面 -->
                  <div class="h-32 bg-gray-100 overflow-hidden">
                    <img :src="item.cover" class="w-full h-full object-cover" alt="封面" />
                  </div>
                  <!-- 标题 + 描述 -->
                  <div class="p-4">
                    <h4 class="text-sm font-medium text-gray-800 mb-1">{{ item.title }}</h4>
                    <p class="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{{ item.description }}</p>
                    <!-- 底部：时间 + 成员 -->
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-400">{{ item.updatedAt }}</span>
                      <div class="flex -space-x-2">
                        <img
                          v-for="(member, i) in item.members"
                          :key="i"
                          :src="member.avatar"
                          class="w-6 h-6 rounded-full border-2 border-white object-cover"
                          alt="成员"
                          :title="member.name"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
