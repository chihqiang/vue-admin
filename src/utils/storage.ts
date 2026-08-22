/**
 * localStorage 统一封装
 *
 * - 统一 JSON 序列化/反序列化，避免业务层到处写 try/catch JSON.parse
 * - 所有"需要持久化的全局键名"（token、collapsed 等）只在各自模块
 *   里声明常量，底层不感知业务字段
 * - SSR 安全：SSR 环境（无 window）时退化到内存 map，避免崩溃
 *   （当前项目纯 SPA，但预留扩展性）
 */

const memory = new Map<string, string>()

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

/** 读取字符串，key 不存在返回 null */
export function storageGet(key: string): string | null {
  if (hasLocalStorage()) {
    return window.localStorage.getItem(key)
  }
  return memory.get(key) ?? null
}

/** 读取并 JSON.parse，失败或不存在返回 null */
export function storageGetJSON<T = unknown>(key: string): T | null {
  const raw = storageGet(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** 写入字符串 */
export function storageSet(key: string, value: string): void {
  if (hasLocalStorage()) {
    window.localStorage.setItem(key, value)
  } else {
    memory.set(key, value)
  }
}

/** 写入任意 JSON 可序列化值 */
export function storageSetJSON<T = unknown>(key: string, value: T): void {
  storageSet(key, JSON.stringify(value))
}

/** 删除 key */
export function storageRemove(key: string): void {
  if (hasLocalStorage()) {
    window.localStorage.removeItem(key)
  } else {
    memory.delete(key)
  }
}

/** 清空全部（一般只在登出等极端场景使用） */
export function storageClear(): void {
  if (hasLocalStorage()) {
    window.localStorage.clear()
  } else {
    memory.clear()
  }
}
