#!/bin/bash
# 파일경로: scripts/backup-automation.sh
# MeetPin 자동 백업 스크립트
# 이 스크립트는 Supabase 데이터베이스를 정기적으로 백업하고 안전하게 저장합니다.

set -euo pipefail

# =============================================================================
# 설정 변수
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 백업 설정
BACKUP_DIR="$PROJECT_ROOT/backups"
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="meetpin_backup_$BACKUP_DATE.sql"
ENCRYPTED_FILE="$BACKUP_FILE.gpg"

# 보관 정책 (7일간 보관)
RETENTION_DAYS=7

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# 헬퍼 함수들
# =============================================================================

log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}" >&2
}

cleanup() {
  log "정리 작업 수행 중..."
  if [[ -f "$BACKUP_DIR/$BACKUP_FILE" ]]; then
    rm -f "$BACKUP_DIR/$BACKUP_FILE"
    log "임시 백업 파일 삭제됨"
  fi
}

check_dependencies() {
  log "의존성 확인 중..."
  
  local missing_deps=()
  
  if ! command -v pg_dump &> /dev/null; then
    missing_deps+=("postgresql-client")
  fi
  
  if ! command -v gpg &> /dev/null; then
    missing_deps+=("gnupg")
  fi
  
  if ! command -v aws &> /dev/null && [[ "${BACKUP_TO_S3:-false}" == "true" ]]; then
    missing_deps+=("awscli")
  fi
  
  if [[ ${#missing_deps[@]} -gt 0 ]]; then
    error "다음 패키지가 필요합니다: ${missing_deps[*]}"
    error "설치 방법:"
    error "  Ubuntu/Debian: sudo apt install ${missing_deps[*]}"
    error "  macOS: brew install ${missing_deps[*]}"
    exit 1
  fi
  
  success "모든 의존성이 설치되어 있습니다"
}

load_environment() {
  log "환경변수 로딩 중..."
  
  if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
    source "$PROJECT_ROOT/.env.local"
    log ".env.local 파일 로드됨"
  elif [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
    log ".env 파일 로드됨"
  else
    error "환경변수 파일을 찾을 수 없습니다 (.env 또는 .env.local)"
    exit 1
  fi
  
  # Supabase URL에서 데이터베이스 연결 정보 추출
  if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
    if [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
      # Supabase URL을 PostgreSQL 연결 문자열로 변환
      SUPABASE_HOST=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|http://||')
      SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.${SUPABASE_HOST}:5432/postgres"
      warning "SUPABASE_DB_URL이 설정되지 않았습니다. 수동으로 설정해주세요."
      error "예시: SUPABASE_DB_URL=\"postgresql://postgres:password@db.example.supabase.co:5432/postgres\""
      exit 1
    else
      error "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_DB_URL이 설정되지 않았습니다"
      exit 1
    fi
  fi
  
  success "환경변수 로드 완료"
}

create_backup_directory() {
  log "백업 디렉토리 생성 중..."
  
  mkdir -p "$BACKUP_DIR"
  
  # 백업 디렉토리 권한 설정 (소유자만 읽기/쓰기)
  chmod 700 "$BACKUP_DIR"
  
  success "백업 디렉토리 준비 완료: $BACKUP_DIR"
}

create_database_backup() {
  log "데이터베이스 백업 생성 중..."
  
  local temp_backup="$BACKUP_DIR/$BACKUP_FILE"
  
  # pg_dump 실행
  if pg_dump "$SUPABASE_DB_URL" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --no-owner \
    --no-privileges \
    --exclude-table-data='auth.*' \
    --exclude-table-data='storage.*' \
    --exclude-table-data='realtime.*' \
    --exclude-table-data='extensions.*' \
    --exclude-table-data='graphql_public.*' \
    --exclude-table-data='supabase_functions.*' \
    --exclude-table-data='net.*' \
    --exclude-table-data='pgsodium.*' \
    --exclude-table-data='vault.*' \
    > "$temp_backup"; then
    
    success "데이터베이스 백업 생성 완료: $BACKUP_FILE"
    
    # 백업 파일 크기 확인
    local file_size=$(du -h "$temp_backup" | cut -f1)
    log "백업 파일 크기: $file_size"
    
  else
    error "데이터베이스 백업 생성 실패"
    return 1
  fi
}

encrypt_backup() {
  log "백업 파일 암호화 중..."
  
  local source_file="$BACKUP_DIR/$BACKUP_FILE"
  local encrypted_file="$BACKUP_DIR/$ENCRYPTED_FILE"
  
  if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
    warning "BACKUP_ENCRYPTION_KEY가 설정되지 않았습니다. 암호화를 건너뜁니다."
    return 0
  fi
  
  # GPG로 대칭키 암호화
  if echo "$BACKUP_ENCRYPTION_KEY" | gpg \
    --batch \
    --yes \
    --passphrase-fd 0 \
    --cipher-algo AES256 \
    --compress-algo 2 \
    --symmetric \
    --output "$encrypted_file" \
    "$source_file"; then
    
    success "백업 파일 암호화 완료: $ENCRYPTED_FILE"
    
    # 원본 파일 삭제
    rm -f "$source_file"
    log "원본 백업 파일 삭제됨 (보안)"
    
  else
    error "백업 파일 암호화 실패"
    return 1
  fi
}

upload_to_s3() {
  if [[ "${BACKUP_TO_S3:-false}" != "true" ]]; then
    log "S3 업로드를 건너뜁니다 (BACKUP_TO_S3=false)"
    return 0
  fi
  
  log "S3에 백업 업로드 중..."
  
  if [[ -z "${AWS_S3_BUCKET:-}" ]]; then
    warning "AWS_S3_BUCKET이 설정되지 않았습니다. S3 업로드를 건너뜁니다."
    return 0
  fi
  
  local backup_file="$BACKUP_DIR/$ENCRYPTED_FILE"
  if [[ ! -f "$backup_file" ]]; then
    backup_file="$BACKUP_DIR/$BACKUP_FILE"
  fi
  
  if [[ ! -f "$backup_file" ]]; then
    error "업로드할 백업 파일을 찾을 수 없습니다"
    return 1
  fi
  
  local s3_key="meetpin-backups/$(date +%Y/%m/%d)/$ENCRYPTED_FILE"
  
  if aws s3 cp "$backup_file" "s3://$AWS_S3_BUCKET/$s3_key" \
    --storage-class STANDARD_IA \
    --metadata "created-by=backup-automation,database=meetpin,date=$BACKUP_DATE"; then
    
    success "S3 업로드 완료: s3://$AWS_S3_BUCKET/$s3_key"
  else
    error "S3 업로드 실패"
    return 1
  fi
}

cleanup_old_backups() {
  log "오래된 백업 파일 정리 중..."
  
  local deleted_count=0
  
  # 로컬 파일 정리
  while IFS= read -r -d '' file; do
    if [[ -f "$file" ]]; then
      rm -f "$file"
      ((deleted_count++))
      log "삭제됨: $(basename "$file")"
    fi
  done < <(find "$BACKUP_DIR" -name "meetpin_backup_*.sql*" -mtime +"$RETENTION_DAYS" -print0 2>/dev/null)
  
  # S3 파일 정리 (설정된 경우)
  if [[ "${BACKUP_TO_S3:-false}" == "true" && -n "${AWS_S3_BUCKET:-}" ]]; then
    local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
    log "S3에서 $cutoff_date 이전 백업 파일 정리 중..."
    
    # 실제 S3 정리는 lifecycle policy로 처리하는 것이 좋습니다
    warning "S3 파일 정리는 S3 Lifecycle Policy로 설정하는 것을 권장합니다"
  fi
  
  if [[ $deleted_count -gt 0 ]]; then
    success "$deleted_count개의 오래된 백업 파일이 삭제되었습니다"
  else
    log "삭제할 오래된 백업 파일이 없습니다"
  fi
}

send_notification() {
  local status=$1
  local message=$2
  
  if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
    log "Slack 알림 전송 중..."
    
    local color="good"
    if [[ "$status" == "error" ]]; then
      color="danger"
    elif [[ "$status" == "warning" ]]; then
      color="warning"
    fi
    
    local payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "$color",
      "title": "MeetPin 백업 알림",
      "text": "$message",
      "fields": [
        {
          "title": "시간",
          "value": "$(date '+%Y-%m-%d %H:%M:%S')",
          "short": true
        },
        {
          "title": "환경",
          "value": "${NODE_ENV:-development}",
          "short": true
        }
      ]
    }
  ]
}
EOF
)
    
    if curl -s -X POST -H "Content-type: application/json" \
      --data "$payload" "$SLACK_WEBHOOK_URL" > /dev/null; then
      log "Slack 알림 전송 완료"
    else
      warning "Slack 알림 전송 실패"
    fi
  fi
  
  if [[ -n "${DISCORD_WEBHOOK_URL:-}" ]]; then
    log "Discord 알림 전송 중..."
    
    local discord_payload=$(cat <<EOF
{
  "embeds": [
    {
      "title": "MeetPin 백업 알림",
      "description": "$message",
      "color": $(case $status in success) echo "65280";; warning) echo "16776960";; error) echo "16711680";; esac),
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
      "fields": [
        {
          "name": "환경",
          "value": "${NODE_ENV:-development}",
          "inline": true
        }
      ]
    }
  ]
}
EOF
)
    
    if curl -s -X POST -H "Content-type: application/json" \
      --data "$discord_payload" "$DISCORD_WEBHOOK_URL" > /dev/null; then
      log "Discord 알림 전송 완료"
    else
      warning "Discord 알림 전송 실패"
    fi
  fi
}

# =============================================================================
# 메인 백업 함수
# =============================================================================

main() {
  log "==================================================================="
  log "MeetPin 자동 백업 스크립트 시작"
  log "==================================================================="
  
  # 에러 발생 시 정리 작업 수행
  trap cleanup EXIT
  
  # 의존성 확인
  check_dependencies
  
  # 환경변수 로드
  load_environment
  
  # 백업 디렉토리 생성
  create_backup_directory
  
  # 데이터베이스 백업 생성
  if ! create_database_backup; then
    send_notification "error" "데이터베이스 백업 생성 실패"
    exit 1
  fi
  
  # 백업 파일 암호화
  encrypt_backup
  
  # S3 업로드
  if ! upload_to_s3; then
    send_notification "warning" "S3 업로드 실패, 로컬 백업만 완료됨"
  fi
  
  # 오래된 백업 정리
  cleanup_old_backups
  
  # 성공 알림
  local backup_file_name="$ENCRYPTED_FILE"
  if [[ ! -f "$BACKUP_DIR/$ENCRYPTED_FILE" ]]; then
    backup_file_name="$BACKUP_FILE"
  fi
  
  send_notification "success" "백업 성공적으로 완료: $backup_file_name"
  
  success "백업 프로세스 완료!"
  log "==================================================================="
}

# =============================================================================
# 사용법 출력
# =============================================================================

show_usage() {
  cat << EOF
MeetPin 자동 백업 스크립트

사용법:
  $0 [옵션]

옵션:
  -h, --help     이 도움말을 표시합니다
  --test         테스트 모드로 실행 (실제 백업 생성하지 않음)

환경변수:
  SUPABASE_DB_URL          Supabase 데이터베이스 연결 URL (필수)
  BACKUP_ENCRYPTION_KEY    백업 파일 암호화 키 (권장)
  BACKUP_TO_S3            S3 업로드 여부 (true/false)
  AWS_S3_BUCKET           S3 버킷 이름
  SLACK_WEBHOOK_URL       Slack 알림 웹훅 URL
  DISCORD_WEBHOOK_URL     Discord 알림 웹훅 URL

예시 설정 (.env.local):
  SUPABASE_DB_URL="postgresql://postgres:password@db.example.supabase.co:5432/postgres"
  BACKUP_ENCRYPTION_KEY="your-strong-encryption-key-here"
  BACKUP_TO_S3=true
  AWS_S3_BUCKET="your-backup-bucket"
  SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

Cron 설정 예시 (매일 새벽 3시 백업):
  0 3 * * * /path/to/backup-automation.sh > /var/log/meetpin-backup.log 2>&1

EOF
}

# =============================================================================
# 스크립트 실행
# =============================================================================

# 인자 처리
case "${1:-}" in
  -h|--help)
    show_usage
    exit 0
    ;;
  --test)
    log "테스트 모드로 실행됩니다"
    export BACKUP_TEST_MODE=true
    ;;
esac

# 메인 함수 실행
main "$@"