<script setup lang="ts">
/**
 * 水印 Watermark
 *
 * 参考：https://ant.design/components/watermark-cn
 *
 * 特性：
 * - content 水印文字（string | string[]，多行）
 * - image 图片源（base64 / url，优先级高于 content）
 * - width / height 水印单元尺寸（默认 120 / 64）
 * - rotate 旋转角度（默认 -22）
 * - zIndex 层级（默认 999）
 * - gap 水印间距 [x, y]（默认 [100, 100]）
 * - offset 距容器左上角偏移（默认 gap/2）
 * - font 文字样式 { color, fontSize, fontWeight, fontFamily, fontStyle, textAlign }
 *
 * 实现：content 用 Canvas 生成单元水印 → toDataURL → 背景图重复；image 直接用作背景
 */
import { ref, computed, watch, onMounted } from 'vue'

interface FontConfig {
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'lighter' | 'bold' | 'bolder' | number
  fontFamily?: string
  fontStyle?: 'none' | 'normal' | 'italic' | 'oblique'
  textAlign?: 'start' | 'end' | 'left' | 'right' | 'center'
}

const props = withDefaults(
  defineProps<{
    content?: string | string[]
    image?: string
    width?: number
    height?: number
    rotate?: number
    zIndex?: number
    gap?: [number, number]
    offset?: [number, number]
    font?: FontConfig
  }>(),
  {
    content: '',
    image: '',
    width: 120,
    height: 64,
    rotate: -22,
    zIndex: 999,
    gap: () => [100, 100] as [number, number],
    offset: undefined,
    font: () => ({}),
  },
)

const base64Url = ref('')

/** 计算实际偏移（默认 gap/2） */
const actualOffset = computed<[number, number]>(() => {
  if (props.offset) return props.offset
  return [props.gap[0] / 2, props.gap[1] / 2] as [number, number]
})

/** 默认字体配置 */
const fontConfig = computed<Required<FontConfig>>(() => ({
  color: 'rgba(0,0,0,0.15)',
  fontSize: 16,
  fontWeight: 'normal',
  fontFamily: 'sans-serif',
  fontStyle: 'normal',
  textAlign: 'center',
  ...props.font,
}))

/** 生成 Canvas 单元水印 */
function generateWatermark() {
  if (props.image) return // 图片模式不需要 canvas
  if (typeof document === 'undefined') return // SSR 兜底
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = props.width
  canvas.height = props.height
  const contents = Array.isArray(props.content) ? props.content.filter(Boolean) : [props.content].filter(Boolean)
  if (contents.length === 0) {
    base64Url.value = ''
    return
  }
  const fc = fontConfig.value
  ctx.font = `${fc.fontStyle === 'italic' ? 'italic ' : ''}${fc.fontWeight} ${fc.fontSize}px ${fc.fontFamily}`
  ctx.fillStyle = fc.color
  ctx.textAlign = fc.textAlign as CanvasTextAlign
  ctx.textBaseline = 'middle'
  ctx.translate(props.width / 2, props.height / 2)
  ctx.rotate((props.rotate * Math.PI) / 180)
  const lineHeight = fc.fontSize * 1.4
  const startY = -((contents.length - 1) / 2) * lineHeight
  contents.forEach((c, i) => {
    ctx.fillText(String(c), 0, startY + i * lineHeight)
  })
  base64Url.value = canvas.toDataURL()
}

/** 实际使用的背景图（image 优先，否则 canvas 生成的 dataURL） */
const bgImage = computed(() => props.image || base64Url.value)

/** 背景样式 */
const bgStyle = computed(() => ({
  backgroundImage: bgImage.value ? `url(${bgImage.value})` : 'none',
  backgroundRepeat: 'repeat' as const,
  backgroundPosition: `${actualOffset.value[0]}px ${actualOffset.value[1]}px`,
  backgroundSize: `${props.gap[0] + props.width}px ${props.gap[1] + props.height}px`,
  zIndex: props.zIndex,
  pointerEvents: 'none' as const,
}))

// 内容或字体配置变化时重新生成
watch(
  () => [props.content, props.width, props.height, props.rotate, props.font, props.image],
  generateWatermark,
  { deep: true, immediate: true },
)

onMounted(generateWatermark)
</script>

<template>
  <div class="relative">
    <!-- 用户内容 -->
    <slot />

    <!-- 水印层（absolute 覆盖 + overflow:hidden 防止外部撑大；pointer-events:none 不影响交互） -->
    <div class="absolute inset-0 overflow-hidden" :style="bgStyle"></div>
  </div>
</template>
