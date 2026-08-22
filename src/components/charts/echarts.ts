/**
 * ECharts 模块统一注册
 *
 * 项目所有图表组件（charts/* 与业务页内的 VChart）共用同一份注册，
 * 避免每个组件各自 use() 导致 CanvasRenderer 等模块被重复注册。
 *
 * 用法：
 *   import '@/components/charts/echarts'   // 副作用导入，执行一次注册
 *   import VChart from 'vue-echarts'       // 即可使用，无需再调用 use()
 */
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
])
