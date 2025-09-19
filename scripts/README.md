# MeetPin Database Setup Scripts

이 디렉토리는 MeetPin 프로덕션 데이터베이스 설정을 위한 SQL 스크립트들을 포함합니다.

## 📂 스크립트 구성

### 1. `001-create-tables.sql`
**데이터베이스 테이블 생성 스크립트**
- 12개 핵심 테이블 생성
- 50개 이상의 최적화된 인덱스
- 데이터 무결성을 위한 제약조건
- 자동 업데이트 트리거 설정

**포함된 테이블:**
- `profiles` - 사용자 프로필
- `rooms` - 모임방 정보
- `requests` - 참가 신청
- `matches` - 매칭 관계
- `messages` - 1:1 채팅 메시지
- `host_messages` - 호스트 직접 메시지
- `blocked_users` - 사용자 차단 관리
- `reports` - 신고 시스템
- `notifications` - 알림 시스템
- `feedback` - 사용자 평가
- `payment_records` - 결제 기록
- `analytics_events` - 사용자 행동 분석

### 2. `002-row-level-security.sql`
**Row Level Security (RLS) 정책 설정**
- 30개 이상의 보안 정책
- 사용자별 데이터 접근 제어
- 차단 사용자 간 데이터 격리
- 관리자 권한 분리

**주요 보안 기능:**
- 개인정보 보호
- 차단 사용자 간 상호 격리
- 역할 기반 접근 제어 (RBAC)
- 데이터 유출 방지

### 3. `003-triggers.sql`
**비즈니스 로직 및 트리거 설정**
- 12개 핵심 비즈니스 트리거
- 자동 알림 시스템
- 실시간 데이터 동기화
- 데이터 검증 및 무결성 보장

**주요 자동화 기능:**
- 회원가입 시 프로필 자동 생성
- 참가 수락 시 매칭 자동 생성
- 새 메시지 실시간 알림
- 결제 완료 시 부스트 자동 적용
- 방 정원 초과 방지

### 4. `004-seed-data.sql`
**개발용 테스트 데이터**
- 9명의 테스트 사용자 (관리자 1명 포함)
- 10개의 다양한 카테고리 모임
- 실제 서울 지역 기반 위치 데이터
- 완전한 사용자 플로우 시나리오

**⚠️ 주의사항:** 개발 환경에서만 사용! 프로덕션에서 실행 금지

## 🚀 설치 순서

### Supabase 대시보드에서 실행

1. **Supabase 프로젝트 접속**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **SQL Editor 열기**
   - 좌측 메뉴 → SQL Editor

3. **스크립트 순차 실행**
   ```sql
   -- 1단계: 테이블 생성
   -- 001-create-tables.sql 내용 복사 후 실행
   
   -- 2단계: 보안 정책 적용
   -- 002-row-level-security.sql 내용 복사 후 실행
   
   -- 3단계: 트리거 설정
   -- 003-triggers.sql 내용 복사 후 실행
   
   -- 4단계: 테스트 데이터 (개발 환경만)
   -- 004-seed-data.sql 내용 복사 후 실행
   ```

### 로컬 psql에서 실행

```bash
# Supabase 연결 정보 설정
export PGHOST="db.your-project-ref.supabase.co"
export PGDATABASE="postgres"
export PGUSER="postgres"
export PGPASSWORD="your-password"
export PGPORT="5432"

# 스크립트 순차 실행
psql -f scripts/001-create-tables.sql
psql -f scripts/002-row-level-security.sql
psql -f scripts/003-triggers.sql

# 개발 환경에서만 실행
psql -f scripts/004-seed-data.sql
```

## 🔍 검증 방법

### 1. 테이블 생성 확인
```sql
-- 모든 테이블이 생성되었는지 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 예상 결과: 12개 테이블
```

### 2. RLS 정책 확인
```sql
-- RLS 정책이 적용되었는지 확인
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 예상 결과: 30개 이상의 정책
```

### 3. 트리거 확인
```sql
-- 트리거가 생성되었는지 확인
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 예상 결과: 12개 이상의 트리거
```

### 4. 테스트 데이터 확인 (개발 환경)
```sql
-- 테스트 데이터가 삽입되었는지 확인
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM rooms) as rooms_count,
  (SELECT COUNT(*) FROM requests) as requests_count,
  (SELECT COUNT(*) FROM matches) as matches_count;

-- 예상 결과: profiles=9, rooms=10, requests=10, matches=7
```

## 📊 데이터베이스 스키마 다이어그램

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles ←→ blocked_users
    ↓
rooms ←→ requests ←→ matches ←→ messages
    ↓           ↓
host_messages   notifications
    ↓
feedback
    ↓
payment_records
    ↓
analytics_events
    ↓
reports
```

## 🔐 보안 고려사항

1. **Row Level Security (RLS)**
   - 모든 테이블에 RLS 활성화
   - 사용자별 데이터 격리
   - 차단 사용자 간 완전 격리

2. **데이터 검증**
   - 입력 데이터 길이 제한
   - 지리적 좌표 유효성 검증
   - 비즈니스 규칙 강제 적용

3. **감사 로그**
   - 모든 테이블의 생성/수정 시간 추적
   - 사용자 행동 분석 데이터 수집
   - 보안 이벤트 모니터링

## 🚨 프로덕션 배포 주의사항

1. **백업 필수**
   ```sql
   -- 배포 전 현재 데이터베이스 백업
   pg_dump -h hostname -U username -d database > backup.sql
   ```

2. **점진적 배포**
   - 테이블 생성 → RLS 적용 → 트리거 설정 순서 준수
   - 각 단계별 검증 후 다음 단계 진행

3. **성능 모니터링**
   - 인덱스 사용률 모니터링
   - 쿼리 성능 최적화
   - 커넥션 풀 관리

4. **시드 데이터 주의**
   - `004-seed-data.sql`는 개발 환경에서만 실행
   - 프로덕션에서는 절대 실행하지 말 것

## 📞 지원

스크립트 실행 중 문제가 발생하면:

1. **로그 확인**: Supabase 대시보드의 Logs 섹션 확인
2. **권한 확인**: 데이터베이스 사용자 권한 검증
3. **순서 확인**: 스크립트 실행 순서 준수 여부 확인

## 📝 버전 정보

- **Version**: 1.0.0
- **Created**: 2025-01-15
- **Compatible with**: Supabase PostgreSQL 15+
- **Required Extensions**: uuid-ossp (자동 설치됨)

---

**⚠️ 중요**: 이 스크립트들은 Supabase의 PostgreSQL 환경에 최적화되어 있습니다. 다른 PostgreSQL 환경에서 사용 시 일부 수정이 필요할 수 있습니다.