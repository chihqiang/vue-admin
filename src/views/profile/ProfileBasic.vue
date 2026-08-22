/**
 * 个人中心 - 基本设置页面 /profile/basic
 * 左侧菜单（基本设置/安全设置/消息设置/自定义）+ 右侧表单内容
 * 包含：头像上传区 + 昵称/个人简介/邮箱/国家地区表单
 */
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { CloudUpload, Plus } from '@lucide/vue'
import { Card, Input, Select, Button } from '@/components/ui'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ========== 左侧菜单 ==========
/** 菜单项 */
const menuItems = [
  { key: 'basic', label: '基本设置' },
  { key: 'security', label: '安全设置' },
  { key: 'notification', label: '消息设置' },
  { key: 'custom', label: '自定义' },
]
/** 当前选中菜单 */
const activeMenu = ref('basic')

// ========== 表单数据 ==========
const form = reactive({
  /** 昵称 */
  nickname: userStore.name || '系统管理员',
  /** 个人简介 */
  profile: '海纳百川，有容乃大',
  /** 邮箱 */
  email: 'admin@example.com',
  /** 国家/地区 */
  region: '中国',
  /** 所在城市 */
  city: '深圳市',
  /** 联系电话 */
  phone: '0755-88888888',
})

/** 国家/地区选项 */
const regionOptions = [
  { label: '中国', value: '中国' },
  { label: '美国', value: '美国' },
  { label: '日本', value: '日本' },
  { label: '英国', value: '英国' },
]

/** 头像 URL */
const avatarUrl = ref(userStore.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avatar%20placeholder&image_size=square_hd')

// ========== 提交状态 ==========
const submitting = ref(false)

/** 更新基本信息 */
async function handleUpdate() {
  submitting.value = true
  await new Promise((r) => setTimeout(r, 800))
  console.log('更新信息：', { ...form })
  submitting.value = false
  window.alert('更新成功')
}

// ========== 头像上传 ==========
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)

/** 点击头像区域触发文件选择 */
function triggerUpload() {
  fileInput.value?.click()
}

/** 处理文件选择 */
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  const reader = new FileReader()
  reader.onload = (evt) => {
    if (evt.target?.result) {
      avatarUrl.value = evt.target.result as string
    }
    uploading.value = false
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="min-h-full bg-gray-50 p-6 space-y-6">
    <!-- 页面说明 -->
    <Card>
      <p class="text-sm text-gray-500">
        个人中心用于管理和展示当前登录用户的个人信息和设置。
      </p>
    </Card>

    <!-- 主卡片 -->
    <Card :body-style="{ padding: '0' }">
      <div class="flex min-h-[600px]">
        <!-- 左侧菜单 -->
        <div class="w-48 border-r border-gray-100 py-4 flex-shrink-0">
          <nav class="space-y-1">
            <button
              v-for="item in menuItems"
              :key="item.key"
              class="w-full text-left px-6 py-2.5 text-sm transition-colors"
              :class="
                activeMenu === item.key
                  ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
              "
              @click="activeMenu = item.key"
            >
              {{ item.label }}
            </button>
          </nav>
        </div>

        <!-- 右侧内容 -->
        <div class="flex-1 p-8">
          <!-- 标题 -->
          <h3 class="text-xl font-medium text-gray-800 mb-6">基本设置</h3>

          <!-- 表单区 -->
          <div class="flex flex-col lg:flex-row gap-8">
            <!-- 左侧表单 -->
            <div class="flex-1 max-w-md space-y-5">
              <!-- 昵称 -->
              <div>
                <label class="block text-sm text-gray-700 mb-1.5">昵称</label>
                <Input v-model="form.nickname" placeholder="请输入昵称" />
              </div>

              <!-- 个人简介 -->
              <div>
                <label class="block text-sm text-gray-700 mb-1.5">个人简介</label>
                <textarea
                  v-model="form.profile"
                  rows="4"
                  placeholder="请输入个人简介"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
                />
              </div>

              <!-- 邮箱 -->
              <div>
                <label class="block text-sm text-gray-700 mb-1.5">邮箱</label>
                <Input v-model="form.email" type="email" placeholder="example@example.com" />
              </div>

              <!-- 国家/地区 + 城市 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-1.5">国家/地区</label>
                  <Select v-model="form.region" :options="regionOptions" />
                </div>
                <div>
                  <label class="block text-sm text-gray-700 mb-1.5">所在城市</label>
                  <Input v-model="form.city" placeholder="请输入城市" />
                </div>
              </div>

              <!-- 联系电话 -->
              <div>
                <label class="block text-sm text-gray-700 mb-1.5">联系电话</label>
                <Input v-model="form.phone" placeholder="请输入联系电话" />
              </div>

              <!-- 更新按钮 -->
              <div class="pt-2">
                <Button type="primary" :loading="submitting" @click="handleUpdate">
                  {{ submitting ? '更新中...' : '更新基本信息' }}
                </Button>
              </div>
            </div>

            <!-- 右侧头像上传区 -->
            <div class="flex flex-col items-center lg:w-48 flex-shrink-0">
              <div
                class="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group"
                @click="triggerUpload"
              >
                <!-- 当前头像 -->
                <img
                  :src="avatarUrl"
                  alt="头像"
                  class="w-full h-full object-cover"
                />
                <!-- hover 遮罩 -->
                <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="text-center text-white">
                    <Plus :size="20" class="mx-auto mb-1" />
                    <span class="text-xs">更换头像</span>
                  </div>
                </div>
              </div>
              <!-- 上传图标 -->
              <div class="mt-3 flex items-center gap-1 text-gray-400">
                <CloudUpload :size="14" />
                <span class="text-xs">{{ uploading ? '上传中...' : '点击头像上传' }}</span>
              </div>
              <!-- 隐藏的 file input -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
