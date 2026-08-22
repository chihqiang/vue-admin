/**
 * 平滑面积图组件
 * 用于展示带坐标轴的平滑面积趋势图
 * 支持自定义数据源和 scale 配置
 */
<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import '@/components/charts/echarts'
import type { EChartsOption } from 'echarts'

interface DataItem {
  x: string
  y: number
}

interface ScaleItem {
  dataKey: string
  alias?: string
  min?: number
  max?: number
}

const props = withDefaults(
  defineProps<{
    /** 图表数据源 */
    dataSource?: DataItem[]
    /** 坐标轴配置（与原 Viser 的 scale 对齐） */
    scale?: ScaleItem[]
    /** 图表高度（px） */
    height?: number
    /** 线条颜色 */
    color?: string
  }>(),
  {
    dataSource: () => [],
    scale: () => [],
    height: 45,
    color: '#1890ff',
  },
)

/** 从 scale 配置中提取 y 轴 min/max */
const yScale = computed(() => props.scale.find((s) => s.dataKey === 'y'))

const option = computed<EChartsOption>(() => ({
  grid: { left: 0, right: 0, top: 4, bottom: 0 },
  xAxis: {
    type: 'category',
    show: false,
    boundaryGap: false,
    data: props.dataSource.map((d) => d.x),
  },
  yAxis: {
    type: 'value',
    show: false,
    min: yScale.value?.min,
    max: yScale.value?.max,
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => `${params[0]?.axisValue}<br/>${params[0]?.value}`,
    axisPointer: { type: 'none' },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.dataSource.map((d) => d.y),
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
