/**
 * 表格列配置
 * @template T 行数据类型
 */
export interface TableColumn<T extends object = Record<string, unknown>> {
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
