/**
 * @autotemu/shared - AutoTemu 项目共享类型和工具库
 *
 * 此库提供前后端共享的类型定义、错误处理和通用工具
 *
 * @example
 * ```typescript
 * import { ApiResponse, BusinessCode, AppError } from '@autotemu/shared';
 *
 * // 使用 API 响应类型
 * const response: ApiResponse<User> = {
 *   code: BusinessCode.SUCCESS,
 *   message: '操作成功',
 *   data: user,
 *   timestamp: new Date().toISOString()
 * };
 * ```
 */

// 导出所有类型
export * from "./types";

// 版本信息
export const VERSION = "1.0.0";
