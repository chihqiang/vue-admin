/**
 * 工具函数 util.ts 单元测试
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { timeFix } from '@/utils/util'

describe('timeFix', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('早上 8 点返回"早上好"', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 8, 0, 0))
    expect(timeFix()).toBe('早上好')
  })

  it('上午 10 点返回"上午好"', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0))
    expect(timeFix()).toBe('上午好')
  })

  it('中午 12 点返回"中午好"', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 12, 0, 0))
    expect(timeFix()).toBe('中午好')
  })

  it('下午 15 点返回"下午好"', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 15, 0, 0))
    expect(timeFix()).toBe('下午好')
  })

  it('晚上 21 点返回"晚上好"', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 21, 0, 0))
    expect(timeFix()).toBe('晚上好')
  })
})
