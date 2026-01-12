# 贡献指南

感谢你对 AutoTemu 项目的关注！本指南将帮助你快速上手项目开发。

## 目录

- [快速开始](#快速开始)
- [开发环境配置](#开发环境配置)
- [代码提交流程](#代码提交流程)
- [Pull Request 规范](#pull-request-规范)
- [问题反馈](#问题反馈)

---

## 快速开始

### 1. Fork 仓库

点击项目页面右上角的 "Fork" 按钮，将仓库 Fork 到你的账号下。

### 2. 克隆代码

```bash
git clone https://github.com/YOUR_USERNAME/AutoTemu.git
cd AutoTemu
```

### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/AutoTemu.git
```

### 4. 创建功能分支

```bash
git checkout -b feature/your-feature-name
```

---

## 开发环境配置

### 前置要求

- **Docker Desktop** 20.10+
- **Node.js** 18+
- **Python** 3.10+
- **pnpm** 8+
- **uv** (Python 包管理器)

### 后端环境

```bash
# 进入后端目录
cd backend

# 安装依赖
uv sync

# 激活虚拟环境
# Windows
.\.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

# 安装 pre-commit hooks
python -m pre_commit install
```

### 前端环境

```bash
# 进入前端目录
cd frontend

# 安装依赖
pnpm install
```

### 启动开发环境

**终端 1 - 启动后端和数据库：**
```bash
docker compose -f docker-compose.dev.yml up
```

**终端 2 - 启动前端：**
```bash
cd frontend && pnpm dev
```

### 验证安装

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000/docs
- 数据库管理: http://localhost:8080

---

## 代码提交流程

### 1. 同步上游代码

在开始工作前，确保代码是最新的：

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
```

### 2. 在功能分支上开发

```bash
git checkout -b feature/your-feature
# 进行开发...
```

### 3. 提交代码

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 添加修改
git add .

# 提交（会触发 pre-commit hooks）
git commit -m "feat(auth): 添加 OAuth2 登录支持"
```

**Commit 类型：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变动

### 4. 推送分支

```bash
git push origin feature/your-feature
```

### 5. 创建 Pull Request

在 GitHub 上创建 Pull Request，从你的功能分支到上游的 `develop` 分支。

---

## Pull Request 规范

### PR 标题

使用与 Commit 相同的格式：

```
feat(auth): 添加 OAuth2 登录支持
```

### PR 描述模板

```markdown
## 概述

简要描述这个 PR 做了什么。

## 改动类型

- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 代码重构 (refactor)
- [ ] 其他

## 改动内容

- 添加了 xxx
- 修改了 xxx
- 删除了 xxx

## 测试

描述如何测试这些更改。

## 截图（如适用）

添加相关截图。

## 相关 Issue

Closes #123
```

### PR 检查清单

提交 PR 前，请确保：

- [ ] 代码符合项目编码规范
- [ ] 所有测试通过
- [ ] 添加了必要的测试用例
- [ ] 更新了相关文档
- [ ] 没有遗留的 console.log / print 语句
- [ ] 没有引入新的安全漏洞

### 代码审查

- PR 需要至少 1 名成员审查通过
- CI 检查必须全部通过
- 解决所有审查意见后才能合并

---

## 问题反馈

### 报告 Bug

创建 Issue 时请包含：

1. **环境信息**
   - 操作系统
   - Node.js / Python 版本
   - 浏览器版本

2. **问题描述**
   - 预期行为
   - 实际行为
   - 复现步骤

3. **错误日志**
   - 控制台错误信息
   - 网络请求截图

### Issue 模板

```markdown
## Bug 描述

简要描述遇到的问题。

## 复现步骤

1. 打开 xxx
2. 点击 xxx
3. 看到错误

## 预期行为

描述你期望发生什么。

## 实际行为

描述实际发生了什么。

## 环境信息

- OS: [例如 Windows 11]
- 浏览器: [例如 Chrome 120]
- Node.js: [例如 18.19.0]
- Python: [例如 3.11.0]

## 截图

如有必要，添加截图。

## 日志

```
粘贴相关错误日志
```
```

---

## 项目结构

```
AutoTemu/
├── backend/              # FastAPI 后端
│   ├── app/
│   │   ├── api/         # API 路由
│   │   ├── common/      # 通用模块 (异常、响应、Schema)
│   │   ├── core/        # 核心配置
│   │   ├── models.py    # 数据模型
│   │   └── crud.py      # CRUD 操作
│   └── tests/           # 后端测试
├── frontend/            # Next.js 前端
│   ├── src/
│   │   ├── app/         # 页面和路由
│   │   ├── components/  # React 组件
│   │   └── lib/         # 工具函数
│   └── __tests__/       # 前端测试
├── extension/           # 浏览器扩展
├── shared/              # 共享类型库
│   └── types/           # 类型定义
└── docs/                # 项目文档
    ├── DEVELOPMENT.md   # 开发规范
    ├── API-STANDARDS.md # API 标准
    └── CONTRIBUTING.md  # 本文件
```

---

## 常用命令

### 后端

```bash
cd backend

# 代码检查
uv run ruff check --fix
uv run ruff format

# 运行测试
uv run pytest
uv run pytest --cov=app --cov-report=html

# 数据库迁移
alembic upgrade head
alembic revision --autogenerate -m "描述"
```

### 前端

```bash
cd frontend

# 代码检查
pnpm lint:fix
pnpm format

# 类型检查
pnpm type-check

# 运行测试
pnpm test
pnpm test:e2e
```

### 共享库

```bash
cd shared

# 构建
pnpm build

# 开发模式
pnpm dev

# 类型检查
pnpm type-check
```

---

## 获取帮助

- 查看 [开发规范](./DEVELOPMENT.md)
- 查看 [API 标准](./API-STANDARDS.md)
- 在 Issue 中提问
- 联系项目维护者

感谢你的贡献！🎉
