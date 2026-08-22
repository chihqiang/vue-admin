<script setup lang="ts" generic="T extends string | number">
/**
 * 级联选择 Cascader
 *
 * 参考：https://ant.design/components/cascader-cn
 *
 * 特性：
 * - v-model:value / v-model 选中值（单选 T[]）
 * - options: { label, value, children, disabled }[] 配置式
 * - placeholder / allowClear / disabled / size / status
 * - expandTrigger: click / hover（默认 click）
 * - changeOnSelect: 每层选择即触发 change（允许只选父级）
 * - fieldNames 字段映射
 * - notFoundContent 空内容
 *
 * 事件：
 * - @change(value, selectedOptions) 选中变化
 *
 * 插槽：
 * - #displayRender({ labels, selectedOptions }) 自定义显示文字
 * - #option({ option, level }) 自定义选项渲染
 * - #notFoundContent
 *
 * 简化：仅支持单选；多选（checkable）未实现。
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { ChevronDown, X, Check, ChevronRight } from '@lucide/vue'

interface CascaderOption<T> {
  label: string
  value: T
  children?: CascaderOption<T>[]
  disabled?: boolean
}

interface FieldNames {
  label: string
  value: string
  children: string
}

const props = withDefaults(
  defineProps<{
    value?: T[]
    modelValue?: T[]
    options?: CascaderOption<T>[]
    placeholder?: string
    allowClear?: boolean
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    expandTrigger?: 'click' | 'hover'
    changeOnSelect?: boolean
    fieldNames?: FieldNames
    status?: 'error' | 'warning'
    notFoundContent?: string
  }>(),
  {
    options: () => [],
    placeholder: '请选择',
    allowClear: false,
    disabled: false,
    size: 'md',
    expandTrigger: 'click',
    changeOnSelect: false,
    fieldNames: () => ({ label: 'label', value: 'value', children: 'children' }),
    notFoundContent: '暂无数据',
  },
)

const emit = defineEmits<{
  'update:value': [value: T[]]
  'update:modelValue': [value: T[]]
  change: [value: T[], selectedOptions: CascaderOption<T>[]]
}>()

// ========== 字段映射 ==========
function getLabel(o: any): string {
  return o[props.fieldNames.label] as string
}
function getValue(o: any): T {
  return o[props.fieldNames.value] as T
}
function getChildren(o: any): CascaderOption<T>[] | undefined {
  return o[props.fieldNames.children] as CascaderOption<T>[] | undefined
}

// ========== 状态 ==========
const open = ref(false)
const rootRef = ref<HTMLDivElement>()
/** 当前展开的路径（用于列展示），每层一个 value；shallowRef 避免泛型 T 类型解包失配 */
const activePath = shallowRef<T[]>([])
/** 已完成选中的路径 */
const selectedPath = shallowRef<T[]>([])

// 外部值同步内部
watch(
  () => [props.value, props.modelValue] as const,
  ([v, mv]) => {
    const ext = v ?? mv
    if (ext && ext.length) selectedPath.value = [...ext]
  },
  { immediate: true, deep: true },
)

// ========== 计算 ==========
/** 当前选中节点的完整对象列表（用于显示 + emit） */
const selectedOptions = computed<CascaderOption<T>[]>(() => {
  const result: CascaderOption<T>[] = []
  let level: CascaderOption<T>[] | undefined = props.options
  for (const v of selectedPath.value) {
    const found = level?.find((o) => getValue(o) === v)
    if (!found) break
    result.push(found)
    level = getChildren(found)
  }
  return result
})

/** 显示文本 */
const displayLabel = computed(() => selectedOptions.value.map((o) => getLabel(o)).join(' / '))

/** 下拉面板的列（基于 activePath） */
const columns = computed<CascaderOption<T>[][]>(() => {
  const cols: CascaderOption<T>[][] = [props.options]
  let level: CascaderOption<T>[] | undefined = props.options
  for (const v of activePath.value) {
    const found = level?.find((o) => getValue(o) === v)
    if (!found || !getChildren(found)) break
    cols.push(getChildren(found)!)
    level = getChildren(found)
  }
  return cols
})

/** 尺寸 */
const sizeClass = computed(() => ({
  sm: 'h-7 text-xs px-2.5',
  md: 'h-8 text-sm px-3',
  lg: 'h-10 text-base px-3.5',
}[props.size]))

const statusClass = computed(() => {
  if (props.status === 'error') return 'border-red-400'
  if (props.status === 'warning') return 'border-amber-400'
  return ''
})

const hasValue = computed(() => selectedPath.value.length > 0)

// ========== 交互 ==========
function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    // 打开时回显已选路径作为展开路径
    activePath.value = [...selectedPath.value]
  }
}

/** 选中某层的某选项 */
function selectOption(option: CascaderOption<T>, level: number) {
  if (option.disabled) return
  // 截断 activePath 到当前层，再加入这一项
  activePath.value = [...activePath.value.slice(0, level), getValue(option)]
  const children = getChildren(option)
  if (children?.length && !props.changeOnSelect) {
    // 有子节点且非 changeOnSelect：继续展开
    return
  }
  // 叶子节点或 changeOnSelect：完成选中
  selectedPath.value = [...activePath.value]
  emit('update:value', selectedPath.value)
  emit('update:modelValue', selectedPath.value)
  emit('change', selectedPath.value, buildSelectedOptions(selectedPath.value))
  if (!children?.length) {
    // 真正叶子才关闭
    open.value = false
  }
}

/** 根据路径构建完整选项对象列表 */
function buildSelectedOptions(path: T[]): CascaderOption<T>[] {
  const result: CascaderOption<T>[] = []
  let level: CascaderOption<T>[] | undefined = props.options
  for (const v of path) {
    const found = level?.find((o) => getValue(o) === v)
    if (!found) break
    result.push(found)
    level = getChildren(found)
  }
  return result
}

/** hover 触发展开（expandTrigger=hover） */
function handleMouseEnter(option: CascaderOption<T>, level: number) {
  if (props.expandTrigger !== 'hover') return
  if (option.disabled) return
  const children = getChildren(option)
  if (!children?.length) return
  activePath.value = [...activePath.value.slice(0, level), getValue(option)]
}

function clearAll(e: MouseEvent) {
  e.stopPropagation()
  selectedPath.value = []
  activePath.value = []
  emit('update:value', [])
  emit('update:modelValue', [])
  emit('change', [], [])
}

// ========== 点击外部关闭 ==========
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
      :class="[
        sizeClass,
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-300',
        open ? 'border-blue-400 ring-2 ring-blue-200' : '',
        statusClass,
      ]"
      @click="toggleOpen"
    >
      <span class="flex-1 truncate" :class="hasValue ? 'text-gray-800' : 'text-gray-300'">
        <slot v-if="hasValue" name="displayRender" :labels="selectedOptions.map(o => o.label)" :selectedOptions="selectedOptions">
          {{ displayLabel }}
        </slot>
        <template v-else>{{ placeholder }}</template>
      </span>

      <!-- 清除按钮 -->
      <button
        v-if="allowClear && hasValue && !disabled"
        type="button"
        class="text-gray-300 hover:text-gray-500 mr-0.5 flex-shrink-0"
        @click="clearAll"
      >
        <X :size="14" />
      </button>

      <ChevronDown
        :size="14"
        class="text-gray-400 transition-transform flex-shrink-0"
        :class="open ? 'rotate-180' : ''"
      />
    </div>

    <!-- 多级面板 -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="absolute z-50 mt-1 bg-white border border-gray-100 rounded-md shadow-lg flex overflow-hidden"
      >
        <div
          v-for="(col, level) in columns"
          :key="level"
          class="min-w-[160px] max-h-60 overflow-auto py-1"
          :class="level < columns.length - 1 ? 'border-r border-gray-50' : ''"
        >
          <div v-if="col.length === 0" class="px-3 py-6 text-center text-sm text-gray-400">
            <slot name="notFoundContent">{{ notFoundContent }}</slot>
          </div>
          <div
            v-for="option in col"
            :key="option.value"
            class="flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer transition-colors"
            :class="[
              option.disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-blue-50',
              activePath[level] === option.value ? 'bg-blue-50 text-blue-600 font-medium' : '',
            ]"
            @click="selectOption(option, level)"
            @mouseenter="handleMouseEnter(option, level)"
          >
            <span class="flex-1 min-w-0 truncate">
              <slot name="option" :option="option" :level="level">{{ option.label }}</slot>
            </span>
            <Check v-if="selectedPath[level] === option.value" :size="14" class="text-blue-500 flex-shrink-0" />
            <ChevronRight v-else-if="option.children?.length" :size="12" class="text-gray-400 flex-shrink-0" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
