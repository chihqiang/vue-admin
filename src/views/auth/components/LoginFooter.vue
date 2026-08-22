/**
 * 登录页页脚：帮助 / 隐私 / 条款 + 版权信息
 */
<script setup lang="ts">
// 页脚链接
const links = ['帮助', '隐私', '条款']
</script>

<template>
  <footer class="mt-auto pt-12 pb-8 text-center">
    <!-- 链接 -->
    <div class="mb-2 text-sm text-gray-500">
      <template v-for="(link, i) in links" :key="link">
        <a href="#" class="transition-colors hover:text-blue-600" @click.prevent>{{ link }}</a>
        <span v-if="i < links.length - 1" class="mx-5 text-gray-300">/</span>
      </template>
    </div>
    <!-- 版权 -->
    <div class="text-sm text-gray-400">
      Copyright © 2024 vue-tailwind-template
    </div>
  </footer>
</template>
