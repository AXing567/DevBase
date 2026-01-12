# API 开发指南

本文档详细说明如何在 AutoTemu 后端进行 API 开发，包括环境搭建、创建新 API、数据库操作、认证和测试。

## 开发环境搭建

### 本地开发流程

1. **安装依赖**
```bash
cd backend
uv sync
```

2. **激活虚拟环境**
```bash
# Windows PowerShell
.\\.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

3. **启动数据库**
```bash
# 在项目根目录
docker compose -f docker-compose.dev.yml up db
```

4. **运行数据库迁移**
```bash
cd backend
alembic upgrade head
```

5. **创建初始数据（可选）**
```bash
python -m app.initial_data
```

6. **启动开发服务器**
```bash
# 开启自动重启
fastapi dev app/main.py
```

访问 API 文档：http://localhost:8000/docs

### IDE 配置

**VS Code 推荐插件**
- Python
- Pylance (类型检查)
- FastAPI (自动补全)

**PyCharm 配置**
- 设置 Python 解释器为 `.venv`
- 启用 Pytest 作为测试框架

## 创建新的 API 端点

### 4 步工作流

#### 1. 定义数据模型

在 `app/models.py` 中定义 SQLModel：

```python
from datetime import datetime
from sqlmodel import Field, SQLModel

class Product(SQLModel, table=True):
    """产品模型"""
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, description="产品名称")
    description: str | None = Field(default=None)
    price: float = Field(gt=0, description="产品价格")
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "示例产品",
                "description": "这是一个示例",
                "price": 99.99
            }
        }

# 创建用 Schema（用于 POST 请求）
class ProductCreate(SQLModel):
    name: str
    description: str | None = None
    price: float

# 读取用 Schema（API 响应）
class ProductPublic(Product):
    pass
```

#### 2. 实现 CRUD 操作

在 `app/crud.py` 中：

```python
from sqlmodel import Session, select
from app.models import Product, ProductCreate

def create_product(
    *,
    session: Session,
    product_create: ProductCreate,
    owner_id: int
) -> Product:
    """创建产品"""
    db_product = Product.model_validate(
        product_create,
        update={"owner_id": owner_id}
    )
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

def get_product(session: Session, product_id: int) -> Product | None:
    """获取单个产品"""
    return session.get(Product, product_id)

def get_products(
    session: Session,
    skip: int = 0,
    limit: int = 100
) -> list[Product]:
    """获取产品列表（带分页）"""
    statement = select(Product).offset(skip).limit(limit)
    return session.exec(statement).all()

def update_product(
    *,
    session: Session,
    product: Product,
    product_update: ProductCreate
) -> Product:
    """更新产品"""
    product_data = product_update.model_dump(exclude_unset=True)
    product.sqlmodel_update(product_data)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

def delete_product(session: Session, product_id: int) -> None:
    """删除产品"""
    product = session.get(Product, product_id)
    if product:
        session.delete(product)
        session.commit()
```

#### 3. 创建 API 路由

新建 `app/api/routes/products.py`：

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.api.deps import get_current_user, SessionDep
from app.models import User, Product, ProductCreate, ProductPublic
from app import crud

router = APIRouter()

@router.post("/", response_model=ProductPublic, status_code=201)
def create_product(
    *,
    session: SessionDep,
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
):
    """创建新产品"""
    product = crud.create_product(
        session=session,
        product_create=product_in,
        owner_id=current_user.id
    )
    return product

@router.get("/", response_model=list[ProductPublic])
def read_products(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
):
    """获取产品列表"""
    products = crud.get_products(session, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=ProductPublic)
def read_product(
    product_id: int,
    session: SessionDep,
):
    """获取单个产品"""
    product = crud.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductPublic)
def update_product(
    *,
    product_id: int,
    product_in: ProductCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    """更新产品（需要是产品所有者）"""
    product = crud.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return crud.update_product(
        session=session,
        product=product,
        product_update=product_in
    )

@router.delete("/{product_id}")
def delete_product(
    *,
    product_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    """删除产品（需要是产品所有者或管理员）"""
    product = crud.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    crud.delete_product(session, product_id)
    return {"message": "Product deleted successfully"}
```

#### 4. 注册路由

在 `app/api/main.py` 中：

```python
from fastapi import APIRouter
from app.api.routes import users, items, products

api_router = APIRouter()

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"]
)
api_router.include_router(
    items.router,
    prefix="/items",
    tags=["items"]
)
api_router.include_router(
    products.router,
    prefix="/products",
    tags=["products"]
)
```

## 数据库操作

### 数据库迁移

#### 创建迁移文件
```bash
# Alembic 自动生成迁移脚本
alembic revision --autogenerate -m "Add products table"
```

#### 检查迁移文件
编辑生成的 `alembic/versions/xxx_add_products_table.py`：

```python
def upgrade() -> None:
    # 创建表
    op.create_table(
        'product',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    # 回滚操作
    op.drop_table('product')
```

#### 应用迁移
```bash
# 应用所有待处理迁移
alembic upgrade head

# 应用指定版本
alembic upgrade abc123

# 查看当前版本
alembic current

# 查看迁移历史
alembic history

# 回滚一个版本
alembic downgrade -1
```

### 查询最佳实践

#### 避免 N+1 问题

```python
# ❌ 不好的做法（N+1 问题）
users = session.exec(select(User)).all()
for user in users:
    print(f"{user.name}: {len(user.items)} items")  # 每个用户都会查一次数据库

# ✅ 好的做法（一次查询获取所有）
from sqlalchemy.orm import selectinload
users = session.exec(
    select(User).options(selectinload(User.items))
).all()
for user in users:
    print(f"{user.name}: {len(user.items)} items")  # 不需要额外查询
```

#### 分页查询

```python
def get_paginated_items(
    session: Session,
    skip: int = 0,
    limit: int = 10,
) -> list[Item]:
    """分页获取物品列表"""
    statement = select(Item).offset(skip).limit(limit)
    return session.exec(statement).all()

# 使用
# GET /items?skip=0&limit=10
items = get_paginated_items(session, skip=0, limit=10)
```

#### 复杂查询

```python
from sqlalchemy import and_, or_

def search_items(
    session: Session,
    title: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> list[Item]:
    """搜索物品"""
    statement = select(Item)

    if title:
        statement = statement.where(
            Item.title.contains(title, autoescape=True)
        )

    if min_price is not None:
        statement = statement.where(Item.price >= min_price)

    if max_price is not None:
        statement = statement.where(Item.price <= max_price)

    return session.exec(statement).all()
```

## 认证和授权

### 保护端点

使用依赖注入保护 API 端点：

```python
from app.api.deps import get_current_user

@router.get("/me", response_model=UserPublic)
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    """获取当前登录用户信息"""
    return current_user
```

### 权限检查

```python
def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """检查是否为管理员"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    return current_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_active_superuser),
):
    """删除用户（仅管理员）"""
    user = crud.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    crud.delete_user(session, user_id)
    return {"message": "User deleted"}
```

## 测试

### 编写单元测试

创建 `tests/api/routes/test_products.py`：

```python
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool
from app.main import app
from app.api.deps import get_session
from app.models import SQLModel, Product

# 使用内存数据库用于测试
@pytest.fixture
def session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture
def client(session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_create_product(client: TestClient, user_token: str):
    """测试创建产品"""
    data = {
        "name": "Test Product",
        "description": "A test product",
        "price": 99.99
    }
    response = client.post(
        "/api/v1/products/",
        headers={"Authorization": f"Bearer {user_token}"},
        json=data,
    )
    assert response.status_code == 201
    content = response.json()
    assert content["name"] == data["name"]

def test_read_products(client: TestClient):
    """测试获取产品列表"""
    response = client.get("/api/v1/products/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_read_product_not_found(client: TestClient):
    """测试获取不存在的产品"""
    response = client.get("/api/v1/products/999")
    assert response.status_code == 404
```

### 运行测试

```bash
cd backend

# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/api/routes/test_products.py

# 运行特定测试函数
pytest tests/api/routes/test_products.py::test_create_product

# 显示测试覆盖率
pytest --cov=app --cov-report=html

# 显示 print 输出
pytest -s
```

## 调试技巧

### 使用日志

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/", response_model=ProductPublic)
def create_product(
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
):
    logger.info(
        "Creating product",
        extra={"user_id": current_user.id, "product_name": product_in.name}
    )
    # 业务逻辑
    logger.debug("Product created successfully")
    return product
```

### 使用 Swagger UI 调试

1. 访问 http://localhost:8000/docs
2. 点击"Authorize"按钮登录
3. 在 Swagger UI 中测试 API 端点

### VS Code 调试器

创建 `.vscode/launch.json`：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "FastAPI Debug",
            "type": "python",
            "request": "launch",
            "module": "fastapi",
            "args": ["dev", "app/main.py"],
            "jinja": true,
            "cwd": "${workspaceFolder}/backend"
        }
    ]
}
```

## 常见错误

### 422 Unprocessable Entity

**原因**：请求数据格式错误或类型不匹配

**解决**：
```python
# ❌ 错误
POST /api/v1/products/
{
    "name": "Product",
    "price": "99.99"  # 应该是 number，不是 string
}

# ✅ 正确
POST /api/v1/products/
{
    "name": "Product",
    "price": 99.99
}
```

### 401 Unauthorized

**原因**：缺少或无效的身份认证 Token

**解决**：
```bash
# 先登录获取 Token
POST /api/v1/login
{
    "username": "user@example.com",
    "password": "password"
}

# 使用 Token
Authorization: Bearer <token>
```

### 403 Forbidden

**原因**：权限不足

**解决**：检查用户权限级别或资源所有权

---

**相关文档**：
- [架构设计](./architecture.md)
- [部署指南](./deployment.md)
