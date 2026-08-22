/**
 * Vitest 配置
 *
 * 测试文件统一放在根目录 tests/ 下，通过 @ 别名引用 src/ 源码
 */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // 测试环境：DOM 相关 API 需要 jsdom
    environment: 'jsdom',
    // 测试文件匹配规则：根目录 tests/ 下的 .test.ts / .spec.ts
    include: ['tests/**/*.{test,spec}.{ts,js}'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/mock/**',
        'src/main.ts',
        'src/App.vue',
      ],
    },
    // 全局 API（不需要每个文件 import { describe, it, expect }）
    globals: true,
  },
})
