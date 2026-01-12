/**
 * 类型导出入口
 */

// API 相关类型
export type {
  ApiResponse,
  ApiErrorResponse,
  FieldError,
  PaginationParams,
  PaginationMeta,
  PaginatedData,
  PaginatedResponse,
} from "./api";

export { BusinessCode, BusinessCodeMessages, HttpToBusinessCode } from "./api";

// 错误类型
export {
  AppError,
  AuthenticationError,
  PermissionError,
  ResourceError,
  ValidationError,
  BusinessError,
  RateLimitError,
  SystemError,
  isAppError,
  toAppError,
} from "./errors";

// 通用类型
export type {
  UUID,
  ISODateTime,
  Nullable,
  Optional,
  DeepPartial,
  DeepReadonly,
  NonNullableFields,
  BaseEntity,
  SoftDeletableEntity,
  SortOrder,
  SortConfig,
  FilterCondition,
  QueryParams,
  KeyValue,
  Tag,
  FileInfo,
  GeoLocation,
  DateRange,
  NumberRange,
  OperationResult,
  BatchOperationResult,
  SelectOption,
  TreeNode,
} from "./common";

export { UserRole, UserStatus, FilterOperator } from "./common";
