/**
 * 工作台相关接口
 */
import request from '@/utils/request'
import type {
  WorkplaceProject,
  WorkplaceActivity,
  TeamMember,
  RadarItem,
} from '@/types/workplace'

/** 接口 URL 常量 */
const URL = {
  Projects: '/workplace/projects',
  Activity: '/workplace/activity',
  Teams: '/workplace/teams',
  Radar: '/workplace/radar',
} as const

/** 获取进行中的项目列表 */
export function getProjects() {
  return request.get<unknown, WorkplaceProject[]>(URL.Projects)
}

/** 获取用户动态列表 */
export function getActivity() {
  return request.get<unknown, WorkplaceActivity[]>(URL.Activity)
}

/** 获取团队成员列表（个人中心页亦复用） */
export function getTeams() {
  return request.get<unknown, TeamMember[]>(URL.Teams)
}

/** 获取雷达图数据 */
export function getRadar() {
  return request.get<unknown, RadarItem[]>(URL.Radar)
}
