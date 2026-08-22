<script setup lang="ts">
/**
 * 二维码 QRCode
 *
 * 参考：https://ant.design/components/qr-code-cn
 *
 * 特性：
 * - value 扫描后的文本（必填）
 * - type 渲染类型 canvas / svg（默认 canvas）
 * - size 二维码大小（默认 160）
 * - color 二维码颜色（默认 #000）
 * - bgColor 背景色（默认 transparent）
 * - bordered 是否有边框（默认 true）
 * - errorLevel 纠错等级 L/M/Q/H（默认 M）
 * - status 状态 active/expired/loading/scanned
 *
 * 事件：
 * - @refresh: 点击"点击刷新"的回调
 *
 * 依赖：qrcode 包
 */
import { ref, watch, onMounted } from 'vue'
import QRCode_lib from 'qrcode'
import { CheckCircle2, RefreshCw } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    value: string
    type?: 'canvas' | 'svg'
    size?: number
    color?: string
    bgColor?: string
    bordered?: boolean
    errorLevel?: 'L' | 'M' | 'Q' | 'H'
    status?: 'active' | 'expired' | 'loading' | 'scanned'
  }>(),
  {
    type: 'canvas',
    size: 160,
    color: '#000',
    bgColor: 'transparent',
    bordered: true,
    errorLevel: 'M',
    status: 'active',
  },
)

const emit = defineEmits<{ refresh: [] }>()

const canvasRef = ref<HTMLCanvasElement>()
const svgString = ref('')

/** 生成二维码 */
async function generate() {
  if (!props.value) return
  const options = {
    width: props.size,
    margin: 1,
    errorCorrectionLevel: props.errorLevel,
    color: {
      dark: props.color,
      // transparent → 透明色（#0000）
      light: props.bgColor === 'transparent' ? '#0000' : props.bgColor,
    },
  } as const
  try {
    if (props.type === 'canvas' && canvasRef.value) {
      await QRCode_lib.toCanvas(canvasRef.value, props.value, options)
    } else if (props.type === 'svg') {
      svgString.value = await QRCode_lib.toString(props.value, {
        ...options,
        type: 'svg' as const,
      })
    }
  } catch (err) {
    console.error('[QRCode] 生成失败:', err)
  }
}

onMounted(generate)

watch(
  () => [props.value, props.size, props.color, props.bgColor, props.errorLevel, props.type],
  generate,
)

function handleRefresh() {
  emit('refresh')
}

defineExpose({ generate })
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center"
    :class="bordered ? 'p-2 border border-gray-100 rounded-md' : ''"
    :style="{ width: `${size + (bordered ? 16 : 0)}px`, height: `${size + (bordered ? 16 : 0)}px` }"
  >
    <!-- 加载中 -->
    <div
      v-if="status === 'loading'"
      class="flex items-center justify-center"
      :style="{ width: size + 'px', height: size + 'px' }"
    >
      <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- 已过期：绝对定位覆盖整个二维码区域 -->
    <div
      v-else-if="status === 'expired'"
      class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2 z-10"
    >
      <span class="text-gray-500 text-sm">二维码过期</span>
      <button
        class="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
        @click="handleRefresh"
      >
        <RefreshCw :size="14" />
        点击刷新
      </button>
    </div>

    <!-- 已扫描 -->
    <div
      v-else-if="status === 'scanned'"
      class="flex flex-col items-center justify-center"
      :style="{ width: size + 'px', height: size + 'px' }"
    >
      <CheckCircle2 :size="32" class="text-green-500" />
      <span class="text-gray-500 text-xs mt-2">已扫描</span>
    </div>

    <!-- 活跃态 -->
    <template v-else>
      <canvas v-if="type === 'canvas'" ref="canvasRef" :width="size" :height="size"></canvas>
      <!-- SVG 字符串渲染（内容来自 qrcode 库，受控） -->
      <div v-else class="qr-svg" v-html="svgString"></div>
    </template>
  </div>
</template>

<style scoped>
.qr-svg :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
