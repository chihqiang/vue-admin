/**
 * localStorage 封装工具单元测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  storageGet,
  storageSet,
  storageGetJSON,
  storageSetJSON,
  storageRemove,
  storageClear,
} from '@/utils/storage'

describe('storage utils', () => {
  beforeEach(() => {
    // 每个测试前清空 localStorage
    localStorage.clear()
  })

  describe('storageGet / storageSet', () => {
    it('写入字符串后可以读取', () => {
      storageSet('key1', 'value1')
      expect(storageGet('key1')).toBe('value1')
    })

    it('不存在的 key 返回 null', () => {
      expect(storageGet('nonexistent')).toBeNull()
    })
  })

  describe('storageGetJSON / storageSetJSON', () => {
    it('写入 JSON 对象后可以正确读取', () => {
      const obj = { name: 'admin', age: 30, nested: { a: 1 } }
      storageSetJSON('user', obj)
      expect(storageGetJSON('user')).toEqual(obj)
    })

    it('写入数组后可以正确读取', () => {
      const arr = [1, 2, 3]
      storageSetJSON('list', arr)
      expect(storageGetJSON<number[]>('list')).toEqual(arr)
    })

    it('JSON 解析失败时返回 null', () => {
      localStorage.setItem('bad', '{invalid json}')
      expect(storageGetJSON('bad')).toBeNull()
    })

    it('不存在的 key 返回 null', () => {
      expect(storageGetJSON('nonexistent')).toBeNull()
    })
  })

  describe('storageRemove', () => {
    it('删除已存在的 key', () => {
      storageSet('key1', 'value1')
      storageRemove('key1')
      expect(storageGet('key1')).toBeNull()
    })

    it('删除不存在的 key 不报错', () => {
      expect(() => storageRemove('nonexistent')).not.toThrow()
    })
  })

  describe('storageClear', () => {
    it('清空所有存储', () => {
      storageSet('key1', 'value1')
      storageSet('key2', 'value2')
      storageClear()
      expect(storageGet('key1')).toBeNull()
      expect(storageGet('key2')).toBeNull()
    })
  })
})
