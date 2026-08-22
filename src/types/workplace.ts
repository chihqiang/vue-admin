/**
 * 工作台相关类型定义
 */

/** 进行中的项目 */
export interface WorkplaceProject {
  id: string
  cover: string
  title: string
  description: string
  group: string
  updatedAt: string
}

/** 用户动态 */
export interface WorkplaceActivity {
  user: { nickname: string; avatar: string }
  project: { name: string; action: string; event: string }
  time: string
}

/** 团队成员（工作台/个人中心共用） */
export interface TeamMember {
  name: string
  avatar: string
}

/** 雷达图数据项 */
export interface RadarItem {
  item: string
  个人: number
  团队: number
  部门: number
}
