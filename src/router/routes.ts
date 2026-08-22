/**
 * 全部业务路由（菜单）定义
 *
 * 这份路由数据即是：
 *   1. Mock 模式下后端返回的菜单数据（mock/services/menu.ts 直接引用）
 *   2. userStore.fetchMenus 降级时的兜底数据
 *   3. SideMenu 在动态菜单未加载时的兜底显示
 *
 * 真实项目联调后端时，前端只需要保证后端返回的菜单结构与此处一致即可，
 * 不需要在此维护（后端返回的数据会覆盖这份默认数据）。
 *
 * 约定：
 *   - 每个一级菜单有 icon（lucide 图标名），子菜单不需要 icon
 *   - component 路径相对于 src/views/（如 'dashboard/Analysis' → src/views/dashboard/Analysis.vue）
 *   - permission 对应 userStore.permissions 中的 permissionId
 *   - affix: true 表示标签页固定不可关闭（如首页）
 */
import type { AsyncMenuItem } from './asyncRoutes'

/** 全部业务路由（菜单树） */
export const asyncRoutes: AsyncMenuItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    redirect: '/dashboard/analysis',
    title: '仪表盘',
    icon: 'LayoutDashboard',
    children: [
      {
        name: 'DashboardAnalysis',
        path: '/dashboard/analysis',
        title: '分析页',
        component: 'dashboard/Analysis',
        affix: true,
      },
      {
        name: 'DashboardWorkplace',
        path: '/dashboard/workplace',
        title: '工作台',
        component: 'dashboard/Workplace',
      },
      {
        name: 'DashboardMonitor',
        path: '/dashboard/monitor',
        title: '监控页',
        component: 'dashboard/Monitor',
      },
    ],
  },
  {
    name: 'Form',
    path: '/form',
    redirect: '/form/basic-form',
    title: '表单页',
    icon: 'FileText',
    children: [
      {
        name: 'BasicForm',
        path: '/form/basic-form',
        title: '基础表单',
        component: 'form/BasicForm',
      },
      {
        name: 'StepForm',
        path: '/form/step-form',
        title: '分步表单',
        component: 'form/step-form/StepForm',
      },
      {
        name: 'AdvancedForm',
        path: '/form/advanced-form',
        title: '高级表单',
        component: 'form/advanced-form/AdvancedForm',
      },
    ],
  },
  {
    name: 'List',
    path: '/list',
    redirect: '/list/basic',
    title: '列表页',
    icon: 'Table',
    children: [
      {
        name: 'BasicList',
        path: '/list/basic',
        title: '基础列表',
        component: 'list/BasicList',
      },
      {
        name: 'SearchList',
        path: '/list/search',
        title: '搜索列表',
        component: 'list/SearchList',
      },
    ],
  },
  {
    name: 'Profile',
    path: '/profile',
    redirect: '/profile/advanced',
    title: '个人页',
    icon: 'User',
    children: [
      {
        name: 'ProfileAdvanced',
        path: '/profile/advanced',
        title: '个人中心',
        component: 'profile/ProfileAdvanced',
      },
      {
        name: 'ProfileBasic',
        path: '/profile/basic',
        title: '基本设置',
        component: 'profile/ProfileBasic',
      },
    ],
  },
  {
    name: 'Result',
    path: '/result',
    redirect: '/result/success',
    title: '结果页',
    icon: 'CheckCircle',
    children: [
      {
        name: 'ResultSuccess',
        path: '/result/success',
        title: '成功页',
        component: 'result/Success',
      },
      {
        name: 'ResultFail',
        path: '/result/fail',
        title: '失败页',
        component: 'result/Fail',
      },
    ],
  },
  {
    name: 'System',
    path: '/system',
    redirect: '/system/user',
    title: '系统管理',
    icon: 'MonitorCog',
    children: [
      {
        name: 'SystemUser',
        path: '/system/user',
        title: '用户管理',
        component: 'system/UserManage',
        permission: 'user',
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        title: '角色管理',
        component: 'system/RoleManage',
        permission: 'role',
      },
      {
        name: 'SystemPermission',
        path: '/system/permission',
        title: '权限管理',
        component: 'system/PermissionManage',
        permission: 'permission',
      },
      {
        name: 'SystemMenu',
        path: '/system/menu',
        title: '菜单管理',
        component: 'system/MenuManage',
        permission: 'role',
      },
    ],
  },
  {
    name: 'Log',
    path: '/log',
    redirect: '/log/operation',
    title: '日志管理',
    icon: 'ScrollText',
    children: [
      {
        name: 'LogOperation',
        path: '/log/operation',
        title: '操作日志',
        component: 'log/OperationLog',
      },
      {
        name: 'LogLogin',
        path: '/log/login',
        title: '登录日志',
        component: 'log/LoginLog',
      },
    ],
  },
  {
    name: 'Message',
    path: '/message',
    redirect: '/message/notify',
    title: '消息中心',
    icon: 'Bell',
    children: [
      {
        name: 'MessageNotify',
        path: '/message/notify',
        title: '通知公告',
        component: 'message/NotifyList',
      },
      {
        name: 'MessageInbox',
        path: '/message/inbox',
        title: '站内信',
        component: 'message/InboxList',
      },
    ],
  },
]
