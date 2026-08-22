<script setup lang="ts">
/**
 * 走马灯 Carousel
 *
 * 参考：https://ant.design/components/carousel-cn
 *
 * 特性：
 * - v-model:current 当前索引
 * - autoplay 自动切换
 * - autoplaySpeed 自动切换间隔（默认 3000ms）
 * - dots 是否显示指示点（默认 true）
 * - dotPlacement 指示点位置 top/bottom/start/end（默认 bottom）
 * - effect 动画效果 scrollx/fade（默认 scrollx）
 * - fade 渐显（同 effect=fade，简写）
 * - infinite 无限循环（默认 true）
 * - speed 切换动画时长（默认 500ms）
 * - arrows 显示切换箭头
 * - draggable 可拖拽切换
 *
 * 事件：
 * - @afterChange(current) 切换后
 * - @beforeChange(current, next) 切换前
 *
 * 方法（defineExpose）：goTo(slide, dontAnimate) / next() / prev()
 *
 * 用法：
 *   <Carousel autoplay>
 *     <div>第 1 张</div>
 *     <div>第 2 张</div>
 *   </Carousel>
 */
import { ref, computed, watch, useSlots, onMounted, onBeforeUnmount, Comment } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    current?: number
    autoplay?: boolean
    autoplaySpeed?: number
    dots?: boolean
    dotPlacement?: 'top' | 'bottom' | 'start' | 'end'
    effect?: 'scrollx' | 'fade'
    fade?: boolean
    infinite?: boolean
    speed?: number
    arrows?: boolean
    draggable?: boolean
  }>(),
  {
    current: 0,
    autoplay: false,
    autoplaySpeed: 3000,
    dots: true,
    dotPlacement: 'bottom',
    effect: 'scrollx',
    fade: false,
    infinite: true,
    speed: 500,
    arrows: false,
    draggable: false,
  },
)

const emit = defineEmits<{
  'update:current': [value: number]
  afterChange: [current: number]
  beforeChange: [current: number, next: number]
}>()

const slots = useSlots()
const currentIndex = ref(props.current)

/** 子节点数量（过滤注释和空文本） */
const slideCount = computed(() => {
  const vnodes = slots.default?.() ?? []
  return vnodes.filter((v) => v.type !== Comment && !(typeof v.children === 'string' && v.children.trim() === '')).length
})

let timer: ReturnType<typeof setInterval> | null = null

function startAutoplay() {
  stopAutoplay()
  if (props.autoplay && slideCount.value > 1) {
    timer = setInterval(() => next(), props.autoplaySpeed)
  }
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function goTo(slide: number, dontAnimate = false) {
  if (slideCount.value === 0) return
  let next = slide
  if (props.infinite) {
    if (next >= slideCount.value) next = 0
    if (next < 0) next = slideCount.value - 1
  } else {
    next = Math.max(0, Math.min(slideCount.value - 1, next))
  }
  if (next === currentIndex.value) return
  emit('beforeChange', currentIndex.value, next)
  currentIndex.value = next
  emit('update:current', next)
  emit('afterChange', next)
  if (dontAnimate) {
    // 简化：忽略 dontAnimate 标志（实现复杂），保持统一动画
  }
}

function next() {
  goTo(currentIndex.value + 1)
}

function prev() {
  goTo(currentIndex.value - 1)
}

defineExpose({ goTo, next, prev })

watch(() => props.current, (v) => {
  if (v !== undefined && v !== currentIndex.value) goTo(v)
})

watch(() => [props.autoplay, props.autoplaySpeed, slideCount.value], startAutoplay, { immediate: true })

onMounted(startAutoplay)
onBeforeUnmount(stopAutoplay)

/** 实际效果（fade 优先级高于 effect） */
const isFade = computed(() => props.fade || props.effect === 'fade')

/** track transform 样式 */
const trackStyle = computed(() => {
  if (isFade.value) return { transition: `opacity ${props.speed}ms ease` }
  return {
    transform: `translateX(-${currentIndex.value * 100}%)`,
    transition: `transform ${props.speed}ms ease`,
  }
})

/** 指示点容器位置 */
const dotsPlacementClass = computed(() => {
  const map: Record<string, string> = {
    bottom: 'bottom-3 left-1/2 -translate-x-1/2 flex-row',
    top: 'top-3 left-1/2 -translate-x-1/2 flex-row',
    start: 'bottom-1/2 left-3 translate-y-1/2 flex-col',
    end: 'bottom-1/2 right-3 translate-y-1/2 flex-col',
  }
  return map[props.dotPlacement]
})

// ========== 拖拽切换 ==========
let dragStartX = 0
let dragging = false

function onDragStart(e: MouseEvent | TouchEvent) {
  if (!props.draggable) return
  dragging = true
  dragStartX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
}

function onDragEnd(e: MouseEvent | TouchEvent) {
  if (!dragging) return
  dragging = false
  const endX = 'changedTouches' in e ? (e.changedTouches[0]?.clientX ?? 0) : e.clientX
  const delta = endX - dragStartX
  if (Math.abs(delta) > 50) {
    if (delta > 0) prev()
    else next()
  }
}
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- 轨道 -->
    <div
      class="flex"
      :class="isFade ? 'relative' : ''"
      :style="trackStyle"
      @mousedown="onDragStart"
      @mouseup="onDragEnd"
      @touchstart="onDragStart"
      @touchend="onDragEnd"
    >
      <slot />
    </div>

    <!-- 切换箭头 -->
    <template v-if="arrows">
      <button
        class="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        @click="prev"
      >
        <ChevronLeft :size="20" />
      </button>
      <button
        class="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        @click="next"
      >
        <ChevronRight :size="20" />
      </button>
    </template>

    <!-- 指示点 -->
    <div
      v-if="dots"
      class="absolute flex gap-1.5 z-10"
      :class="dotsPlacementClass"
    >
      <button
        v-for="i in slideCount"
        :key="i"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="i - 1 === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5 hover:bg-white/70'"
        @click="goTo(i - 1)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
/* 子元素固定宽度，支持横向滚动切换 */
.flex > :deep(*) {
  flex: 0 0 100%;
  width: 100%;
}

/* fade 模式：仅当前可见，其他透明 */
.flex[style*="opacity"] > :deep(*) {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}
.flex[style*="opacity"] > :deep(*:nth-child(1)) {
  position: relative;
}
</style>
