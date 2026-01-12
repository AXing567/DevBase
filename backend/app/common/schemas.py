"""
通用 Schema 定义

提供项目中通用的 Pydantic Schema 定义
"""

from datetime import datetime
from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class BaseSchema(BaseModel):
    """基础 Schema，提供通用配置"""

    model_config = ConfigDict(
        from_attributes=True,  # 允许从 ORM 模型创建
        populate_by_name=True,  # 允许使用字段别名
        str_strip_whitespace=True,  # 自动去除字符串首尾空格
    )


class TimestampMixin(BaseModel):
    """时间戳混入"""

    created_at: datetime = Field(description="创建时间")
    updated_at: datetime = Field(description="更新时间")


class IDMixin(BaseModel):
    """ID 混入"""

    id: UUID = Field(description="唯一标识符")


class BaseEntitySchema(IDMixin, TimestampMixin, BaseSchema):
    """基础实体 Schema，包含 ID 和时间戳"""

    pass


class MessageResponse(BaseSchema):
    """通用消息响应"""

    message: str = Field(description="消息内容")


class IDResponse(BaseSchema):
    """ID 响应"""

    id: UUID = Field(description="资源 ID")


class CountResponse(BaseSchema):
    """计数响应"""

    count: int = Field(ge=0, description="数量")


class BoolResponse(BaseSchema):
    """布尔响应"""

    success: bool = Field(description="是否成功")
    message: str | None = Field(default=None, description="消息")


class BatchOperationResult(BaseSchema):
    """批量操作结果"""

    total: int = Field(ge=0, description="总数")
    success_count: int = Field(ge=0, description="成功数量")
    failed_count: int = Field(ge=0, description="失败数量")
    failed_items: list[dict[str, Any]] | None = Field(
        default=None, description="失败项详情"
    )


class PaginationParams(BaseSchema):
    """分页参数"""

    page: int = Field(default=1, ge=1, description="页码")
    page_size: int = Field(default=20, ge=1, le=100, description="每页数量")
    sort_by: str | None = Field(default=None, description="排序字段")
    sort_order: str = Field(
        default="desc", pattern="^(asc|desc)$", description="排序方向"
    )


class SearchParams(PaginationParams):
    """搜索参数"""

    search: str | None = Field(default=None, max_length=100, description="搜索关键词")


class DateRangeParams(BaseSchema):
    """日期范围参数"""

    start_date: datetime | None = Field(default=None, description="开始日期")
    end_date: datetime | None = Field(default=None, description="结束日期")


class FilterParams(BaseSchema):
    """过滤参数"""

    field: str = Field(description="字段名")
    operator: str = Field(
        description="操作符",
        pattern="^(eq|ne|gt|gte|lt|lte|contains|in|not_in)$",
    )
    value: Any = Field(description="值")


class ListResponse(BaseSchema, Generic[T]):
    """列表响应"""

    items: list[T] = Field(description="数据列表")
    total: int = Field(ge=0, description="总数")


class KeyValuePair(BaseSchema):
    """键值对"""

    key: str = Field(description="键")
    value: Any = Field(description="值")


class SelectOption(BaseSchema):
    """选项 (用于下拉菜单)"""

    label: str = Field(description="显示文本")
    value: str | int = Field(description="值")
    disabled: bool = Field(default=False, description="是否禁用")
    description: str | None = Field(default=None, description="描述")


class FileUploadResponse(BaseSchema):
    """文件上传响应"""

    filename: str = Field(description="文件名")
    url: str = Field(description="文件 URL")
    size: int = Field(ge=0, description="文件大小 (字节)")
    mime_type: str = Field(description="MIME 类型")


class HealthCheckResponse(BaseSchema):
    """健康检查响应"""

    status: str = Field(description="状态")
    version: str | None = Field(default=None, description="版本")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="检查时间")
    services: dict[str, str] | None = Field(default=None, description="服务状态")
