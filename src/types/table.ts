/**
 * 表格列配置
 * @template T 行数据类型
 */
// 泛型约束用 any：TS 接口不自动满足 Record<string, unknown>，需 any 保证消费者任意接口可用
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableColumn<T extends Record<string, any> = Record<string, any>> {
  /** 列标题 */
  title: string
  /** 对应数据的字段名 */
  dataIndex: string
  /** 列宽（CSS 值，如 '200px' 或 '20%'） */
  width?: string
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 固定列位置 */
  fixed?: 'left' | 'right'
  /** 自定义渲染函数 */
  render?: (row: T, index: number) => string
}
