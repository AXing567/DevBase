"""
异常处理器模块

提供 FastAPI 全局异常处理器
"""

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .exceptions import (
    BUSINESS_CODE_MESSAGES,
    AppException,
    BusinessCode,
)
from .responses import error_response, get_request_id

logger = logging.getLogger(__name__)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    处理应用自定义异常
    """
    logger.warning(
        f"AppException: code={exc.code}, message={exc.message}, "
        f"path={request.url.path}, request_id={get_request_id(request)}"
    )

    return JSONResponse(
        status_code=exc.http_status,
        content=error_response(
            code=exc.code,
            message=exc.message,
            detail=exc.detail,
            errors=exc.data.get("errors") if exc.data else None,
            request=request,
        ),
    )


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """
    处理 HTTP 异常
    """
    # HTTP 状态码到业务状态码的映射
    http_to_business: dict[int, BusinessCode] = {
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
    }

    code = http_to_business.get(exc.status_code, BusinessCode.INTERNAL_ERROR)
    message = (
        str(exc.detail) if exc.detail else BUSINESS_CODE_MESSAGES.get(code, "未知错误")
    )

    logger.warning(
        f"HTTPException: status={exc.status_code}, detail={exc.detail}, "
        f"path={request.url.path}, request_id={get_request_id(request)}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(
            code=code,
            message=message,
            request=request,
        ),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    处理请求验证异常
    """
    errors: list[dict[str, Any]] = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append(
            {
                "field": field,
                "message": error["msg"],
                "type": error["type"],
            }
        )

    logger.warning(
        f"ValidationError: errors={errors}, "
        f"path={request.url.path}, request_id={get_request_id(request)}"
    )

    return JSONResponse(
        status_code=422,
        content=error_response(
            code=BusinessCode.VALIDATION_ERROR,
            message="数据验证失败",
            errors=errors,
            request=request,
        ),
    )


async def pydantic_validation_handler(
    request: Request, exc: PydanticValidationError
) -> JSONResponse:
    """
    处理 Pydantic 验证异常
    """
    errors: list[dict[str, Any]] = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors.append(
            {
                "field": field,
                "message": error["msg"],
                "type": error["type"],
            }
        )

    logger.warning(
        f"PydanticValidationError: errors={errors}, "
        f"path={request.url.path}, request_id={get_request_id(request)}"
    )

    return JSONResponse(
        status_code=422,
        content=error_response(
            code=BusinessCode.VALIDATION_ERROR,
            message="数据验证失败",
            errors=errors,
            request=request,
        ),
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    处理未捕获的异常
    """
    logger.exception(
        f"UnhandledException: {type(exc).__name__}: {exc}, "
        f"path={request.url.path}, request_id={get_request_id(request)}"
    )

    return JSONResponse(
        status_code=500,
        content=error_response(
            code=BusinessCode.INTERNAL_ERROR,
            message="服务器内部错误",
            request=request,
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """
    注册所有异常处理器

    在 FastAPI 应用启动时调用此函数

    Args:
        app: FastAPI 应用实例

    Example:
        ```python
        from fastapi import FastAPI
        from app.common.handlers import register_exception_handlers

        app = FastAPI()
        register_exception_handlers(app)
        ```
    """
    app.add_exception_handler(AppException, app_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(PydanticValidationError, pydantic_validation_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, general_exception_handler)
