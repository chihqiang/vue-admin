<script setup lang="ts">
/**
 * 日期选择器 DatePicker
 *
 * 特性：
 * - v-model 双向绑定 (YYYY-MM-DD)
 * - placeholder
 * - disabled
 * - allowClear
 * - size: sm / md / lg
 * - format: 显示格式（默认 YYYY-MM-DD）
 *
 * 事件：
 * - @change: 日期变化
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Calendar, X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    allowClear?: boolean
    size?: 'sm' | 'md' | 'lg'
    format?: string
  }>(),
  {
    modelValue: '',
    placeholder: '请选择日期',
    disabled: false,
    allowClear: false,
    size: 'md',
    format: 'YYYY-MM-DD',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLDivElement>()

/** 当前显示的年月 */
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())

/** 选中的日期 */
const selectedDate = computed(() => props.modelValue)

/** 日历数据 */
const calendarDays = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0)
  const startWeekday = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  // 上月剩余天数
  const prevMonthDays = new Date(viewYear.value, viewMonth.value, 0).getDate()

  const days: { day: number; current: boolean; dateStr: string }[] = []
  // 上月填充
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const m = viewMonth.value === 0 ? 12 : viewMonth.value
    const y = viewMonth.value === 0 ? viewYear.value - 1 : viewYear.value
    days.push({ day, current: false, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` })
  }
  // 本月
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      current: true,
      dateStr: `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }
  // 下月填充到 42 格
  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day++) {
    const m = viewMonth.value === 11 ? 1 : viewMonth.value + 2
    const y = viewMonth.value === 11 ? viewYear.value + 1 : viewYear.value
    days.push({ day, current: false, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` })
  }
  return days
})

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const sizeClass = computed(() => ({ sm: 'h-7 text-xs px-2.5', md: 'h-8 text-sm px-3', lg: 'h-10 text-base px-3.5' }[props.size]))

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function selectDay(dateStr: string) {
  emit('update:modelValue', dateStr)
  emit('change', dateStr)
  open.value = false
}

function clearValue(e: MouseEvent) {
  e.stopPropagation()
  emit('update:modelValue', '')
}

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative inline-block w-full">
    <!-- 触发器 -->
    <div
      class="flex items-center w-full border border-gray-200 rounded-md cursor-pointer transition-colors bg-white"
      :class="[sizeClass, disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-300', open ? 'border-blue-400 ring-2 ring-blue-200' : '']"
      @click="!disabled && (open = !open)"
    >
      <Calendar :size="14" class="text-gray-400 mr-1.5 flex-shrink-0" />
      <span class="flex-1 truncate" :class="selectedDate ? 'text-gray-800' : 'text-gray-300'">
        {{ selectedDate || placeholder }}
      </span>
      <button v-if="allowClear && selectedDate && !disabled" class="text-gray-300 hover:text-gray-500" @click="clearValue">
        <X :size="14" />
      </button>
      <ChevronDown :size="14" class="text-gray-400 transition-transform flex-shrink-0" :class="open ? 'rotate-180' : ''" />
    </div>

    <!-- 日历面板 -->
    <Transition
      enter-active-class="transition-all duration-150"
      leave-active-class="transition-all duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="open" class="absolute z-50 mt-1 w-72 bg-white border border-gray-100 rounded-md shadow-lg p-3">
        <!-- 月份切换 -->
        <div class="flex items-center justify-between mb-3">
          <button class="text-gray-400 hover:text-gray-600 p-1" @click="prevMonth">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span class="text-sm font-medium">{{ viewYear }}年 {{ monthNames[viewMonth] }}</span>
          <button class="text-gray-400 hover:text-gray-600 p-1" @click="nextMonth">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <!-- 星期 -->
        <div class="grid grid-cols-7 gap-1 mb-1">
          <div v-for="w in weekDays" :key="w" class="text-center text-xs text-gray-400 py-1">{{ w }}</div>
        </div>
        <!-- 日期 -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(day, i) in calendarDays"
            :key="i"
            class="h-8 text-sm rounded transition-colors"
            :class="[
              day.current ? 'text-gray-700 hover:bg-blue-50' : 'text-gray-300',
              day.dateStr === selectedDate ? 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white' : '',
            ]"
            @click="selectDay(day.dateStr)"
          >
            {{ day.day }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
