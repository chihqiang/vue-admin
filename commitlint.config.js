/**
 * commitlint 配置
 *
 * 约定式提交规范（Conventional Commits）：
 *   <type>(<scope>): <subject>
 *
 * 允许的 type 类型：
 *   feat     → 新功能
 *   fix      → 修复 bug
 *   docs     → 文档变更
 *   style    → 代码格式（不影响功能的变更，如空格、分号等）
 *   refactor → 代码重构（既不是新功能也不是修 bug）
 *   perf     → 性能优化
 *   test     → 添加或修改测试
 *   build    → 构建系统或外部依赖的变更
 *   ci       → CI 配置或脚本的变更
 *   chore    → 其他杂项（如构建流程、依赖管理）
 *   revert   → 回退之前的提交
 *   types    → 类型定义文件变更
 *
 * 示例：
 *   feat(router): add permission guard
 *   fix(login): handle 401 redirect loop
 *   refactor(stores): extract storage layer
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // type 不能为空
    'type-empty': [2, 'never'],
    // type 必须小写
    'type-case': [2, 'always', 'lower-case'],
    // scope 可选，小写
    'scope-case': [0, 'always', 'lower-case'],
    // subject 首字母不要大写
    'subject-case': [0],
    // header 最多 100 个字符
    'header-max-length': [2, 'always', 100],
  },
}