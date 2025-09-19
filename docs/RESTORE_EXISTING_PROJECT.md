# 🔄 기존 Supabase 프로젝트 복원 및 업그레이드 가이드

> **좋은 소식!** 새로 프로젝트를 만들 필요가 없습니다. 기존 Supabase 프로젝트를 그대로 사용하면서 현재 개선된 코드베이스를 연결할 수 있어요.

## 🎯 복원 방법 선택

### **옵션 A: 기존 프로젝트 그대로 사용 (권장)**
- ✅ 기존 데이터 유지
- ✅ URL 변경 없음
- ✅ 빠른 복원 가능
- ⚠️ 데이터베이스 스키마 업데이트 필요

### **옵션 B: 새 프로젝트 생성**
- ✅ 깨끗한 시작
- ✅ 최신 스키마 적용
- ❌ 기존 데이터 손실
- ❌ URL 변경 필요

## 🔧 옵션 A: 기존 프로젝트 복원 (권장)

### **1단계: 기존 Supabase 프로젝트 접속**

```bash
# 1. Supabase Dashboard 접속
# https://supabase.com/dashboard

# 2. 기존 프로젝트 선택
# 프로젝트 목록에서 'meetpin' 또는 이전에 만든 프로젝트 클릭

# 3. 프로젝트 상태 확인
# - Settings > General > Project details
# - Database > Tables (기존 테이블 확인)
```

### **2단계: API 키 확인 및 복사**

```bash
# Supabase Dashboard에서
# Settings > API > API Keys

# 다음 키들을 복사해두세요:
# - Project URL: https://[project-id].supabase.co
# - anon public key: eyJhbGci...
# - service_role secret key: eyJhbGci...
```

### **3단계: 환경변수 설정**

```bash
# .env.local 파일 생성
cp .env.example .env.local

# 다음 내용으로 수정:
```

```env
# ===========================================
# 🔄 기존 Supabase 프로젝트 연결
# ===========================================
NODE_ENV=development
NEXT_PUBLIC_USE_MOCK_DATA=false

# 기존 Supabase 프로젝트 정보
NEXT_PUBLIC_SUPABASE_URL=https://[기존-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[기존-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[기존-service-role-key]

# 기타 설정 (기존 값 사용)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=[기존-kakao-key]
STRIPE_SECRET_KEY=[기존-stripe-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[기존-stripe-public-key]
STRIPE_WEBHOOK_SECRET=[기존-webhook-secret]

SITE_URL=http://localhost:3000
```

### **4단계: 데이터베이스 스키마 업데이트**

#### **현재 스키마 확인**
```sql
-- Supabase SQL Editor에서 실행
-- 기존 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

#### **스키마 업데이트 적용**
```sql
-- 1. 새로운 컬럼이나 테이블 추가 (scripts/migrate.sql 참고)
-- 기존 데이터를 유지하면서 안전하게 업데이트

-- 예시: rooms 테이블에 boost_until 컬럼 추가 (없는 경우)
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS boost_until TIMESTAMP WITH TIME ZONE;

-- 예시: 새로운 테이블 추가 (없는 경우)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **RLS 정책 업데이트**
```sql
-- 2. 새로운 RLS 정책 적용 (scripts/rls.sql 참고)
-- 기존 정책과 충돌하지 않게 조건부 생성

-- 예시: 새로운 테이블의 RLS 활성화
ALTER TABLE IF EXISTS achievements ENABLE ROW LEVEL SECURITY;

-- 예시: 새로운 정책 추가
CREATE POLICY IF NOT EXISTS "Users can view own achievements" 
ON achievements FOR SELECT 
USING (auth.uid() = user_id);
```

### **5단계: 연결 테스트**

```bash
# 개발 서버 시작
pnpm dev

# Health Check API 테스트
curl http://localhost:3000/api/health

# 예상 응답:
{
  "ok": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-19T...",
    "version": "1.3.1-signup-login-fix",
    "env": "development"
  }
}
```

#### **데이터베이스 연결 확인**
```bash
# 브라우저에서 확인
# http://localhost:3000/map

# 기존 데이터가 보이는지 확인:
# - 이전에 만든 방들
# - 사용자 프로필들  
# - 메시지 기록들
```

### **6단계: 점진적 기능 테스트**

```bash
# 1. 인증 테스트
# - 기존 계정으로 로그인
# - 새 계정 생성

# 2. 방 생성/수정 테스트
# - 새로운 방 만들기
# - 기존 방 수정하기

# 3. 실시간 기능 테스트  
# - 채팅 메시지 송수신
# - 알림 수신

# 4. 결제 기능 테스트
# - 부스트 구매 (테스트 모드)
```

## 🔄 데이터 마이그레이션 가이드

### **안전한 스키마 업데이트 방법**

#### **백업 먼저!**
```sql
-- 1. 중요 데이터 백업
-- Supabase Dashboard > Database > Backups
-- 수동 백업 생성 또는 SQL 덤프 다운로드
```

#### **점진적 업데이트**
```sql
-- 2. 컬럼 추가 (기존 데이터 유지)
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS boost_until TIMESTAMP WITH TIME ZONE;

-- 3. 인덱스 추가 (성능 개선)
CREATE INDEX IF NOT EXISTS idx_rooms_boost_until 
ON rooms(boost_until);

-- 4. 새로운 테이블 생성
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **데이터 변환 (필요한 경우)**
```sql
-- 예시: 기존 데이터 형식 변환
UPDATE rooms 
SET boost_until = created_at + INTERVAL '7 days'
WHERE boost_until IS NULL AND created_at > NOW() - INTERVAL '30 days';
```

## ⚠️ 주의사항 및 문제 해결

### **일반적인 문제들**

#### **1. 스키마 충돌**
```sql
-- 해결: 조건부 생성 사용
CREATE TABLE IF NOT EXISTS table_name (...);
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE;
```

#### **2. RLS 정책 충돌**  
```sql
-- 해결: 기존 정책 확인 후 생성
DROP POLICY IF EXISTS "old_policy_name" ON table_name;
CREATE POLICY "new_policy_name" ON table_name ...;
```

#### **3. 환경변수 인식 안됨**
```bash
# 해결: 개발 서버 재시작
pnpm dev
```

#### **4. 인증 오류**
```bash
# 해결: 키 확인 및 재발급
# Supabase Dashboard > Settings > API > Reset keys
```

### **롤백 계획**

#### **문제 발생 시 즉시 조치**
```bash
# 1. Mock 모드로 전환 (임시)
# .env.local에서 
NEXT_PUBLIC_USE_MOCK_DATA=true

# 2. 개발 서버 재시작
pnpm dev

# 3. 백업에서 복원 (필요시)
# Supabase Dashboard > Database > Backups > Restore
```

## 📋 업그레이드 체크리스트

### **복원 전 준비**
- [ ] 기존 Supabase 프로젝트 URL 확인
- [ ] API 키들 복사 완료
- [ ] 현재 데이터베이스 백업 생성
- [ ] .env.local 파일 준비

### **복원 과정**
- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 연결 확인
- [ ] 스키마 업데이트 적용
- [ ] RLS 정책 업데이트
- [ ] Health Check API 정상 응답

### **테스트 및 검증**
- [ ] 기존 데이터 정상 로드 확인
- [ ] 로그인/회원가입 기능 테스트
- [ ] 방 생성/수정 기능 테스트
- [ ] 실시간 채팅 기능 테스트
- [ ] 결제 기능 테스트 (개발 모드)

### **최종 확인**
- [ ] 모든 기능 정상 동작
- [ ] 콘솔 에러 없음
- [ ] 성능 이슈 없음
- [ ] 새로운 기능들 정상 작동

## 🎯 성공적인 복원을 위한 팁

### **1. 단계별 진행**
- 한 번에 모든 것을 바꾸지 마세요
- 각 단계마다 테스트하고 다음으로 진행
- 문제 발생 시 이전 단계로 롤백

### **2. 백업의 중요성**
- 복원 작업 전 반드시 백업 생성
- 여러 시점의 백업 유지
- 백업 복원 절차 미리 숙지

### **3. 점진적 기능 활성화**
- Mock 모드로 시작해서 단계별로 실제 연결
- 기능별로 하나씩 테스트
- 문제가 없으면 다음 기능 활성화

---

## ✅ 결론

**기존 Supabase 프로젝트를 그대로 사용하는 것이 가장 효율적입니다!**

- 🔄 **기존 데이터 보존**: 지금까지의 작업 내용 유지
- 🚀 **빠른 복원**: 새 프로젝트 생성보다 훨씬 빠름  
- 🛡️ **안전한 업그레이드**: 백업과 점진적 적용으로 위험 최소화
- 📈 **개선된 기능**: 새로운 코드베이스의 모든 개선사항 적용

이 가이드를 따라하면 **기존 프로젝트를 안전하게 업그레이드**할 수 있습니다!