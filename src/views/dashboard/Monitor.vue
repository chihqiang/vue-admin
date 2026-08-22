/**
 * 监控页 /dashboard/monitor
 * 展示实时活动公告、访问量/销售额趋势、实时排名等监控数据
 */
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Activity, TrendingUp, DollarSign, Users, Server, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from '@lucide/vue'
import { Card, Statistic, Progress } from '@/components/ui'
import type { Component } from 'vue'

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

// ========== 顶部统计卡片 ==========
// 用 Card 组合实现，每张卡含图标、标签、数值、趋势
const iconColorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-500',
  green: 'bg-green-50 text-green-500',
  purple: 'bg-purple-50 text-purple-500',
  orange: 'bg-orange-50 text-orange-500',
}
const statsCards = [
  { label: '总访问量', value: '126,560', icon: Users as Component, color: 'blue', trend: '12%', trendUp: true },
  { label: '总销售额', value: '￥328,752', icon: DollarSign as Component, color: 'green', trend: '8%', trendUp: true },
  { label: '活跃用户', value: '8,254', icon: Activity as Component, color: 'purple', trend: '3%', trendUp: false },
  { label: '服务器数', value: '32/36', icon: Server as Component, color: 'orange', trend: '2台下线', trendUp: false },
]

// ========== 活动公告列表 ==========
const activities = ref([
  { id: 1, user: '张三', action: '更新了', target: '权限管理模块', time: '3分钟前', type: 'update' },
  { id: 2, user: '李四', action: '创建了', target: '新项目「数据可视化大屏」', time: '15分钟前', type: 'create' },
  { id: 3, user: '系统', action: '检测到', target: '服务器 CPU 使用率超过 80%', time: '30分钟前', type: 'alert' },
  { id: 4, user: '王五', action: '完成了', target: '订单管理模块开发', time: '1小时前', type: 'done' },
  { id: 5, user: '赵六', action: '提交了', target: '代码审查请求', time: '2小时前', type: 'update' },
  { id: 6, user: '系统', action: '恢复了', target: '数据库连接正常', time: '3小时前', type: 'done' },
])

// ========== 实时排名 ==========
const rankList = ref([
  { rank: 1, name: '搜索引擎', value: 8234, percent: 82 },
  { rank: 2, name: '直接访问', value: 6532, percent: 65 },
  { rank: 3, name: '社交媒体', value: 5210, percent: 52 },
  { rank: 4, name: '外部链接', value: 3876, percent: 38 },
  { rank: 5, name: '邮件营销', value: 2345, percent: 23 },
  { rank: 6, name: '广告投放', value: 1234, percent: 12 },
])

// ========== 图表 refs ==========
const visitChartRef = ref<HTMLDivElement>()
const saleChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()

let visitChart: echarts.ECharts | null = null
let saleChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

// ========== 初始化图表 ==========
function initCharts() {
  // 访问量趋势（折线图）
  if (visitChartRef.value) {
    visitChart = echarts.init(visitChartRef.value)
    visitChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#999' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#999' },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        {
          name: '今日',
          type: 'line',
          smooth: true,
          data: [280, 900, 1500, 3200, 2800, 2100, 1800],
          itemStyle: { color: '#1890ff' },
          areaStyle: { color: 'rgba(24,144,255,0.1)' },
        },
        {
          name: '昨日',
          type: 'line',
          smooth: true,
          data: [200, 700, 1200, 2800, 2400, 1800, 1500],
          itemStyle: { color: '#52c41a' },
          areaStyle: { color: 'rgba(82,196,26,0.1)' },
        },
      ],
      legend: { data: ['今日', '昨日'], bottom: 0, textStyle: { color: '#666' } },
    })
  }

  // 销售额（柱状图）
  if (saleChartRef.value) {
    saleChart = echarts.init(saleChartRef.value)
    saleChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#999' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#999' },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        {
          name: '销售额',
          type: 'bar',
          data: [3200, 4500, 3800, 5600, 6200, 7800, 5400],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#69c0ff' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    })
  }

  // 访问来源（饼图）
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: '#666' } },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 16 } },
          data: [
            { value: 8234, name: '搜索引擎' },
            { value: 6532, name: '直接访问' },
            { value: 5210, name: '社交媒体' },
            { value: 3876, name: '外部链接' },
          ],
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          color: ['#1890ff', '#52c41a', '#722ed1', '#fa8c16'],
        },
      ],
    })
  }
}

// ========== 响应式 resize ==========
function handleResize() {
  visitChart?.resize()
  saleChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  visitChart?.dispose()
  saleChart?.dispose()
  pieChart?.dispose()
})

// ========== 活动类型图标映射 ==========
const activityIconMap: Record<string, typeof Activity> = {
  update: Activity,
  create: TrendingUp,
  alert: AlertTriangle,
  done: CheckCircle,
}
const activityColorMap: Record<string, string> = {
  update: 'text-blue-500 bg-blue-50',
  create: 'text-green-500 bg-green-50',
  alert: 'text-red-500 bg-red-50',
  done: 'text-green-500 bg-green-50',
}
</script>

<template>
  <div class="min-h-full bg-gray-50 p-6 space-y-6">
    <!-- ========== 顶部统计卡片 ========== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="card in statsCards" :key="card.label">
        <div class="flex items-center gap-4">
          <!-- 图标 -->
          <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" :class="iconColorMap[card.color]">
            <component :is="card.icon" :size="22" />
          </div>
          <!-- 文字内容：用 Statistic 渲染标题+数值，formatter 跳过数字解析以保留原字符串（如 32/36、￥328,752） -->
          <div class="flex-1 min-w-0">
            <Statistic
              :title="card.label"
              :value="card.value"
              :formatter="(v: string | number) => String(v)"
              :value-style="{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }"
            />
          </div>
          <!-- 趋势 -->
          <span
            class="flex items-center gap-0.5 text-xs"
            :class="card.trendUp ? 'text-green-500' : 'text-red-500'"
          >
            <component :is="card.trendUp ? ArrowUp : ArrowDown" :size="12" />
            {{ card.trend }}
          </span>
        </div>
      </Card>
    </div>

    <!-- ========== 图表区域 ========== -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 访问量趋势 -->
      <Card>
        <template #title>
          <h3 class="text-base font-medium text-gray-800 flex items-center gap-2">
            <TrendingUp :size="16" class="text-blue-500" />
            访问量趋势
          </h3>
        </template>
        <div ref="visitChartRef" style="width: 100%; height: 260px;"></div>
      </Card>

      <!-- 销售额 -->
      <Card>
        <template #title>
          <h3 class="text-base font-medium text-gray-800 flex items-center gap-2">
            <DollarSign :size="16" class="text-green-500" />
            本周销售额
          </h3>
        </template>
        <div ref="saleChartRef" style="width: 100%; height: 260px;"></div>
      </Card>
    </div>

    <!-- ========== 底部：活动公告 + 实时排名 + 访问来源 ========== -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 活动公告 -->
      <Card>
        <template #title>
          <h3 class="text-base font-medium text-gray-800 flex items-center gap-2">
            <Activity :size="16" class="text-blue-500" />
            实时活动
          </h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="item in activities"
            :key="item.id"
            class="flex items-start gap-3"
          >
            <!-- 图标 -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              :class="activityColorMap[item.type]"
            >
              <component :is="activityIconMap[item.type]" :size="13" />
            </div>
            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-600">
                <span class="font-medium text-gray-800">{{ item.user }}</span>
                {{ item.action }}
                <span class="text-blue-500">{{ item.target }}</span>
              </p>
              <p class="text-xs text-gray-400 mt-0.5">{{ item.time }}</p>
            </div>
          </div>
        </div>
      </Card>

      <!-- 实时排名 -->
      <Card title="访问来源排名">
        <div class="space-y-3">
          <div
            v-for="item in rankList"
            :key="item.rank"
            class="flex items-center gap-3"
          >
            <span
              class="w-5 h-5 rounded text-xs flex items-center justify-center font-medium flex-shrink-0"
              :class="
                item.rank <= 3
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              "
            >
              {{ item.rank }}
            </span>
            <span class="text-sm text-gray-600 w-24 flex-shrink-0">{{ item.name }}</span>
            <!-- 进度条：用 Progress 组件，前三名深蓝、其余浅蓝，不显示百分比文字 -->
            <div class="flex-1">
              <Progress
                :percent="item.percent"
                :show-info="false"
                size="md"
                :stroke-color="item.rank <= 3 ? '#3b82f6' : '#bfdbfe'"
              />
            </div>
            <span class="text-sm text-gray-500 w-12 text-right flex-shrink-0">{{ item.value.toLocaleString() }}</span>
          </div>
        </div>
      </Card>

      <!-- 访问来源饼图 -->
      <Card title="流量分布">
        <div ref="pieChartRef" style="width: 100%; height: 260px;"></div>
      </Card>
    </div>
  </div>
</template>
