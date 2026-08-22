/**
 * 第三方登录入口 + 注册账户链接
 */
<script setup lang="ts">
// 第三方登录平台配置
const platforms = [
  { label: '支', color: '#1677ff', name: '支付宝' },
  { label: '淘', color: '#ff5000', name: '淘宝' },
  { label: '微', color: '#e6162d', name: '微博' },
]
</script>

<template>
  <div class="mt-6 flex items-center justify-between text-sm">
    <!-- 第三方登录 -->
    <div class="flex items-center gap-3 text-gray-400">
      <span class="whitespace-nowrap">其他登录方式：</span>
      <a
        v-for="p in platforms"
        :key="p.name"
        href="#"
        class="flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold text-white transition-transform hover:scale-110"
        :style="{ backgroundColor: p.color }"
        :title="p.name"
        @click.prevent
      >
        {{ p.label }}
      </a>
    </div>
    <!-- 注册入口 -->
    <router-link
      to="/register"
      class="text-blue-600 transition-colors hover:text-blue-700"
    >
      注册账户
    </router-link>
  </div>
</template>
