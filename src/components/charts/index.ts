/**
 * 图表组件统一 barrel
 *
 * 所有图表基础组件（Bar / ChartCard / Mini* / RankList）从这里统一导出，
 * 方便 `import { Bar, MiniArea } from '@/components'` 调用。
 *
 * echarts.ts 是副作用模块，统一在这里入口 import，
 * 保证用到任何图表组件时 ECharts 模块都先注册好。
 */
import './echarts'

export { default as Bar } from './Bar.vue'
export { default as ChartCard } from './ChartCard.vue'
export { default as MiniArea } from './MiniArea.vue'
export { default as MiniBar } from './MiniBar.vue'
export { default as MiniProgress } from './MiniProgress.vue'
export { default as MiniSmoothArea } from './MiniSmoothArea.vue'
export { default as RankList } from './RankList.vue'
