/**
 * 迷你柱状图组件
 * 用于 ChartCard 内部展示小型柱状趋势
 * 使用 ECharts 渲染，无坐标轴
 */
<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

interface DataItem {
  x: string
  y: number
}

const props = withDefaults(
  defineProps<{
    /** 图表数据 */
    data?: DataItem[]
    /** 高度（px） */
    height?: number
    /** 柱子颜色 */
    color?: string
  }>(),
  {
    data: () => [
      { x: '1', y: 7 }, { x: '2', y: 5 }, { x: '3', y: 4 },
      { x: '4', y: 6 }, { x: '5', y: 8 }, { x: '6', y: 7 },
      { x: '7', y: 9 }, { x: '8', y: 6 }, { x: '9', y: 8 },
      { x: '10', y: 10 }, { x: '11', y: 7 }, { x: '12', y: 9 },
    ],
    height: 46,
    color: '#1890ff',
  },
)

const option = computed<EChartsOption>(() => ({
  grid: { left: 0, right: 0, top: 4, bottom: 0 },
  xAxis: { type: 'category', show: false, data: props.data.map((d) => d.x) },
  yAxis: { type: 'value', show: false },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => params[0]?.value ?? '',
    axisPointer: { type: 'none' },
  },
  series: [
    {
      type: 'bar',
      data: props.data.map((d) => d.y),
      barWidth: '60%',
      itemStyle: { color: props.color, borderRadius: [2, 2, 0, 0] },
    },
  ],
}))
</script>

<template>
  <VChart :option="option" :style="{ height: `${height}px` }" autoresize />
</template>
