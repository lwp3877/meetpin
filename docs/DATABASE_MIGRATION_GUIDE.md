# 데이터베이스 마이그레이션 가이드

사용자 안전 시스템 데이터베이스 스키마를 Supabase에 적용하는 방법입니다.

## 📋 목차

1. [사전 요구사항](#사전-요구사항)
2. [마이그레이션 단계](#마이그레이션-단계)
3. [검증 방법](#검증-방법)
4. [롤백 방법](#롤백-방법)
5. [문제 해결](#문제-해결)

## 🔧 사전 요구사항

- Supabase 프로젝트 접근 권한 (Project Owner 또는 Admin)
- Supabase Dashboard 접속 ([https://supabase.com/dashboard](https://supabase.com/dashboard))
- 프로젝트 백업 권장 (중요한 데이터가 있는 경우)

## 📝 마이그레이션 단계

### 1단계: Supabase SQL Editor 접속

1. Supabase Dashboard에 로그인
2. 해당 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭

### 2단계: 사용자 안전 시스템 스키마 실행

1. `scripts/user-safety-system.sql` 파일 열기
2. 전체 SQL 내용 복사
3. Supabase SQL Editor에 붙여넣기
4. **Run** 버튼 클릭 (또는 `Ctrl + Enter`)

#### 생성되는 테이블 목록:

```sql
✅ user_verifications          -- 사용자 신원 확인 (휴대폰, 신분증, 이메일, 성인 인증)
✅ meetup_feedback             -- 모임 후 안전 피드백 및 평가
✅ age_verification_logs       -- 연령 인증 로그 (GDPR 준수)
✅ emergency_reports           -- 긴급 상황 신고 및 처리
✅ user_safety_settings        -- 사용자 안전 설정
✅ minor_protection_policies   -- 미성년자 보호 정책
```

### 3단계: Row Level Security (RLS) 정책 확인

스크립트 실행 후 자동으로 RLS가 활성화되며, 다음 정책들이 적용됩니다:

#### user_verifications
- 사용자는 자신의 인증 요청만 조회/생성 가능
- 관리자는 모든 인증 요청 조회/수정 가능

#### meetup_feedback
- 참가자는 자신이 제출한 피드백만 조회/생성 가능
- 호스트는 자신의 모임에 대한 피드백 조회 가능
- 관리자는 모든 피드백 조회 가능

#### emergency_reports
- 신고자는 자신의 신고만 조회 가능
- 관리자는 모든 신고 조회/수정 가능

#### user_safety_settings
- 사용자는 자신의 설정만 조회/수정 가능

#### age_verification_logs
- 사용자는 자신의 로그만 조회 가능
- 관리자는 모든 로그 조회 가능

#### minor_protection_policies
- 모든 사용자가 정책 조회 가능
- 관리자만 정책 수정 가능

### 4단계: 인덱스 및 제약조건 확인

다음 항목들이 자동으로 생성됩니다:

```sql
-- 인덱스
✅ idx_user_verifications_user_id
✅ idx_user_verifications_status
✅ idx_meetup_feedback_room_id
✅ idx_meetup_feedback_attendee_id
✅ idx_emergency_reports_status
✅ idx_emergency_reports_priority

-- 외래 키 제약조건
✅ user_verifications -> profiles(user_id)
✅ meetup_feedback -> rooms(room_id)
✅ meetup_feedback -> profiles(attendee_id, host_id)
✅ emergency_reports -> profiles(reporter_id, reported_user_id)
✅ user_safety_settings -> profiles(user_id)
```

## ✅ 검증 방법

### 1. 테이블 생성 확인

SQL Editor에서 실행:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_verifications',
    'meetup_feedback',
    'age_verification_logs',
    'emergency_reports',
    'user_safety_settings',
    'minor_protection_policies'
  );
```

**예상 결과:** 6개 테이블이 모두 표시되어야 함

### 2. RLS 정책 확인

```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_verifications',
    'meetup_feedback',
    'emergency_reports',
    'user_safety_settings'
  );
```

**예상 결과:** 각 테이블별로 여러 개의 RLS 정책이 표시됨

### 3. 인덱스 확인

```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'user_verifications',
    'meetup_feedback',
    'emergency_reports'
  );
```

**예상 결과:** 각 테이블별 인덱스가 표시됨

### 4. 테스트 데이터 삽입 (선택사항)

```sql
-- 안전 설정 생성 테스트
INSERT INTO user_safety_settings (user_id)
VALUES ('your-user-id-here')
ON CONFLICT (user_id) DO NOTHING;

-- 조회 테스트
SELECT * FROM user_safety_settings WHERE user_id = 'your-user-id-here';
```

## 🔄 롤백 방법

마이그레이션을 되돌려야 하는 경우:

```sql
-- ⚠️ 주의: 이 작업은 모든 데이터를 삭제합니다!

-- 테이블 삭제 (역순으로)
DROP TABLE IF EXISTS minor_protection_policies CASCADE;
DROP TABLE IF EXISTS user_safety_settings CASCADE;
DROP TABLE IF EXISTS emergency_reports CASCADE;
DROP TABLE IF EXISTS age_verification_logs CASCADE;
DROP TABLE IF EXISTS meetup_feedback CASCADE;
DROP TABLE IF EXISTS user_verifications CASCADE;
```

## 🔧 문제 해결

### 문제 1: "relation already exists" 오류

**원인:** 테이블이 이미 존재함

**해결방법:**
```sql
-- 기존 테이블 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_verifications';

-- 필요시 기존 테이블 삭제 후 재생성
DROP TABLE IF EXISTS user_verifications CASCADE;
```

### 문제 2: "foreign key constraint" 오류

**원인:** 참조하는 테이블(profiles, rooms 등)이 없음

**해결방법:**
1. `scripts/migrate.sql` 먼저 실행하여 기본 테이블 생성
2. 그 후 `scripts/user-safety-system.sql` 실행

### 문제 3: "permission denied" 오류

**원인:** RLS 정책 충돌 또는 권한 부족

**해결방법:**
```sql
-- RLS 일시 비활성화
ALTER TABLE user_verifications DISABLE ROW LEVEL SECURITY;

-- 작업 완료 후 다시 활성화
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
```

### 문제 4: 관리자 권한 필요

**관리자 사용자 설정:**

```sql
-- 특정 사용자를 관리자로 설정
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@meetpin.com';
```

## 📊 마이그레이션 후 확인사항

### 1. API 엔드포인트 테스트

```bash
# 안전 설정 조회
curl -X GET https://your-domain.com/api/safety/settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# 인증 요청 생성
curl -X POST https://your-domain.com/api/safety/verification \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"verification_type": "phone"}'

# 긴급 신고 조회
curl -X GET https://your-domain.com/api/safety/emergency \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 프론트엔드 페이지 확인

- ✅ `/settings/safety` - 안전 설정 페이지 접근 가능
- ✅ `/admin` - 관리자 대시보드 (관리자만)
- ✅ 긴급 신고 버튼 정상 동작

### 3. 성능 확인

```sql
-- 인덱스 사용 확인
EXPLAIN ANALYZE
SELECT * FROM user_verifications
WHERE user_id = 'your-user-id'
  AND status = 'approved';

-- 결과에서 "Index Scan"이 표시되어야 함
```

## 🚀 프로덕션 배포 체크리스트

- [ ] 백업 완료
- [ ] 스테이징 환경에서 마이그레이션 테스트 완료
- [ ] RLS 정책 검증 완료
- [ ] API 엔드포인트 테스트 완료
- [ ] 프론트엔드 연동 테스트 완료
- [ ] 롤백 계획 수립
- [ ] 관리자 계정 설정 완료
- [ ] 모니터링 설정 (에러 추적, 성능 메트릭)

## 📞 지원

문제가 발생하면:

1. [Supabase Documentation](https://supabase.com/docs)
2. [프로젝트 이슈](https://github.com/your-repo/issues)
3. 개발팀에 문의

---

**마지막 업데이트:** 2025-10-06
**작성자:** Claude Code
**버전:** 1.0.0
