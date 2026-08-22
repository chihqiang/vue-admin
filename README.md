# vue-tailwind-template

> 基于 Vue 3 + TypeScript + TailwindCSS 的中后台前端模板，开箱即用。

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev/)
[![License](https://img.shields.io/badge/license-Private-red.svg)]()

## 目录

- [特性](#特性)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [页面路由](#页面路由)
- [登录账号](#登录账号)
- [开发约定](#开发约定)
- [许可证](#许可证)

## 特性

- **Vue 3 + TypeScript**：Composition API + `<script setup>` 全量类型检查
- **TailwindCSS 4**：通过 `@tailwindcss/vite` 插件集成，原子化 CSS
- **Vite 8**：Rolldown 内核，极速冷启动与 HMR
- **Pinia 4**：Setup Store 风格状态管理
- **基础组件库**：40+ 组件按 form/layout/display/navigation/feedback/data 分类，antd API 风格
- **ECharts 6 封装**：统一模块注册，按需分包，迷你图/卡片图/排行榜开箱即用
- **Mock.js**：开发环境模拟接口，切换生产环境自动禁用
- **路由即菜单**：路由配置与侧边栏菜单合并，`route.meta` 承载菜单元信息
- **ESLint + OxLint**：双引擎 Lint，零配置错误

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
| 请求   | Axios                                        |
| Mock   | Mock.js（仅开发环境）                        |
| Lint   | ESLint + OxLint + Prettier                   |

## 环境要求

- Node.js `^22.18.0` 或 `>=24.12.0`

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查 + 生产构建
npm run build

# 代码检查（oxlint + eslint）
npm run lint

# 代码格式化
npm run format
```

## 目录结构

```text
src/
├── api/                  # 接口封装（axios）
│   ├── login.ts          #   登录接口
│   └── workplace.ts      #   工作台接口
├── assets/
│   └── main.css          # 全局样式（Tailwind 入口 + 基础样式）
├── components/
│   ├── charts/           # 图表组件（基于 ECharts 封装）
│   │   ├── echarts.ts    #   ECharts 模块统一注册
│   │   ├── Bar.vue       #   柱状图
│   │   ├── ChartCard.vue #   图表卡片
│   │   ├── MiniArea.vue  #   迷你面积图
│   │   ├── MiniBar.vue   #   迷你柱状图
│   │   ├── MiniProgress.vue
│   │   ├── MiniSmoothArea.vue
│   │   └── RankList.vue  #   排行榜
│   ├── form/             # 表单组件：Button, Input, Select, Checkbox, Radio, Switch, DatePicker, Upload
│   ├── layout/           # 布局组件：Divider, Card, Collapse, Steps, Breadcrumb
│   ├── display/          # 展示组件：Tag, Avatar, Badge, Empty, Progress, Timeline, Spin, Skeleton, Statistic, Image, QRCode, Watermark, Trend
│   ├── navigation/       # 导航组件：Tabs, Pagination, Dropdown, Segmented, Carousel
│   ├── feedback/         # 反馈组件：Modal, Drawer, Popover, Tooltip, confirm, alert, message, notification
│   └── data/             # 数据组件：Table, Tree, TreeSelect, Transfer, Cascader
├── layouts/              # 布局组件
│   ├── BasicLayout.vue   #   主布局（侧边栏 + 顶栏 + 内容区）
│   ├── HeaderBar.vue     #   顶栏
│   └── SideMenu.vue      #   侧边栏菜单
├── mock/                 # Mock 服务（仅开发环境）
│   ├── services/         #   各模块 mock 实现
│   └── index.ts          #   Mock 入口
├── router/
│   └── index.ts          # 路由 + 菜单配置（合并，无单独 menu.ts）
├── stores/               # Pinia 状态管理
│   └── user.ts           #   用户状态（token、登录态、用户信息）
├── types/                # 类型定义
│   ├── api.ts            #   API 响应格式
│   ├── table.ts          #   表格列类型
│   ├── user.ts           #   用户类型
│   └── workplace.ts      #   工作台类型
├── utils/
│   ├── request.ts        # axios 封装（拦截器、错误处理）
│   └── util.ts           # 通用工具函数
├── views/                # 页面
│   ├── auth/             #   登录
│   ├── dashboard/        #   仪表盘
│   ├── form/             #   表单页
│   ├── list/             #   列表页
│   └── profile/          #   个人页
├── App.vue
└── main.ts
```

## 页面路由

| 路径                  | 页面     | 说明                           |
| --------------------- | -------- | ------------------------------ |
| `/login`              | 登录页   | 账号 / 手机 / 社交三种登录方式 |
| `/dashboard/analysis` | 分析页   | 销售趋势、访问量等数据可视化   |
| `/dashboard/workplace`| 工作台   | 项目进度、团队动态、雷达图     |
| `/dashboard/monitor`  | 监控页   | 实时监控、活动日志、流量分布   |
| `/form/basic-form`    | 基础表单 | 单列表单                       |
| `/form/step-form`     | 分步表单 | 三步流程表单                   |
| `/form/advanced-form` | 高级表单 | 多模块表单 + 可编辑表格        |
| `/list/basic`         | 基础列表 | 标准列表 + 分页                |
| `/list/search`        | 搜索列表 | 搜索 + 分类筛选                |
| `/profile/advanced`   | 个人中心 | 用户详情 + 动态                |
| `/profile/basic`      | 基本设置 | 个人信息编辑                   |

## 登录账号

Mock 环境下可用以下账号登录：

| 账号类型   | 用户名              | 密码           |
| ---------- | ------------------- | -------------- |
| 管理员     | `admin`             | `admin`        |
| 超级管理员 | `super`             | `super`        |
| 邮箱       | `admin@example.com` | `admin`        |
| 手机       | `13800000001`       | 验证码 `123456`|

## 开发约定

### API 响应格式

```ts
interface ApiResponse<T = unknown> {
  code: number // 200 成功，其他失败
  msg: string
  data: T
  request_id?: string
}
```

### 路由与菜单

路由即菜单，菜单即路由——所有菜单字段放在 `route.meta` 中：

```ts
interface RouteMeta {
  title?: string // 页面/菜单标题（中文，无国际化）
  icon?: string // lucide 图标组件名（仅一级菜单）
  hideInMenu?: boolean // 是否在侧边栏隐藏
  hideInBreadcrumb?: boolean // 是否在面包屑隐藏
  requiresAuth?: boolean // 是否需要登录
  permission?: string // 权限标识
}
```

### 基础组件使用

统一从 `@/components` 导入：

```ts
import { Button, Input, Modal, message, confirm } from '@/components'
```

组件遵循 antd API 风格，支持 slot 扩展，统一 `size`（sm/md/lg）和 `variant`（filled/outline/dot）约定。

## 许可证

[Apache License 2.0](LICENSE) Copyright 2026 chihqiang
