/**
 * 错误类型定义
 *
 * 定义了项目中所有可能的错误类型，用于统一错误处理
 */

import { BusinessCode, BusinessCodeMessages } from "./api";

/**
 * 基础错误类
 * 所有自定义错误都应继承此类
 */
export class AppError extends Error {
  /** 业务状态码 */
  public readonly code: BusinessCode;
  /** HTTP 状态码 */
  public readonly httpStatus: number;
  /** 错误详情 */
  public readonly detail?: string;
  /** 额外数据 */
  public readonly data?: Record<string, unknown>;

  constructor(
    code: BusinessCode,
    message?: string,
    options?: {
      httpStatus?: number;
      detail?: string;
      data?: Record<string, unknown>;
    }
  ) {
    super(message || BusinessCodeMessages[code]);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = options?.httpStatus || 400;
    this.detail = options?.detail;
    this.data = options?.data;

    // 保持正确的原型链
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail,
      data: this.data,
    };
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AppError {
  constructor(
    code:
      | BusinessCode.AUTH_REQUIRED
      | BusinessCode.AUTH_INVALID_TOKEN
      | BusinessCode.AUTH_TOKEN_EXPIRED
      | BusinessCode.AUTH_INVALID_CREDENTIALS
      | BusinessCode.AUTH_USER_DISABLED = BusinessCode.AUTH_REQUIRED,
    message?: string,
    detail?: string
  ) {
    super(code, message, { httpStatus: 401, detail });
    this.name = "AuthenticationError";
  }
}

/**
 * 权限错误
 */
export class PermissionError extends AppError {
  constructor(
    code:
      | BusinessCode.PERMISSION_DENIED
      | BusinessCode.PERMISSION_INSUFFICIENT = BusinessCode.PERMISSION_DENIED,
    message?: string,
    detail?: string
  ) {
    super(code, message, { httpStatus: 403, detail });
    this.name = "PermissionError";
  }
}

/**
 * 资源错误
 */
export class ResourceError extends AppError {
  constructor(
    code:
      | BusinessCode.RESOURCE_NOT_FOUND
      | BusinessCode.RESOURCE_ALREADY_EXISTS
      | BusinessCode.RESOURCE_CONFLICT = BusinessCode.RESOURCE_NOT_FOUND,
    message?: string,
    detail?: string
  ) {
    const httpStatus =
      code === BusinessCode.RESOURCE_NOT_FOUND
        ? 404
        : code === BusinessCode.RESOURCE_CONFLICT
          ? 409
          : 400;
    super(code, message, { httpStatus, detail });
    this.name = "ResourceError";
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  /** 字段级错误列表 */
  public readonly fieldErrors: Array<{
    field: string;
    message: string;
    type?: string;
  }>;

  constructor(
    fieldErrors: Array<{ field: string; message: string; type?: string }>,
    message?: string
  ) {
    super(BusinessCode.VALIDATION_ERROR, message || "数据验证失败", {
      httpStatus: 422,
      data: { errors: fieldErrors },
    });
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.fieldErrors,
    };
  }
}

/**
 * 业务逻辑错误
 */
export class BusinessError extends AppError {
  constructor(message: string, detail?: string) {
    super(BusinessCode.BUSINESS_ERROR, message, { httpStatus: 400, detail });
    this.name = "BusinessError";
  }
}

/**
 * 频率限制错误
 */
export class RateLimitError extends AppError {
  /** 重试等待时间 (秒) */
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60, message?: string) {
    super(BusinessCode.RATE_LIMIT_EXCEEDED, message || "请求过于频繁", {
      httpStatus: 429,
      data: { retry_after: retryAfter },
    });
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * 系统错误
 */
export class SystemError extends AppError {
  constructor(
    code:
      | BusinessCode.INTERNAL_ERROR
      | BusinessCode.SERVICE_UNAVAILABLE
      | BusinessCode.DATABASE_ERROR
      | BusinessCode.EXTERNAL_SERVICE_ERROR = BusinessCode.INTERNAL_ERROR,
    message?: string,
    detail?: string
  ) {
    const httpStatus = code === BusinessCode.SERVICE_UNAVAILABLE ? 503 : 500;
    super(code, message, { httpStatus, detail });
    this.name = "SystemError";
  }
}

/**
 * 判断是否为 AppError 实例
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 从未知错误创建 AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new SystemError(
      BusinessCode.INTERNAL_ERROR,
      error.message,
      error.stack
    );
  }

  return new SystemError(
    BusinessCode.INTERNAL_ERROR,
    String(error)
  );
}
