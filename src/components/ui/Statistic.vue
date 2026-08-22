<script setup lang="ts">
/**
 * 统计数值 Statistic
 *
 * 参考：https://ant.design/components/statistic-cn
 *
 * 特性：
 * - title 数值标题
 * - value 数值内容（string | number）
 * - precision 小数精度
 * - prefix / suffix 前后缀
 * - groupSeparator 千分位标识符（默认 ,）
 * - decimalSeparator 小数点标识符（默认 .）
 * - formatter 自定义数值展示（函数 prop）
 * - loading 数值加载中
 * - valueStyle 数值区域样式
 *
 * 插槽：
 * - #title 标题
 * - #prefix 前缀
 * - #suffix 后缀
 * - #formatter 自定义数值渲染 ({ value })
 */
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    value?: string | number
    precision?: number
    prefix?: string
    suffix?: string
    groupSeparator?: string
    decimalSeparator?: string
    formatter?: (value: string | number) => string
    loading?: boolean
    valueStyle?: Record<string, string | number>
  }>(),
  {
    title: '',
    value: '',
    precision: undefined,
    prefix: '',
    suffix: '',
    groupSeparator: ',',
    decimalSeparator: '.',
    formatter: undefined,
    loading: false,
    valueStyle: () => ({}),
  },
)

const slots = useSlots()

/** 格式化后的数值字符串 */
const valueString = computed(() => {
  // formatter 优先（接收原始 value，自行决定渲染）
  if (props.formatter) return props.formatter(props.value)
  if (props.value === '' || props.value === undefined || props.value === null) return ''
  const num = typeof props.value === 'number' ? props.value : parseFloat(String(props.value))
  if (isNaN(num)) return String(props.value)
  // 精度
  const fixed = props.precision !== undefined ? num.toFixed(props.precision) : String(num)
  // 千分位 + 小数点替换
  const [intPartRaw, decPart] = fixed.split('.')
  const intPart = intPartRaw ?? '0'
  const intStr = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, props.groupSeparator)
  return decPart !== undefined ? `${intStr}${props.decimalSeparator}${decPart}` : intStr
})
</script>

<template>
  <div class="statistic">
    <!-- 标题 -->
    <div v-if="title || slots.title" class="text-sm text-gray-500 mb-1">
      <slot name="title">{{ title }}</slot>
    </div>

    <!-- 数值区 -->
    <div class="flex items-baseline" :style="valueStyle">
      <!-- 前缀 -->
      <span v-if="prefix || slots.prefix" class="mr-1 text-gray-500 text-base">
        <slot name="prefix">{{ prefix }}</slot>
      </span>

      <!-- 数值 -->
      <span class="text-2xl font-semibold text-gray-800 tabular-nums">
        <span v-if="loading" class="inline-block w-24 h-6 bg-gray-100 animate-pulse rounded align-middle"></span>
        <template v-else>
          <slot name="formatter" :value="value">{{ valueString }}</slot>
        </template>
      </span>

      <!-- 后缀 -->
      <span v-if="suffix || slots.suffix" class="ml-1 text-gray-500 text-base">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </div>
  </div>
</template>
