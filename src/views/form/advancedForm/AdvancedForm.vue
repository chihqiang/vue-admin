/**
 * 高级表单页面 /form/advanced-form
 * 包含：仓库管理表单 + 任务管理表单 + 成员管理表格 + 底部固定提交工具栏
 * 适用于一次性输入和提交大批量数据的场景
 */
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, AlertCircle } from '@lucide/vue'
import RepositoryForm from './RepositoryForm.vue'
import TaskForm from './TaskForm.vue'

// ========== 子表单 ref ==========
const repositoryRef = ref<InstanceType<typeof RepositoryForm>>()
const taskRef = ref<InstanceType<typeof TaskForm>>()

// ========== 成员表格 ==========
interface Member {
  key: string
  name: string
  workId: string
  department: string
  editable: boolean
  isNew?: boolean
  /** 编辑前的原始数据（取消时恢复） */
  _originalData?: { name: string; workId: string; department: string }
}

const members = reactive<Member[]>([
  { key: '1', name: '小明', workId: '001', department: '行政部', editable: false },
  { key: '2', name: '李莉', workId: '002', department: 'IT部', editable: false },
  { key: '3', name: '王小帅', workId: '003', department: '财务部', editable: false },
])

/** 新增成员 */
function newMember() {
  const lastMember = members[members.length - 1]
  const lastKey = lastMember ? parseInt(lastMember.key) : 0
  members.push({
    key: (lastKey + 1).toString(),
    name: '',
    workId: '',
    department: '',
    editable: true,
    isNew: true,
  })
}

/** 删除成员 */
function removeMember(key: string) {
  const idx = members.findIndex((m) => m.key === key)
  if (idx !== -1) members.splice(idx, 1)
}

/** 保存行 */
function saveRow(record: Member) {
  if (!record.name || !record.workId || !record.department) {
    window.alert('请填写完整成员信息。')
    return
  }
  record.editable = false
  record.isNew = false
  record._originalData = undefined
}

/** 切换为编辑模式 */
function toggleEdit(key: string) {
  const target = members.find((m) => m.key === key)
  if (!target) return
  target._originalData = { name: target.name, workId: target.workId, department: target.department }
  target.editable = true
}

/** 取消编辑 */
function cancelEdit(key: string) {
  const target = members.find((m) => m.key === key)
  if (!target || !target._originalData) return
  target.name = target._originalData.name
  target.workId = target._originalData.workId
  target.department = target._originalData.department
  target.editable = false
  target._originalData = undefined
}

// ========== 错误汇总 ==========
interface FormError {
  message: string
  fieldLabel: string
}

/** 字段中文标签映射 */
const fieldLabels: Record<string, string> = {
  name: '仓库名',
  url: '仓库域名',
  owner: '仓库管理员',
  approver: '审批人',
  dateRange: '生效日期',
  type: '仓库类型',
  name2: '任务名',
  url2: '任务描述',
  owner2: '执行人',
  approver2: '责任人',
  dateTime: '提醒时间',
  type2: '任务类型',
}

/** 错误列表（汇总子表单校验结果） */
const errorList = ref<FormError[]>([])
/** 错误 popover 是否展开 */
const errorPopoverOpen = ref(false)

// ========== 提交 ==========
const submitting = ref(false)

/** 最终提交：校验两个子表单 */
async function handleSubmit() {
  const repoValid = repositoryRef.value?.validate()
  const taskValid = taskRef.value?.validate()

  errorList.value = []

  if (!repoValid) {
    const repoErrors = repositoryRef.value?.errors || {}
    Object.keys(repoErrors).forEach((key) => {
      errorList.value.push({ message: repoErrors[key]!, fieldLabel: fieldLabels[key] ?? key })
    })
  }

  if (!taskValid) {
    const taskErrors = taskRef.value?.errors || {}
    Object.keys(taskErrors).forEach((key) => {
      errorList.value.push({ message: taskErrors[key]!, fieldLabel: fieldLabels[key] ?? key })
    })
  }

  if (errorList.value.length > 0) {
    errorPopoverOpen.value = true
    return
  }

  // 校验通过，提交
  submitting.value = true
  await new Promise((r) => setTimeout(r, 800))
  const repoData = repositoryRef.value?.getFormData()
  const taskData = taskRef.value?.getFormData()
  console.log('提交数据：', { repository: repoData, task: taskData, members: members.map(({ _originalData, ...rest }) => rest) })
  submitting.value = false
  window.alert('提交成功')
}

/** 滚动到错误字段 */
function scrollToField(fieldKey: string) {
  const el = document.querySelector(`[data-field="${fieldKey}"]`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// 错误数量
const errorCount = computed(() => errorList.value.length)
</script>

<template>
  <div class="min-h-full pb-24 bg-gray-50">
    <!-- 页面说明 -->
    <div class="bg-white rounded-lg border border-gray-100 p-4 m-6 mb-4">
      <p class="text-sm text-gray-500">
        高级表单常见于一次性输入和提交大批量数据的场景。
      </p>
    </div>

    <!-- 仓库管理 -->
    <div class="bg-white rounded-lg border border-gray-100 mx-6 mb-4">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-800">仓库管理</h3>
      </div>
      <div class="p-6" data-field="name">
        <RepositoryForm ref="repositoryRef" />
      </div>
    </div>

    <!-- 任务管理 -->
    <div class="bg-white rounded-lg border border-gray-100 mx-6 mb-4">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-800">任务管理</h3>
      </div>
      <div class="p-6" data-field="name2">
        <TaskForm ref="taskRef" />
      </div>
    </div>

    <!-- 成员管理表格 -->
    <div class="bg-white rounded-lg border border-gray-100 mx-6 mb-4">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-800">成员管理</h3>
      </div>
      <div class="p-6">
        <!-- 表格 -->
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left text-sm font-medium text-gray-500 py-3 px-2" style="width: 20%">成员姓名</th>
              <th class="text-left text-sm font-medium text-gray-500 py-3 px-2" style="width: 20%">工号</th>
              <th class="text-left text-sm font-medium text-gray-500 py-3 px-2" style="width: 40%">所属部门</th>
              <th class="text-left text-sm font-medium text-gray-500 py-3 px-2" style="width: 20%">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in members"
              :key="record.key"
              class="border-b border-gray-50 hover:bg-gray-50"
            >
              <!-- 成员姓名 -->
              <td class="py-3 px-2">
                <input
                  v-if="record.editable"
                  v-model="record.name"
                  type="text"
                  placeholder="成员姓名"
                  class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <span v-else class="text-sm text-gray-700">{{ record.name }}</span>
              </td>
              <!-- 工号 -->
              <td class="py-3 px-2">
                <input
                  v-if="record.editable"
                  v-model="record.workId"
                  type="text"
                  placeholder="工号"
                  class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <span v-else class="text-sm text-gray-700">{{ record.workId }}</span>
              </td>
              <!-- 所属部门 -->
              <td class="py-3 px-2">
                <input
                  v-if="record.editable"
                  v-model="record.department"
                  type="text"
                  placeholder="所属部门"
                  class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <span v-else class="text-sm text-gray-700">{{ record.department }}</span>
              </td>
              <!-- 操作 -->
              <td class="py-3 px-2">
                <template v-if="record.editable">
                  <template v-if="record.isNew">
                    <button class="text-sm text-blue-500 hover:text-blue-600 mr-3" @click="saveRow(record)">添加</button>
                    <button class="text-sm text-red-500 hover:text-red-600" @click="removeMember(record.key)">删除</button>
                  </template>
                  <template v-else>
                    <button class="text-sm text-blue-500 hover:text-blue-600 mr-3" @click="saveRow(record)">保存</button>
                    <button class="text-sm text-gray-500 hover:text-gray-600" @click="cancelEdit(record.key)">取消</button>
                  </template>
                </template>
                <template v-else>
                  <button class="text-sm text-blue-500 hover:text-blue-600 mr-3" @click="toggleEdit(record.key)">编辑</button>
                  <button class="text-sm text-red-500 hover:text-red-600" @click="removeMember(record.key)">删除</button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 新增成员按钮 -->
        <button
          type="button"
          class="w-full mt-4 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:text-blue-500 hover:border-blue-400 transition-colors flex items-center justify-center gap-1"
          @click="newMember"
        >
          <Plus :size="14" />
          新增成员
        </button>
      </div>
    </div>

    <!-- 底部固定工具栏 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div class="flex items-center justify-end gap-4 px-6 py-3">
        <!-- 错误提示 popover -->
        <div v-if="errorCount > 0" class="relative">
          <button
            type="button"
            class="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
            @click="errorPopoverOpen = !errorPopoverOpen"
          >
            <AlertCircle :size="16" />
            {{ errorCount }}
          </button>
          <!-- 弹出层 -->
          <div
            v-if="errorPopoverOpen"
            class="absolute right-0 bottom-full mb-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-auto"
          >
            <div class="px-4 py-2 border-b border-gray-100 text-sm font-medium text-gray-700">表单校验信息</div>
            <ul>
              <li
                v-for="(err, i) in errorList"
                :key="i"
                class="px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50"
                @click="scrollToField(err.fieldLabel)"
              >
                <div class="flex items-start gap-2">
                  <span class="text-red-500 text-sm mt-0.5">×</span>
                  <div>
                    <p class="text-sm text-gray-700">{{ err.message }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ err.fieldLabel }}</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- 提交按钮 -->
        <button
          type="button"
          :disabled="submitting"
          class="px-6 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="handleSubmit"
        >
          {{ submitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </div>
  </div>
</template>
