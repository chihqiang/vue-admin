/**
 * 排名列表组件
 * 展示名称 + 数值的排名列表，前三名高亮
 * 参考原项目 RankList，使用 TailwindCSS 重写
 */
<script setup lang="ts">
interface RankItem {
  name: string
  total: number | string
}

withDefaults(
  defineProps<{
    /** 列表标题 */
    title?: string
    /** 排名数据 */
    list?: RankItem[]
  }>(),
  {
    title: '',
    list: () => [],
  },
)

/** 根据排名索引返回序号样式（前三名高亮） */
function rankClass(index: number): string {
  if (index === 0) return 'bg-red-500 text-white'
  if (index === 1) return 'bg-orange-400 text-white'
  if (index === 2) return 'bg-yellow-400 text-white'
  return 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 标题 -->
    <div v-if="title" class="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-100">
      {{ title }}
    </div>

    <!-- 排名列表 -->
    <div class="flex-1 overflow-auto">
      <ul class="divide-y divide-gray-50">
        <li
          v-for="(item, index) in list"
          :key="index"
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <!-- 排名序号 -->
          <span
            class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-medium"
            :class="rankClass(index)"
          >
            {{ index + 1 }}
          </span>
          <!-- 名称 -->
          <span class="flex-1 text-sm text-gray-700 truncate">{{ item.name }}</span>
          <!-- 数值 -->
          <span class="text-sm font-medium text-gray-800">{{ item.total }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
