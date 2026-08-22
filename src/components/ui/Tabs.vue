<script setup lang="ts" generic="T extends string | number">
/**
 * 标签页组件 Tabs
 *
 * 设计参考 ant-design Tabs 的 API，用 TailwindCSS 实现。
 *
 * 特性：
 * - v-model 双向绑定当前激活的 key
 * - type: line（线条）/ card（卡片）
 * - size: sm / md / lg
 * - tabPosition: top / bottom / left / right
 * - items: 数组配置式（{ key, label, disabled }）
 *
 * 插槽：
 * - #default: 默认内容区
 * - #tab-{key}: 自定义某个 tab 的标签内容
 * - #extra: 右侧额外操作区
 *
 * 事件：
 * - @change: 切换时触发
 * - @tabClick: 点击 tab 时触发
 */
import { ref, watch, computed } from 'vue'

/** Tab 项配置 */
interface TabItem {
  key: T
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    /** 当前激活 key（v-model） */
    modelValue?: T
    /** Tab 项配置 */
    items?: TabItem[]
    /** 样式类型 */
    type?: 'line' | 'card'
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg'
    /** 标签位置 */
    tabPosition?: 'top' | 'bottom' | 'left' | 'right'
    /** 居中 */
    centered?: boolean
  }>(),
  {
    items: () => [],
    type: 'line',
    size: 'md',
    tabPosition: 'top',
    centered: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T]
  tabClick: [key: T, e: MouseEvent]
}>()

/** 当前激活的 key */
const activeKey = ref<T>(props.modelValue || (props.items[0]?.key as T))

// 同步外部 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && val !== activeKey.value) {
      activeKey.value = val
    }
  },
)

/** 选择某个 tab */
function selectTab(item: TabItem, e: MouseEvent) {
  if (item.disabled) return
  activeKey.value = item.key
  emit('update:modelValue', item.key)
  emit('change', item.key)
  emit('tabClick', item.key, e)
}

// ========== 尺寸 ==========
const sizeClass = computed(() => {
  const map = {
    sm: { tab: 'text-xs px-3 py-1.5', gap: 'gap-4' },
    md: { tab: 'text-sm px-4 py-2', gap: 'gap-6' },
    lg: { tab: 'text-base px-5 py-2.5', gap: 'gap-8' },
  }
  return map[props.size]
})

// ========== 布局方向 ==========
const isVertical = computed(() => props.tabPosition === 'left' || props.tabPosition === 'right')

const containerClass = computed(() => {
  if (isVertical.value) {
    return props.tabPosition === 'left' ? 'flex-row' : 'flex-row-reverse'
  }
  return props.tabPosition === 'top' ? 'flex-col' : 'flex-col-reverse'
})

const tabBarClass = computed(() => {
  const base = 'flex'
  if (isVertical.value) {
    return props.tabPosition === 'left' ? 'flex-col border-r border-gray-100' : 'flex-col border-l border-gray-100'
  }
  const justify = props.centered ? 'justify-center' : 'justify-start'
  return `${base} ${justify} ${sizeClass.value.gap} border-b border-gray-100`
})

/** line 类型的下划线指示器 */
function tabItemClass(item: TabItem) {
  const base = `${sizeClass.value.tab} transition-colors cursor-pointer whitespace-nowrap`
  const active = item.key === activeKey.value
  const disabled = item.disabled

  if (props.type === 'card') {
    // card 样式
    const cardBase = 'border rounded-t-md'
    if (disabled) return `${base} ${cardBase} border-transparent text-gray-300 cursor-not-allowed`
    if (active) return `${base} ${cardBase} border-gray-200 border-b-white text-blue-500 font-medium -mb-px`
    return `${base} ${cardBase} border-transparent text-gray-500 hover:text-blue-500`
  }

  // line 样式
  if (disabled) return `${base} text-gray-300 cursor-not-allowed`
  if (active) return `${base} text-blue-500 font-medium border-b-2 border-blue-500 -mb-px`
  return `${base} text-gray-500 hover:text-blue-500 border-b-2 border-transparent`
}
</script>

<template>
  <div class="flex" :class="containerClass">
    <!-- 标签栏 -->
    <div :class="isVertical ? 'flex-shrink-0' : 'w-full'">
      <div :class="tabBarClass">
        <div
          v-for="item in items"
          :key="item.key"
          :class="tabItemClass(item)"
          @click="selectTab(item, $event)"
        >
          <!-- 支持自定义 tab 内容 -->
          <slot :name="`tab-${item.key}`" :item="item">{{ item.label }}</slot>
        </div>
      </div>
      <!-- 右侧额外区域（仅水平方向） -->
      <div v-if="$slots.extra && !isVertical" class="mt-2">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 min-w-0" :class="isVertical ? 'pl-4' : 'pt-4'">
      <slot />
    </div>
  </div>
</template>
