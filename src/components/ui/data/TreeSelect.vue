<script setup lang="ts" generic="T extends string | number">
/**
 * 树选择 TreeSelect
 *
 * 参考：https://ant.design/components/tree-select-cn
 *
 * 特性：
 * - v-model:value / v-model 双向绑定（单选 T / 多选 T[]）
 * - treeData: 树数据（{ value, title, children, disabled, disableCheckbox, selectable, isLeaf }[]）
 * - multiple: 多选
 * - treeCheckable: 显示 Checkbox 勾选模式（开启时自动启用多选 + 父子联动）
 * - treeCheckStrictly: 严格勾选模式（父子不联动）
 * - treeDefaultExpandAll: 默认展开全部
 * - treeDefaultExpandedKeys: 默认展开的 key
 * - showSearch: 可搜索
 * - allowClear: 可清除
 * - size: sm / md / lg
 * - placement: bottom / top
 * - maxTagCount: 多选时最多显示多少 tag，超出折叠为 +N
 * - status: error / warning 校验状态
 * - listHeight: 下拉面板最大高度
 * - fieldNames: 字段映射（{ value, title, children }）
 *
 * 事件：
 * - @change: 值变化 (value, labelList, extra)
 * - @select: 选中节点 (value, node, extra)
 * - @deselect: 取消选中（多选）(value, node)
 * - @search: 搜索文本变化 (value)
 * - @treeExpand: 展开变化 (expandedKeys)
 * - @openChange: 下拉展开变化 (open)
 *
 * 插槽：
 * - #title: 自定义节点内容 ({ node })
 * - #prefix: 触发器前缀
 * - #suffixIcon: 自定义后缀图标
 * - #switcherIcon: 自定义展开图标 ({ expanded })
 * - #maxTagPlaceholder: 隐藏 tag 占位 ({ omittedValues })
 * - #notFoundContent: 空内容
 */
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, ChevronRight, Check, X, Search } from '@lucide/vue'

/** 原始树节点（用户传入） */
interface TreeNodeRaw {
  value: T
  title: string
  children?: TreeNodeRaw[]
  disabled?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  isLeaf?: boolean
}

/** 扁平化后的节点 */
interface FlatNode {
  value: T
  title: string
  level: number
  parentValue?: T
  children?: TreeNodeRaw[]
  disabled?: boolean
  disableCheckbox?: boolean
  selectable: boolean
  isLeaf: boolean
  hasChildren: boolean
}

const props = withDefaults(
  defineProps<{
    /** v-model:value 选中值（单选 T / 多选 T[]） */
    value?: T | T[]
    /** 兼容 v-model（无参数） */
    modelValue?: T | T[]
    treeData?: TreeNodeRaw[]
    multiple?: boolean
    treeCheckable?: boolean
    treeCheckStrictly?: boolean
    treeDefaultExpandAll?: boolean
    treeDefaultExpandedKeys?: T[]
    placeholder?: string
    disabled?: boolean
    allowClear?: boolean
    showSearch?: boolean
    size?: 'sm' | 'md' | 'lg'
    placement?: 'bottom' | 'top'
    maxTagCount?: number
    notFoundContent?: string
    status?: 'error' | 'warning'
    listHeight?: number
    /** 字段映射，默认 { value, title, children } */
    fieldNames?: { value: string; title: string; children: string }
  }>(),
  {
    treeData: () => [],
    multiple: false,
    treeCheckable: false,
    treeCheckStrictly: false,
    treeDefaultExpandAll: false,
    treeDefaultExpandedKeys: () => [],
    placeholder: '请选择',
    disabled: false,
    allowClear: false,
    showSearch: false,
    size: 'md',
    placement: 'bottom',
    maxTagCount: undefined,
    notFoundContent: '暂无数据',
    status: undefined,
    listHeight: 256,
    // 默认字段名（与 antd 一致），内联避免 defineProps 引用本地变量被 hoist
    fieldNames: () => ({ value: 'value', title: 'title', children: 'children' }),
  },
)

const emit = defineEmits<{
  'update:value': [value: T | T[]]
  'update:modelValue': [value: T | T[]]
  change: [value: T | T[], labelList: string[], extra: { triggerValue?: T; selected?: boolean }]
  select: [value: T, node: TreeNodeRaw, extra: { selected: boolean }]
  deselect: [value: T, node: TreeNodeRaw]
  search: [value: string]
  treeExpand: [expandedKeys: T[]]
  openChange: [open: boolean]
}>()

/** 实际是否多选：multiple 或 treeCheckable 都视为多选 */
const isMultiple = computed(() => props.multiple || props.treeCheckable)

/** 是否勾选模式 */
const isCheckable = computed(() => props.treeCheckable)

// ========== 内部状态 ==========
const open = ref(false)
const searchValue = ref('')
const rootRef = ref<HTMLDivElement>()

/** 内部选中键集合（单选/多选/勾选统一管理）；shallowRef 避免 Vue 类型解包导致泛型 T 类型失配 */
const selectedKeys = shallowRef<Set<T>>(new Set())
/** 展开的节点 key 集合 */
const expandedKeys = shallowRef<Set<T>>(new Set())

// ========== 字段映射辅助 ==========
/** 读取节点 value（按 fieldNames） */
function getValue(node: any): T {
  return node[props.fieldNames.value] as T
}
function getTitle(node: any): string {
  return node[props.fieldNames.title] as string
}
function getChildren(node: any): TreeNodeRaw[] | undefined {
  return node[props.fieldNames.children] as TreeNodeRaw[] | undefined
}

// ========== 扁平化 ==========
const flattened = computed<FlatNode[]>(() => {
  const result: FlatNode[] = []
  const walk = (nodes: TreeNodeRaw[], level: number, parentValue?: T) => {
    nodes.forEach((raw) => {
      const value = getValue(raw)
      const title = getTitle(raw)
      const children = getChildren(raw)
      const hasChildren = !!(children && children.length)
      result.push({
        value,
        title,
        level,
        parentValue,
        children,
        disabled: raw.disabled,
        disableCheckbox: raw.disableCheckbox,
        selectable: raw.selectable !== false,
        isLeaf: raw.isLeaf ?? !hasChildren,
        hasChildren,
      })
      if (hasChildren) walk(children!, level + 1, value)
    })
  }
  walk(props.treeData, 0)
  return result
})

/** value → 节点 索引 */
const nodeMap = computed<Map<T, FlatNode>>(() => {
  const m = new Map<T, FlatNode>()
  flattened.value.forEach((n) => m.set(n.value, n))
  return m
})

// ========== 可见节点（按 expandedKeys + 搜索过滤） ==========
const visibleNodes = computed<FlatNode[]>(() => {
  // 搜索模式：扁平化可见全部匹配项及其祖先链
  if (searchValue.value) {
    const kw = searchValue.value.toLowerCase()
    const matched = flattened.value.filter((n) => n.title.toLowerCase().includes(kw))
    const matchedSet = new Set(matched.map((m) => m.value))
    // 收集祖先 value
    const ancestorSet = new Set<T>()
    matched.forEach((m) => {
      let p = m.parentValue
      while (p !== undefined) {
        ancestorSet.add(p)
        const parent = nodeMap.value.get(p)
        p = parent?.parentValue
      }
    })
    return flattened.value.filter((n) => matchedSet.has(n.value) || ancestorSet.has(n.value))
  }
  // 非搜索：父链全部展开才可见
  return flattened.value.filter((n) => {
    if (n.level === 0) return true
    let p = n.parentValue
    while (p !== undefined) {
      if (!expandedKeys.value.has(p)) return false
      const parent = nodeMap.value.get(p)
      p = parent?.parentValue
    }
    return true
  })
})

// ========== 外部值 → 内部 selectedKeys 同步 ==========
watch(
  () => [props.value, props.modelValue] as const,
  ([v, mv]) => {
    const external = v !== undefined ? v : mv
    if (external === undefined) {
      selectedKeys.value = new Set()
      return
    }
    if (Array.isArray(external)) {
      selectedKeys.value = new Set(external)
    } else {
      selectedKeys.value = new Set([external as T])
    }
  },
  { immediate: true },
)

// ========== 初始化展开 ==========
watch(
  () => props.treeData,
  () => {
    const next = new Set<T>(expandedKeys.value)
    if (props.treeDefaultExpandAll) {
      flattened.value.forEach((n) => {
        if (n.hasChildren) next.add(n.value)
      })
    }
    props.treeDefaultExpandedKeys.forEach((k) => next.add(k))
    expandedKeys.value = next
  },
  { immediate: true },
)

// ========== 显示文本 ==========
/** 选中节点标题列表 */
const selectedLabels = computed<string[]>(() => {
  const labels: string[] = []
  selectedKeys.value.forEach((v) => {
    const node = nodeMap.value.get(v)
    if (node) labels.push(node.title)
  })
  return labels
})

/** 多选 tag 列表（含折叠逻辑） */
const tagList = computed(() => {
  // selectedKeys 与 selectedLabels 顺序一致（均按 Set 迭代顺序）
  const keysArr = [...selectedKeys.value]
  const all: { label: string; value: T }[] = []
  selectedLabels.value.forEach((label, i) => {
    const v = keysArr[i]
    if (v !== undefined) all.push({ label, value: v })
  })
  if (props.maxTagCount !== undefined && all.length > props.maxTagCount) {
    const visible = all.slice(0, props.maxTagCount)
    const omitted = all.slice(props.maxTagCount)
    return { visible, omitted }
  }
  return { visible: all, omitted: [] }
})

/** 单选显示文本 */
const singleLabel = computed(() => selectedLabels.value[0] ?? '')

// ========== 交互 ==========
function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
  emit('openChange', open.value)
  if (!open.value) {
    // 关闭时清空搜索
    searchValue.value = ''
    emit('search', '')
  }
}

function toggleExpand(value: T) {
  const next = new Set(expandedKeys.value)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  expandedKeys.value = next
  emit('treeExpand', [...next])
}

/** 节点是否可选（受 disabled / selectable / 单选禁用约束） */
function isNodeSelectable(node: FlatNode): boolean {
  if (node.disabled) return false
  if (!node.selectable) return false
  return true
}

/** 单选/多选点击节点 */
function handleSelect(node: FlatNode) {
  if (!isNodeSelectable(node)) return
  if (isCheckable.value) {
    // 勾选模式下，title 区域点击只展开/折叠（antd 行为），勾选由 checkbox 负责
    if (node.hasChildren) toggleExpand(node.value)
    return
  }
  const next = new Set(selectedKeys.value)
  if (isMultiple.value) {
    const selected = next.has(node.value)
    if (selected) {
      next.delete(node.value)
      emit('deselect', node.value, toRawNode(node))
    } else {
      next.add(node.value)
      emit('select', node.value, toRawNode(node), { selected: true })
    }
  } else {
    // 单选：覆盖式
    next.clear()
    next.add(node.value)
    emit('select', node.value, toRawNode(node), { selected: true })
  }
  selectedKeys.value = next
  emitChange(node.value, isMultiple.value ? !next.has(node.value) : true)
  // 单选 + 非勾选模式选完即关闭
  if (!isMultiple.value) {
    open.value = false
    emit('openChange', false)
    searchValue.value = ''
  }
}

/** 勾选框切换（带父子联动，除非 treeCheckStrictly） */
function handleCheck(node: FlatNode) {
  if (node.disableCheckbox || node.disabled) return
  const next = new Set(selectedKeys.value)
  const isChecked = next.has(node.value)
  if (props.treeCheckStrictly) {
    // 严格模式：只切自己
    if (isChecked) next.delete(node.value)
    else next.add(node.value)
  } else {
    // 联动模式：切自己 + 所有后代 + 向上更新祖先
    if (isChecked) {
      // 取消：移除自己 + 所有后代
      collectDescendants(node.value).forEach((v) => next.delete(v))
      next.delete(node.value)
      // 向上：祖先全取消（半选不可表达，简化为：只要有一个子未选，祖先就取消）
      let p = node.parentValue
      while (p !== undefined) {
        next.delete(p)
        const parent = nodeMap.value.get(p)
        p = parent?.parentValue
      }
    } else {
      // 勾选：加入自己 + 所有后代
      next.add(node.value)
      collectDescendants(node.value).forEach((v) => next.add(v))
      // 向上：若所有兄弟都选中，则祖先选中
      let p = node.parentValue
      while (p !== undefined) {
        const parent = nodeMap.value.get(p)
        if (!parent) break
        const siblings = flattened.value.filter((n) => n.parentValue === p)
        const allChecked = siblings.every((s) => next.has(s.value))
        if (allChecked) {
          next.add(p)
        } else {
          next.delete(p)
        }
        p = parent.parentValue
      }
    }
  }
  selectedKeys.value = next
  emit('select', node.value, toRawNode(node), { selected: !isChecked })
  emitChange(node.value, !isChecked)
}

/** 收集所有后代 value（不含自己） */
function collectDescendants(value: T): T[] {
  const result: T[] = []
  const walk = (v: T) => {
    const node = nodeMap.value.get(v)
    if (!node || !node.hasChildren) return
    node.children!.forEach((child) => {
      const cv = getValue(child)
      result.push(cv)
      walk(cv)
    })
  }
  walk(value)
  return result
}

/** 还原为原始 TreeNodeRaw（用于事件参数） */
function toRawNode(node: FlatNode): TreeNodeRaw {
  return {
    value: node.value,
    title: node.title,
    children: node.children,
    disabled: node.disabled,
    disableCheckbox: node.disableCheckbox,
    selectable: node.selectable,
    isLeaf: node.isLeaf,
  }
}

/** 统一 emit change + 双向更新 */
function emitChange(triggerValue: T | undefined, selected: boolean) {
  const value = isMultiple.value ? [...selectedKeys.value] : ([...selectedKeys.value][0] as T)
  const labels = selectedLabels.value
  emit('update:value', value)
  emit('update:modelValue', value)
  emit('change', value, labels, { triggerValue, selected })
}

/** 多选：移除某个 tag */
function removeTag(value: T, e: MouseEvent) {
  e.stopPropagation()
  const next = new Set(selectedKeys.value)
  next.delete(value)
  selectedKeys.value = next
  const node = nodeMap.value.get(value)
  if (node) emit('deselect', value, toRawNode(node))
  emitChange(value, false)
}

/** 清空所有 */
function clearAll(e: MouseEvent) {
  e.stopPropagation()
  selectedKeys.value = new Set()
  emitChange(undefined, false)
}

/** 搜索输入 */
function onSearchInput(e: Event) {
  searchValue.value = (e.target as HTMLInputElement).value
  emit('search', searchValue.value)
}

// ========== 点击外部关闭 ==========
function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    if (open.value) {
      open.value = false
      emit('openChange', false)
      searchValue.value = ''
    }
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// ========== 样式 ==========
const sizeClass = computed(() => ({
  sm: 'h-7 text-xs px-2.5 min-h-7',
  md: 'h-8 text-sm px-3 min-h-8',
  lg: 'h-10 text-base px-3.5 min-h-10',
}[props.size]))

const statusClass = computed(() => {
  if (props.status === 'error') return 'border-red-400 focus:border-red-500'
  if (props.status === 'warning') return 'border-amber-400 focus:border-amber-500'
  return ''
})

/** 触发器是否显示选中态 */
const hasValue = computed(() => selectedKeys.value.size > 0)
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
      <!-- 前缀 -->
      <slot v-if="$slots.prefix" name="prefix" />

      <!-- 占位 / 选中值 -->
      <div class="flex-1 min-w-0 flex flex-wrap items-center gap-1" :class="isMultiple ? 'py-0.5' : ''">
        <!-- 空态 -->
        <span v-if="!hasValue" class="truncate text-gray-300">
          <slot v-if="$slots.placeholder" name="placeholder" />
          <template v-else>{{ placeholder }}</template>
        </span>

        <!-- 单选：显示文本 -->
        <span v-else-if="!isMultiple" class="truncate text-gray-800">{{ singleLabel }}</span>

        <!-- 多选：tag 列表 -->
        <template v-else>
          <span
            v-for="tag in tagList.visible"
            :key="tag.value"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs max-w-full"
          >
            <span class="truncate">{{ tag.label }}</span>
            <X
              v-if="!disabled"
              :size="10"
              class="flex-shrink-0 hover:text-blue-800"
              @click.stop="removeTag(tag.value, $event)"
            />
          </span>
          <!-- 折叠的 +N -->
          <span
            v-if="tagList.omitted.length > 0"
            class="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs"
          >
            <slot name="maxTagPlaceholder" :omittedValues="tagList.omitted">
              +{{ tagList.omitted.length }}
            </slot>
          </span>
        </template>
      </div>

      <!-- 清除按钮 -->
      <button
        v-if="allowClear && hasValue && !disabled"
        type="button"
        class="text-gray-300 hover:text-gray-500 mr-0.5 flex-shrink-0"
        @click="clearAll"
      >
        <X :size="14" />
      </button>

      <!-- 后缀箭头 -->
      <slot v-if="$slots.suffixIcon" name="suffixIcon" />
      <ChevronDown
        v-else
        :size="14"
        class="text-gray-400 transition-transform flex-shrink-0"
        :class="open ? 'rotate-180' : ''"
      />
    </div>

    <!-- 下拉面板（absolute 跟随触发器，会被父级 overflow 截断；如需跳出可改 Teleport + fixed + JS 算位置） -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="absolute z-50 bg-white border border-gray-100 rounded-md shadow-lg w-full"
        :class="placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'"
      >
        <!-- 搜索框 -->
        <div v-if="showSearch" class="p-2 border-b border-gray-50">
          <div class="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded">
            <Search :size="14" class="text-gray-400 flex-shrink-0" />
            <input
              :value="searchValue"
              type="text"
              class="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-300"
              placeholder="搜索"
              @input="onSearchInput"
            />
            <X
              v-if="searchValue"
              :size="12"
              class="text-gray-400 hover:text-gray-600 flex-shrink-0"
              @click="searchValue = ''; emit('search', '')"
            />
          </div>
        </div>

        <!-- 树列表 -->
        <div class="overflow-auto py-1" :style="{ maxHeight: `${listHeight}px` }">
          <div v-if="visibleNodes.length === 0" class="py-6 text-center text-sm text-gray-400">
            <slot name="notFoundContent">{{ notFoundContent }}</slot>
          </div>
          <div
            v-for="node in visibleNodes"
            :key="node.value"
            class="flex items-center gap-1 py-1 px-2 text-sm cursor-pointer transition-colors"
            :class="[
              node.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50',
              selectedKeys.has(node.value) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700',
            ]"
            :style="{ paddingLeft: `${node.level * 18 + 8}px` }"
            @click="handleSelect(node)"
          >
            <!-- 展开/折叠 -->
            <span
              v-if="node.hasChildren"
              class="flex items-center justify-center w-4 h-4 flex-shrink-0 transition-transform"
              :class="expandedKeys.has(node.value) ? 'rotate-90' : ''"
              @click.stop="toggleExpand(node.value)"
            >
              <slot name="switcherIcon" :expanded="expandedKeys.has(node.value)">
                <ChevronRight :size="14" />
              </slot>
            </span>
            <span v-else class="w-4 flex-shrink-0"></span>

            <!-- 勾选框 -->
            <input
              v-if="isCheckable"
              type="checkbox"
              class="mr-1 flex-shrink-0"
              :checked="selectedKeys.has(node.value)"
              :disabled="node.disableCheckbox || node.disabled"
              @click.stop="handleCheck(node)"
            />

            <!-- 内容 -->
            <span class="flex-1 min-w-0 truncate">
              <slot name="title" :node="toRawNode(node)">{{ node.title }}</slot>
            </span>

            <!-- 单选标记 -->
            <Check
              v-if="!isMultiple && selectedKeys.has(node.value)"
              :size="14"
              class="text-blue-500 flex-shrink-0"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
