# 开发规范

本文档定义了 AutoTemu 项目的开发规范，所有团队成员应遵循这些规范以保持代码质量和一致性。

## 目录

- [通用规范](#通用规范)
- [Git 工作流](#git-工作流)
- [后端开发规范](#后端开发规范)
- [前端开发规范](#前端开发规范)
- [代码审查](#代码审查)
- [测试规范](#测试规范)

---

## 通用规范

### 编码规范

1. **文件编码**: 所有文件使用 UTF-8 编码
2. **换行符**: 使用 LF（Unix 风格）
3. **缩进**:
   - Python: 4 空格
   - TypeScript/JavaScript: 2 空格
4. **行宽**: 最大 88 字符（Python）/ 100 字符（TypeScript）

### 命名规范

| 类型 | Python | TypeScript |
|------|--------|------------|
| 文件名 | `snake_case.py` | `kebab-case.ts` 或 `PascalCase.tsx` |
| 类名 | `PascalCase` | `PascalCase` |
| 函数/方法 | `snake_case` | `camelCase` |
| 变量 | `snake_case` | `camelCase` |
| 常量 | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` |
| 私有成员 | `_leading_underscore` | `#privateField` 或 `_prefix` |

### 注释规范

```python
# Python 文档字符串 (Google 风格)
def create_user(email: str, password: str) -> User:
    """
    创建新用户

    Args:
        email: 用户邮箱地址
        password: 用户密码（明文）

    Returns:
        创建的用户对象

    Raises:
        ValidationException: 邮箱格式无效
        ResourceException: 邮箱已被注册
    """
    pass
```

```typescript
// TypeScript JSDoc 风格
/**
 * 创建新用户
 * @param email - 用户邮箱地址
 * @param password - 用户密码
 * @returns 创建的用户对象
 * @throws {ValidationError} 邮箱格式无效
 */
function createUser(email: string, password: string): User {
  // ...
}
```

---

## Git 工作流

### 分支策略

```
main/master     # 生产分支 (保护分支)
  └── develop   # 开发主分支
       ├── feature/xxx   # 功能分支
       ├── fix/xxx       # 修复分支
       └── release/x.x.x # 发布分支
```

### 分支命名

- 功能分支: `feature/<功能简述>` 例: `feature/user-avatar`
- 修复分支: `fix/<问题简述>` 例: `fix/login-redirect`
- 发布分支: `release/<版本号>` 例: `release/1.2.0`
- 热修复: `hotfix/<问题简述>` 例: `hotfix/security-patch`

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（非新功能/修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变动
- `ci`: CI/CD 配置

**示例**:
```bash
feat(auth): 添加 OAuth2 登录支持

- 集成 Google OAuth2 认证
- 添加 OAuth 回调处理
- 更新用户模型支持第三方账号

Closes #123
```

### Pull Request 流程

1. 从 `develop` 创建功能分支
2. 完成开发和本地测试
3. 推送分支并创建 PR
4. 至少 1 人代码审查
5. CI 检查通过
6. 合并到 `develop`
7. 删除功能分支

---

## 后端开发规范

### 项目结构

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/      # API 路由
│   │   ├── deps.py      # 依赖注入
│   │   └── main.py      # 路由注册
│   ├── common/          # 🆕 通用模块
│   │   ├── exceptions.py   # 异常定义
│   │   ├── responses.py    # 响应格式
│   │   ├── schemas.py      # 通用 Schema
│   │   └── handlers.py     # 异常处理器
│   ├── core/            # 核心配置
│   ├── models.py        # 数据模型
│   └── crud.py          # CRUD 操作
├── tests/               # 测试
└── alembic/             # 数据库迁移
```

### 异常处理

使用统一的异常类：

```python
from app.common import (
    AuthenticationException,
    PermissionException,
    ResourceException,
    ValidationException,
    BusinessException,
    BusinessCode,
)

# 认证失败
raise AuthenticationException(
    code=BusinessCode.AUTH_INVALID_CREDENTIALS,
    message="用户名或密码错误"
)

# 资源不存在
raise ResourceException(
    code=BusinessCode.RESOURCE_NOT_FOUND,
    message="用户不存在",
    resource_type="User",
    resource_id=str(user_id)
)

# 数据验证失败
raise ValidationException(
    errors=[
        {"field": "email", "message": "邮箱格式无效"},
        {"field": "password", "message": "密码至少 8 个字符"},
    ]
)

# 业务逻辑错误
raise BusinessException(
    message="用户已达到最大项目数限制",
    detail="当前限制: 10 个项目"
)
```

### API 响应格式

使用统一的响应工具：

```python
from app.common import success_response, paginated_response

# 成功响应
@router.get("/users/{user_id}")
async def get_user(user_id: UUID):
    user = await get_user_by_id(user_id)
    return success_response(data=user, message="获取用户成功")

# 分页响应
@router.get("/users")
async def list_users(page: int = 1, page_size: int = 20):
    users, total = await get_users_paginated(page, page_size)
    return paginated_response(
        items=users,
        total=total,
        page=page,
        page_size=page_size
    )
```

### 类型提示

**必须** 为所有函数添加类型提示：

```python
from typing import Optional
from uuid import UUID

async def get_user(
    user_id: UUID,
    include_deleted: bool = False,
) -> Optional[User]:
    """获取用户"""
    pass
```

### 数据库操作

使用 SQLModel 和事务：

```python
from sqlmodel import Session, select

async def create_user(session: Session, user_in: UserCreate) -> User:
    db_user = User.model_validate(user_in)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
```

---

## 前端开发规范

### 项目结构

```
frontend/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # 认证相关页面
│   │   ├── (dashboard)/ # 仪表板页面
│   │   └── api/         # API 路由
│   ├── components/
│   │   ├── ui/          # 基础 UI 组件
│   │   └── common/      # 业务通用组件
│   ├── lib/
│   │   ├── api/         # API 客户端
│   │   ├── hooks/       # 自定义 Hooks
│   │   ├── utils/       # 工具函数
│   │   └── validations/ # Zod Schema
│   └── types/           # 类型定义
```

### 组件规范

```tsx
// components/common/user-card.tsx
"use client";

import { type FC } from "react";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: User;
  className?: string;
  onEdit?: (id: string) => void;
}

export const UserCard: FC<UserCardProps> = ({
  user,
  className,
  onEdit,
}) => {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3>{user.name}</h3>
      {onEdit && (
        <button onClick={() => onEdit(user.id)}>编辑</button>
      )}
    </div>
  );
};
```

### API 调用

使用 React Query 管理服务端状态：

```tsx
// lib/api/users.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useUsers(page: number = 1) {
  return useQuery({
    queryKey: ["users", page],
    queryFn: () => apiClient.get("/users", { params: { page } }),
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      apiClient.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### 表单处理

使用 React Hook Form + Zod：

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少 8 个字符"),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = (data: UserFormData) => {
    // ...
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

---

## 代码审查

### 审查清单

- [ ] 代码符合命名规范
- [ ] 有适当的类型注解/提示
- [ ] 异常处理完善
- [ ] 没有硬编码的敏感信息
- [ ] 没有遗留的 console.log / print
- [ ] 测试覆盖充分
- [ ] 文档/注释清晰

### 审查标准

1. **功能正确性**: 代码是否实现了预期功能？
2. **代码质量**: 是否简洁、可读、可维护？
3. **安全性**: 是否存在安全隐患？
4. **性能**: 是否有明显的性能问题？
5. **测试**: 是否有足够的测试覆盖？

---

## 测试规范

### 后端测试

```python
# tests/test_users.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, db_session):
    """测试创建用户"""
    response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert data["data"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_create_user_duplicate_email(client: AsyncClient):
    """测试创建重复邮箱用户"""
    # 创建第一个用户
    await client.post("/api/v1/users", json={"email": "dup@example.com", "password": "pass"})

    # 尝试创建重复邮箱
    response = await client.post("/api/v1/users", json={"email": "dup@example.com", "password": "pass"})
    assert response.status_code == 409
    assert response.json()["code"] == 3002  # RESOURCE_ALREADY_EXISTS
```

### 前端测试

```tsx
// __tests__/components/user-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { UserCard } from "@/components/common/user-card";

describe("UserCard", () => {
  const mockUser = { id: "1", name: "Test User", email: "test@example.com" };

  it("renders user name", () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked", () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    fireEvent.click(screen.getByText("编辑"));
    expect(onEdit).toHaveBeenCalledWith("1");
  });
});
```

### 测试覆盖率要求

- 后端: >= 80%
- 前端: >= 70%
- 核心业务逻辑: >= 90%

---

## 附录

### 常用命令

```bash
# 后端
cd backend
uv run ruff check --fix    # 代码检查
uv run ruff format         # 代码格式化
uv run pytest              # 运行测试
uv run pytest --cov=app    # 测试覆盖率

# 前端
cd frontend
pnpm lint:fix             # 代码检查
pnpm format               # 代码格式化
pnpm test                 # 运行测试
pnpm type-check           # 类型检查
```

### 参考资料

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [Next.js 官方文档](https://nextjs.org/docs)
- [TypeScript 风格指南](https://google.github.io/styleguide/tsguide.html)
- [Python PEP 8](https://pep8.org/)
