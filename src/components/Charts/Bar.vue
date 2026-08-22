/**
 * 柱状图组件
 * 用于展示带标题、坐标轴、tooltip 的完整柱状图
 * 替代原项目 Bar 组件，使用 ECharts
 */
<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
} from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
])

interface DataItem {
  x: string
  y: number
}

const props = withDefaults(
  defineProps<{
    /** 图表标题 */
    title?: string
    /** 图表数据 */
    data?: DataItem[]
    /** 高度（px） */
    height?: number
  }>(),
  {
    title: '',
    data: () => [],
    height: 296,
  },
)

const option = computed<EChartsOption>(() => ({
  title: {
    text: props.title,
    left: 'left',
    textStyle: { fontSize: 14, fontWeight: 500, color: '#333' },
  },
  grid: { left: 40, right: 20, top: 40, bottom: 30 },
  xAxis: {
    type: 'category',
    data: props.data.map((d) => d.x),
    axisLine: { lineStyle: { color: '#e8e8e8' } },
    axisLabel: { color: '#666' },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#666' },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
  },
  series: [
    {
      type: 'bar',
      data: props.data.map((d) => d.y),
      barWidth: '50%',
      itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] },
    },
  ],
}))
</script>

<template>
  <VChart :option="option" :style="{ height: `${height}px` }" autoresize />
</template>
