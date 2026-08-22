<script setup lang="ts">
/**
 * 图片 Image
 *
 * 参考：https://ant.design/components/image-cn
 *
 * 特性：
 * - src / alt / width / height
 * - fallback 加载失败容错地址
 * - placeholder 加载占位（boolean 默认显示 Skeleton）
 * - preview 是否可预览（boolean | { src }），点击放大
 *   - 支持滚轮缩放、拖拽、ESC 关闭
 *   - 简化：不做 group 多图切换
 *
 * 事件：
 * - @error: 加载错误 (event)
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { X, ZoomIn, RotateCw, RotateCcw } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
    width?: string | number
    height?: string | number
    fallback?: string
    placeholder?: boolean
    /** 预览：false 禁用；{ src } 自定义预览图 */
    preview?: boolean | { src?: string }
  }>(),
  {
    src: '',
    alt: '',
    width: undefined,
    height: undefined,
    fallback: '',
    placeholder: true,
    preview: true,
  },
)

const emit = defineEmits<{ error: [event: Event] }>()

const status = ref<'loading' | 'loaded' | 'error'>('loading')
/** 实际显示的 src（错误后用 fallback） */
const currentSrc = ref<string>(props.src)

const previewVisible = ref(false)
const previewSrc = ref<string>('')
const scale = ref(1)
const rotate = ref(0)
const translateX = ref(0)
const translateY = ref(0)

const previewEnabled = computed(() => props.preview !== false)
const previewSrcFromProp = computed(() => (typeof props.preview === 'object' && props.preview.src) || '')

function onLoad() {
  status.value = 'loaded'
}

function onError(e: Event) {
  status.value = 'error'
  if (props.fallback) {
    currentSrc.value = props.fallback
    status.value = 'loading' // 重新加载 fallback
  }
  emit('error', e)
}

function openPreview() {
  if (!previewEnabled.value) return
  previewSrc.value = previewSrcFromProp.value || currentSrc.value
  scale.value = 1
  rotate.value = 0
  translateX.value = 0
  translateY.value = 0
  previewVisible.value = true
  document.addEventListener('keydown', handleKeydown)
}

function closePreview() {
  previewVisible.value = false
  document.removeEventListener('keydown', handleKeydown)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closePreview()
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.min(Math.max(0.5, scale.value + delta), 10)
}

let dragStart: { x: number; y: number } | null = null
function onDragStart(e: MouseEvent) {
  dragStart = { x: e.clientX - translateX.value, y: e.clientY - translateY.value }
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}
function onDragMove(e: MouseEvent) {
  if (!dragStart) return
  translateX.value = e.clientX - dragStart.x
  translateY.value = e.clientY - dragStart.y
}
function onDragEnd() {
  dragStart = null
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.5, 10)
}
function zoomOut() {
  scale.value = Math.max(scale.value - 0.5, 0.5)
}
function rotateLeft() {
  rotate.value -= 90
}
function rotateRight() {
  rotate.value += 90
}

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
})

const imgStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
</script>

<template>
  <div class="inline-block relative overflow-hidden" :style="imgStyle">
    <!-- 加载占位 -->
    <div v-if="placeholder && status === 'loading'" class="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- 错误态 -->
    <div v-if="status === 'error' && !fallback" class="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400">
      <span class="text-xs">图片加载失败</span>
    </div>

    <img
      v-if="currentSrc"
      :src="currentSrc"
      :alt="alt"
      class="block"
      :class="previewEnabled ? 'cursor-zoom-in' : ''"
      :style="imgStyle"
      @load="onLoad"
      @error="onError"
      @click="openPreview"
    />

    <!-- 预览蒙层 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="previewVisible"
          class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center select-none"
          @click="closePreview"
        >
          <img
            :src="previewSrc"
            :alt="alt"
            class="max-w-[90vw] max-h-[90vh] object-contain transition-transform"
            :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)` }"
            @click.stop
            @wheel="onWheel"
            @mousedown="onDragStart"
          />

          <!-- 工具栏 -->
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-full" @click.stop>
            <button class="text-white hover:text-blue-300 p-1" title="缩小" @click="zoomOut">
              <ZoomIn :size="18" class="rotate-180" />
            </button>
            <span class="text-white text-xs w-12 text-center tabular-nums">{{ Math.round(scale * 100) }}%</span>
            <button class="text-white hover:text-blue-300 p-1" title="放大" @click="zoomIn">
              <ZoomIn :size="18" />
            </button>
            <span class="w-px h-4 bg-white/30 mx-1"></span>
            <button class="text-white hover:text-blue-300 p-1" title="左旋" @click="rotateLeft">
              <RotateCcw :size="18" />
            </button>
            <button class="text-white hover:text-blue-300 p-1" title="右旋" @click="rotateRight">
              <RotateCw :size="18" />
            </button>
          </div>

          <!-- 关闭按钮 -->
          <button class="absolute top-4 right-4 text-white hover:text-blue-300 p-2" @click="closePreview">
            <X :size="22" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
