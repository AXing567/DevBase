# 架构设计

AutoTemu 采用分层架构设计，将系统分为表示层、应用层、数据访问层和数据层。本文档详细说明系统架构、技术选型理由、数据库设计和安全考虑。

## 系统架构

### 分层设计

```
┌──────────────────────────────────────────────────────────────┐
│                    表示层 (Presentation Layer)               │
│  Next.js 前端应用    │  Plasmo 浏览器扩展    │  移动应用     │
│  (React 19)          │  (跨浏览器支持)       │  (Capacitor)  │
└──────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
┌──────────────────────────────────────────────────────────────┐
│              应用层 (Application Layer) - FastAPI            │
│  API 路由 → 业务逻辑 → 数据验证 → 错误处理 → 日志记录      │
└──────────────────────────────────────────────────────────────┘
                              ↓ SQL
┌──────────────────────────────────────────────────────────────┐
│           数据访问层 (Data Access Layer) - SQLModel         │
│  ORM 模型 → CRUD 操作 → 连接池 → 事务管理                  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              数据层 (Data Layer) - PostgreSQL                 │
│  关系型数据库 → 事务保证 → 完整性约束 → 备份恢复           │
└──────────────────────────────────────────────────────────────┘
```

### 表示层

**Next.js 前端应用**
- 基于 React 19 和 TypeScript
- App Router 文件系统路由
- Server Components 支持
- 自动代码分割和图片优化
- 实时更新和 Hot Reload

**Plasmo 浏览器扩展**
- 跨浏览器兼容 (Chrome, Firefox, Edge)
- 热更新开发体验
- Content Script + Background Service Worker 架构
- Manifest V3 标准

### 应用层 (FastAPI)

**核心职责**
- RESTful API 路由管理
- 请求验证和响应序列化
- 业务逻辑处理
- 身份认证和授权
- 错误处理和日志

**文件结构**
```
backend/app/
├── api/
│   ├── routes/          # API 端点
│   │   ├── users.py
│   │   ├── items.py
│   │   └── login.py
│   └── deps.py          # 依赖注入
├── core/
│   ├── config.py        # 配置管理
│   ├── security.py      # 安全相关
│   └── db.py            # 数据库连接
├── models.py            # SQLModel 模型
├── crud.py              # CRUD 操作
└── main.py              # FastAPI 应用入口
```

### 数据访问层

**SQLModel 优势**
- 单一模型定义：数据库模型 = API Schema
- 完全类型提示支持
- Pydantic 数据验证
- SQLAlchemy 功能完整

**设计模式**
```python
# 模型定义（同时作为数据库表和 API Schema）
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: EmailStr
    hashed_password: str
    is_active: bool = True

# CRUD 操作（统一在 crud.py）
def create_user(session: Session, user_create: UserCreate) -> User:
    db_user = User.model_validate(user_create)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
```

### 数据层

**PostgreSQL 选择**
- ACID 事务保证
- 丰富的数据类型（JSON、Array、UUID等）
- 强大的查询优化器
- 全文搜索支持
- 可靠的备份机制

## 技术选型

### 为什么选择 FastAPI？

| 特性 | FastAPI | Django | Flask |
|------|---------|--------|-------|
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 学习曲线 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 自动文档 | ✅ OpenAPI | ❌ | ❌ |
| 异步支持 | ✅ 原生 | ⭐ 有限 | ⭐ 有限 |
| 类型提示 | ✅ 完整 | ⭐ 部分 | ❌ |

**关键优势**
1. **性能** - 基于 Starlette + Pydantic，性能接近 Node.js
2. **开发效率** - 自动生成 OpenAPI 文档和请求验证
3. **类型安全** - 从请求到响应的完整类型检查
4. **异步优先** - 原生 async/await 支持，适合高并发
5. **简洁代码** - 装饰器驱动，代码量少

### 为什么选择 Next.js 15？

**核心优势**
1. **全栈能力** - 前端 + API Routes，减少配置复杂度
2. **性能优化** - 自动代码分割、图片优化、字体优化
3. **SSR/SSG** - 服务端渲染和静态生成，SEO 友好
4. **App Router** - 基于文件系统的路由，更直观
5. **React Server Components** - 减少客户端 JavaScript

**开发体验**
- 热模块重载 (HMR)
- 自动编译错误检查
- 集成 TypeScript 支持
- 生产优化自动化

### 为什么选择 PostgreSQL 17？

**企业级特性**
1. **ACID 事务** - 完整的事务支持，数据一致性有保证
2. **丰富的数据类型**
   - JSON/JSONB：灵活的文档存储
   - UUID：分布式系统友好
   - Array：复杂数据结构
   - Range：时间范围查询
3. **全文搜索** - 内置全文搜索能力
4. **扩展性** - 丰富的扩展生态（PostGIS、TimescaleDB等）

**可靠性**
- Write-Ahead Logging (WAL) 日志机制
- 点对点恢复能力
- 复制和故障转移支持
- 完善的备份工具

### 为什么选择 SQLModel？

**统一的模型定义**
```python
class Product(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None
    price: float = Field(gt=0)
```

这个模型同时作为：
- 数据库表定义
- API 请求/响应 Schema
- 数据验证规则

**优点**
- 减少重复代码
- 保持一致性
- 类型安全的完整链路
- Pydantic 的强大验证

## 数据库设计

### 核心数据模型

**用户表 (users)**
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**物品表 (items)**
```sql
CREATE TABLE item (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    description VARCHAR,
    owner_id INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 外键关系

- User 和 Item 的 1:N 关系
- 级联删除：删除用户时，自动删除其所有物品
- 非空约束：确保数据完整性

### 索引策略

```sql
-- 提高查询速度的关键索引
CREATE INDEX idx_user_email ON user(email);        -- 用户登录查询
CREATE INDEX idx_item_owner_id ON item(owner_id);  -- 查询用户物品
CREATE INDEX idx_item_created_at ON item(created_at DESC);  -- 时间排序
```

### 数据库迁移

使用 Alembic 管理版本：

```bash
# 创建新迁移
alembic revision --autogenerate -m "Add user table"

# 应用迁移
alembic upgrade head

# 查看迁移历史
alembic history

# 回滚一个版本
alembic downgrade -1
```

## 安全设计

### 身份认证

**JWT Token 机制**

1. **登录流程**
```
用户输入邮箱/密码 → 验证密码 → 生成 JWT Token → 返回 Token
```

2. **Token 结构**
```
{
  "sub": "user_id",
  "exp": 1234567890,
  "iat": 1234567800,
  "type": "access"
}
```

3. **Token 验证**
```python
def get_current_user(token: str) -> User:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    user_id = payload.get("sub")
    return get_user(user_id)
```

**密码安全**
- 使用 bcrypt 加密存储密码
- 最小密码长度要求
- 密码强度验证

### API 安全

**CORS 配置**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**请求验证**
- Pydantic 自动验证请求数据类型
- 电子邮件格式验证
- 数据长度限制

**错误处理**
- 不暴露内部错误详情
- 统一错误响应格式
- 日志记录所有错误

### 数据安全

**SQL 注入防护**
- 使用 ORM 参数化查询
- 避免直接字符串拼接
- SQLAlchemy 自动处理转义

**敏感数据**
- 密码哈希存储
- 不在日志中记录 Token
- 环境变量管理密钥

## 扩展性设计

### 水平扩展

**多后端实例**
```yaml
# docker-compose.yml
services:
  backend1:
    image: autotemu-backend
  backend2:
    image: autotemu-backend
  # Traefik 自动负载均衡
```

**数据库连接池**
```python
# 避免连接耗尽
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600,
)
```

**Redis 缓存**（可选）
```python
# 缓存用户数据，减少数据库查询
@cache.cached(timeout=300)
def get_user(user_id: int):
    return db.query(User).get(user_id)
```

### 代码扩展性

**模块化路由**
```python
# main.py
api_router = APIRouter()
api_router.include_router(users.router, prefix="/users")
api_router.include_router(items.router, prefix="/items")
app.include_router(api_router, prefix="/api/v1")
```

**依赖注入**
```python
# deps.py
def get_db() -> Generator:
    with SessionLocal() as session:
        yield session

# routes/users.py
@router.get("/")
def list_users(session: Session = Depends(get_db)):
    return crud.get_users(session)
```

### 监控和日志

**结构化日志**
```python
import logging
logger = logging.getLogger(__name__)
logger.info("User login", extra={"user_id": user.id})
```

**性能监控**
- 使用 Sentry 追踪错误
- 记录 API 响应时间
- 监控数据库查询性能

**健康检查**
```python
@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## 最佳实践

### API 设计

1. **RESTful 原则**
   - GET - 查询资源
   - POST - 创建资源
   - PUT/PATCH - 更新资源
   - DELETE - 删除资源

2. **版本管理**
   - URL 中包含版本号：`/api/v1/users`
   - 向后兼容性考虑
   - 弃用预告期

3. **错误响应**
```json
{
  "detail": "User not found",
  "status_code": 404,
  "timestamp": "2025-12-30T10:00:00Z"
}
```

### 代码质量

- **类型提示** - 必须为所有函数添加类型提示
- **文档字符串** - Google 风格的文档字符串
- **单元测试** - 至少 80% 的代码覆盖率
- **代码审查** - PR 合并前需要代码审查

### 性能优化

1. **数据库查询**
   - 使用索引加快查询
   - 避免 N+1 查询问题
   - 使用分页限制数据量

2. **缓存策略**
   - 缓存频繁访问的数据
   - 设置合理的过期时间
   - 考虑缓存失效策略

3. **API 响应**
   - 只返回必要的字段
   - 使用分页减少传输量
   - 启用 GZIP 压缩

## 未来扩展方向

- **GraphQL 支持** - 灵活的数据查询
- **WebSocket** - 实时通信
- **消息队列** - 异步任务处理 (Celery + Redis)
- **微服务** - 服务拆分和独立扩展
- **容器编排** - Kubernetes 部署

---

**相关文档**：
- [API 开发指南](./api-development.md)
- [前端开发指南](./frontend-development.md)
- [部署指南](./deployment.md)
