# API 标准规范

本文档定义了 AutoTemu 项目的 API 设计标准，确保前后端接口的一致性和可维护性。

## 目录

- [响应格式](#响应格式)
- [状态码规范](#状态码规范)
- [错误处理](#错误处理)
- [分页规范](#分页规范)
- [认证规范](#认证规范)
- [命名规范](#命名规范)
- [版本控制](#版本控制)

---

## 响应格式

### 统一响应结构

所有 API 响应都遵循以下格式：

```json
{
  "code": 0,
  "message": "操作成功",
  "data": { ... },
  "timestamp": "2025-01-12T10:30:00.000Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | number | ✅ | 业务状态码，0 表示成功 |
| `message` | string | ✅ | 响应消息 |
| `data` | any | ❌ | 响应数据，失败时可为 null |
| `timestamp` | string | ✅ | ISO 8601 格式时间戳 |
| `request_id` | string | ❌ | 请求追踪 ID |

### 成功响应示例

**单个对象：**
```json
{
  "code": 0,
  "message": "获取用户成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "张三",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  },
  "timestamp": "2025-01-12T10:30:00.000Z"
}
```

**列表（带分页）：**
```json
{
  "code": 0,
  "message": "获取用户列表成功",
  "data": {
    "items": [
      { "id": "...", "email": "user1@example.com" },
      { "id": "...", "email": "user2@example.com" }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  },
  "timestamp": "2025-01-12T10:30:00.000Z"
}
```

### 错误响应示例

```json
{
  "code": 4001,
  "message": "数据验证失败",
  "errors": [
    { "field": "email", "message": "邮箱格式无效", "type": "value_error" },
    { "field": "password", "message": "密码至少 8 个字符", "type": "string_too_short" }
  ],
  "timestamp": "2025-01-12T10:30:00.000Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 状态码规范

### 业务状态码

| 范围 | 类型 | 说明 |
|------|------|------|
| 0 | 成功 | 操作成功 |
| 1xxx | 认证错误 | 登录、Token 相关 |
| 2xxx | 权限错误 | 授权、访问控制 |
| 3xxx | 资源错误 | 资源不存在、冲突 |
| 4xxx | 业务错误 | 验证、逻辑错误 |
| 5xxx | 系统错误 | 服务器、数据库错误 |

### 详细状态码定义

```
SUCCESS                = 0      # 操作成功

# 认证相关 (1xxx)
AUTH_REQUIRED          = 1001   # 需要登录
AUTH_INVALID_TOKEN     = 1002   # Token 无效
AUTH_TOKEN_EXPIRED     = 1003   # Token 过期
AUTH_INVALID_CREDENTIALS = 1004 # 用户名或密码错误
AUTH_USER_DISABLED     = 1005   # 用户已禁用

# 权限相关 (2xxx)
PERMISSION_DENIED      = 2001   # 权限不足
PERMISSION_INSUFFICIENT = 2002  # 需要更高权限

# 资源相关 (3xxx)
RESOURCE_NOT_FOUND     = 3001   # 资源不存在
RESOURCE_ALREADY_EXISTS = 3002  # 资源已存在
RESOURCE_CONFLICT      = 3003   # 资源冲突

# 业务逻辑错误 (4xxx)
VALIDATION_ERROR       = 4001   # 数据验证失败
BUSINESS_ERROR         = 4002   # 业务逻辑错误
RATE_LIMIT_EXCEEDED    = 4003   # 请求过于频繁

# 系统错误 (5xxx)
INTERNAL_ERROR         = 5001   # 内部错误
SERVICE_UNAVAILABLE    = 5002   # 服务不可用
DATABASE_ERROR         = 5003   # 数据库错误
EXTERNAL_SERVICE_ERROR = 5004   # 外部服务错误
```

### HTTP 状态码映射

| HTTP 状态码 | 业务状态码 | 使用场景 |
|-------------|-----------|---------|
| 200 | 0 | 成功 |
| 400 | 4001/4002 | 请求参数错误 |
| 401 | 1001-1005 | 认证失败 |
| 403 | 2001-2002 | 权限不足 |
| 404 | 3001 | 资源不存在 |
| 409 | 3002/3003 | 资源冲突 |
| 422 | 4001 | 数据验证失败 |
| 429 | 4003 | 请求频率限制 |
| 500 | 5001 | 服务器错误 |
| 503 | 5002 | 服务不可用 |

---

## 错误处理

### 错误响应格式

```json
{
  "code": 4001,
  "message": "数据验证失败",
  "detail": "详细错误信息（仅开发环境）",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式无效",
      "type": "value_error.email"
    }
  ],
  "timestamp": "2025-01-12T10:30:00.000Z",
  "request_id": "..."
}
```

### 前端错误处理

```typescript
import { BusinessCode } from "@autotemu/shared";

async function handleApiError(response: ApiErrorResponse) {
  switch (response.code) {
    case BusinessCode.AUTH_TOKEN_EXPIRED:
      // 跳转登录
      router.push("/login");
      break;
    case BusinessCode.PERMISSION_DENIED:
      // 显示权限不足提示
      toast.error("您没有权限执行此操作");
      break;
    case BusinessCode.VALIDATION_ERROR:
      // 显示字段错误
      response.errors?.forEach((err) => {
        form.setError(err.field, { message: err.message });
      });
      break;
    default:
      toast.error(response.message);
  }
}
```

---

## 分页规范

### 请求参数

```
GET /api/v1/users?page=1&page_size=20&sort_by=created_at&sort_order=desc
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码（从 1 开始）|
| `page_size` | number | 20 | 每页数量（最大 100）|
| `sort_by` | string | - | 排序字段 |
| `sort_order` | string | desc | 排序方向：asc/desc |

### 响应格式

```json
{
  "code": 0,
  "message": "获取列表成功",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 后端实现

```python
from app.common import paginated_response, PaginationParams

@router.get("/users")
async def list_users(
    params: PaginationParams = Depends(),
    session: Session = Depends(get_db),
):
    users, total = crud.get_users(
        session,
        skip=(params.page - 1) * params.page_size,
        limit=params.page_size,
        sort_by=params.sort_by,
        sort_order=params.sort_order,
    )
    return paginated_response(
        items=[UserPublic.model_validate(u) for u in users],
        total=total,
        page=params.page,
        page_size=params.page_size,
    )
```

---

## 认证规范

### 认证方式

项目使用 JWT Bearer Token 认证：

```
Authorization: Bearer <access_token>
```

### Token 获取

```
POST /api/v1/login/access-token
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=secretpassword
```

**响应：**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
  }
}
```

### Token 刷新

Token 过期前，前端应主动刷新：

```
POST /api/v1/login/refresh-token
Authorization: Bearer <current_token>
```

### 认证错误处理

| 场景 | HTTP 状态码 | 业务状态码 | 前端处理 |
|------|------------|-----------|---------|
| 未携带 Token | 401 | 1001 | 跳转登录页 |
| Token 无效 | 401 | 1002 | 清除本地 Token，跳转登录 |
| Token 过期 | 401 | 1003 | 尝试刷新 Token |
| 用户被禁用 | 401 | 1005 | 显示账号已禁用提示 |

---

## 命名规范

### URL 路径

- 使用小写字母和连字符
- 资源名使用复数形式
- 避免动词（RESTful 风格）

```
✅ GET    /api/v1/users           # 获取用户列表
✅ POST   /api/v1/users           # 创建用户
✅ GET    /api/v1/users/{id}      # 获取单个用户
✅ PATCH  /api/v1/users/{id}      # 更新用户
✅ DELETE /api/v1/users/{id}      # 删除用户

❌ GET    /api/v1/getUsers
❌ POST   /api/v1/createUser
❌ GET    /api/v1/User/1
```

### 特殊操作

使用子资源或动作端点：

```
POST /api/v1/users/{id}/activate      # 激活用户
POST /api/v1/users/{id}/deactivate    # 禁用用户
POST /api/v1/users/{id}/reset-password # 重置密码
GET  /api/v1/users/me                  # 获取当前用户
```

### 字段命名

- 使用 snake_case（与 Python 保持一致）
- 布尔字段使用 is_/has_/can_ 前缀
- 时间字段使用 _at 后缀

```json
{
  "id": "uuid",
  "full_name": "张三",
  "email": "user@example.com",
  "is_active": true,
  "has_verified_email": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-12T10:30:00Z"
}
```

---

## 版本控制

### URL 版本

使用 URL 路径进行版本控制：

```
/api/v1/users
/api/v2/users
```

### 版本升级策略

1. **向后兼容的更改**：不需要新版本
   - 添加新的可选字段
   - 添加新的端点
   - 添加新的查询参数

2. **破坏性更改**：需要新版本
   - 删除或重命名字段
   - 更改字段类型
   - 更改响应结构
   - 更改认证方式

### 版本弃用流程

1. 发布新版本时，旧版本标记为 `Deprecated`
2. 在响应头中添加弃用警告：
   ```
   Deprecation: true
   Sunset: Sat, 01 Jan 2026 00:00:00 GMT
   ```
3. 至少保留 6 个月过渡期
4. 发送弃用通知给 API 使用者
5. 过渡期后移除旧版本

---

## 附录

### 常用响应示例

**创建成功：**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": { "id": "..." }
}
```

**更新成功：**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": { ... }
}
```

**删除成功：**
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

**资源不存在：**
```json
{
  "code": 3001,
  "message": "用户不存在"
}
```

**权限不足：**
```json
{
  "code": 2001,
  "message": "您没有权限访问此资源"
}
```
