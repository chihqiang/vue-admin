<template>
  <div class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
    <div class="text-9xl font-bold text-gray-200 dark:text-gray-700">404</div>
    <div class="text-lg text-gray-500 dark:text-gray-400 mt-4">页面不存在</div>
    <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">您访问的页面已被移除或地址错误</p>
    <router-link
      to="/"
      class="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
    >
      返回首页
    </router-link>
  </div>
</template>
