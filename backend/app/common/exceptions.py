"""
统一异常处理模块

定义了项目中所有自定义异常类，用于统一错误处理和响应格式
"""

from enum import IntEnum
from typing import Any


class BusinessCode(IntEnum):
    """
    业务状态码枚举

    状态码规则:
    - 0: 成功
    - 1xxx: 认证相关错误
    - 2xxx: 权限相关错误
    - 3xxx: 资源相关错误
    - 4xxx: 业务逻辑错误
    - 5xxx: 系统错误
    """

    # 成功
    SUCCESS = 0

    # 认证相关 (1xxx)
    AUTH_REQUIRED = 1001
    AUTH_INVALID_TOKEN = 1002
    AUTH_TOKEN_EXPIRED = 1003
    AUTH_INVALID_CREDENTIALS = 1004
    AUTH_USER_DISABLED = 1005

    # 权限相关 (2xxx)
    PERMISSION_DENIED = 2001
    PERMISSION_INSUFFICIENT = 2002

    # 资源相关 (3xxx)
    RESOURCE_NOT_FOUND = 3001
    RESOURCE_ALREADY_EXISTS = 3002
    RESOURCE_CONFLICT = 3003

    # 业务逻辑错误 (4xxx)
    VALIDATION_ERROR = 4001
    BUSINESS_ERROR = 4002
    RATE_LIMIT_EXCEEDED = 4003

    # 系统错误 (5xxx)
    INTERNAL_ERROR = 5001
    SERVICE_UNAVAILABLE = 5002
    DATABASE_ERROR = 5003
    EXTERNAL_SERVICE_ERROR = 5004


# 业务状态码默认消息
BUSINESS_CODE_MESSAGES: dict[BusinessCode, str] = {
    BusinessCode.SUCCESS: "操作成功",
    BusinessCode.AUTH_REQUIRED: "请先登录",
    BusinessCode.AUTH_INVALID_TOKEN: "无效的认证令牌",
    BusinessCode.AUTH_TOKEN_EXPIRED: "认证令牌已过期",
    BusinessCode.AUTH_INVALID_CREDENTIALS: "用户名或密码错误",
    BusinessCode.AUTH_USER_DISABLED: "用户已被禁用",
    BusinessCode.PERMISSION_DENIED: "权限不足",
    BusinessCode.PERMISSION_INSUFFICIENT: "需要更高权限",
    BusinessCode.RESOURCE_NOT_FOUND: "资源不存在",
    BusinessCode.RESOURCE_ALREADY_EXISTS: "资源已存在",
    BusinessCode.RESOURCE_CONFLICT: "资源冲突",
    BusinessCode.VALIDATION_ERROR: "数据验证失败",
    BusinessCode.BUSINESS_ERROR: "业务处理失败",
    BusinessCode.RATE_LIMIT_EXCEEDED: "请求过于频繁",
    BusinessCode.INTERNAL_ERROR: "服务器内部错误",
    BusinessCode.SERVICE_UNAVAILABLE: "服务暂不可用",
    BusinessCode.DATABASE_ERROR: "数据库错误",
    BusinessCode.EXTERNAL_SERVICE_ERROR: "外部服务错误",
}


class AppException(Exception):
    """
    应用基础异常类

    所有自定义异常都应继承此类
    """

    def __init__(
        self,
        code: BusinessCode,
        message: str | None = None,
        http_status: int = 400,
        detail: str | None = None,
        data: dict[str, Any] | None = None,
    ) -> None:
        self.code = code
        self.message = message or BUSINESS_CODE_MESSAGES.get(code, "未知错误")
        self.http_status = http_status
        self.detail = detail
        self.data = data or {}
        super().__init__(self.message)

    def to_dict(self) -> dict[str, Any]:
        """转换为字典格式"""
        result: dict[str, Any] = {
            "code": self.code,
            "message": self.message,
        }
        if self.detail:
            result["detail"] = self.detail
        if self.data:
            result["data"] = self.data
        return result


class AuthenticationException(AppException):
    """认证异常"""

    def __init__(
        self,
        code: BusinessCode = BusinessCode.AUTH_REQUIRED,
        message: str | None = None,
        detail: str | None = None,
    ) -> None:
        super().__init__(
            code=code,
            message=message,
            http_status=401,
            detail=detail,
        )


class PermissionException(AppException):
    """权限异常"""

    def __init__(
        self,
        code: BusinessCode = BusinessCode.PERMISSION_DENIED,
        message: str | None = None,
        detail: str | None = None,
    ) -> None:
        super().__init__(
            code=code,
            message=message,
            http_status=403,
            detail=detail,
        )


class ResourceException(AppException):
    """资源异常"""

    def __init__(
        self,
        code: BusinessCode = BusinessCode.RESOURCE_NOT_FOUND,
        message: str | None = None,
        detail: str | None = None,
        resource_type: str | None = None,
        resource_id: str | None = None,
    ) -> None:
        http_status = 404 if code == BusinessCode.RESOURCE_NOT_FOUND else 409
        data = {}
        if resource_type:
            data["resource_type"] = resource_type
        if resource_id:
            data["resource_id"] = resource_id

        super().__init__(
            code=code,
            message=message,
            http_status=http_status,
            detail=detail,
            data=data if data else None,
        )


class ValidationException(AppException):
    """验证异常"""

    def __init__(
        self,
        errors: list[dict[str, str]] | None = None,
        message: str | None = None,
    ) -> None:
        """
        Args:
            errors: 字段级错误列表，格式: [{"field": "email", "message": "邮箱格式错误"}]
            message: 总体错误消息
        """
        self.errors = errors or []
        super().__init__(
            code=BusinessCode.VALIDATION_ERROR,
            message=message or "数据验证失败",
            http_status=422,
            data={"errors": self.errors} if self.errors else None,
        )


class BusinessException(AppException):
    """业务逻辑异常"""

    def __init__(
        self,
        message: str,
        detail: str | None = None,
        data: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            code=BusinessCode.BUSINESS_ERROR,
            message=message,
            http_status=400,
            detail=detail,
            data=data,
        )


class RateLimitException(AppException):
    """频率限制异常"""

    def __init__(
        self,
        retry_after: int = 60,
        message: str | None = None,
    ) -> None:
        self.retry_after = retry_after
        super().__init__(
            code=BusinessCode.RATE_LIMIT_EXCEEDED,
            message=message or "请求过于频繁",
            http_status=429,
            data={"retry_after": retry_after},
        )


class SystemException(AppException):
    """系统异常"""

    def __init__(
        self,
        code: BusinessCode = BusinessCode.INTERNAL_ERROR,
        message: str | None = None,
        detail: str | None = None,
    ) -> None:
        http_status = 503 if code == BusinessCode.SERVICE_UNAVAILABLE else 500
        super().__init__(
            code=code,
            message=message,
            http_status=http_status,
            detail=detail,
        )


class DatabaseException(SystemException):
    """数据库异常"""

    def __init__(
        self,
        message: str | None = None,
        detail: str | None = None,
    ) -> None:
        super().__init__(
            code=BusinessCode.DATABASE_ERROR,
            message=message or "数据库操作失败",
            detail=detail,
        )


class ExternalServiceException(SystemException):
    """外部服务异常"""

    def __init__(
        self,
        service_name: str,
        message: str | None = None,
        detail: str | None = None,
    ) -> None:
        super().__init__(
            code=BusinessCode.EXTERNAL_SERVICE_ERROR,
            message=message or f"外部服务 {service_name} 调用失败",
            detail=detail,
        )
