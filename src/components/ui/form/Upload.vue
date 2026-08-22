<script setup lang="ts">
/**
 * 文件上传 Upload
 *
 * 特性：
 * - accept: 接受的文件类型
 * - multiple: 多选
 * - disabled: 禁用
 * - maxSize: 最大文件大小（MB）
 * - limit: 最大文件数量
 * - listType: text / picture
 * - #default: 自定义触发区域
 * - #item: 自定义文件列表项 ({ file, index })
 *
 * 事件：
 * - @change: 文件列表变化 (fileList)
 * - @success: 上传成功 (file, fileList)
 * - @error: 上传失败 (file, error)
 * - @remove: 移除文件 (file, fileList)
 * - @exceed: 超出限制 (files, fileList)
 * - @before-upload: 上传前钩子 (file) => boolean
 */
import { ref, useSlots, onBeforeUnmount } from 'vue'
import { Upload as UploadIcon, X, File as FileIcon, Check, AlertCircle } from '@lucide/vue'

interface UploadFile {
  uid: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'success' | 'error'
  url?: string
  raw?: File
}

const props = withDefaults(
  defineProps<{
    accept?: string
    multiple?: boolean
    disabled?: boolean
    maxSize?: number
    limit?: number
    listType?: 'text' | 'picture'
    /** 上传前钩子；返回 false / Promise<false> 取消上传 */
    beforeUpload?: (file: File) => boolean | Promise<boolean>
  }>(),
  {
    accept: '',
    multiple: false,
    disabled: false,
    maxSize: 10,
    limit: 0,
    listType: 'text',
    beforeUpload: undefined,
  },
)

const emit = defineEmits<{
  change: [fileList: UploadFile[]]
  success: [file: UploadFile, fileList: UploadFile[]]
  error: [file: UploadFile, error: Error]
  remove: [file: UploadFile, fileList: UploadFile[]]
  exceed: [files: File[], fileList: UploadFile[]]
  'before-upload': [file: File]
}>()

const slots = useSlots()
const inputRef = ref<HTMLInputElement>()
const fileList = ref<UploadFile[]>([])

let seed = 0

/** 上传定时器数组；卸载时统一清理，避免在已卸载组件上修改 ref / emit */
const uploadTimers: ReturnType<typeof setTimeout>[] = []

function handleClick() {
  if (props.disabled) return
  inputRef.value?.click()
}

async function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)

  // 数量限制
  if (props.limit > 0 && fileList.value.length + files.length > props.limit) {
    emit('exceed', files, fileList.value)
    target.value = ''
    return
  }

  // for...of 以支持 await（beforeUpload 可能异步）
  for (const file of files) {
    // 大小限制
    if (file.size > props.maxSize * 1024 * 1024) {
      emit('error', { uid: `_${++seed}`, name: file.name, size: file.size, type: file.type, status: 'error' }, new Error('文件大小超出限制'))
      continue
    }

    // 事件通知（不依赖返回值，无法用作取消信号）
    emit('before-upload', file)
    // 函数 prop：返回 false 则取消上传
    if (props.beforeUpload) {
      const result = await props.beforeUpload(file)
      if (result === false) continue
    }

    const uploadFile: UploadFile = {
      uid: `_${++seed}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      raw: file,
    }

    fileList.value.push(uploadFile)
    emit('change', fileList.value)

    // 模拟上传（实际使用时替换为真实上传逻辑）
    const timer = setTimeout(() => {
      uploadFile.status = 'success'
      uploadFile.url = URL.createObjectURL(file)
      emit('success', uploadFile, fileList.value)
      emit('change', fileList.value)
    }, 1000)
    uploadTimers.push(timer)
  }

  target.value = ''
}

function removeFile(uid: string) {
  const file = fileList.value.find((f) => f.uid === uid)
  if (!file) return
  // 释放对象 URL，避免 Blob 数据无法 GC
  if (file.url) URL.revokeObjectURL(file.url)
  fileList.value = fileList.value.filter((f) => f.uid !== uid)
  emit('remove', file, fileList.value)
  emit('change', fileList.value)
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// 卸载时清理：上传定时器 + 释放所有对象 URL
onBeforeUnmount(() => {
  uploadTimers.forEach((t) => clearTimeout(t))
  uploadTimers.length = 0
  fileList.value.forEach((f) => {
    if (f.url) URL.revokeObjectURL(f.url)
  })
})
</script>

<template>
  <div class="w-full">
    <!-- 触发器 -->
    <div @click="handleClick">
      <slot>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors"
          :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
        >
          <UploadIcon :size="14" />
          点击上传
        </button>
      </slot>
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        @change="handleChange"
      />
    </div>

    <!-- 文件列表 -->
    <ul v-if="fileList.length > 0" class="mt-2 space-y-1">
      <li
        v-for="file in fileList"
        :key="file.uid"
        class="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md group"
      >
        <!-- 图标 -->
        <FileIcon :size="14" class="text-gray-400 flex-shrink-0" />

        <!-- 文件信息 -->
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-700 truncate">{{ file.name }}</div>
          <div class="text-xs text-gray-400">{{ formatSize(file.size) }}</div>
        </div>

        <!-- 状态 -->
        <div v-if="file.status === 'uploading'" class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
        <Check v-else-if="file.status === 'success'" :size="14" class="text-green-500 flex-shrink-0" />
        <AlertCircle v-else-if="file.status === 'error'" :size="14" class="text-red-500 flex-shrink-0" />

        <!-- 移除 -->
        <button class="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" @click="removeFile(file.uid)">
          <X :size="14" />
        </button>
      </li>
    </ul>
  </div>
</template>
