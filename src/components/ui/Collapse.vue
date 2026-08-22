<script setup lang="ts">
/**
 * 折叠面板 Collapse
 *
 * 特性：
 * - v-model:activeKey 当前展开的面板 key 列表
 * - accordion: 手风琴模式（只展开一个）
 * - items: { key, title, disabled }[]
 * - #default: 自定义面板内容（需配合 v-for）
 * - #title: 自定义标题
 * - #expandIcon: 自定义展开图标
 *
 * 用法：
 *   <Collapse v-model:activeKey="keys" :items="items">
 *     <template #panel-1>面板 1 内容</template>
 *   </Collapse>
 */
import { ref, watch, useSlots } from 'vue'
import { ChevronDown } from '@lucide/vue'

interface CollapseItem {
  key: string | number
  title: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    activeKey?: (string | number)[]
    accordion?: boolean
    items?: CollapseItem[]
  }>(),
  {
    activeKey: () => [],
    accordion: false,
    items: () => [],
  },
)

const emit = defineEmits<{
  'update:activeKey': [keys: (string | number)[]]
  change: [keys: (string | number)[]]
}>()

const slots = useSlots()

/** 内部展开状态 */
const innerKeys = ref<Set<string | number>>(new Set(props.activeKey))

watch(
  () => props.activeKey,
  (val) => {
    innerKeys.value = new Set(val)
  },
)

function toggle(key: string | number) {
  const item = props.items.find((i) => i.key === key)
  if (item?.disabled) return

  if (props.accordion) {
    // 手风琴模式
    if (innerKeys.value.has(key)) {
      innerKeys.value.clear()
    } else {
      innerKeys.value.clear()
      innerKeys.value.add(key)
    }
  } else {
    if (innerKeys.value.has(key)) {
      innerKeys.value.delete(key)
    } else {
      innerKeys.value.add(key)
    }
  }

  const keys = [...innerKeys.value]
  emit('update:activeKey', keys)
  emit('change', keys)
}
</script>

<template>
  <div class="border border-gray-100 rounded-md divide-y divide-gray-50">
    <div v-for="item in items" :key="item.key">
      <!-- 标题栏 -->
      <button
        class="flex items-center justify-between w-full px-4 py-3 text-left transition-colors"
        :class="item.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'"
        @click="toggle(item.key)"
      >
        <span class="text-sm font-medium text-gray-800">
          <slot name="title" :item="item">{{ item.title }}</slot>
        </span>
        <ChevronDown
          :size="16"
          class="text-gray-400 transition-transform flex-shrink-0"
          :class="innerKeys.has(item.key) ? 'rotate-180' : ''"
        />
      </button>

      <!-- 内容区 -->
      <Transition
        enter-active-class="transition-all duration-200 overflow-hidden"
        leave-active-class="transition-all duration-200 overflow-hidden"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="innerKeys.has(item.key)" class="px-4 py-3">
          <slot :name="`panel-${item.key}`" />
        </div>
      </Transition>
    </div>
  </div>
</template>
