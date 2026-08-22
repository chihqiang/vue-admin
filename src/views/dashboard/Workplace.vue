/**
 * 工作台页面 /dashboard/workplace
 * 展示：用户问候头部 + 统计数据 + 进行中项目 + 动态 + 快速导航 + 雷达图 + 团队
 * 使用 TailwindCSS + ECharts（雷达图）重写
 */
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, ArrowRight } from '@lucide/vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'
import { useUserStore } from '@/stores/user'
import { timeFix } from '@/utils/util'
import request from '@/utils/request'

use([CanvasRenderer, RadarChart, TooltipComponent, LegendComponent])

const userStore = useUserStore()

// ========== 页面状态 ==========
const loading = ref(true)
const radarLoading = ref(true)

// ========== 数据 ==========
interface Project {
  id: string
  cover: string
  title: string
  description: string
  group: string
  updatedAt: string
}
const projects = ref<Project[]>([])

interface Activity {
  user: { nickname: string; avatar: string }
  project: { name: string; action: string; event: string }
  time: string
}
const activities = ref<Activity[]>([])

interface TeamMember {
  name: string
  avatar: string
}
const teams = ref<TeamMember[]>([])

interface RadarItem {
  item: string
  个人: number
  团队: number
  部门: number
}
const radarData = ref<RadarItem[]>([])

// ========== 问候语 ==========
const greeting = computed(() => timeFix())

// ========== 快速导航 ==========
const quickLinks = ['操作一', '操作二', '操作三', '操作四', '操作五', '操作六']

// ========== 雷达图配置 ==========
const radarOption = computed<EChartsOption>(() => {
  const indicators = radarData.value.map((d) => ({
    name: d.item,
    max: 80,
  }))

  return {
    tooltip: {},
    legend: {
      data: ['个人', '团队', '部门'],
      bottom: 0,
    },
    radar: {
      indicator: indicators,
      radius: '65%',
      splitArea: {
        areaStyle: {
          color: ['rgba(24,144,255,0.05)', 'rgba(24,144,255,0.02)'],
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: radarData.value.map((d) => d.个人),
            name: '个人',
            areaStyle: { color: 'rgba(24,144,255,0.2)' },
            lineStyle: { color: '#1890ff' },
            itemStyle: { color: '#1890ff' },
          },
          {
            value: radarData.value.map((d) => d.团队),
            name: '团队',
            areaStyle: { color: 'rgba(82,196,26,0.15)' },
            lineStyle: { color: '#52c41a' },
            itemStyle: { color: '#52c41a' },
          },
          {
            value: radarData.value.map((d) => d.部门),
            name: '部门',
            areaStyle: { color: 'rgba(114,46,209,0.1)' },
            lineStyle: { color: '#722ed1' },
            itemStyle: { color: '#722ed1' },
          },
        ],
      },
    ],
  }
})

// ========== 加载数据 ==========
async function loadData() {
  loading.value = true
  radarLoading.value = true

  try {
    const [projectsRes, activityRes, teamsRes, radarRes] = await Promise.all([
      request.get<unknown, Project[]>('/workplace/projects'),
      request.get<unknown, Activity[]>('/workplace/activity'),
      request.get<unknown, TeamMember[]>('/workplace/teams'),
      request.get<unknown, RadarItem[]>('/workplace/radar'),
    ])

    projects.value = projectsRes
    activities.value = activityRes
    teams.value = teamsRes
    radarData.value = radarRes
  } catch (e) {
    console.error('[Workplace] 加载数据失败', e)
  } finally {
    loading.value = false
    radarLoading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="min-h-full p-6 bg-gray-50 space-y-6">
    <!-- ========== 页头：用户信息 + 统计 ========== -->
    <div class="bg-white rounded-lg border border-gray-100 p-6">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <!-- 左侧：头像 + 问候 -->
        <div class="flex items-center gap-4">
          <img
            :src="userStore.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'"
            class="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0"
            alt="avatar"
          />
          <div>
            <div class="text-lg font-medium text-gray-800">
              {{ greeting }}，{{ userStore.name || '用户' }}
            </div>
            <div class="text-sm text-gray-500 mt-1">
              前端工程师 | 技术平台部 - 前端架构组
            </div>
          </div>
        </div>

        <!-- 右侧：统计数据 -->
        <div class="flex items-center gap-8">
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-800">56</div>
            <div class="text-xs text-gray-500 mt-1">项目数</div>
          </div>
          <div class="w-px h-10 bg-gray-100" />
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-800">8 <span class="text-sm text-gray-400">/ 24</span></div>
            <div class="text-xs text-gray-500 mt-1">团队内排名</div>
          </div>
          <div class="w-px h-10 bg-gray-100" />
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-800">2,223</div>
            <div class="text-xs text-gray-500 mt-1">项目访问</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 主体内容：左右两栏 ========== -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- 左栏：项目 + 动态 -->
      <div class="xl:col-span-2 space-y-6">
        <!-- 进行中的项目 -->
        <div class="bg-white rounded-lg border border-gray-100">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">进行中的项目</span>
            <a class="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1">
              全部项目 <ArrowRight :size="14" />
            </a>
          </div>

          <!-- 项目卡片网格 -->
          <div
            v-if="loading"
            class="px-6 py-4 text-center text-gray-400 text-sm"
          >
            加载中...
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 divide-x divide-y divide-gray-50">
            <div
              v-for="item in projects"
              :key="item.id"
              class="p-5 hover:bg-gray-50 transition-colors"
            >
              <!-- 标题行 -->
              <div class="flex items-center gap-2 mb-2">
                <img :src="item.cover" class="w-6 h-6 rounded" alt="cover" />
                <a class="text-sm font-medium text-gray-800 hover:text-blue-500">{{ item.title }}</a>
              </div>
              <!-- 描述 -->
              <p class="text-sm text-gray-500 leading-5 h-10 overflow-hidden">
                {{ item.description }}
              </p>
              <!-- 底部 -->
              <div class="flex items-center justify-between mt-3 text-xs">
                <a class="text-gray-400 hover:text-blue-500">{{ item.group }}</a>
                <span class="text-gray-300">{{ item.updatedAt }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 动态 -->
        <div class="bg-white rounded-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">动态</span>
          </div>
          <div v-if="loading" class="px-6 py-4 text-center text-gray-400 text-sm">加载中...</div>
          <ul v-else class="px-6 py-2">
            <li
              v-for="(item, index) in activities"
              :key="index"
              class="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0"
            >
              <!-- 头像 -->
              <img
                :src="item.user.avatar"
                class="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"
                alt="avatar"
              />
              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-700">
                  <span class="font-medium">{{ item.user.nickname }}</span>
                  &nbsp;在&nbsp;
                  <a class="text-blue-500 hover:underline">{{ item.project.name }}</a>
                  &nbsp;{{ item.project.action }}&nbsp;
                  <a class="text-blue-500 hover:underline">{{ item.project.event }}</a>
                </p>
                <p class="text-xs text-gray-400 mt-1">{{ item.time }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- 右栏：快速导航 + 雷达图 + 团队 -->
      <div class="space-y-6">
        <!-- 快速开始 / 便捷导航 -->
        <div class="bg-white rounded-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">快速开始 / 便捷导航</span>
          </div>
          <div class="px-6 py-4 flex flex-wrap gap-3">
            <a
              v-for="link in quickLinks"
              :key="link"
              class="text-sm text-gray-600 hover:text-blue-500 cursor-pointer"
            >
              {{ link }}
            </a>
            <button
              class="inline-flex items-center gap-1 text-sm text-blue-500 border border-blue-300 rounded px-2 py-0.5 hover:bg-blue-50"
            >
              <Plus :size="12" />
              添加
            </button>
          </div>
        </div>

        <!-- 雷达图 -->
        <div class="bg-white rounded-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">XX 指数</span>
          </div>
          <div class="px-6 py-4">
            <div v-if="radarLoading" class="h-[340px] flex items-center justify-center text-gray-400 text-sm">
              加载中...
            </div>
            <VChart
              v-else
              :option="radarOption"
              style="height: 340px"
              autoresize
            />
          </div>
        </div>

        <!-- 团队 -->
        <div class="bg-white rounded-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">团队</span>
          </div>
          <div v-if="loading" class="px-6 py-4 text-center text-gray-400 text-sm">加载中...</div>
          <div v-else class="px-6 py-4 grid grid-cols-2 gap-4">
            <a
              v-for="(member, index) in teams"
              :key="index"
              class="flex items-center gap-2 hover:bg-gray-50 rounded p-1 transition-colors cursor-pointer"
            >
              <img
                :src="member.avatar"
                class="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0"
                alt="avatar"
              />
              <span class="text-sm text-gray-700 truncate">{{ member.name }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
