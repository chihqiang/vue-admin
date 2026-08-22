# vue-admin

> 基于 Vue 3 + TypeScript + TailwindCSS 的中后台前端模板，开箱即用。

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev/)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)

## 目录

- [特性](#特性)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [环境变量](#环境变量)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [核心功能](#核心功能)
- [页面路由](#页面路由)
- [登录账号](#登录账号)
- [开发约定](#开发约定)
- [许可证](#许可证)

## 特性

- **Vue 3 + TypeScript**：Composition API + `<script setup>` 全量类型检查
- **TailwindCSS 4**：通过 `@tailwindcss/vite` 插件集成，原子化 CSS，内置暗色模式（light / dark / auto）
- **Vite 8**：Rolldown 内核，极速冷启动与 HMR
- **Pinia 4**：Setup Store 风格状态管理（app / user / tabs）
- **基础组件库**：40+ 组件按 form/layout/display/navigation/feedback/data/charts 分类，antd API 风格
- **ECharts 6 封装**：统一模块注册，按需分包，迷你图/卡片图/排行榜开箱即用
- **Mock.js**：开发环境模拟接口（可通过 `VITE_USE_MOCK=false` 关闭），生产构建完全不打包
- **动态路由**：后端返回菜单数据，前端动态注册路由 + 渲染侧边栏菜单（RBAC 权限控制）
- **多标签页**：路由切换自动创建标签页，支持关闭/关闭其他/关闭全部/固定标签，配合 KeepAlive 缓存页面状态
- **权限控制**：路由级权限守卫 + 按钮级 `v-permission` 指令，统一 `hasPermission()` 工具函数
- **暗色模式**：light / dark / auto 三种模式，跟随系统偏好实时切换，状态持久化
- **Vitest**：根目录 `tests/` 单元测试，覆盖核心工具与权限逻辑
- **ESLint + OxLint**：双引擎 Lint，零配置错误
- **Husky + Commitlint**：Git 钩子规范提交信息

## 技术栈

| 分类   | 技术                                         |
| ------ | -------------------------------------------- |
| 框架   | Vue 3.5 + TypeScript 6                       |
| 样式   | TailwindCSS 4（`@tailwindcss/vite` 插件）    |
| 构建   | Vite 8（Rolldown 内核）                      |
| 状态   | Pinia 4                                      |
| 路由   | Vue Router 5                                 |
| 图标   | @lucide/vue                                  |
| 图表   | ECharts 6 + vue-echarts 8                    |
| 请求   | Axios（标准 `Authorization: Bearer <token>` |
| Mock   | Mock.js（仅开发环境，可关闭）                |
| 测试   | Vitest 4 + @vue/test-utils                   |
| Lint   | ESLint + OxLint + Prettier                   |
| Git    | Husky + Commitlint                           |

## 环境要求

- Node.js `^22.18.0` 或 `>=24.12.0`

## 环境变量

项目使用 `.env.*` 管理环境变量，复制 `.env.example` 为 `.env.development` 或 `.env.production` 后按需修改：

| 变量名               | 默认值                  | 说明                                                                 |
| -------------------- | ----------------------- | -------------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | `/api`                  | axios 请求前缀                                                       |
| `VITE_USE_MOCK`      | `true`                  | 是否启用 Mock.js。设为 `false` 时请求会由 Vite proxy 转发到后端。   |
| `VITE_PROXY_TARGET`  | `http://127.0.0.1:8080` | 后端真实地址，仅当 `VITE_USE_MOCK=false` 时作为 proxy target 使用。 |

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量（可选，默认已内置 .env.development）
cp .env.example .env.development

# 启动开发服务器
npm run dev

# 类型检查 + 生产构建
npm run build

# 代码检查（oxlint + eslint）
npm run lint

# 代码格式化
npm run format

# 运行单元测试
npm run test

# 测试覆盖率报告
npm run test:coverage
```

## 目录结构

```text
vue-admin/
├── src/
│   ├── api/                  # 接口封装（axios）
│   │   ├── login.ts          #   登录/登出/用户信息接口
│   │   ├── menu.ts           #   菜单接口（动态路由数据）
│   │   └── workplace.ts      #   工作台接口
│   ├── assets/
│   │   └── main.css          #   全局样式（Tailwind 入口 + 暗色模式 + nprogress）
│   ├── components/            # 基础组件库（40+ 组件）
│   │   ├── charts/           #   图表组件（Bar, ChartCard, MiniArea, MiniBar, MiniProgress, MiniSmoothArea, RankList）
│   │   ├── data/             #   数据组件（Table, Tree, TreeSelect, Transfer, Cascader）
│   │   ├── display/          #   展示组件（Tag, Avatar, Badge, Empty, Progress, Timeline, Spin, Skeleton, Statistic, Image, QRCode, Watermark, Trend）
│   │   ├── feedback/         #   反馈组件（Modal, Drawer, Popover, Tooltip, Alert, confirm, message, notification）
│   │   ├── form/             #   表单组件（Button, Input, Select, Checkbox, Radio, Switch, DatePicker, Upload）
│   │   ├── layout/           #   布局组件（Divider, Card, Collapse, Steps, Breadcrumb）
│   │   └── navigation/       #   导航组件（Tabs, Pagination, Dropdown, Segmented, Carousel）
│   ├── directives/
│   │   └── permission.ts     #   v-permission 按钮级权限指令
│   ├── hooks/
│   │   ├── useNprogress.ts   #   路由进度条 Hook
│   │   └── useClickOutside.ts#   点击外部 Hook
│   ├── layouts/              # 布局组件
│   │   ├── BasicLayout.vue   #   主布局（侧边栏 + 顶栏 + 标签栏 + 内容区）
│   │   ├── HeaderBar.vue     #   顶栏（折叠按钮 + 面包屑 + 主题切换 + 用户菜单）
│   │   ├── SideMenu.vue      #   侧边栏菜单（动态渲染）
│   │   └── TabBar.vue        #   多标签页栏
│   ├── mock/                 # Mock 服务（仅开发环境，动态 import，生产不打包）
│   │   ├── services/         #   各模块 mock 实现（auth, menu, user, workplace）
│   │   └── index.ts          #   Mock 入口
│   ├── router/
│   │   ├── index.ts          #   路由实例 + 静态路由 + 登录/权限守卫
│   │   ├── routes.ts         #   业务路由树定义（动态菜单数据源）
│   │   └── asyncRoutes.ts    #   AsyncMenuItem 接口 + transformAsyncRoutes 转换函数
│   ├── stores/               # Pinia 状态管理
│   │   ├── app.ts            #   全局 UI 状态（侧边栏折叠 + 主题模式，持久化）
│   │   ├── user.ts           #   用户状态（token、登录态、用户信息、权限、动态路由加载）
│   │   └── tabs.ts           #   多标签页状态（标签增删/缓存管理）
│   ├── utils/
│   │   ├── request.ts        #   axios 封装（Authorization 头、拦截器、错误处理、ApiResponse 类型）
│   │   ├── storage.ts        #   localStorage 统一封装（token 持久化介质）
│   │   ├── permission.ts     #   hasPermission / hasAnyPermission 工具
│   │   ├── lucide.ts         #   项目实际用到的 lucide 图标白名单
│   │   └── util.ts           #   通用工具函数
│   ├── views/                # 页面
│   │   ├── auth/             #   登录 / 注册
│   │   ├── dashboard/        #   仪表盘（分析页 / 工作台 / 监控页）
│   │   ├── form/             #   表单页（基础表单 / 分步表单 / 高级表单）
│   │   ├── list/             #   列表页（基础列表 / 搜索列表）
│   │   ├── profile/          #   个人页（个人中心 / 基本设置）
│   │   ├── result/           #   结果页（成功 / 失败）
│   │   ├── system/           #   系统管理（用户 / 角色 / 菜单 / 权限）
│   │   ├── log/              #   日志管理（操作日志 / 登录日志）
│   │   ├── message/          #   消息中心（通知公告 / 站内信）
│   │   └── exception/       #   异常页（403 / 404 / 500）
│   ├── App.vue
│   └── main.ts
├── tests/                    # 单元测试（Vitest）
│   ├── Button.test.ts        #   组件测试
│   ├── permission.test.ts    #   权限工具测试
│   ├── storage.test.ts       #   存储工具测试
│   └── util.test.ts          #   通用工具测试
└── package.json
```

## 核心功能

### 动态路由与权限

路由数据由后端接口返回，前端通过 `transformAsyncRoutes()` 转换为 `RouteRecordRaw[]` 后动态注册：

```
登录 → 获取 token → 请求 /user/info → 获取用户角色和权限
     → 请求 /user/menus → 获取菜单树 → transformAsyncRoutes → router.addRoute
```

- **路由定义**：`src/router/routes.ts` 集中定义所有业务路由树（同时作为 Mock 数据源和降级兜底数据）
- **转换逻辑**：`src/router/asyncRoutes.ts` 中的 `transformAsyncRoutes()` 将后端 `AsyncMenuItem[]` 转为 vue-router `RouteRecordRaw[]`
- **路由守卫**：`src/router/index.ts` 的 `beforeEach` 完成登录鉴权 → 动态路由加载 → 权限校验
- **按钮级权限**：`v-permission` 指令（`src/directives/permission.ts`）控制按钮显示/隐藏

### 多标签页

- 路由切换时自动添加标签页（`router.afterEach` → `tabsStore.addTab()`）
- 支持关闭当前 / 关闭其他 / 关闭全部 / 固定标签（`affix: true`）
- 配合 `<KeepAlive>` 缓存已打开页面的组件状态

### 暗色模式

- 三种模式：light / dark / auto（跟随系统）
- TailwindCSS v4 通过 `.dark` 父选择器实现暗色变体
- auto 模式监听 `prefers-color-scheme` 媒体查询实时切换
- 状态持久化到 localStorage

### HTTP 请求

`src/utils/request.ts` 基于 axios 封装：

- 请求拦截器自动注入 `Authorization: Bearer <token>` 头
- 响应拦截器统一解包 `{ code, msg, data }` 结构
- `code !== 200` 按业务异常抛出
- 401 自动清理登录态并跳转登录页（携带 redirect 回跳）
- 403 / 500 统一弹窗提示
- 类型扩展：`request.get<T>()` 直接返回 `Promise<T>`（已解包 data）

## 页面路由

| 路径                   | 页面     | 说明                           |
| ---------------------- | -------- | ------------------------------ |
| `/login`               | 登录页   | 账号 / 手机 / 社交三种登录方式 |
| `/register`            | 注册页   | 账号注册                       |
| `/dashboard/analysis`  | 分析页   | 销售趋势、访问量等数据可视化   |
| `/dashboard/workplace` | 工作台   | 项目进度、团队动态、雷达图     |
| `/dashboard/monitor`   | 监控页   | 实时监控、活动日志、流量分布   |
| `/form/basic-form`     | 基础表单 | 单列表单                       |
| `/form/step-form`      | 分步表单 | 三步流程表单                   |
| `/form/advanced-form`  | 高级表单 | 多模块表单 + 可编辑表格        |
| `/list/basic`          | 基础列表 | 标准列表 + 分页                |
| `/list/search`         | 搜索列表 | 搜索 + 分类筛选                |
| `/profile/advanced`    | 个人中心 | 用户详情 + 动态                |
| `/profile/basic`       | 基本设置 | 个人信息编辑                   |
| `/result/success`      | 成功页   | 操作成功结果展示               |
| `/result/fail`         | 失败页   | 操作失败结果展示               |
| `/system/user`         | 用户管理 | 用户列表 + 增删改查            |
| `/system/role`         | 角色管理 | 角色列表 + 权限分配            |
| `/system/menu`         | 菜单管理 | 菜单树形管理 + 上级选择        |
| `/system/permission`   | 权限管理 | 权限列表 + 增删改查            |
| `/log/operation`       | 操作日志 | 操作记录 + 搜索筛选 + 导出      |
| `/log/login`           | 登录日志 | 登录/登出记录 + 搜索筛选        |
| `/message/notify`      | 通知公告 | 系统通知列表                   |
| `/message/inbox`       | 站内信   | 站内消息列表                   |
| `/403`                 | 403      | 无访问权限                     |
| `/500`                 | 500      | 服务器错误                     |

## 登录账号

Mock 环境下可用以下账号登录：

| 账号类型   | 用户名              | 密码           | 说明                                         |
| ---------- | ------------------- | -------------- | -------------------------------------------- |
| 超级管理员 | `super`             | `super`        | 拥有所有模块权限                             |
| 普通用户   | `user`              | `user`         | 仅基础权限（仪表盘/表单/列表/个人页），无系统管理 |
| 邮箱       | `super@example.com` | `super`        | 同超级管理员                                 |
| 手机       | `13900000002`       | 验证码 `123456`| 同超级管理员                                 |

## 开发约定

### API 响应格式

后端统一响应体，`utils/request.ts` 的拦截器会按 `code !== 200` 视为业务失败并抛出错误：

```ts
interface ApiResponse<T = unknown> {
  code: number // 200 成功，其他失败
  msg: string
  data: T
  request_id?: string
}
```

### 路由与菜单

路由数据定义在 `src/router/routes.ts`，同时作为后端菜单返回结构和前端降级兜底数据：

```ts
interface AsyncMenuItem {
  name: string           // 路由名称（唯一标识）
  title: string          // 菜单标题（中文）
  path: string           // 路由路径
  icon?: string          // lucide 图标名（仅一级菜单）
  component?: string      // 组件路径（相对于 src/views/，如 'dashboard/Analysis'）
  redirect?: string      // 重定向路径（父级菜单用）
  permission?: string    // 权限标识（匹配 userStore.permissions）
  hideInMenu?: boolean   // 是否在侧边栏隐藏
  keepAlive?: boolean    // 是否缓存页面
  affix?: boolean        // 标签页是否固定不可关闭
  children?: AsyncMenuItem[]
}
```

### 权限控制

**路由级权限**：在路由 `meta.permission` 中声明所需权限，路由守卫自动校验：

```ts
// routes.ts 中声明
{ name: 'SystemUser', path: '/system/user', permission: 'user', ... }
```

**按钮级权限**：使用 `v-permission` 指令控制元素显示：

```vue
<Button v-permission="'user'" @click="handleAdd">新增用户</Button>
<Button v-permission="['user', 'admin']">编辑</Button>
```

### 暗色模式

通过 `appStore` 管理主题，TailwindCSS v4 的暗色变体自动生效：

```ts
const appStore = useAppStore()
appStore.setTheme('dark')    // 手动切换
appStore.toggleTheme()        // 在 light/dark 间切换
appStore.isDark               // 当前是否暗色（computed）
```

在组件中使用 TailwindCSS 暗色变体：

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  自动适配明暗主题
</div>
```

### 基础组件使用

统一从 `@/components` 导入（含 charts 图表组件）：

```ts
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  message,
  confirm,
  Bar,           // 图表组件同样在统一入口导出
  ChartCard,
  MiniArea,
} from '@/components'
```

组件遵循 antd API 风格，支持 slot 扩展，统一 `size`（sm/md/lg）和 `variant`（filled/outline/dot）约定。

### 单元测试

测试文件位于根目录 `tests/`，使用 Vitest + @vue/test-utils：

```bash
npm run test          # 运行一次
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告
```

## 许可证

[Apache License 2.0](LICENSE) Copyright 2026 chihqiang
