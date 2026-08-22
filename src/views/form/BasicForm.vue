/**
 * 基础表单页面 /form/basic-form
 * 展示：标题、日期范围、目标描述、衡量标准、客户、邀请人、权重、公开性
 */
<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { Info } from '@lucide/vue'
import { Card, Input, Radio, Checkbox, Button, message } from '@/components/ui'

// ========== 表单数据 ==========
const form = reactive({
  /** 标题 */
  name: '',
  /** 起止日期 */
  dateRange: ['', ''],
  /** 目标描述 */
  description: '',
  /** 衡量标准 */
  standard: '',
  /** 客户 */
  customer: '',
  /** 邀请人 */
  invites: '',
  /** 权重 */
  weight: 0,
  /** 公开性：1=公开 2=部分公开 3=私密 */
  visibility: 1,
  /** 部分公开时选中的可见范围 */
  visibleTo: [] as string[],
})

// ========== 校验错误 ==========
const errors = reactive<Record<string, string>>({})

// ========== 提交状态 ==========
const submitting = ref(false)

// ========== 选项数据 ==========
/** 部分公开时的可见范围选项 */
const visibilityOptions = [
  { label: '朋友', value: '1' },
  { label: '同事', value: '2' },
  { label: '家人', value: '3' },
]

// ========== 校验规则 ==========
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!form.name.trim()) errors.name = '请输入标题'
  if (!form.dateRange[0] || !form.dateRange[1]) errors.dateRange = '请选择起止日期'
  if (!form.description.trim()) errors.description = '请输入目标描述'
  if (!form.standard.trim()) errors.standard = '请输入衡量标准'
  if (!form.customer.trim()) errors.customer = '请输入客户名称'

  return Object.keys(errors).length === 0
}

// ========== 提交 ==========
async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    // 模拟接口提交
    await new Promise((r) => setTimeout(r, 800))
    console.log('表单提交数据：', { ...form })
    message.success('提交成功')
  } catch {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

/** 保存草稿 */
function handleSave() {
  console.log('保存草稿：', { ...form })
  message.success('已保存为草稿')
}

// ========== 日期处理 ==========
/** 开始日期 */
const startDate = computed({
  get: () => form.dateRange[0],
  set: (v: string) => { form.dateRange[0] = v },
})
/** 结束日期 */
const endDate = computed({
  get: () => form.dateRange[1],
  set: (v: string) => { form.dateRange[1] = v },
})

/** 是否显示部分公开的可见范围选择 */
const showVisibleTo = computed(() => form.visibility === 2)

/** 切换可见范围选项 */
function toggleVisibleTo(value: string) {
  const idx = form.visibleTo.indexOf(value)
  if (idx >= 0) form.visibleTo.splice(idx, 1)
  else form.visibleTo.push(value)
}

/** 错误态边框样式 */
function errClass(err?: string) {
  return err ? 'border-red-300 ring-2 ring-red-100 focus:border-red-400 focus:ring-red-100' : ''
}
</script>

<template>
  <div class="min-h-full p-6 bg-gray-50 space-y-6">
    <!-- 页面说明 -->
    <Card>
      <div class="flex items-start gap-2">
        <Info :size="16" class="text-blue-500 mt-0.5 flex-shrink-0" />
        <p class="text-sm text-gray-500">
          表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。
        </p>
      </div>
    </Card>

    <!-- 表单卡片 -->
    <Card>
      <form @submit.prevent="handleSubmit" class="max-w-2xl mx-auto space-y-6">
        <!-- 标题 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 标题
          </label>
          <div class="flex-1">
            <Input v-model="form.name" placeholder="给目标起个名字" :custom-class="errClass(errors.name)" />
            <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
          </div>
        </div>

        <!-- 起止日期 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 起止日期
          </label>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <Input v-model="startDate" type="date" :custom-class="errClass(errors.dateRange)" />
              <span class="text-gray-400">~</span>
              <Input v-model="endDate" type="date" :custom-class="errClass(errors.dateRange)" />
            </div>
            <p v-if="errors.dateRange" class="text-xs text-red-500 mt-1">{{ errors.dateRange }}</p>
          </div>
        </div>

        <!-- 目标描述 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 目标描述
          </label>
          <div class="flex-1">
            <Input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入你的阶段性工作目标"
              :custom-class="errClass(errors.description)"
            />
            <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
          </div>
        </div>

        <!-- 衡量标准 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 衡量标准
          </label>
          <div class="flex-1">
            <Input
              v-model="form.standard"
              type="textarea"
              :rows="4"
              placeholder="请输入衡量标准"
              :custom-class="errClass(errors.standard)"
            />
            <p v-if="errors.standard" class="text-xs text-red-500 mt-1">{{ errors.standard }}</p>
          </div>
        </div>

        <!-- 客户 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            <span class="text-red-500">*</span> 客户
          </label>
          <div class="flex-1">
            <Input v-model="form.customer" placeholder="请描述你服务的客户，方便客户快速筛查" :custom-class="errClass(errors.customer)" />
            <p v-if="errors.customer" class="text-xs text-red-500 mt-1">{{ errors.customer }}</p>
          </div>
        </div>

        <!-- 邀请人 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            邀请人
          </label>
          <div class="flex-1">
            <Input v-model="form.invites" placeholder="请输入邀请人" />
          </div>
        </div>

        <!-- 权重 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            权重
          </label>
          <div class="flex-1 flex items-center gap-2">
            <Input v-model="form.weight" type="number" custom-class="w-24" />
            <span class="text-sm text-gray-500">%</span>
          </div>
        </div>

        <!-- 公开性 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label class="sm:w-28 text-sm text-gray-700 pt-1.5 flex-shrink-0 text-right">
            公开性
          </label>
          <div class="flex-1">
            <!-- 单选按钮组 -->
            <div class="flex items-center gap-4">
              <Radio v-model="form.visibility" :value="1">公开</Radio>
              <Radio v-model="form.visibility" :value="2">部分公开</Radio>
              <Radio v-model="form.visibility" :value="3">私密</Radio>
            </div>
            <p class="text-xs text-gray-400 mt-1">客户、邀评人默认被分享</p>

            <!-- 部分公开时的多选 -->
            <div v-if="showVisibleTo" class="mt-3 space-y-2">
              <Checkbox
                v-for="opt in visibilityOptions"
                :key="opt.value"
                :checked="form.visibleTo.includes(opt.value)"
                @change="toggleVisibleTo(opt.value)"
              >{{ opt.label }}</Checkbox>
            </div>
          </div>
        </div>

        <!-- 按钮区 -->
        <div class="flex justify-center gap-3 pt-4 border-t border-gray-50">
          <Button type="primary" html-type="submit" :loading="submitting">
            {{ submitting ? '提交中...' : '提交' }}
          </Button>
          <Button type="default" @click="handleSave">保存</Button>
        </div>
      </form>
    </Card>
  </div>
</template>
