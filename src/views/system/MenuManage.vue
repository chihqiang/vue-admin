/**
 * 菜单管理页面 /system/menu
 *
 * 功能：
 *   - 菜单树形展示
 *   - 新增/编辑菜单（支持选择上级菜单）
 *   - 删除菜单
 */
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Edit, Trash2, ChevronRight } from '@lucide/vue'
import { Button, Card, Tag, Modal, Input, Select, message, confirm } from '@/components'

interface MenuItem {
  id: string
  parentId: string | null
  name: string
  path: string
  icon?: string
  component?: string
  permission?: string
  hideInMenu: boolean
  sort: number
  children?: MenuItem[]
}

const menuList = ref<MenuItem[]>([
  {
    id: '1', parentId: null, name: '仪表盘', path: '/dashboard', icon: 'LayoutDashboard', component: '', permission: 'dashboard', hideInMenu: false, sort: 1,
    children: [
      { id: '1-1', parentId: '1', name: '分析页', path: '/dashboard/analysis', component: 'dashboard/Analysis', hideInMenu: false, sort: 1 },
      { id: '1-2', parentId: '1', name: '工作台', path: '/dashboard/workplace', component: 'dashboard/Workplace', hideInMenu: false, sort: 2 },
      { id: '1-3', parentId: '1', name: '监控页', path: '/dashboard/monitor', component: 'dashboard/Monitor', hideInMenu: false, sort: 3 },
    ],
  },
  {
    id: '2', parentId: null, name: '表单页', path: '/form', icon: 'FileText', hideInMenu: false, sort: 2,
    children: [
      { id: '2-1', parentId: '2', name: '基础表单', path: '/form/basic-form', component: 'form/BasicForm', hideInMenu: false, sort: 1 },
      { id: '2-2', parentId: '2', name: '分步表单', path: '/form/step-form', component: 'form/step-form/StepForm', hideInMenu: false, sort: 2 },
      { id: '2-3', parentId: '2', name: '高级表单', path: '/form/advanced-form', component: 'form/advanced-form/AdvancedForm', hideInMenu: false, sort: 3 },
    ],
  },
  {
    id: '3', parentId: null, name: '系统管理', path: '/system', icon: 'MonitorCog', hideInMenu: false, sort: 10,
    children: [
      { id: '3-1', parentId: '3', name: '用户管理', path: '/system/user', component: 'system/UserManage', permission: 'user', hideInMenu: false, sort: 1 },
      { id: '3-2', parentId: '3', name: '角色管理', path: '/system/role', component: 'system/RoleManage', permission: 'role', hideInMenu: false, sort: 2 },
      { id: '3-3', parentId: '3', name: '菜单管理', path: '/system/menu', component: 'system/MenuManage', permission: 'menu', hideInMenu: false, sort: 3 },
      { id: '3-4', parentId: '3', name: '权限管理', path: '/system/permission', component: 'system/PermissionManage', permission: 'permission', hideInMenu: false, sort: 4 },
    ],
  },
])

// 展开状态
const expandedKeys = ref<string[]>(['1', '3'])

function toggleExpand(id: string) {
  const idx = expandedKeys.value.indexOf(id)
  if (idx >= 0) {
    expandedKeys.value.splice(idx, 1)
  } else {
    expandedKeys.value.push(id)
  }
}

// ============ 上级菜单选项 ============

/** 递归收集所有菜单（含一级和子级），用于上级菜单下拉选项 */
function collectAllMenus(list: MenuItem[], depth = 0): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = []
  for (const item of list) {
    const prefix = depth > 0 ? `${'\u00A0\u00A0'.repeat(depth)}└ ` : ''
    result.push({ label: `${prefix}${item.name}`, value: item.id })
    if (item.children?.length) {
      result.push(...collectAllMenus(item.children, depth + 1))
    }
  }
  return result
}

/** 上级菜单下拉选项：首项为「根菜单（无上级）」+ 所有现有菜单 */
const parentOptions = computed(() => [
  { label: '根菜单（无上级）', value: '' },
  ...collectAllMenus(menuList.value),
])

// ============ 弹窗 ============

const modalVisible = ref(false)
const modalTitle = ref('新增菜单')
const editingId = ref<string | null>(null)
const formData = ref({
  parentId: '' as string,
  name: '',
  path: '',
  icon: '',
  component: '',
  permission: '',
  sort: 0,
  hideInMenu: false,
})

/** 查找菜单项及其所在列表（一级 or 某父级的 children） */
function findMenuItem(id: string): { item: MenuItem; siblings: MenuItem[] } | null {
  for (const parent of menuList.value) {
    if (parent.id === id) return { item: parent, siblings: menuList.value }
    if (parent.children) {
      const child = parent.children.find((c) => c.id === id)
      if (child) return { item: child, siblings: parent.children }
    }
  }
  return null
}

function handleAdd(parentId?: string) {
  editingId.value = null
  modalTitle.value = parentId ? '新增子菜单' : '新增菜单'
  formData.value = {
    parentId: parentId || '',
    name: '',
    path: '',
    icon: '',
    component: '',
    permission: '',
    sort: 0,
    hideInMenu: false,
  }
  modalVisible.value = true
}

function handleEdit(item: MenuItem) {
  editingId.value = item.id
  modalTitle.value = '编辑菜单'
  formData.value = {
    parentId: item.parentId || '',
    name: item.name,
    path: item.path,
    icon: item.icon || '',
    component: item.component || '',
    permission: item.permission || '',
    sort: item.sort,
    hideInMenu: item.hideInMenu,
  }
  modalVisible.value = true
}

function handleSubmit() {
  if (!formData.value.name || !formData.value.path) {
    message.warning('请填写菜单名称和路径')
    return
  }

  // 不能将自己设为自己的上级
  if (editingId.value && formData.value.parentId === editingId.value) {
    message.warning('不能将自身设为上级菜单')
    return
  }

  if (editingId.value) {
    // 编辑模式：从旧位置移除，按新 parentId 插入到目标位置
    const found = findMenuItem(editingId.value)
    if (found) {
      const updated: MenuItem = {
        ...found.item,
        parentId: formData.value.parentId || null,
        name: formData.value.name,
        path: formData.value.path,
        icon: formData.value.icon || undefined,
        component: formData.value.component || undefined,
        permission: formData.value.permission || undefined,
        sort: formData.value.sort,
        hideInMenu: formData.value.hideInMenu,
      }
      // 从原 siblings 列表中移除
      const idx = found.siblings.findIndex((m) => m.id === editingId.value)
      if (idx >= 0) found.siblings.splice(idx, 1)

      // 插入到目标列表
      if (formData.value.parentId) {
        const targetParent = findMenuItem(formData.value.parentId)
        if (targetParent) {
          if (!targetParent.item.children) targetParent.item.children = []
          targetParent.item.children.push(updated)
          // 自动展开父级
          if (!expandedKeys.value.includes(formData.value.parentId)) {
            expandedKeys.value.push(formData.value.parentId)
          }
        }
      } else {
        // 移到根级
        menuList.value.push(updated)
      }
    }
  } else {
    // 新增模式
    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      parentId: formData.value.parentId || null,
      name: formData.value.name,
      path: formData.value.path,
      icon: formData.value.icon || undefined,
      component: formData.value.component || undefined,
      permission: formData.value.permission || undefined,
      hideInMenu: formData.value.hideInMenu,
      sort: formData.value.sort,
    }

    if (formData.value.parentId) {
      // 挂到指定父级下
      const targetParent = findMenuItem(formData.value.parentId)
      if (targetParent) {
        if (!targetParent.item.children) targetParent.item.children = []
        targetParent.item.children.push(newItem)
        if (!expandedKeys.value.includes(formData.value.parentId)) {
          expandedKeys.value.push(formData.value.parentId)
        }
      }
    } else {
      // 根级菜单
      menuList.value.push(newItem)
    }
  }

  message.success(editingId.value ? '编辑成功' : '新增成功')
  modalVisible.value = false
}

function handleDelete(item: MenuItem) {
  confirm({
    title: '确认删除',
    content: `确定要删除菜单"${item.name}"吗？${item.children?.length ? '其子菜单也会一并删除。' : ''}`,
    onOk: () => {
      const found = findMenuItem(item.id)
      if (found) {
        const idx = found.siblings.findIndex((m) => m.id === item.id)
        if (idx >= 0) found.siblings.splice(idx, 1)
      }
      message.success('删除成功')
    },
  })
}
</script>

<template>
  <div class="p-6">
    <Card class="mb-4">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">菜单树形管理</div>
        <Button type="primary" v-permission="'menu'" @click="handleAdd()">
          <template #icon><Plus :size="14" /></template>
          新增菜单
        </Button>
      </div>
    </Card>

    <Card>
      <!-- 表头 -->
      <div class="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
        <div class="col-span-3">菜单名称</div>
        <div class="col-span-3">路由路径</div>
        <div class="col-span-2">图标</div>
        <div class="col-span-2">组件路径</div>
        <div class="col-span-1 text-center">排序</div>
        <div class="col-span-1 text-center">操作</div>
      </div>

      <!-- 递归渲染菜单树 -->
      <template v-for="item in menuList" :key="item.id">
        <!-- 一级菜单 -->
        <div class="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-50 dark:border-gray-700 items-center text-sm">
          <div class="col-span-3 flex items-center gap-1">
            <button
              v-if="item.children?.length"
              class="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              @click="toggleExpand(item.id)"
            >
              <ChevronRight :size="14" :class="expandedKeys.includes(item.id) ? 'rotate-90' : ''" class="transition-transform" />
            </button>
            <span class="font-medium text-gray-700 dark:text-gray-200">{{ item.name }}</span>
          </div>
          <div class="col-span-3 text-gray-600 dark:text-gray-400">{{ item.path }}</div>
          <div class="col-span-2"><Tag v-if="item.icon" color="blue">{{ item.icon }}</Tag></div>
          <div class="col-span-2 text-gray-400 text-xs">—</div>
          <div class="col-span-1 text-center text-gray-600 dark:text-gray-400">{{ item.sort }}</div>
          <div class="col-span-1 flex items-center justify-center gap-1">
            <button v-permission="'menu'" class="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="编辑" @click="handleEdit(item)">
              <Edit :size="13" />
            </button>
            <button v-permission="'menu'" class="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="新增子菜单" @click="handleAdd(item.id)">
              <Plus :size="13" />
            </button>
            <button v-permission="'menu'" class="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="删除" @click="handleDelete(item)">
              <Trash2 :size="13" />
            </button>
          </div>
        </div>

        <!-- 子菜单 -->
        <template v-if="item.children?.length && expandedKeys.includes(item.id)">
          <div
            v-for="child in item.children"
            :key="child.id"
            class="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-50 dark:border-gray-700 items-center text-sm bg-gray-50/30 dark:bg-gray-800/30"
          >
            <div class="col-span-3 pl-8 text-gray-600 dark:text-gray-400">{{ child.name }}</div>
            <div class="col-span-3 text-gray-500 dark:text-gray-500">{{ child.path }}</div>
            <div class="col-span-2 text-gray-400 text-xs">—</div>
            <div class="col-span-2 text-gray-500 dark:text-gray-400 text-xs">{{ child.component || '—' }}</div>
            <div class="col-span-1 text-center text-gray-600 dark:text-gray-400">{{ child.sort }}</div>
            <div class="col-span-1 flex items-center justify-center gap-1">
              <button v-permission="'menu'" class="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="编辑" @click="handleEdit(child)">
                <Edit :size="13" />
              </button>
              <button v-permission="'menu'" class="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="删除" @click="handleDelete(child)">
                <Trash2 :size="13" />
              </button>
            </div>
          </div>
        </template>
      </template>
    </Card>

    <Modal :open="modalVisible" :title="modalTitle" @update:open="modalVisible = $event" @ok="handleSubmit">
      <div class="space-y-4 py-2">
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">上级菜单</label>
          <Select v-model="formData.parentId" :options="parentOptions" placeholder="选择上级菜单" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">菜单名称</label>
          <Input v-model="formData.name" placeholder="请输入菜单名称" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">路由路径</label>
          <Input v-model="formData.path" placeholder="如 /system/user" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">图标</label>
          <Input v-model="formData.icon" placeholder="Lucide 图标名" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">组件路径</label>
          <Input v-model="formData.component" placeholder="如 system/UserManage" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">权限标识</label>
          <Input v-model="formData.permission" placeholder="如 user" class="flex-1" />
        </div>
        <div class="flex items-center gap-3">
          <label class="w-20 text-sm text-gray-500 dark:text-gray-400">排序</label>
          <Input v-model="formData.sort" type="number" placeholder="数字" class="flex-1" />
        </div>
      </div>
    </Modal>
  </div>
</template>
