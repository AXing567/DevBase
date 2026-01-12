"""
统一响应格式模块

提供统一的 API 响应格式工具函数和类
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .exceptions import BUSINESS_CODE_MESSAGES, BusinessCode

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一 API 响应格式"""

    code: int = Field(default=0, description="业务状态码")
    message: str = Field(default="操作成功", description="响应消息")
    data: T | None = Field(default=None, description="响应数据")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="响应时间戳",
    )
    request_id: str | None = Field(default=None, description="请求追踪 ID")


class PaginationMeta(BaseModel):
    """分页元数据"""

    page: int = Field(ge=1, description="当前页码")
    page_size: int = Field(ge=1, le=100, description="每页数量")
    total: int = Field(ge=0, description="总记录数")
    total_pages: int = Field(ge=0, description="总页数")
    has_next: bool = Field(description="是否有下一页")
    has_prev: bool = Field(description="是否有上一页")


class PaginatedData(BaseModel, Generic[T]):
    """分页数据"""

    items: list[T] = Field(description="数据列表")
    pagination: PaginationMeta = Field(description="分页元数据")


def get_request_id(request: Request | None = None) -> str:
    """
    获取或生成请求 ID

    优先从请求头获取，否则生成新的 UUID
    """
    if request:
        request_id = request.headers.get("X-Request-ID")
        if request_id:
            return request_id
    return str(uuid.uuid4())


def success_response(
    data: Any = None,
    message: str = "操作成功",
    request: Request | None = None,
) -> dict[str, Any]:
    """
    创建成功响应

    Args:
        data: 响应数据
        message: 响应消息
        request: FastAPI 请求对象（用于获取 request_id）

    Returns:
        响应字典
    """
    return {
        "code": BusinessCode.SUCCESS,
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request_id": get_request_id(request),
    }


def error_response(
    code: BusinessCode,
    message: str | None = None,
    detail: str | None = None,
    errors: list[dict[str, str]] | None = None,
    request: Request | None = None,
) -> dict[str, Any]:
    """
    创建错误响应

    Args:
        code: 业务状态码
        message: 错误消息
        detail: 错误详情（仅开发环境显示）
        errors: 字段级错误列表
        request: FastAPI 请求对象

    Returns:
        响应字典
    """
    response: dict[str, Any] = {
        "code": code,
        "message": message or BUSINESS_CODE_MESSAGES.get(code, "未知错误"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request_id": get_request_id(request),
    }

    if detail:
        response["detail"] = detail
    if errors:
        response["errors"] = errors

    return response


def paginated_response(
    items: list[Any],
    total: int,
    page: int,
    page_size: int,
    message: str = "操作成功",
    request: Request | None = None,
) -> dict[str, Any]:
    """
    创建分页响应

    Args:
        items: 数据列表
        total: 总记录数
        page: 当前页码
        page_size: 每页数量
        message: 响应消息
        request: FastAPI 请求对象

    Returns:
        分页响应字典
    """
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0

    return {
        "code": BusinessCode.SUCCESS,
        "message": message,
        "data": {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request_id": get_request_id(request),
    }


class ApiJSONResponse(JSONResponse):
    """自定义 JSON 响应类，自动添加时间戳和请求 ID"""

    def __init__(
        self,
        content: Any = None,
        status_code: int = 200,
        headers: dict[str, str] | None = None,
        media_type: str | None = None,
        request: Request | None = None,
    ) -> None:
        # 如果 content 是字典且没有 timestamp，添加它
        if isinstance(content, dict):
            if "timestamp" not in content:
                content["timestamp"] = datetime.now(timezone.utc).isoformat()
            if "request_id" not in content:
                content["request_id"] = get_request_id(request)

        super().__init__(
            content=content,
            status_code=status_code,
            headers=headers,
            media_type=media_type,
        )
