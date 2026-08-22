<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * 树形组件 Tree
 *
 * 特性：
 * - data: 树数据 { key, title, children, disabled }[]
 * - selectable: 可选中
 * - checkable: 可勾选
 * - defaultExpandAll: 默认展开全部
 * - defaultExpandedKeys: 默认展开的 key
 * - defaultSelectedKey: 默认选中
 * - #default: 自定义节点内容 ({ node })
 *
 * 事件：
 * - @select: 选中节点 (key, node)
 * - @check: 勾选节点 (checkedKeys)
 */
import { ref, watch } from 'vue'
import { ChevronRight } from '@lucide/vue'

interface TreeNode {
  key: string | number
  title: string
  children?: TreeNode[]
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    data?: TreeNode[]
    selectable?: boolean
    checkable?: boolean
    defaultExpandAll?: boolean
    defaultExpandedKeys?: (string | number)[]
    defaultSelectedKey?: string | number
  }>(),
  {
    data: () => [],
    selectable: true,
    checkable: false,
    defaultExpandAll: false,
    defaultExpandedKeys: () => [],
    defaultSelectedKey: '',
  },
)

const emit = defineEmits<{
  select: [key: string | number, node: TreeNode]
  check: [keys: (string | number)[]]
}>()

/** 展开的节点 */
const expandedKeys = ref<Set<string | number>>(new Set())

/** 选中的节点 */
const selectedKey = ref<string | number>(props.defaultSelectedKey)

/** 勾选的节点 */
const checkedKeys = ref<Set<string | number>>(new Set())

// 初始化展开
watch(
  () => props.data,
  (val) => {
    if (props.defaultExpandAll) {
      const expand = (nodes: TreeNode[]) => {
        nodes.forEach((n) => {
          if (n.children?.length) {
            expandedKeys.value.add(n.key)
            expand(n.children)
          }
        })
      }
      expand(val)
    }
    props.defaultExpandedKeys.forEach((k) => expandedKeys.value.add(k))
  },
  { immediate: true },
)

function toggleExpand(key: string | number) {
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key)
  } else {
    expandedKeys.value.add(key)
  }
}

function handleSelect(key: string | number, node: TreeNode) {
  if (!props.selectable || node.disabled) return
  selectedKey.value = key
  emit('select', key, node)
}

function toggleCheck(key: string | number, node: TreeNode) {
  if (node.disabled) return
  if (checkedKeys.value.has(key)) {
    checkedKeys.value.delete(key)
  } else {
    checkedKeys.value.add(key)
  }
  emit('check', [...checkedKeys.value])
}
</script>

<template>
  <ul class="text-sm select-none">
    <li v-for="node in data" :key="node.key">
      <div
        class="flex items-center gap-1 py-1 px-1 rounded transition-colors"
        :class="[
          node.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50',
          selectedKey === node.key && selectable ? 'bg-blue-50 text-blue-600' : 'text-gray-700',
        ]"
        @click="handleSelect(node.key, node)"
      >
        <!-- 展开/折叠 -->
        <span
          v-if="node.children?.length"
          class="flex items-center justify-center w-4 h-4 flex-shrink-0 transition-transform"
          :class="expandedKeys.has(node.key) ? 'rotate-90' : ''"
          @click.stop="toggleExpand(node.key)"
        >
          <ChevronRight :size="14" />
        </span>
        <span v-else class="w-4 flex-shrink-0"></span>

        <!-- 勾选框 -->
        <input
          v-if="checkable"
          type="checkbox"
          class="mr-1 flex-shrink-0"
          :checked="checkedKeys.has(node.key)"
          :disabled="node.disabled"
          @click.stop="toggleCheck(node.key, node)"
        />

        <!-- 内容 -->
        <slot :node="node">{{ node.title }}</slot>
      </div>

      <!-- 子节点 -->
      <div v-if="node.children?.length && expandedKeys.has(node.key)" class="ml-4">
        <Tree
          :data="node.children"
          :selectable="selectable"
          :checkable="checkable"
          :default-expand-all="false"
          :default-selected-key="''"
          @select="(k, n) => emit('select', k, n)"
          @check="(childKeys) => {
            // 合并子级返回的 keys 与自身 checkedKeys，保证消费方能拿到全树完整选中键列表
            // 注意：模板中 ref 自动解包，checkedKeys 已是 Set 实例，无需 .value
            const merged = new Set([...checkedKeys, ...childKeys])
            emit('check', [...merged])
          }"
        />
      </div>
    </li>
  </ul>
</template>
