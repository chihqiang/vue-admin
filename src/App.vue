<script setup lang="ts">
/**
 * 根组件
 * 包裹 Suspense（路由懒加载 fallback）+ ErrorBoundary（页面级错误捕获）
 */
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import PageLoading from '@/components/PageLoading.vue'
</script>

<template>
  <ErrorBoundary>
    <router-view v-slot="{ Component }">
      <Suspense :timeout="0">
        <component :is="Component" />
        <!-- 路由懒加载时的 fallback -->
        <template #fallback>
          <PageLoading />
        </template>
      </Suspense>
    </router-view>
  </ErrorBoundary>
</template>
