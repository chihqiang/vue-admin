/**
 * 点击外部区域关闭组合式函数
 *
 * 用法：
 *   const targetRef = ref<HTMLElement>()
 *   useClickOutside(targetRef, () => { isOpen.value = false })
 *
 * 在 onMounted 中注册 document 监听，onBeforeUnmount 中移除，
 * 避免在 setup 顶层直接操作 document 产生的副作用作用域问题。
 */
import { onMounted, onBeforeUnmount, type Ref } from 'vue'

export function useClickOutside(
  targetRef: Ref<HTMLElement | undefined>,
  handler: () => void,
) {
  function onClick(e: MouseEvent) {
    if (targetRef.value && !targetRef.value.contains(e.target as Node)) {
      handler()
    }
  }

  onMounted(() => document.addEventListener('click', onClick))
  onBeforeUnmount(() => document.removeEventListener('click', onClick))
}