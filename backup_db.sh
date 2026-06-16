#!/usr/bin/env bash
# Usage:
#   ./backup_db.sh             # backup staging
#   ./backup_db.sh prod        # backup production
set -euo pipefail

ENV="${1:-staging}"

if [[ "$ENV" == "prod" || "$ENV" == "production" ]]; then
  SERVER="root@10.10.50.112"
  LABEL="prod"
else
  SERVER="root@192.168.200.214"
  LABEL="staging"
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="myscore_${LABEL}_${TIMESTAMP}.sql.gz"
LOCAL_DIR="$HOME/backups/myscore"

mkdir -p "$LOCAL_DIR"

echo "Backing up $LABEL database → $LOCAL_DIR/$BACKUP_FILE"

ssh "$SERVER" "
  docker exec myscore-postgres-1 pg_dump -U myscore myscore | gzip
" > "$LOCAL_DIR/$BACKUP_FILE"

SIZE=$(du -sh "$LOCAL_DIR/$BACKUP_FILE" | cut -f1)
echo "Done: $LOCAL_DIR/$BACKUP_FILE ($SIZE)"

# Keep only the 10 most recent backups per environment
ls -t "$LOCAL_DIR/myscore_${LABEL}_"*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm --
KEPT=$(ls "$LOCAL_DIR/myscore_${LABEL}_"*.sql.gz 2>/dev/null | wc -l)
echo "Backups retained: $KEPT"
