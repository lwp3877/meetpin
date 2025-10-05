# 🚀 Vercel 환경 변수 설정 가이드

> **현재 상태**: Production이 "database: disconnected" - Supabase 환경 변수 미설정
> **목표**: 실제 데이터베이스 연결하여 프로덕션 완성

---

## 📋 1단계: Vercel Dashboard 접속

1. https://vercel.com/dashboard 접속
2. **meetpin** 프로젝트 선택
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 선택

---

## 🔐 2단계: 환경 변수 추가

### 필수 변수 (Supabase)

**NEXT_PUBLIC_SUPABASE_URL**
```
Value: https://xnrqfkecpabucnoxxtwa.supabase.co
Environment: Production, Preview, Development (모두 체크)
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzUyNjYsImV4cCI6MjA3MTg1MTI2Nn0.YkIzsHezbQwLKc7hTM9akTZEh6kT2m9MLzmaIwpXEks
Environment: Production, Preview, Development (모두 체크)
```

**SUPABASE_SERVICE_ROLE_KEY**
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3NTI2NiwiZXhwIjoyMDcxODUxMjY2fQ.YxKU1hb8F9hTrjGP5UgoeCClaihaZDH7nZf3u0UQLWc
Environment: Production, Preview, Development (모두 체크)
⚠️ SENSITIVE - Admin 권한
```

### 필수 변수 (Kakao Maps)

**NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY**
```
Value: 11764377687ae8ad3d8decc7ac0078d5
Environment: Production, Preview, Development (모두 체크)
```

### 필수 변수 (Application)

**SITE_URL**
```
Value: https://meetpin-weld.vercel.app
Environment: Production
```

```
Value: http://localhost:3001
Environment: Development
```

---

## 💳 3단계: Stripe 설정 (선택 - 결제 기능 사용 시)

⚠️ **현재는 테스트 키만 있음** - 실제 결제를 받으려면 Stripe Live 키 필요

**STRIPE_SECRET_KEY**
```
Value: sk_live_... (Stripe Dashboard에서 발급)
Environment: Production
⚠️ SENSITIVE
```

**NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
```
Value: pk_live_... (Stripe Dashboard에서 발급)
Environment: Production
```

**STRIPE_WEBHOOK_SECRET**
```
Value: whsec_... (Stripe Webhook 설정 후 발급)
Environment: Production
⚠️ SENSITIVE
```

---

## ✅ 4단계: 환경 변수 저장 후 재배포

### 자동 재배포
- 환경 변수 저장 시 Vercel이 자동으로 재배포를 트리거합니다
- 약 2-3분 소요

### 수동 재배포 (필요 시)
1. **Deployments** 탭 클릭
2. 최신 배포의 **⋮** (점 3개) 클릭
3. **Redeploy** 선택
4. **Redeploy** 버튼 클릭

---

## 🔍 5단계: 배포 확인

### Health Check API 호출
```bash
curl https://meetpin-weld.vercel.app/api/health
```

### 성공 시 예상 응답:
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "environment": "production",
    "services": {
      "database": "connected",  // ← 이게 중요!
      "auth": "configured",
      "maps": "configured",
      "payments": "configured"
    }
  }
}
```

### 실패 시:
```json
{
  "services": {
    "database": "disconnected"  // ← 환경 변수 확인 필요
  }
}
```

---

## 📊 현재 설정된 환경 변수 확인

### Vercel Dashboard에서:
```
Settings > Environment Variables

확인 사항:
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
✅ SITE_URL

선택:
○ STRIPE_SECRET_KEY
○ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
○ STRIPE_WEBHOOK_SECRET
```

---

## 🗄️ 다음 단계: Supabase DB 마이그레이션

환경 변수 설정 후:
1. Supabase Dashboard → SQL Editor
2. `scripts/migrate.sql` 실행 (테이블 생성)
3. `scripts/rls.sql` 실행 (보안 정책)
4. `scripts/seed.sql` 실행 (샘플 데이터, 선택)

자세한 내용: [SUPABASE-MIGRATION-GUIDE.md](./SUPABASE-MIGRATION-GUIDE.md)

---

## 🆘 문제 해결

### "database: disconnected" 계속 나올 때:
1. Vercel Dashboard에서 환경 변수 다시 확인
2. 환경 변수 이름 정확히 입력했는지 확인 (대소문자 구분)
3. 재배포 완료 후 5분 정도 대기
4. Health API 다시 호출

### Supabase 연결 오류:
1. Supabase Dashboard → Settings → API
2. URL과 Keys 다시 복사해서 확인
3. Supabase 프로젝트가 일시 중지되지 않았는지 확인

### Vercel 배포 실패:
1. Deployments → 실패한 배포 클릭 → Build Logs 확인
2. 빌드 로그에서 환경 변수 관련 오류 찾기
3. 오류 해결 후 재배포

---

## 📝 체크리스트

배포 전:
- [ ] Vercel Dashboard 접속
- [ ] Environment Variables 메뉴 접속
- [ ] Supabase 3개 변수 추가
- [ ] Kakao Maps 변수 추가
- [ ] SITE_URL 변수 추가
- [ ] 환경 변수 저장
- [ ] 자동 재배포 대기 (2-3분)
- [ ] Health API 호출하여 "connected" 확인

배포 후:
- [ ] Supabase DB 마이그레이션 실행
- [ ] 실제 회원가입/로그인 테스트
- [ ] 지도에 실제 모임 생성 테스트
- [ ] PWA 설치 테스트

---

**작성일**: 2025년 10월 5일
**상태**: Ready to deploy
**다음 단계**: Vercel 환경 변수 설정 → Supabase DB 마이그레이션
