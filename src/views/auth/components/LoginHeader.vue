/**
 * 登录页头部：Logo 图标 + 项目名称 + 副标题描述
 */
<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'

withDefaults(
  defineProps<{
    /** 副标题，可被父组件覆盖 */
    description?: string
  }>(),
  { description: '基于 Vue 3 + TypeScript + TailwindCSS 的企业级中后台脚手架' },
)
</script>

<template>
  <div class="mt-16 mb-10 flex flex-col items-center text-center">
    <a href="/" class="flex items-center gap-3">
      <!-- Logo 图标：蓝色渐变盾牌，表达安全/可信的品牌气质 -->
      <div
        class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/20"
      >
        <ShieldCheck :size="26" :stroke-width="2.2" />
      </div>
      <span
        class="text-[30px] font-semibold leading-[44px] tracking-tight text-[rgba(0,0,0,0.85)]"
        style="font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif"
      >
        vue-admin
      </span>
    </a>
    <p class="mt-3 text-sm text-[rgba(0,0,0,0.45)]">
      {{ description }}
    </p>
  </div>
</template>
