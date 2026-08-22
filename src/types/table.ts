/** 表格列配置 */
export interface TableColumn {
  /** 列标题 */
  title: string
  /** 对应数据的字段名 */
  dataIndex: string
  /** 列宽（CSS 值，如 '200px' 或 '20%'） */
  width?: string
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
}
