"""
通用模块

提供统一的异常处理、响应格式和通用 Schema
"""

from .exceptions import (
    BUSINESS_CODE_MESSAGES,
    AppException,
    AuthenticationException,
    BusinessCode,
    BusinessException,
    DatabaseException,
    ExternalServiceException,
    PermissionException,
    RateLimitException,
    ResourceException,
    SystemException,
    ValidationException,
)
from .handlers import register_exception_handlers
from .responses import (
    ApiJSONResponse,
    ApiResponse,
    PaginatedData,
    PaginationMeta,
    error_response,
    get_request_id,
    paginated_response,
    success_response,
)
from .schemas import (
    BaseEntitySchema,
    BaseSchema,
    BatchOperationResult,
    BoolResponse,
    CountResponse,
    DateRangeParams,
    FileUploadResponse,
    FilterParams,
    HealthCheckResponse,
    IDMixin,
    IDResponse,
    KeyValuePair,
    ListResponse,
    MessageResponse,
    PaginationParams,
    SearchParams,
    SelectOption,
    TimestampMixin,
)

__all__ = [
    # 异常类
    "AppException",
    "AuthenticationException",
    "PermissionException",
    "ResourceException",
    "ValidationException",
    "BusinessException",
    "RateLimitException",
    "SystemException",
    "DatabaseException",
    "ExternalServiceException",
    # 状态码
    "BusinessCode",
    "BUSINESS_CODE_MESSAGES",
    # 处理器
    "register_exception_handlers",
    # 响应工具
    "ApiResponse",
    "ApiJSONResponse",
    "PaginationMeta",
    "PaginatedData",
    "success_response",
    "error_response",
    "paginated_response",
    "get_request_id",
    # Schema
    "BaseSchema",
    "BaseEntitySchema",
    "IDMixin",
    "TimestampMixin",
    "MessageResponse",
    "IDResponse",
    "CountResponse",
    "BoolResponse",
    "BatchOperationResult",
    "PaginationParams",
    "SearchParams",
    "DateRangeParams",
    "FilterParams",
    "ListResponse",
    "KeyValuePair",
    "SelectOption",
    "FileUploadResponse",
    "HealthCheckResponse",
]
