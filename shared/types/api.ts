/**
 * API 响应格式规范
 *
 * 所有 API 响应都应遵循此格式，确保前后端一致性
 */

/**
 * 统一 API 成功响应格式
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码 (0 表示成功，其他表示具体错误) */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
  /** 响应时间戳 (ISO 8601 格式) */
  timestamp: string;
  /** 请求追踪 ID (用于日志关联) */
  request_id?: string;
}

/**
 * 统一 API 错误响应格式
 */
export interface ApiErrorResponse {
  /** 业务状态码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 错误详情 (仅开发环境) */
  detail?: string;
  /** 字段级错误 (表单验证) */
  errors?: FieldError[];
  /** 响应时间戳 */
  timestamp: string;
  /** 请求追踪 ID */
  request_id?: string;
}

/**
 * 字段级验证错误
 */
export interface FieldError {
  /** 字段名称 */
  field: string;
  /** 错误消息 */
  message: string;
  /** 错误类型 */
  type?: string;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  /** 页码 (从 1 开始) */
  page?: number;
  /** 每页数量 */
  page_size?: number;
  /** 排序字段 */
  sort_by?: string;
  /** 排序方向 */
  sort_order?: "asc" | "desc";
}

/**
 * 分页响应元数据
 */
export interface PaginationMeta {
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  page_size: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  total_pages: number;
  /** 是否有下一页 */
  has_next: boolean;
  /** 是否有上一页 */
  has_prev: boolean;
}

/**
 * 分页响应数据
 * @template T - 列表项类型
 */
export interface PaginatedData<T> {
  /** 数据列表 */
  items: T[];
  /** 分页元数据 */
  pagination: PaginationMeta;
}

/**
 * 分页 API 响应
 * @template T - 列表项类型
 */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

/**
 * 业务状态码枚举
 *
 * 状态码规则:
 * - 0: 成功
 * - 1xxx: 认证相关错误
 * - 2xxx: 权限相关错误
 * - 3xxx: 资源相关错误
 * - 4xxx: 业务逻辑错误
 * - 5xxx: 系统错误
 */
export enum BusinessCode {
  // 成功
  SUCCESS = 0,

  // 认证相关 (1xxx)
  AUTH_REQUIRED = 1001,
  AUTH_INVALID_TOKEN = 1002,
  AUTH_TOKEN_EXPIRED = 1003,
  AUTH_INVALID_CREDENTIALS = 1004,
  AUTH_USER_DISABLED = 1005,

  // 权限相关 (2xxx)
  PERMISSION_DENIED = 2001,
  PERMISSION_INSUFFICIENT = 2002,

  // 资源相关 (3xxx)
  RESOURCE_NOT_FOUND = 3001,
  RESOURCE_ALREADY_EXISTS = 3002,
  RESOURCE_CONFLICT = 3003,

  // 业务逻辑错误 (4xxx)
  VALIDATION_ERROR = 4001,
  BUSINESS_ERROR = 4002,
  RATE_LIMIT_EXCEEDED = 4003,

  // 系统错误 (5xxx)
  INTERNAL_ERROR = 5001,
  SERVICE_UNAVAILABLE = 5002,
  DATABASE_ERROR = 5003,
  EXTERNAL_SERVICE_ERROR = 5004,
}

/**
 * 业务状态码对应的默认消息
 */
export const BusinessCodeMessages: Record<BusinessCode, string> = {
  [BusinessCode.SUCCESS]: "操作成功",
  [BusinessCode.AUTH_REQUIRED]: "请先登录",
  [BusinessCode.AUTH_INVALID_TOKEN]: "无效的认证令牌",
  [BusinessCode.AUTH_TOKEN_EXPIRED]: "认证令牌已过期",
  [BusinessCode.AUTH_INVALID_CREDENTIALS]: "用户名或密码错误",
  [BusinessCode.AUTH_USER_DISABLED]: "用户已被禁用",
  [BusinessCode.PERMISSION_DENIED]: "权限不足",
  [BusinessCode.PERMISSION_INSUFFICIENT]: "需要更高权限",
  [BusinessCode.RESOURCE_NOT_FOUND]: "资源不存在",
  [BusinessCode.RESOURCE_ALREADY_EXISTS]: "资源已存在",
  [BusinessCode.RESOURCE_CONFLICT]: "资源冲突",
  [BusinessCode.VALIDATION_ERROR]: "数据验证失败",
  [BusinessCode.BUSINESS_ERROR]: "业务处理失败",
  [BusinessCode.RATE_LIMIT_EXCEEDED]: "请求过于频繁",
  [BusinessCode.INTERNAL_ERROR]: "服务器内部错误",
  [BusinessCode.SERVICE_UNAVAILABLE]: "服务暂不可用",
  [BusinessCode.DATABASE_ERROR]: "数据库错误",
  [BusinessCode.EXTERNAL_SERVICE_ERROR]: "外部服务错误",
};

/**
 * HTTP 状态码到业务状态码的映射
 */
export const HttpToBusinessCode: Record<number, BusinessCode> = {
  400: BusinessCode.VALIDATION_ERROR,
  401: BusinessCode.AUTH_REQUIRED,
  403: BusinessCode.PERMISSION_DENIED,
  404: BusinessCode.RESOURCE_NOT_FOUND,
  409: BusinessCode.RESOURCE_CONFLICT,
  422: BusinessCode.VALIDATION_ERROR,
  429: BusinessCode.RATE_LIMIT_EXCEEDED,
  500: BusinessCode.INTERNAL_ERROR,
  502: BusinessCode.EXTERNAL_SERVICE_ERROR,
  503: BusinessCode.SERVICE_UNAVAILABLE,
};
