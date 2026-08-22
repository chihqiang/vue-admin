/**
 * 分析页 /dashboard/analysis
 * 展示：销售额、访问量、支付笔数、运营效果 4 个指标卡片
 * + 销售额/访问量 Tab 图表 + 排名列表
 * + 热门搜索表单 + 销售类别占比饼图
 * 所有文案均为中文，使用 TailwindCSS + ECharts 重写
 */
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Info, MoreHorizontal, ArrowUp, ArrowDown } from '@lucide/vue'

// 基础组件
import ChartCard from '@/components/charts/ChartCard.vue'
import { Statistic, Trend } from '@/components'
import RankList from '@/components/charts/RankList.vue'
import MiniProgress from '@/components/charts/MiniProgress.vue'

import MiniArea from '@/components/charts/MiniArea.vue'
import MiniBar from '@/components/charts/MiniBar.vue'
import MiniSmoothArea from '@/components/charts/MiniSmoothArea.vue'
import Bar from '@/components/charts/Bar.vue'

// 饼图用 ECharts
import VChart from 'vue-echarts'
import '@/components/charts/echarts'
import type { EChartsOption } from 'echarts'

// ========== 加载状态 ==========
const loading = ref(true)

// 模拟 1 秒后加载完成；页面卸载时清理定时器，避免回调在组件销毁后执行
let loadingTimer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  loadingTimer = setTimeout(() => {
    loading.value = false
  }, 1000)
})
onBeforeUnmount(() => {
  if (loadingTimer) clearTimeout(loadingTimer)
})

// ========== 柱状图数据 ==========
const barData = ref(
  Array.from({ length: 12 }, (_, i) => ({
    x: `${i + 1}月`,
    y: Math.floor(Math.random() * 1000) + 200,
  })),
)
const barData2 = ref(
  Array.from({ length: 12 }, (_, i) => ({
    x: `${i + 1}月`,
    y: Math.floor(Math.random() * 1000) + 200,
  })),
)

// ========== 排名列表 ==========
const rankList = ref(
  Array.from({ length: 7 }, (_, i) => ({
    name: `白鹭岛 ${i + 1} 号店`,
    total: (1234.56 - i * 100).toFixed(2),
  })),
)

// ========== 搜索用户数（迷你面积图） ==========
const searchUserData = ref(
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      x: `${d.getMonth() + 1}-${d.getDate()}`,
      y: Math.ceil(Math.random() * 10),
    }
  }),
)
const searchUserScale = [
  { dataKey: 'x', alias: '时间' },
  { dataKey: 'y', alias: '用户数', min: 0, max: 10 },
]

// ========== 搜索表格 ==========
interface SearchRow {
  index: number
  keyword: string
  count: number
  range: number
  status: number
}
const searchData = ref<SearchRow[]>(
  Array.from({ length: 50 }, (_, i) => ({
    index: i + 1,
    keyword: `搜索关键词-${i}`,
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor(Math.random() * 10) % 2,
  })),
)
const searchColumns = [
  { title: '排名', dataIndex: 'index', width: '90px' },
  { title: '搜索关键词', dataIndex: 'keyword' },
  { title: '用户数', dataIndex: 'count' },
  { title: '周涨幅', dataIndex: 'range', align: 'right' },
]

// ========== 饼图（销售类别占比） ==========
const pieSourceData = [
  { item: '家用电器', count: 32.2 },
  { item: '食用酒水', count: 21 },
  { item: '个护健康', count: 17 },
  { item: '服饰箱包', count: 13 },
  { item: '母婴产品', count: 9 },
  { item: '其他', count: 7.8 },
]

// 饼图颜色
const pieColors = ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC']

const pieOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {d}%',
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    data: pieSourceData.map((d) => d.item),
  },
  series: [
    {
      name: '销售额',
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      data: pieSourceData.map((d, i) => ({
        name: d.item,
        value: d.count,
        itemStyle: { color: pieColors[i % pieColors.length] },
      })),
    },
  ],
}))

// ========== Tab 切换 ==========
const activeTab = ref<'sales' | 'visits'>('sales')

// ========== 饼图渠道筛选 ==========
const salesType = ref<'all' | 'online' | 'stores'>('all')

// ========== 顶部时间快捷 ==========
const timeOptions = ['全部', '今日', '本周', '本月', '本年']
const activeTime = ref('全部')
</script>

<template>
  <div class="min-h-full p-6 bg-gray-50 space-y-6">
    <!-- ========== 第一行：4 个指标卡片 ========== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <!-- 总销售额 -->
      <ChartCard title="总销售额" total="￥126,560" :loading="loading">
        <template #action>
          <Info :size="14" class="text-gray-400" />
        </template>
        <div class="flex items-center gap-4">
          <Trend flag="up">
            <template #term>同周</template>
            12%
          </Trend>
          <Trend flag="down">
            <template #term>同日</template>
            11%
          </Trend>
        </div>
        <template #footer>
          <span>日均销售额</span>
          <span class="ml-2 text-gray-700">￥ 234.56</span>
        </template>
      </ChartCard>

      <!-- 访问量 -->
      <ChartCard title="访问量" :total="8846" :loading="loading">
        <template #action>
          <Info :size="14" class="text-gray-400" />
        </template>
        <div>
          <MiniArea :height="46" />
        </div>
        <template #footer>
          <span>日访问量</span>
          <span class="ml-2 text-gray-700">1,234</span>
        </template>
      </ChartCard>

      <!-- 支付笔数 -->
      <ChartCard title="支付笔数" :total="6560" :loading="loading">
        <template #action>
          <Info :size="14" class="text-gray-400" />
        </template>
        <div>
          <MiniBar :height="46" />
        </div>
        <template #footer>
          <span>转化率</span>
          <span class="ml-2 text-gray-700">60%</span>
        </template>
      </ChartCard>

      <!-- 运营效果 -->
      <ChartCard title="运营效果" total="78%" :loading="loading">
        <template #action>
          <Info :size="14" class="text-gray-400" />
        </template>
        <div>
          <MiniProgress color="rgb(19, 194, 194)" :target="80" :percentage="78" :height="8" />
        </div>
        <template #footer>
          <Trend flag="down" class="mr-4">
            <template #term>同周</template>
            12%
          </Trend>
          <Trend flag="up">
            <template #term>同日</template>
            80%
          </Trend>
        </template>
      </ChartCard>
    </div>

    <!-- ========== 第二行：销售额/访问量 Tab ========== -->
    <div class="bg-white rounded-lg border border-gray-100">
      <!-- Tab 头部 -->
      <div class="flex items-center justify-between border-b border-gray-100 px-4">
        <div class="flex">
          <button
            v-for="tab in [
              { key: 'sales', label: '销售额' },
              { key: 'visits', label: '访问量' },
            ]"
            :key="tab.key"
            class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            "
            @click="activeTab = tab.key as 'sales' | 'visits'"
          >
            {{ tab.label }}
          </button>
        </div>
        <!-- 右侧快捷 -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 text-sm">
            <button
              v-for="t in timeOptions"
              :key="t"
              :class="
                activeTime === t
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="activeTime = t"
            >
              {{ t }}
            </button>
          </div>
          <input
            type="text"
            placeholder="请选择日期"
            class="w-48 px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-600 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <!-- Tab 内容 -->
      <div class="p-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 左侧柱状图 -->
          <div class="lg:col-span-2">
            <Bar
              v-if="activeTab === 'sales'"
              :data="barData"
              title="销售额趋势"
              :height="296"
            />
            <Bar
              v-else
              :data="barData2"
              title="访问量趋势"
              :height="296"
            />
          </div>
          <!-- 右侧排名 -->
          <div class="lg:col-span-1">
            <RankList
              :title="activeTab === 'sales' ? '门店销售额排名' : '门店访问量排名'"
              :list="rankList"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 第三行：热门搜索 + 销售类别占比 ========== -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- 热门搜索 -->
      <div class="bg-white rounded-lg border border-gray-100">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-700">线上热门搜索</span>
          <MoreHorizontal :size="16" class="text-gray-400 cursor-pointer" />
        </div>
        <div class="px-6 py-4">
          <!-- 数字信息：用 Statistic 替换 NumberInfo，title 显示副标题，suffix 显示涨跌幅 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <Statistic :value="12321" :value-style="{ fontWeight: 500 }">
                <template #title>
                  <span class="mr-2">搜索用户数</span>
                  <Info :size="14" class="text-gray-400" />
                </template>
                <template #suffix>
                  <span class="inline-flex items-center text-sm font-medium text-red-500">
                    <ArrowUp :size="12" />
                    17.1%
                  </span>
                </template>
              </Statistic>
              <div class="mt-2">
                <MiniSmoothArea
                  :data-source="searchUserData"
                  :scale="searchUserScale"
                  :height="45"
                />
              </div>
            </div>
            <div>
              <Statistic :value="2.7" :value-style="{ fontWeight: 500 }">
                <template #title>
                  <span class="mr-2">人均搜索次数</span>
                  <Info :size="14" class="text-gray-400" />
                </template>
                <template #suffix>
                  <span class="inline-flex items-center text-sm font-medium text-green-500">
                    <ArrowDown :size="12" />
                    26.2%
                  </span>
                </template>
              </Statistic>
              <div class="mt-2">
                <MiniSmoothArea
                  :data-source="searchUserData"
                  :scale="searchUserScale"
                  :height="45"
                />
              </div>
            </div>
          </div>

          <!-- 搜索表格 -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-gray-500">
                  <th
                    v-for="col in searchColumns"
                    :key="col.dataIndex"
                    class="px-3 py-2 font-medium"
                    :class="col.align === 'right' ? 'text-right' : 'text-left'"
                    :style="col.width ? { width: col.width } : {}"
                  >
                    {{ col.title }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in searchData.slice(0, 5)"
                  :key="row.index"
                  class="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td class="px-3 py-2 text-gray-600">{{ row.index }}</td>
                  <td class="px-3 py-2 text-gray-700">{{ row.keyword }}</td>
                  <td class="px-3 py-2 text-gray-700">{{ row.count }}</td>
                  <td class="px-3 py-2 text-right">
                    <Trend :flag="row.status === 0 ? 'up' : 'down'">
                      {{ row.range }}%
                    </Trend>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 销售类别占比 -->
      <div class="bg-white rounded-lg border border-gray-100">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-700">销售额类别占比</span>
          <div class="flex items-center gap-2">
            <MoreHorizontal :size="16" class="text-gray-400 cursor-pointer" />
            <!-- 渠道筛选 -->
            <div class="flex items-center gap-1 ml-2">
              <button
                v-for="opt in [
                  { key: 'all', label: '全部渠道' },
                  { key: 'online', label: '线上' },
                  { key: 'stores', label: '门店' },
                ]"
                :key="opt.key"
                class="px-3 py-1 text-xs rounded border transition-colors"
                :class="
                  salesType === opt.key
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'border-gray-200 text-gray-500 hover:text-gray-700'
                "
                @click="salesType = opt.key as 'all' | 'online' | 'stores'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="px-6 py-4">
          <h4 class="text-sm text-gray-500 mb-4">销售额</h4>
          <VChart :option="pieOption" style="height: 360px" autoresize />
        </div>
      </div>
    </div>
  </div>
</template>
