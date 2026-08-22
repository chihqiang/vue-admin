<script setup lang="ts">
/**
 * 骨架屏 Skeleton
 *
 * 特性：
 * - loading: 是否显示骨架
 * - active: 动画效果
 * - rows: 文本行数
 * - avatar: 是否显示头像占位
 * - title: 是否显示标题占位
 * - paragraph: 段落配置 { rows, width }
 * - #default: 实际内容
 */
withDefaults(
  defineProps<{
    loading?: boolean
    active?: boolean
    rows?: number
    avatar?: boolean
    avatarSize?: number
    title?: boolean
    titleWidth?: string
    round?: boolean
  }>(),
  {
    loading: true,
    active: false,
    rows: 3,
    avatar: false,
    avatarSize: 32,
    title: true,
    titleWidth: '38%',
    round: false,
  },
)

/** 生成每行宽度（交替模式） */
function getRowWidth(index: number, total: number) {
  if (index === total - 1) return '60%'
  const widths = ['100%', '90%', '95%', '80%', '70%']
  return widths[index % widths.length]
}
</script>

<template>
  <!-- 骨架态 -->
  <div v-if="loading" class="flex gap-3">
    <!-- 头像占位 -->
    <div
      v-if="avatar"
      class="bg-gray-100 flex-shrink-0"
      :class="[round ? 'rounded-full' : 'rounded-md', active ? 'animate-pulse' : '']"
      :style="{ width: `${avatarSize}px`, height: `${avatarSize}px` }"
    ></div>

    <div class="flex-1 space-y-2">
      <!-- 标题占位 -->
      <div
        v-if="title"
        class="h-4 bg-gray-100"
        :class="[round ? 'rounded-full' : 'rounded', active ? 'animate-pulse' : '']"
        :style="{ width: titleWidth }"
      ></div>
      <!-- 行占位 -->
      <div
        v-for="i in rows"
        :key="i"
        class="h-3 bg-gray-100"
        :class="[round ? 'rounded-full' : 'rounded', active ? 'animate-pulse' : '']"
        :style="{ width: getRowWidth(i - 1, rows) }"
      ></div>
    </div>
  </div>

  <!-- 实际内容 -->
  <slot v-else />
</template>
