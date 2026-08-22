/**
 * 分步表单页面 /form/step-form
 * 通过 Steps 组件的具名插槽 #step-{index} 渲染对应步骤内容
 * 步骤1：填写转账信息 → 步骤2：确认并输入支付密码 → 步骤3：完成
 */
<script setup lang="ts">
import { reactive, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle } from '@lucide/vue'
import { Card, Steps, Select, Input, Button, Alert } from '@/components/ui'

const router = useRouter()

/** 当前步骤索引（0/1/2） */
const currentTab = ref(0)

/** 步骤条配置 */
const steps = [
  { title: '填写转账信息' },
  { title: '确认转账信息' },
  { title: '完成' },
]

// ========== 第一步：填写转账信息 ==========
/** 表单数据（第二步、第三步都会用到） */
const form = reactive({
  /** 付款账户 */
  paymentUser: '',
  /** 收款支付方式 */
  payType: 'alipay',
  /** 收款账户 */
  receiverAccount: 'test@example.com',
  /** 收款人姓名 */
  receiverName: 'Alex',
  /** 转账金额 */
  amount: '5000',
})

/** 校验错误 */
const errors = reactive<Record<string, string>>({})

/** 付款账户选项 */
const paymentOptions = [{ label: 'ant-design@alipay.com', value: 'ant-design@alipay.com' }]

/** 支付方式选项 */
const payTypeOptions = [
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wexinpay' },
]

/** 第一步校验 */
function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.paymentUser) errors.paymentUser = '付款账户必须填写'
  if (!form.receiverAccount) errors.receiverAccount = '收款账户必须填写'
  if (!form.receiverName.trim()) errors.receiverName = '收款人名称必须核对'
  if (!form.amount) errors.amount = '转账金额必须填写'
  return Object.keys(errors).length === 0
}

/** 错误态边框样式 */
function errClass(err?: string) {
  return err ? 'border-red-300 ring-2 ring-red-100 focus:border-red-400 focus:ring-red-100' : ''
}

/** 下一步（第一步 → 第二步） */
function nextStep() {
  if (!validate()) return
  currentTab.value = 1
}

/** 上一步（第二步 → 第一步） */
function prevStep() {
  currentTab.value = 0
}

// ========== 第二步：确认转账 ==========
/** 支付密码 */
const paymentPassword = ref('123456')
const passwordError = ref('')
const loading = ref(false)
let timer: number | null = null

/** 提交转账（模拟延迟后进入第三步） */
function submit() {
  if (!paymentPassword.value) {
    passwordError.value = '请输入支付密码'
    return
  }
  loading.value = true
  timer = window.setTimeout(() => {
    loading.value = false
    currentTab.value = 2
  }, 1500)
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

// ========== 第三步：完成 ==========
/** 再转一笔：重置回第一步 */
function finish() {
  currentTab.value = 0
}

/** 查看账单 */
function toOrderList() {
  router.push('/list/basic')
}
</script>

<template>
  <div class="min-h-full p-6 bg-gray-50 space-y-6">
    <!-- 页面说明 -->
    <Card>
      <p class="text-sm text-gray-500">
        将一个冗长或用户不熟悉的表单任务分成多个步骤，指导用户完成。
      </p>
    </Card>

    <!-- 步骤条 + 内容 -->
    <Card>
      <div class="max-w-[750px] mx-auto">
        <Steps :current="currentTab" :items="steps">
          <!-- ========== 第一步：填写转账信息 ========== -->
          <template #step-0>
            <div>
              <!-- 表单 -->
              <div class="max-w-[500px] mx-auto py-10">
                <!-- 付款账户 -->
                <div class="flex items-start gap-4 mb-6">
                  <label class="w-24 text-sm text-gray-700 text-right pt-1.5 flex-shrink-0">付款账户</label>
                  <div class="flex-1">
                    <Select
                      v-model="form.paymentUser"
                      :options="paymentOptions"
                      placeholder="请选择付款账户"
                      :custom-class="errClass(errors.paymentUser)"
                    />
                    <p v-if="errors.paymentUser" class="text-xs text-red-500 mt-1">{{ errors.paymentUser }}</p>
                  </div>
                </div>

                <!-- 收款账户 -->
                <div class="flex items-start gap-4 mb-6">
                  <label class="w-24 text-sm text-gray-700 text-right pt-1.5 flex-shrink-0">收款账户</label>
                  <div class="flex-1 flex gap-2">
                    <Select
                      v-model="form.payType"
                      :options="payTypeOptions"
                      custom-class="w-28 flex-shrink-0"
                    />
                    <Input
                      v-model="form.receiverAccount"
                      placeholder="请输入收款账户"
                      class="flex-1"
                      :custom-class="errClass(errors.receiverAccount)"
                    />
                  </div>
                </div>
                <div v-if="errors.receiverAccount" class="ml-28 -mt-4 mb-6">
                  <p class="text-xs text-red-500">{{ errors.receiverAccount }}</p>
                </div>

                <!-- 收款人姓名 -->
                <div class="flex items-start gap-4 mb-6">
                  <label class="w-24 text-sm text-gray-700 text-right pt-1.5 flex-shrink-0">收款人姓名</label>
                  <div class="flex-1">
                    <Input
                      v-model="form.receiverName"
                      placeholder="请输入收款人姓名"
                      :custom-class="errClass(errors.receiverName)"
                    />
                    <p v-if="errors.receiverName" class="text-xs text-red-500 mt-1">{{ errors.receiverName }}</p>
                  </div>
                </div>

                <!-- 转账金额 -->
                <div class="flex items-start gap-4 mb-6">
                  <label class="w-24 text-sm text-gray-700 text-right pt-1.5 flex-shrink-0">转账金额</label>
                  <div class="flex-1">
                    <Input
                      v-model="form.amount"
                      type="number"
                      placeholder="请输入金额"
                      :custom-class="errClass(errors.amount)"
                    >
                      <template #prefix><span class="text-gray-400">￥</span></template>
                    </Input>
                    <p v-if="errors.amount" class="text-xs text-red-500 mt-1">{{ errors.amount }}</p>
                  </div>
                </div>

                <!-- 按钮 -->
                <div class="ml-28">
                  <Button type="primary" @click="nextStep">下一步</Button>
                </div>
              </div>

              <!-- 分割线 -->
              <hr class="border-gray-100 my-4" />

              <!-- 说明 -->
              <div class="px-8 text-gray-400">
                <h3 class="text-base mb-3">说明</h3>
                <h4 class="text-sm mb-1">转账到支付宝账户</h4>
                <p class="text-sm leading-relaxed mb-3">
                  如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。
                </p>
                <h4 class="text-sm mb-1">转账到银行卡</h4>
                <p class="text-sm leading-relaxed">
                  如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。
                </p>
              </div>
            </div>
          </template>

          <!-- ========== 第二步：确认转账信息 ========== -->
          <template #step-1>
            <div class="max-w-[500px] mx-auto py-10">
              <!-- 警告提示 -->
              <div class="mb-6">
                <Alert type="warning" description="确认转账后，资金将直接打入对方账户，无法退回。" />
              </div>

              <!-- 只读信息 -->
              <div class="space-y-4 mb-6">
                <div class="flex items-start gap-4">
                  <label class="w-24 text-sm text-gray-500 text-right pt-0.5 flex-shrink-0">付款账户</label>
                  <span class="text-sm text-gray-700">{{ form.paymentUser || '-' }}</span>
                </div>
                <div class="flex items-start gap-4">
                  <label class="w-24 text-sm text-gray-500 text-right pt-0.5 flex-shrink-0">收款账户</label>
                  <span class="text-sm text-gray-700">{{ form.receiverAccount || '-' }}</span>
                </div>
                <div class="flex items-start gap-4">
                  <label class="w-24 text-sm text-gray-500 text-right pt-0.5 flex-shrink-0">收款人姓名</label>
                  <span class="text-sm text-gray-700">{{ form.receiverName || '-' }}</span>
                </div>
                <div class="flex items-start gap-4">
                  <label class="w-24 text-sm text-gray-500 text-right pt-0.5 flex-shrink-0">转账金额</label>
                  <span class="text-sm text-gray-700">￥ {{ Number(form.amount || 0).toLocaleString() }}.00</span>
                </div>
              </div>

              <!-- 分割线 -->
              <hr class="border-gray-100 mb-6" />

              <!-- 支付密码 -->
              <div class="flex items-start gap-4 mb-6">
                <label class="w-24 text-sm text-gray-700 text-right pt-1.5 flex-shrink-0">支付密码</label>
                <div class="flex-1">
                  <Input
                    v-model="paymentPassword"
                    type="password"
                    placeholder="请输入支付密码"
                    custom-class="w-4/5"
                  />
                  <p v-if="passwordError" class="text-xs text-red-500 mt-1">{{ passwordError }}</p>
                </div>
              </div>

              <!-- 按钮 -->
              <div class="ml-28 flex gap-2">
                <Button type="primary" :loading="loading" @click="submit">
                  {{ loading ? '提交中...' : '提交' }}
                </Button>
                <Button type="default" @click="prevStep">上一步</Button>
              </div>
            </div>
          </template>

          <!-- ========== 第三步：完成 ========== -->
          <template #step-2>
            <div class="max-w-[560px] mx-auto py-10 text-center">
              <!-- 成功图标 -->
              <div class="flex justify-center mb-4">
                <CheckCircle :size="48" class="text-green-500" />
              </div>

              <!-- 标题 -->
              <h2 class="text-xl font-medium text-gray-800 mb-2">操作成功</h2>
              <p class="text-sm text-gray-500 mb-8">预计两小时内到账</p>

              <!-- 转账信息 -->
              <div class="text-left bg-gray-50 rounded-lg p-6 mb-8">
                <div class="flex items-start gap-2 mb-4">
                  <span class="w-28 text-sm text-gray-400 flex-shrink-0">付款账户：</span>
                  <span class="text-sm text-gray-700">{{ form.paymentUser || '-' }}</span>
                </div>
                <div class="flex items-start gap-2 mb-4">
                  <span class="w-28 text-sm text-gray-400 flex-shrink-0">收款账户：</span>
                  <span class="text-sm text-gray-700">{{ form.receiverAccount || '-' }}</span>
                </div>
                <div class="flex items-start gap-2 mb-4">
                  <span class="w-28 text-sm text-gray-400 flex-shrink-0">收款人姓名：</span>
                  <span class="text-sm text-gray-700">{{ form.receiverName || '-' }}</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-28 text-sm text-gray-400 flex-shrink-0">转账金额：</span>
                  <span class="text-sm text-gray-700">
                    <span class="text-xl font-medium">{{ Number(form.amount || 0).toLocaleString() }}</span> 元
                  </span>
                </div>
              </div>

              <!-- 按钮 -->
              <div class="flex justify-center gap-3">
                <Button type="primary" @click="finish">再转一笔</Button>
                <Button type="default" @click="toOrderList">查看账单</Button>
              </div>
            </div>
          </template>
        </Steps>
      </div>
    </Card>
  </div>
</template>
