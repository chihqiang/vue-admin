/**
 * 项目用到的 Lucide 图标白名单
 *
 * 说明：
 * - 直接的静态 `import { X } from '@lucide/vue'` 天然可 tree-shake，业务文件
 *   中继续保持这种用法即可。
 * - 只有 SideMenu.vue 这类"图标名来自字符串（route.meta.icon）"的动态场景
 *   才需要通过 `import * as Icons from '@/utils/lucide'` 取组件。
 * - 白名单通过显式 re-export 控制打包体积，避免把整个 @lucide/vue 全部打进来。
 *
 * 新增图标使用流程：
 *   1. 先在文件里静态 import 该图标 → tree-shake 会自动收录
 *   2. 如果图标名要"按字符串渲染"（菜单、可配置等），再在这里追加一行 export
 */
export {
  // ========== 一级菜单图标（SideMenu 通过 meta.icon 动态引用，必须在这里列出） ==========
  LayoutDashboard,
  FileText,
  Table,
  User,

  // ========== 顶栏 / HeaderBar ==========
  Menu as MenuIcon,
  ChevronRight,
  Settings,
  LogOut,
  ChevronDown,

  // ========== 布局 Logo / LoginHeader ==========
  ShieldCheck,

  // ========== 反馈/表单/导航等基础组件内部 ==========
  ChevronLeft,
  ChevronUp,
  ChevronsUpDown,
  X,
  Check,
  Minus,
  Calendar,
  LoaderCircle,
  Loader2,
  Upload as UploadIcon,
  File as FileIcon,
  AlertCircle,
  ZoomIn,
  RotateCw,
  RotateCcw,
  CheckCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Search,
  Star,
  ThumbsUp,
  MessageCircle,
  Download,
  Pencil,
  Share2,
  MoreHorizontal,
  Ellipsis,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Server,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  LogIn,
  CloudUpload,
  RefreshCw,
} from '@lucide/vue'
