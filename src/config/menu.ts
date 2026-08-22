/**
 * 菜单 & 路由配置
 * 统一定义所有业务页面的路径、标题、图标、是否在菜单中隐藏等元信息
 * 后续新增页面时在此文件追加配置即可
 */

/** 单个菜单项的元信息 */
export interface MenuMeta {
  /** 菜单标题 */
  title: string
  /** lucide 图标名称（组件名，如 LayoutDashboard） */
  icon?: string
  /** 是否在侧边栏菜单中隐藏 */
  hideInMenu?: boolean
  /** 是否在面包屑中隐藏 */
  hideInBreadcrumb?: boolean
  /** 权限标识（后续接权限时用） */
  permission?: string
}

/** 菜单项配置 */
export interface MenuRoute {
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name: string
  /** 路由元信息 */
  meta: MenuMeta
  /** 子菜单 */
  children?: MenuRoute[]
  /** 是否需要登录才能访问 */
  requiresAuth?: boolean
}

/**
 * 菜单路由树
 * 按照业务模块组织，一级菜单为分类，二级菜单为页面
 */
export const menuRoutes: MenuRoute[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: { title: '仪表盘', icon: 'LayoutDashboard' },
    requiresAuth: true,
    children: [
      {
        path: '/dashboard/analysis',
        name: 'DashboardAnalysis',
        meta: { title: '分析页' },
        requiresAuth: true,
      },
      {
        path: '/dashboard/monitor',
        name: 'DashboardMonitor',
        meta: { title: '监控页' },
        requiresAuth: true,
      },
      {
        path: '/dashboard/workplace',
        name: 'DashboardWorkplace',
        meta: { title: '工作台' },
        requiresAuth: true,
      },
    ],
  },
  {
    path: '/form',
    name: 'Form',
    meta: { title: '表单页', icon: 'FileText' },
    requiresAuth: true,
    children: [
      {
        path: '/form/basic-form',
        name: 'BasicForm',
        meta: { title: '基础表单' },
        requiresAuth: true,
      },
      {
        path: '/form/step-form',
        name: 'StepForm',
        meta: { title: '分步表单' },
        requiresAuth: true,
      },
      {
        path: '/form/advanced-form',
        name: 'AdvancedForm',
        meta: { title: '高级表单' },
        requiresAuth: true,
      },
    ],
  },
  {
    path: '/list',
    name: 'List',
    meta: { title: '列表页', icon: 'Table' },
    requiresAuth: true,
    children: [
      {
        path: '/list/search',
        name: 'SearchList',
        meta: { title: '搜索列表' },
        requiresAuth: true,
      },
      {
        path: '/list/basic',
        name: 'BasicList',
        meta: { title: '基础列表' },
        requiresAuth: true,
      },
    ],
  },
  {
    path: '/profile',
    name: 'Profile',
    meta: { title: '个人页', icon: 'User' },
    requiresAuth: true,
    children: [
      {
        path: '/profile/advanced',
        name: 'ProfileAdvanced',
        meta: { title: '个人中心' },
        requiresAuth: true,
      },
      {
        path: '/profile/basic',
        name: 'ProfileBasic',
        meta: { title: '基本设置' },
        requiresAuth: true,
      },
    ],
  },
]
