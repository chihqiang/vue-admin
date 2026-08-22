/**
 * 搜索列表页 /list/search
 * 顶部搜索框 + Tab 切换（文章/项目/应用）+ 左侧筛选 + 右侧列表
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Star, ThumbsUp, MessageCircle, Download, Pencil, Share2 } from '@lucide/vue'
import { Card, Input, Empty, Tag, Tabs } from '@/components/ui'

// ========== 搜索 ==========
const searchText = ref('')

// ========== Tab ==========
type TabKey = 'article' | 'project' | 'application'
const activeTab = ref<TabKey>('article')
const tabList = [
  { key: 'article' as TabKey, label: '文章' },
  { key: 'project' as TabKey, label: '项目' },
  { key: 'application' as TabKey, label: '应用' },
]

// ========== 左侧筛选 ==========
const articleCategories = [
  { label: '全部', value: 'all' },
  { label: '前端开发', value: 'frontend' },
  { label: '后端开发', value: 'backend' },
  { label: '工程设计', value: 'design' },
  { label: '工具推荐', value: 'tools' },
]
const activeCategory = ref('all')

const projectCategories = [
  { label: '全部', value: 'all' },
  { label: '企业级', value: 'enterprise' },
  { label: '开源', value: 'opensource' },
  { label: '内部工具', value: 'internal' },
]
const activeProjectCategory = ref('all')

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
  category: string
}

const articles = ref<Article[]>([
  { id: 1, title: 'Vue 3.4 正式发布', description: 'Vue 3.4 带来了多项性能改进和新特性，包括更快的模板编译速度和改进的响应式系统。', owner: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z1', updatedAt: '2024-08-01', star: 120, like: 230, message: 45, tags: ['Vue', '前端'], category: 'frontend' },
  { id: 2, title: 'TailwindCSS v3.4 新特性解析', description: '深入解析 TailwindCSS 3.4 版本的新特性，包括新的颜色系统和改进的工具类。', owner: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z2', updatedAt: '2024-07-28', star: 89, like: 180, message: 32, tags: ['CSS', '前端'], category: 'frontend' },
  { id: 3, title: 'TypeScript 5.0 完全指南', description: '从基础到进阶，全面掌握 TypeScript 5.0 的类型系统和高级特性。', owner: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z3', updatedAt: '2024-07-25', star: 200, like: 350, message: 80, tags: ['TypeScript', '前端'], category: 'frontend' },
  { id: 4, title: 'Node.js 微服务架构实践', description: '使用 Node.js 构建微服务架构的最佳实践，包含服务发现、负载均衡等。', owner: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z4', updatedAt: '2024-07-20', star: 156, like: 280, message: 55, tags: ['Node.js', '后端'], category: 'backend' },
  { id: 5, title: '设计系统构建指南', description: '如何从零开始构建一套完整的设计系统，包含设计语言、组件库和文档。', owner: '孙七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z5', updatedAt: '2024-07-15', star: 98, like: 160, message: 28, tags: ['设计', 'UI'], category: 'design' },
  { id: 6, title: 'Vite 5 构建工具深度解析', description: '深入 Vite 5 的构建原理，包括依赖预构建、HMR 和生产构建优化。', owner: '周八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z6', updatedAt: '2024-07-10', star: 134, like: 210, message: 42, tags: ['Vite', '工具'], category: 'tools' },
])

// ========== 项目列表数据 ==========
interface Project {
  id: number
  title: string
  cover: string
  description: string
  updatedAt: string
  members: { name: string; avatar: string }[]
  category: string
}

const projects = ref<Project[]>([
  { id: 1, title: '企业管理系统', cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p1&backgroundColor=1890ff', description: '企业级中后台管理系统', updatedAt: '2小时前', members: [{ name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z1' }], category: 'enterprise' },
  { id: 2, title: '开源组件库', cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p2&backgroundColor=52c41a', description: '基于 Vue 3 的开源 UI 组件库', updatedAt: '5小时前', members: [{ name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z2' }], category: 'opensource' },
  { id: 3, title: '数据分析平台', cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p3&backgroundColor=722ed1', description: '实时数据分析和可视化平台', updatedAt: '1天前', members: [{ name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z3' }], category: 'enterprise' },
  { id: 4, title: '内部工具集', cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p4&backgroundColor=fa8c16', description: '团队内部使用的开发工具集合', updatedAt: '3天前', members: [{ name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z4' }], category: 'internal' },
])

// ========== 应用列表数据 ==========
interface AppItem {
  id: number
  title: string
  avatar: string
  activeUser: number
  newUser: number
}

const apps = ref<AppItem[]>([
  { id: 1, title: 'Alipay', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=a1&backgroundColor=1890ff', activeUser: 17, newUser: 1700 },
  { id: 2, title: 'Angular', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=a2&backgroundColor=dd4444', activeUser: 20, newUser: 2000 },
  { id: 3, title: 'Bootstrap', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=a3&backgroundColor=722ed1', activeUser: 15, newUser: 1500 },
  { id: 4, title: 'React', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=a4&backgroundColor=61dafb', activeUser: 25, newUser: 2500 },
  { id: 5, title: 'Vue', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=a5&backgroundColor=42b883', activeUser: 22, newUser: 2200 },
  { id: 6, title: 'Webpack', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=a6&backgroundColor=1c78c0', activeUser: 12, newUser: 1200 },
])

// ========== 筛选逻辑 ==========
const filteredArticles = computed(() => {
  let list = articles.value
  if (activeCategory.value !== 'all') list = list.filter((a) => a.category === activeCategory.value)
  if (searchText.value) list = list.filter((a) => a.title.includes(searchText.value))
  return list
})

const filteredProjects = computed(() => {
  let list = projects.value
  if (activeProjectCategory.value !== 'all') list = list.filter((p) => p.category === activeProjectCategory.value)
  if (searchText.value) list = list.filter((p) => p.title.includes(searchText.value))
  return list
})

const filteredApps = computed(() => {
  if (!searchText.value) return apps.value
  return apps.value.filter((a) => a.title.toLowerCase().includes(searchText.value.toLowerCase()))
})

// 当前 Tab 对应的分类列表
const currentCategories = computed(() => {
  return activeTab.value === 'article' ? articleCategories : activeTab.value === 'project' ? projectCategories : []
})
const currentActiveCategory = computed(() => {
  return activeTab.value === 'article' ? activeCategory.value : activeTab.value === 'project' ? activeProjectCategory.value : 'all'
})

/** 选择分类 */
function selectCategory(value: string) {
  if (activeTab.value === 'article') activeCategory.value = value
  else if (activeTab.value === 'project') activeProjectCategory.value = value
}

/** 当前列表是否为空 */
const isEmpty = computed(() => {
  if (activeTab.value === 'article') return filteredArticles.value.length === 0
  if (activeTab.value === 'project') return filteredProjects.value.length === 0
  return filteredApps.value.length === 0
})
</script>

<template>
  <div class="min-h-full bg-gray-50 p-6 space-y-6">
    <!-- 搜索区域 -->
    <Card>
      <!-- 大搜索框 -->
      <div class="max-w-xl mx-auto">
        <Input v-model="searchText" placeholder="请输入搜索关键词" allow-clear custom-class="w-full">
          <template #prefix><Search :size="14" /></template>
        </Input>
      </div>
      <!-- Tab -->
      <div class="mt-4">
        <Tabs v-model="activeTab" :items="tabList" centered />
      </div>
    </Card>

    <!-- 内容区：左筛选 + 右列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 左侧筛选 -->
      <div class="lg:col-span-1">
        <Card title="分类筛选">
          <div v-if="currentCategories.length > 0" class="space-y-1">
            <button
              v-for="cat in currentCategories"
              :key="cat.value"
              class="block w-full text-left px-3 py-2 text-sm rounded transition-colors"
              :class="
                currentActiveCategory === cat.value
                  ? 'text-blue-600 bg-blue-50 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              "
              @click="selectCategory(cat.value)"
            >
              {{ cat.label }}
            </button>
          </div>
          <p v-else class="text-sm text-gray-400">暂无分类筛选</p>
        </Card>
      </div>

      <!-- 右侧列表 -->
      <div class="lg:col-span-3">
        <Card>
          <!-- 空状态 -->
          <Empty v-if="isEmpty" />

          <!-- 文章列表 -->
          <div v-else-if="activeTab === 'article'">
            <div class="space-y-6">
              <div
                v-for="item in filteredArticles"
                :key="item.id"
                class="border-b border-gray-50 pb-6 last:border-0"
              >
                <h4 class="text-base font-medium text-gray-800 hover:text-blue-500 cursor-pointer mb-2">{{ item.title }}</h4>
                <div class="flex gap-2 mb-2">
                  <Tag v-for="tag in item.tags" :key="tag" color="blue" size="sm">{{ tag }}</Tag>
                </div>
                <p class="text-sm text-gray-500 leading-relaxed mb-3">{{ item.description }}</p>
                <div class="flex items-center gap-2 mb-3">
                  <img :src="item.avatar" class="w-5 h-5 rounded-full" alt="作者" />
                  <span class="text-xs text-gray-400">{{ item.owner }}</span>
                  <span class="text-xs text-gray-300">·</span>
                  <span class="text-xs text-gray-400">{{ item.updatedAt }}</span>
                </div>
                <div class="flex items-center gap-5 text-xs text-gray-400">
                  <span class="flex items-center gap-1"><Star :size="13" /> {{ item.star }}</span>
                  <span class="flex items-center gap-1"><ThumbsUp :size="13" /> {{ item.like }}</span>
                  <span class="flex items-center gap-1"><MessageCircle :size="13" /> {{ item.message }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 项目列表 -->
          <div v-else-if="activeTab === 'project'">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="item in filteredProjects"
                :key="item.id"
                class="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
              >
                <div class="h-28 bg-gray-100 overflow-hidden">
                  <img :src="item.cover" class="w-full h-full object-cover" alt="封面" />
                </div>
                <div class="p-4">
                  <h4 class="text-sm font-medium text-gray-800 mb-1">{{ item.title }}</h4>
                  <p class="text-xs text-gray-400 mb-3 line-clamp-2">{{ item.description }}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400">{{ item.updatedAt }}</span>
                    <div class="flex -space-x-2">
                      <img
                        v-for="(member, i) in item.members"
                        :key="i"
                        :src="member.avatar"
                        class="w-5 h-5 rounded-full border-2 border-white"
                        :alt="member.name"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 应用列表 -->
          <div v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="item in filteredApps"
                :key="item.id"
                class="border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
              >
                <div class="flex items-center gap-3 mb-3">
                  <img :src="item.avatar" class="w-8 h-8 rounded-lg" alt="应用图标" />
                  <span class="text-sm font-medium text-gray-800">{{ item.title }}</span>
                </div>
                <div class="flex gap-6">
                  <div>
                    <p class="text-xs text-gray-400 mb-1">活跃用户</p>
                    <p class="text-lg font-medium text-gray-700">{{ item.activeUser }}<span class="text-xs font-normal text-gray-400">万</span></p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 mb-1">新增用户</p>
                    <p class="text-lg font-medium text-gray-700">{{ item.newUser.toLocaleString() }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-around pt-3 mt-3 border-t border-gray-50">
                  <button class="text-gray-400 hover:text-blue-500"><Download :size="16" /></button>
                  <button class="text-gray-400 hover:text-blue-500"><Pencil :size="16" /></button>
                  <button class="text-gray-400 hover:text-blue-500"><Share2 :size="16" /></button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
