import { type FieldError, BusinessCode, BusinessCodeMessages } from "@autotemu/shared";

/**
 * API 错误响应接口（兼容旧格式）
 */
interface LegacyApiError {
  detail?: string;
}

/**
 * 统一 API 错误响应接口
 */
interface UnifiedApiError {
  code?: number;
  message?: string;
  detail?: string;
  errors?: FieldError[];
}

/**
 * 从 API 错误响应中提取错误消息
 * 支持新的统一格式和旧的 detail 格式
 *
 * @param error - API 返回的错误对象
 * @param defaultMessage - 如果无法提取错误信息，使用的默认消息
 * @returns 错误消息字符串
 */
export function extractErrorMessage(
  error: UnifiedApiError | LegacyApiError | unknown,
  defaultMessage: string
): string {
  if (!error || typeof error !== "object") {
    return defaultMessage;
  }

  const err = error as UnifiedApiError;

  // 优先使用新格式的 message
  if (err.message && typeof err.message === "string") {
    return err.message;
  }

  // 兼容旧格式的 detail
  if (err.detail && typeof err.detail === "string") {
    return err.detail;
  }

  // 根据业务状态码获取默认消息
  if (err.code && err.code in BusinessCodeMessages) {
    return BusinessCodeMessages[err.code as BusinessCode];
  }

  return defaultMessage;
}

/**
 * 从 API 错误响应中提取字段级错误
 *
 * @param error - API 返回的错误对象
 * @returns 字段错误列表
 */
export function extractFieldErrors(error: UnifiedApiError | unknown): FieldError[] {
  if (!error || typeof error !== "object") {
    return [];
  }

  const err = error as UnifiedApiError;
  return err.errors || [];
}

/**
 * 判断是否为认证错误
 *
 * @param error - API 返回的错误对象
 * @returns 是否为认证错误
 */
export function isAuthenticationError(error: UnifiedApiError | unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as UnifiedApiError;
  const authCodes = [
    BusinessCode.AUTH_REQUIRED,
    BusinessCode.AUTH_INVALID_TOKEN,
    BusinessCode.AUTH_TOKEN_EXPIRED,
    BusinessCode.AUTH_INVALID_CREDENTIALS,
    BusinessCode.AUTH_USER_DISABLED,
  ];

  return err.code !== undefined && authCodes.includes(err.code);
}

/**
 * 判断是否为权限错误
 *
 * @param error - API 返回的错误对象
 * @returns 是否为权限错误
 */
export function isPermissionError(error: UnifiedApiError | unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as UnifiedApiError;
  const permissionCodes = [BusinessCode.PERMISSION_DENIED, BusinessCode.PERMISSION_INSUFFICIENT];

  return err.code !== undefined && permissionCodes.includes(err.code);
}

/**
 * 判断是否为验证错误
 *
 * @param error - API 返回的错误对象
 * @returns 是否为验证错误
 */
export function isValidationError(error: UnifiedApiError | unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as UnifiedApiError;
  return err.code === BusinessCode.VALIDATION_ERROR;
}

/**
 * 判断是否为资源不存在错误
 *
 * @param error - API 返回的错误对象
 * @returns 是否为资源不存在错误
 */
export function isNotFoundError(error: UnifiedApiError | unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as UnifiedApiError;
  return err.code === BusinessCode.RESOURCE_NOT_FOUND;
}

/**
 * 获取业务状态码
 *
 * @param error - API 返回的错误对象
 * @returns 业务状态码，如果不存在则返回 undefined
 */
export function getBusinessCode(error: UnifiedApiError | unknown): BusinessCode | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const err = error as UnifiedApiError;
  return err.code as BusinessCode | undefined;
}
