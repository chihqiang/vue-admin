<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-80 rounded-2xl bg-white p-8 text-center shadow-lg">
      <h1 class="mb-2 text-2xl font-bold text-gray-800">Vue + Tailwind</h1>
      <p class="mb-6 text-sm text-gray-500">点击按钮测试 Pinia 和 Tailwind</p>

      <p class="mb-1 text-5xl font-extrabold text-blue-600">{{ counter.count }}</p>
      <p class="mb-6 text-xs text-gray-400">双倍值：{{ counter.doubleCount }}</p>

      <button
        class="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 active:scale-95"
        @click="counter.increment()"
      >
        +1
      </button>
    </div>
  </div>
</template>

<style scoped></style>
