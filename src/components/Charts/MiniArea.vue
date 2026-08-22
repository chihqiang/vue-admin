/**
 * 迷你面积图组件
 * 用于 ChartCard 内部展示小型面积趋势图
 * 使用 ECharts 渲染，无坐标轴，仅展示曲线和填充
 */
<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

// 按需注册 ECharts 模块
use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

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
    /** 面积颜色 */
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

/** ECharts 配置 */
const option = computed<EChartsOption>(() => ({
  grid: { left: 0, right: 0, top: 4, bottom: 0 },
  xAxis: {
    type: 'category',
    show: false,
    boundaryGap: false,
    data: props.data.map((d) => d.x),
  },
  yAxis: { type: 'value', show: false, min: 0 },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => params[0]?.value ?? '',
    axisPointer: { type: 'none' },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.data.map((d) => d.y),
      lineStyle: { width: 1.5, color: props.color },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: props.color + '40' },
            { offset: 1, color: props.color + '05' },
          ],
        },
      },
    },
  ],
}))
</script>

<template>
  <VChart :option="option" :style="{ height: `${height}px` }" autoresize />
</template>
