<script setup lang="ts">
/**
 * 空状态 Empty
 *
 * 特性：
 * - description: 描述文字（string 或 #description 插槽）
 * - image: 自定义图片地址
 * - size: sm / md / lg
 * - #icon: 自定义图标
 * - #default: 默认 = 内容下方额外区域
 * - #action: 操作按钮区
 */
withDefaults(
  defineProps<{
    description?: string
    image?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    description: '暂无数据',
    image: '',
    size: 'md',
  },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8">
    <!-- 图片 / 图标 -->
    <template v-if="image">
      <img :src="image" class="object-contain mb-3" :class="size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'" />
    </template>
    <template v-else>
      <slot name="icon">
        <!-- 默认 SVG 空状态图 -->
        <svg
          class="mb-3 text-gray-200"
          :class="size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'"
          viewBox="0 0 64 41"
          fill="currentColor"
        >
          <path d="M55 12.76L44.898 1.1H19.102L9 12.76V22h6v-3h34v3h6V12.76zM12.102 5h39.796L57 13.333V19H7v-5.667L12.102 5zM7 22h50v19H7V22zm16 5h18v2H23v-2z"/>
        </svg>
      </slot>
    </template>

    <!-- 描述 -->
    <p class="text-gray-400" :class="size === 'sm' ? 'text-xs' : 'text-sm'">
      <slot name="description">{{ description }}</slot>
    </p>

    <!-- 默认插槽：内容下方额外区域 -->
    <div v-if="$slots.default" class="mt-3">
      <slot />
    </div>

    <!-- 操作区 -->
    <div v-if="$slots.action" class="mt-3">
      <slot name="action" />
    </div>
  </div>
</template>
