#!/bin/bash

# AutoTemu 数据库备份脚本
# 用途：备份 PostgreSQL 数据库，自动压缩和清理旧备份
# 用法：./scripts/backup-db.sh [备份目录]
# 示例：./scripts/backup-db.sh /backups/postgres

set -e

# 配置
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "PostgreSQL 数据库备份开始"
log "备份目录: $BACKUP_DIR"
log "=========================================="

# 检查 Docker Compose 是否可用
if ! command -v docker-compose &> /dev/null; then
    log "错误: 未找到 docker-compose 命令"
    exit 1
fi

# 检查容器是否运行
if ! docker-compose ps db | grep -q "Up"; then
    log "错误: 数据库容器未运行"
    exit 1
fi

# 执行备份
log "正在备份数据库..."
if docker-compose exec -T db pg_dump -U postgres app > "$BACKUP_FILE"; then
    log "数据库备份成功: $BACKUP_FILE"
else
    log "错误: 数据库备份失败"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# 获取备份文件大小
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "备份文件大小: $BACKUP_SIZE"

# 压缩备份文件
log "正在压缩备份文件..."
if gzip "$BACKUP_FILE"; then
    log "压缩成功: ${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    log "压缩后大小: $COMPRESSED_SIZE"
else
    log "错误: 压缩失败"
    rm -f "$BACKUP_FILE" "${BACKUP_FILE}.gz"
    exit 1
fi

# 清理超过 30 天的旧备份
log "清理旧备份（保留最近 30 天）..."
DELETED_COUNT=0
while IFS= read -r old_backup; do
    if [ -n "$old_backup" ]; then
        rm -f "$old_backup"
        log "已删除: $(basename $old_backup)"
        ((DELETED_COUNT++))
    fi
done < <(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30)

log "已删除 $DELETED_COUNT 个旧备份文件"

# 备份完成统计
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "=========================================="
log "备份完成！"
log "当前备份数: $TOTAL_BACKUPS 个"
log "备份目录总大小: $TOTAL_SIZE"
log "=========================================="

exit 0
