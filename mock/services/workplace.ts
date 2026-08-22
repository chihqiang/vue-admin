/**
 * 工作台 Mock：项目列表、动态、团队、雷达图数据
 */
import Mock from 'mockjs'
import { builder } from '../util'

// ========== 进行中的项目 ==========
const projects = [
  {
    id: '1',
    cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p1&backgroundColor=1890ff',
    title: 'vue-admin',
    description: '基于 Vue 3 + TypeScript + TailwindCSS 的企业级中后台脚手架',
    group: '科学搬砖组',
    updatedAt: '9小时前',
  },
  {
    id: '2',
    cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p2&backgroundColor=52c41a',
    title: '前端脚手架工具链',
    description: '集成了 Vite、ESLint、Prettier、Husky 的前端工程化方案',
    group: '平台架构组',
    updatedAt: '2小时前',
  },
  {
    id: '3',
    cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p3&backgroundColor=722ed1',
    title: '组件库文档站',
    description: '使用 VitePress 搭建的组件库文档和在线演示平台',
    group: '体验技术组',
    updatedAt: '1天前',
  },
  {
    id: '4',
    cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p4&backgroundColor=fa8c16',
    title: '数据可视化大屏',
    description: '基于 ECharts 的实时数据监控大屏，支持自适应和多屏联动',
    group: '数据产品组',
    updatedAt: '3天前',
  },
  {
    id: '5',
    cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p5&backgroundColor=eb2f96',
    title: '移动端 H5 商城',
    description: '使用 Vant + Vue 3 构建的移动端电商方案，已上线运营',
    group: '移动前端组',
    updatedAt: '5天前',
  },
  {
    id: '6',
    cover: 'https://api.dicebear.com/7.x/shapes/svg?seed=p6&backgroundColor=13c2c2',
    title: '权限管理系统',
    description: '基于 RBAC 模型的细粒度权限控制系统，支持菜单和按钮级别',
    group: '基础架构组',
    updatedAt: '1周前',
  },
]

// ========== 动态 ==========
const activities = [
  {
    user: {
      nickname: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    },
    project: { name: 'vue-admin', action: '更新了', event: '登录页面' },
    time: '3 分钟前',
  },
  {
    user: {
      nickname: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    },
    project: { name: '前端脚手架工具链', action: '发布了', event: 'v1.2.0 版本' },
    time: '1 小时前',
  },
  {
    user: {
      nickname: '王五',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    },
    project: { name: '组件库文档站', action: '完成了', event: '按钮组件文档' },
    time: '3 小时前',
  },
  {
    user: {
      nickname: '赵六',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    },
    project: { name: '数据可视化大屏', action: '提交了', event: '雷达图组件' },
    time: '5 小时前',
  },
  {
    user: {
      nickname: '孙七',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi',
    },
    project: { name: '权限管理系统', action: '修复了', event: '角色分配 Bug' },
    time: '8 小时前',
  },
  {
    user: {
      nickname: '周八',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba',
    },
    project: { name: '移动端 H5 商城', action: '新增了', event: '购物车功能' },
    time: '12 小时前',
  },
]

// ========== 团队成员 ==========
const teams = [
  { name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan' },
  { name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' },
  { name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu' },
  { name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu' },
  { name: '孙七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi' },
  { name: '周八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba' },
]

// ========== 雷达图数据 ==========
const radarData = [
  { item: '引用', 个人: 70, 团队: 30, 部门: 40 },
  { item: '口碑', 个人: 60, 团队: 70, 部门: 40 },
  { item: '产量', 个人: 50, 团队: 60, 部门: 40 },
  { item: '贡献', 个人: 40, 团队: 50, 部门: 40 },
  { item: '热度', 个人: 60, 团队: 70, 部门: 40 },
  { item: '产出', 个人: 70, 团队: 50, 部门: 40 },
]

// ========== 注册 mock ==========
Mock.mock(/\/workplace\/projects/, 'get', () => builder(projects))
Mock.mock(/\/workplace\/activity/, 'get', () => builder(activities))
Mock.mock(/\/workplace\/teams/, 'get', () => builder(teams))
Mock.mock(/\/workplace\/radar/, 'get', () => builder(radarData))
