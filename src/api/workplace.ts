/**
 * 工作台相关接口
 */
import request from '@/utils/request'

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

/** 获取进行中的项目列表 */
export function getProjects() {
  return request.get<WorkplaceProject[]>('/workplace/projects')
}

/** 获取用户动态列表 */
export function getActivity() {
  return request.get<WorkplaceActivity[]>('/workplace/activity')
}

/** 获取团队成员列表（工作台/个人中心页亦复用） */
export function getTeams() {
  return request.get<TeamMember[]>('/workplace/teams')
}

/** 获取雷达图数据 */
export function getRadar() {
  return request.get<RadarItem[]>('/workplace/radar')
}
