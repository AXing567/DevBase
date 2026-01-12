#!/bin/bash

# AutoTemu 数据库恢复脚本
# 用途：从备份文件恢复 PostgreSQL 数据库
# 用法：./scripts/restore-db.sh <备份文件>
# 示例：./scripts/restore-db.sh /backups/postgres/backup_20251230_020000.sql.gz
# 警告：此操作会覆盖当前数据库！

set -e

# 配置
BACKUP_FILE="${1}"
LOG_FILE="restore.log"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 确认函数
confirm() {
    local prompt="$1"
    local response

    while true; do
        read -p "$prompt (yes/no): " response
        case "$response" in
            yes|YES|Yes)
                return 0
                ;;
            no|NO|No)
                return 1
                ;;
            *)
                echo "请输入 yes 或 no"
                ;;
        esac
    done
}

log "=========================================="
log "PostgreSQL 数据库恢复开始"
log "=========================================="

# 检查参数
if [ -z "$BACKUP_FILE" ]; then
    echo "用法: $0 <备份文件>"
    echo "示例: $0 /backups/postgres/backup_20251230_020000.sql.gz"
    exit 1
fi

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    log "错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

log "备份文件: $BACKUP_FILE"
log "备份文件大小: $(du -h $BACKUP_FILE | cut -f1)"

# 显示警告
echo ""
echo "⚠️  警告: 此操作将覆盖当前数据库中的所有数据！"
echo "     备份文件: $BACKUP_FILE"
echo ""

if ! confirm "确认要从此备份文件恢复数据库吗?"; then
    log "恢复操作已取消"
    exit 0
fi

# 检查 Docker Compose 是否可用
if ! command -v docker-compose &> /dev/null; then
    log "错误: 未找到 docker-compose 命令"
    exit 1
fi

# 检查容器是否运行
if ! docker-compose ps db | grep -q "Up"; then
    log "错误: 数据库容器未运行，请先启动容器"
    exit 1
fi

log "=========================================="
log "开始恢复数据库..."
log "=========================================="

# 执行恢复
if [[ "$BACKUP_FILE" == *.gz ]]; then
    # 如果是压缩文件，先解压后恢复
    log "检测到压缩备份文件，正在解压并恢复..."
    if gunzip -c "$BACKUP_FILE" | docker-compose exec -T db psycopg2 -U postgres app; then
        log "数据库恢复成功!"
    else
        log "错误: 数据库恢复失败"
        exit 1
    fi
else
    # 直接恢复
    log "正在恢复数据库..."
    if cat "$BACKUP_FILE" | docker-compose exec -T db psql -U postgres app; then
        log "数据库恢复成功!"
    else
        log "错误: 数据库恢复失败"
        exit 1
    fi
fi

# 验证恢复
log "=========================================="
log "验证数据库恢复..."
log "=========================================="

if docker-compose exec -T db psql -U postgres app -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';" > /dev/null; then
    TABLE_COUNT=$(docker-compose exec -T db psql -U postgres app -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" | tr -d ' ')
    log "数据库表数: $TABLE_COUNT"
    log "✓ 数据库恢复验证成功"
else
    log "✗ 数据库恢复验证失败"
    exit 1
fi

log "=========================================="
log "恢复完成！"
log "=========================================="

exit 0
