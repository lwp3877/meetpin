# 🗄️ Supabase 데이터베이스 마이그레이션 가이드

> **전제 조건**: Vercel 환경 변수가 설정되어 있어야 합니다
> **목표**: 프로덕션 데이터베이스에 모든 테이블 및 보안 정책 생성

---

## 📋 마이그레이션 개요

### 실행할 스크립트 (순서대로)

| 순서 | 파일 | 목적 | 라인 수 | 필수 |
|------|------|------|---------|------|
| 1 | `scripts/migrate.sql` | 테이블, 인덱스, 트리거 생성 | 337줄 | ✅ 필수 |
| 2 | `scripts/rls.sql` | Row Level Security 정책 | 283줄 | ✅ 필수 |
| 3 | `scripts/seed.sql` | 샘플 데이터 (개발용) | 153줄 | ⚠️ 선택 |

**총 실행 시간**: 약 5-10분

---

## 🚀 1단계: Supabase Dashboard 접속

1. https://supabase.com/dashboard 접속
2. **meetpin** 프로젝트 선택 (xnrqfkecpabucnoxxtwa)
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭

---

## 📄 2단계: migrate.sql 실행

### 2-1. 스크립트 내용 확인

**생성되는 테이블** (8개):
```sql
1. profiles          - 사용자 프로필
2. rooms             - 모임방
3. requests          - 참가 요청
4. matches           - 매칭 (수락된 요청)
5. messages          - 1:1 채팅 메시지
6. reports           - 신고
7. host_messages     - 호스트 메시지
8. blocked_users     - 차단 목록
```

**생성되는 인덱스** (성능 최적화):
```sql
- rooms: lat/lng (지도 검색)
- rooms: start_at (시간 필터링)
- rooms: boost_until (부스트 정렬)
- requests: room_id, requester_uid
- matches: room_id, host_uid, guest_uid
- messages: match_id, created_at
- reports: status
```

**생성되는 트리거**:
```sql
- updated_at 자동 업데이트
- 새 사용자 프로필 자동 생성
- 요청 수락 시 매칭 자동 생성
- 매칭 생성 시 알림 자동 생성
```

### 2-2. 실행 방법

```bash
# 로컬에서 파일 열기
cat scripts/migrate.sql

# 또는 직접 복사
```

1. **SQL Editor**에서 **New query** 클릭
2. `scripts/migrate.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. 성공 메시지 확인:
   ```
   Success. No rows returned
   ```

### 2-3. 에러 발생 시

**"relation already exists" 에러**:
```sql
-- 이미 테이블이 존재하는 경우
-- migrate.sql에 "IF NOT EXISTS"가 있어서 안전함
-- 무시하고 계속 진행
```

**"permission denied" 에러**:
```sql
-- Supabase Service Role 권한 필요
-- Dashboard에서 실행하면 자동으로 권한 부여됨
```

---

## 🔒 3단계: rls.sql 실행 (보안 정책)

### 3-1. RLS 정책 개요

**보안 정책** (총 30+ 정책):

**Profiles**:
- ✅ 본인 프로필은 읽기/수정 가능
- ✅ 다른 사용자 프로필은 읽기만 가능
- ✅ 차단한 사용자는 서로 안 보임

**Rooms**:
- ✅ 모든 사용자가 공개 방 조회 가능
- ✅ 호스트만 자기 방 수정/삭제
- ✅ 차단한 사용자의 방은 안 보임

**Requests**:
- ✅ 본인이 보낸/받은 요청만 조회
- ✅ 요청자만 삭제 가능
- ✅ 호스트만 수락/거절 가능

**Matches**:
- ✅ 매칭된 두 사람만 조회 가능
- ✅ 호스트만 매칭 삭제 가능

**Messages**:
- ✅ 매칭된 두 사람만 메시지 조회/작성
- ✅ 차단 시 메시지 전송 불가

**Reports**:
- ✅ 본인이 신고한 내용만 조회
- ✅ Admin만 모든 신고 조회

**Blocked Users**:
- ✅ 본인이 차단한 목록만 조회/수정

### 3-2. 실행 방법

1. **SQL Editor**에서 **New query** 클릭
2. `scripts/rls.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭
5. 성공 메시지 확인

### 3-3. RLS 정책 확인

```sql
-- 모든 테이블의 RLS 활성화 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 예상 결과: 모든 테이블 rowsecurity = true
```

```sql
-- 정책 개수 확인
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- 예상 결과: 30+ 정책
```

---

## 🌱 4단계: seed.sql 실행 (선택 사항)

### 4-1. 샘플 데이터 개요

**생성되는 샘플 데이터**:
```
- 테스트 사용자 3명
- 서울 지역 샘플 모임 10개
- 샘플 참가 요청 5개
```

⚠️ **주의**:
- **프로덕션 환경에서는 실행하지 마세요!**
- 개발/테스트 환경에서만 사용
- 실제 사용자 데이터와 섞일 수 있음

### 4-2. 실행 방법 (개발 환경만)

1. **SQL Editor**에서 **New query** 클릭
2. `scripts/seed.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

---

## ✅ 5단계: 마이그레이션 확인

### 5-1. 테이블 생성 확인

```sql
-- 모든 테이블 목록 조회
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 예상 결과 (8개):
-- blocked_users
-- host_messages
-- matches
-- messages
-- profiles
-- reports
-- requests
-- rooms
```

### 5-2. 인덱스 확인

```sql
-- 모든 인덱스 확인
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 예상: 15+ 인덱스
```

### 5-3. 트리거 확인

```sql
-- 모든 트리거 확인
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 예상: 10+ 트리거
```

---

## 🧪 6단계: 데이터베이스 테스트

### 6-1. 프로필 생성 테스트

```sql
-- 테스트 사용자 생성 (Supabase Auth에서 먼저 생성 필요)
-- Auth User ID를 얻은 후:

INSERT INTO profiles (uid, nickname, age_range)
VALUES (
  'your-auth-user-id',
  '테스트유저',
  '20s_late'
);

-- 성공 시: INSERT 0 1
```

### 6-2. 방 생성 테스트

```sql
-- 테스트 방 생성
INSERT INTO rooms (
  host_uid,
  title,
  category,
  lat,
  lng,
  place_text,
  start_at,
  max_people
)
VALUES (
  'your-auth-user-id',
  '강남에서 술모임',
  'drink',
  37.4979,
  127.0276,
  '강남역 3번 출구',
  NOW() + INTERVAL '2 hours',
  4
);

-- 성공 시: INSERT 0 1
```

### 6-3. RLS 테스트

```sql
-- 본인 프로필 조회 (성공해야 함)
SELECT * FROM profiles WHERE uid = auth.uid();

-- 다른 사람 프로필 수정 시도 (실패해야 함)
UPDATE profiles
SET nickname = '해킹시도'
WHERE uid != auth.uid();

-- 예상: UPDATE 0 (아무것도 수정 안 됨)
```

---

## 🔍 7단계: Production 연결 확인

### 7-1. Health API 확인

```bash
curl https://meetpin-weld.vercel.app/api/health
```

**성공 시 응답**:
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "connected"  // ✅ 이제 connected!
    }
  }
}
```

### 7-2. 실제 앱에서 테스트

1. https://meetpin-weld.vercel.app 접속
2. 회원가입 시도
3. 프로필 작성
4. 지도에서 모임 생성
5. 다른 사용자로 참가 요청

---

## 🆘 문제 해결

### "database: disconnected" 계속 나올 때

**원인 1**: Vercel 환경 변수 미설정
```bash
# 해결: VERCEL-SETUP-GUIDE.md 참조
```

**원인 2**: Supabase 프로젝트 일시 중지
```bash
# 해결: Supabase Dashboard에서 프로젝트 재시작
```

**원인 3**: 환경 변수 값 오타
```bash
# 해결: Supabase Dashboard → Settings → API에서 키 재확인
```

### 마이그레이션 실행 중 에러

**"syntax error"**:
```sql
-- 원인: SQL 복사 시 일부만 복사됨
-- 해결: 파일 전체 내용 다시 복사
```

**"relation already exists"**:
```sql
-- 원인: 이미 테이블이 존재
-- 해결: 무시하고 계속 진행 (IF NOT EXISTS 사용)
```

**"permission denied"**:
```sql
-- 원인: 권한 부족
-- 해결: Supabase Dashboard SQL Editor에서 실행 (자동 권한 부여)
```

### RLS 정책 문제

**"new row violates RLS policy"**:
```sql
-- 원인: 잘못된 RLS 정책
-- 해결 1: rls.sql 다시 실행
-- 해결 2: 해당 테이블 RLS 일시 비활성화
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
-- 문제 해결 후 다시 활성화
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

---

## 📝 체크리스트

**마이그레이션 전**:
- [ ] Vercel 환경 변수 설정 완료
- [ ] Supabase Dashboard 접속
- [ ] SQL Editor 열기
- [ ] migrate.sql 파일 준비

**마이그레이션 중**:
- [ ] migrate.sql 실행 (테이블 생성)
- [ ] rls.sql 실행 (보안 정책)
- [ ] seed.sql 실행 (선택, 개발만)

**마이그레이션 후**:
- [ ] 테이블 8개 생성 확인
- [ ] RLS 정책 30+ 개 확인
- [ ] 트리거 10+ 개 확인
- [ ] Health API "connected" 확인
- [ ] 실제 앱에서 회원가입 테스트

---

## 🎯 다음 단계

마이그레이션 완료 후:
1. ✅ Production 앱 테스트
2. ✅ 실제 회원가입/로그인
3. ✅ 모임 생성/참가
4. ⚠️ Stripe 실제 키 설정 (결제 기능 사용 시)
5. ⚠️ Kakao Maps API 보안 설정

---

**작성일**: 2025년 10월 5일
**상태**: Ready to migrate
**예상 소요 시간**: 5-10분
