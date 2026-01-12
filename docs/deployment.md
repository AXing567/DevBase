# 生产环境部署指南

本文档详细说明如何将 AutoTemu 部署到生产环境，包括 Docker 配置、Traefik 反向代理、HTTPS 证书、备份和监控。

## 部署架构

```
Internet (80/443)
    ↓
┌─────────────────────────────────────────┐
│     Traefik 反向代理                     │
│  • HTTPS 终止                           │
│  • 自动证书更新 (Let's Encrypt)         │
│  • 负载均衡                             │
│  • 请求路由                             │
└─────────────────────────────────────────┘
    ↓
┌──────────────────┬──────────────────┐
│  后端 API        │  前端应用        │
│ (api.example.com)│ (app.example.com)│
└──────────────────┴──────────────────┘
    ↓
┌──────────────────────────────────────┐
│       PostgreSQL 数据库               │
│  • 持久化存储                        │
│  • 数据备份                          │
└──────────────────────────────────────┘
```

## 环境准备

### 服务器要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+
- **Docker**: 20.10+
- **Docker Compose**: v2+
- **RAM**: 2GB+
- **磁盘**: 20GB+
- **CPU**: 2核+

### 域名配置

准备以下子域名并解析到服务器 IP：

```
example.com           → 前端应用
api.example.com       → 后端 API
admin.example.com     → 数据库管理（可选）
```

在 DNS 提供商中创建 A 记录：
```
A  example.com      123.45.67.89
A  api.example.com  123.45.67.89
```

### 服务器登录和初始化

```bash
# SSH 登录服务器
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

## Docker 部署

### 1. 克隆项目

```bash
cd /opt
git clone https://github.com/your-org/AutoTemu.git
cd AutoTemu
```

### 2. 配置环境变量

```bash
# 复制模板
cp .env.example .env

# 编辑配置
nano .env
```

**关键配置项**：

```bash
# 域名配置
DOMAIN=example.com
FRONTEND_HOST=https://example.com
STACK_NAME=autotemu
ENVIRONMENT=production

# 数据库配置
POSTGRES_SERVER=db
POSTGRES_PASSWORD=<strong-random-password>  # 使用强密码
POSTGRES_DB=app

# 后端配置
SECRET_KEY=<32-char-random-string>  # 生成: openssl rand -hex 16
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=<strong-password>

# SMTP 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-password>  # Gmail 应用密码
EMAILS_FROM_EMAIL=noreply@example.com

# Docker 镜像
DOCKER_IMAGE_BACKEND=your-registry/autotemu-backend
DOCKER_IMAGE_FRONTEND=your-registry/autotemu-frontend
TAG=latest
```

### 3. 构建镜像

```bash
# 构建后端镜像
docker build -t autotemu-backend backend/

# 构建前端镜像
docker build -t autotemu-frontend frontend/

# 推送到镜像仓库（可选）
docker push autotemu-backend:latest
docker push autotemu-frontend:latest
```

### 4. 启动服务

```bash
# 创建 Traefik 网络（仅首次）
docker network create traefik-public

# 创建证书目录
mkdir -p /opt/AutoTemu/traefik/certificates

# 启动所有服务
docker-compose -f docker-compose.yml up -d

# 查看日志
docker-compose logs -f

# 检查服务状态
docker-compose ps
```

**等待服务启动**（约 30-60 秒）：
- 数据库初始化
- Alembic 迁移执行
- 初始数据创建

## Traefik 配置

### Traefik 反向代理

创建 `traefik.yml` 配置：

```yaml
# API 文档配置
api:
  dashboard: true
  debug: true

# 入口点
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: le
        domains:
          - main: example.com
            sans:
              - "*.example.com"

# 证书解析器（Let's Encrypt）
certificatesResolvers:
  le:
    acme:
      email: admin@example.com
      storage: /certificates/acme.json
      httpChallenge:
        entryPoint: web

# Docker 提供商
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-public
```

### 后端服务配置

在 `docker-compose.yml` 中配置后端服务：

```yaml
services:
  backend:
    image: autotemu-backend:latest
    networks:
      - traefik-public
      - default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.example.com`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=le"
      - "traefik.http.services.backend.loadbalancer.server.port=8000"
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db/app
    depends_on:
      - db
    restart: unless-stopped
```

## HTTPS 和证书

### Let's Encrypt 自动证书

Traefik 会自动从 Let's Encrypt 获取证书：

1. **首次申请**
   - Traefik 监听 HTTP (80) 端口
   - Let's Encrypt 发送挑战请求
   - Traefik 响应验证
   - 证书颁发并保存

2. **自动续期**
   - 证书过期前 30 天自动续期
   - 无需手动干预

3. **证书存储**
   ```bash
   # 证书存储在
   /opt/AutoTemu/traefik/certificates/acme.json
   ```

### 验证 HTTPS

```bash
# 测试 HTTPS 连接
curl -I https://api.example.com

# 查看证书信息
openssl s_client -connect api.example.com:443 -showcerts
```

## 数据库备份和恢复

### 自动备份

创建 `scripts/backup-db.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

# 执行备份
docker-compose exec -T db pg_dump -U postgres app > "$BACKUP_FILE"

# 压缩
gzip "$BACKUP_FILE"

# 删除超过 30 天的备份
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### 定时备份

使用 crontab 设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * /opt/AutoTemu/scripts/backup-db.sh >> /var/log/backup.log 2>&1

# 每周日凌晨 3 点全量备份
0 3 * * 0 /opt/AutoTemu/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### 手动备份

```bash
# 备份数据库
docker-compose exec -T db pg_dump -U postgres app > backup.sql

# 压缩
gzip backup.sql

# 上传到远程服务器
scp backup.sql.gz user@backup-server:/backups/
```

### 数据库恢复

```bash
# 从备份恢复
gunzip backup.sql.gz
docker-compose exec -T db psql -U postgres app < backup.sql

# 或通过管道
zcat backup.sql.gz | docker-compose exec -T db psql -U postgres app
```

## 监控和日志

### 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f backend
docker-compose logs -f db

# 最后 100 行
docker-compose logs --tail=100 backend

# 保存日志到文件
docker-compose logs > logs.txt
```

### 健康检查

```bash
# 检查后端健康状态
curl https://api.example.com/api/v1/health-check/

# 检查数据库连接
docker-compose exec db pg_isready -U postgres

# 查看容器状态
docker-compose ps

# 查看资源使用
docker stats
```

### Sentry 错误追踪（可选）

1. **注册 Sentry**：访问 [sentry.io](https://sentry.io/)
2. **创建项目**：选择 Python + FastAPI
3. **获取 DSN**：复制项目 DSN
4. **配置应用**：
   ```bash
   # 在 .env 中
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

## 故障排查

### 服务无法启动

```bash
# 检查日志
docker-compose logs

# 检查端口占用
lsof -i :80
lsof -i :443
lsof -i :5432

# 清理并重启
docker-compose down
docker-compose up -d
```

### 数据库连接失败

```bash
# 检查数据库容器
docker-compose logs db

# 进入数据库
docker-compose exec db psql -U postgres

# 测试连接
docker-compose exec backend python -c "
import psycopg2
conn = psycopg2.connect(
    host='db',
    database='app',
    user='postgres',
    password='password'
)
print('Connection successful')
"
```

### SSL/TLS 证书错误

```bash
# 检查 Traefik 日志
docker-compose logs traefik

# 检查证书文件
ls -la /opt/AutoTemu/traefik/certificates/

# 清除过期证书并重新申请
rm /opt/AutoTemu/traefik/certificates/acme.json
docker-compose restart traefik
```

### API 超时或性能问题

```bash
# 增加超时时间
docker-compose exec backend python -c "
# 调整连接池
SQLALCHEMY_POOL_SIZE=20
SQLALCHEMY_MAX_OVERFLOW=10
"

# 检查慢查询
docker-compose exec db psql -U postgres -c "
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"
```

## 更新部署

### 拉取最新代码

```bash
cd /opt/AutoTemu
git pull origin main
```

### 重建镜像

```bash
# 后端镜像
docker build -t autotemu-backend:latest backend/

# 前端镜像
docker build -t autotemu-frontend:latest frontend/
```

### 零停机更新

```bash
# 更新后端（自动蓝绿部署）
docker-compose up -d --no-deps --build backend

# 验证更新
docker-compose ps
curl https://api.example.com/api/v1/health-check/
```

### 完整更新

```bash
# 停止旧版本
docker-compose down

# 拉取代码和镜像
git pull
docker pull autotemu-backend:latest
docker pull autotemu-frontend:latest

# 运行迁移
docker-compose run --rm backend alembic upgrade head

# 启动新版本
docker-compose up -d
```

## 性能优化

### 数据库优化

```bash
# 进入数据库
docker-compose exec db psql -U postgres app

# 分析表大小
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# 清理未使用的空间
VACUUM ANALYZE;

# 重建索引
REINDEX DATABASE app;
```

### 缓存配置

添加 Redis 缓存层（可选）：

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - default
    restart: unless-stopped
```

### 监控和调整

```bash
# 监控数据库性能
docker-compose exec db pg_stat_statements
docker-compose exec db EXPLAIN ANALYZE SELECT ...

# 检查慢查询日志
docker-compose logs --follow backend | grep "duration:"
```

## 安全加固

### 防火墙配置

```bash
# 仅允许必需的端口
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 定期备份

```bash
# 每日自动备份到外部存储
0 2 * * * /opt/AutoTemu/scripts/backup-db.sh && \
  scp /backups/postgres/backup_*.sql.gz user@backup-server:/backups/
```

### 监控文件完整性

```bash
# 检查关键文件是否被修改
md5sum /opt/AutoTemu/docker-compose.yml > checksums.md5
md5sum -c checksums.md5
```

---

**相关文档**：
- [架构设计](./architecture.md)
- [API 开发指南](./api-development.md)
