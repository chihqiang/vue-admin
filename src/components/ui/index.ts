/**
 * 基础组件统一导出
 * 使用方式：import { Button, Modal, Tabs, Input, Select, Alert, alert, message, notification } from '@/components/ui'
 */

// 表单类
export { default as Button } from './Button.vue'
export { default as Input } from './Input.vue'
export { default as Select } from './Select.vue'
export { default as Checkbox } from './Checkbox.vue'
export { default as Radio } from './Radio.vue'
export { default as Switch } from './Switch.vue'
export { default as DatePicker } from './DatePicker.vue'
export { default as Upload } from './Upload.vue'

// 布局类
export { default as Divider } from './Divider.vue'
export { default as Card } from './Card.vue'
export { default as Collapse } from './Collapse.vue'
export { default as Steps } from './Steps.vue'
export { default as Breadcrumb } from './Breadcrumb.vue'

// 展示类
export { default as Tag } from './Tag.vue'
export { default as CheckableTag } from './CheckableTag.vue'
export { default as Avatar } from './Avatar.vue'
export { default as Badge } from './Badge.vue'
export { default as Empty } from './Empty.vue'
export { default as Progress } from './Progress.vue'
export { default as Timeline } from './Timeline.vue'
export { default as Spin } from './Spin.vue'
export { default as Skeleton } from './Skeleton.vue'

// 导航类
export { default as Tabs } from './Tabs.vue'
export { default as Pagination } from './Pagination.vue'
export { default as Dropdown } from './Dropdown.vue'

// 反馈类
export { default as Modal } from './Modal.vue'
export { default as Drawer } from './Drawer.vue'
export { default as Popover } from './Popover.vue'
export { default as Tooltip } from './Tooltip.vue'
export { Alert, alert } from './Alert'
export { default as message } from './Message'
export { default as notification } from './Notification'

// 数据类
export { default as Table } from './Table.vue'
export type { TableColumn } from '@/types/table'
export { default as Tree } from './Tree.vue'
export { default as Transfer } from './Transfer.vue'
