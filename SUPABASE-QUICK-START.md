# 🚀 Supabase 데이터베이스 만들기 - 빠른 시작

> **목표**: 2개의 SQL 파일 실행하기
> **소요 시간**: 5분
> **필요한 것**: Supabase 계정

---

## 📋 1단계: Supabase SQL Editor 열기

### 1-1. Supabase 접속
```
브라우저 주소창에 입력:
https://supabase.com/dashboard
```

### 1-2. 프로젝트 선택
- 화면에 프로젝트 목록이 보여요
- **xnrqfkecpabucnoxxtwa** 또는 **meetpin** 프로젝트를 클릭하세요

**화면 예시:**
```
┌─────────────────────────────────────┐
│  Supabase                    [프로필] │
├─────────────────────────────────────┤
│  Your Projects                       │
│                                      │
│  ┌──────────────────┐               │
│  │ xnrqfkecpabuc... │ 👈 클릭!       │
│  │ meetpin          │               │
│  │ 🟢 Active        │               │
│  └──────────────────┘               │
└─────────────────────────────────────┘
```

### 1-3. SQL Editor 찾기
- 왼쪽 메뉴에서 **"SQL Editor"** 를 클릭하세요

**메뉴 위치:**
```
┌──────────────────┐
│ Database         │
│ Auth             │
│ Storage          │
│ SQL Editor  👈   │
│ Edge Functions   │
│ Reports          │
└──────────────────┘
```

### 1-4. New query 버튼 클릭
- **"+ New query"** 버튼을 클릭하세요
- 빈 SQL 편집기가 나타나요!

---

## 📄 2단계: migrate.sql 실행 (테이블 생성)

### 2-1. 파일 열기
로컬 컴퓨터에서:
```
C:\Users\이원표\Desktop\meetpin\scripts\migrate.sql
```
파일을 메모장이나 VS Code로 열어주세요

### 2-2. 전체 복사
- **Ctrl + A** (전체 선택)
- **Ctrl + C** (복사)

⚠️ **주의**: 파일 전체를 복사해야 해요! (337줄)

### 2-3. Supabase에 붙여넣기
- Supabase SQL Editor로 돌아가서
- 편집기에 **Ctrl + V** (붙여넣기)

**이렇게 보여요:**
```sql
-- 밋핀(MeetPin) 데이터베이스 스키마 - 최종 완성 버전
-- 실행 순서: 이 파일을 먼저 실행한 후 rls.sql 실행

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 프로필 테이블 (profiles.uid를 PK로 사용)
CREATE TABLE IF NOT EXISTS public.profiles (
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ...
```

### 2-4. Run 버튼 클릭!
- 오른쪽 아래에 **"Run"** 버튼이 있어요
- 또는 **Ctrl + Enter** 누르기

### 2-5. 완료 확인
화면 아래에 이렇게 나오면 성공! ✅
```
Success. No rows returned
```

또는:
```
✓ Success
```

**에러가 나면?**
- "already exists" 에러는 무시해도 돼요 (이미 있다는 뜻)
- 다른 에러는 SQL을 다시 확인하세요

---

## 🔒 3단계: rls.sql 실행 (보안 설정)

### 3-1. New query 다시 클릭
- **"+ New query"** 버튼 클릭
- 새로운 빈 편집기가 나타나요

### 3-2. rls.sql 파일 열기
로컬 컴퓨터에서:
```
C:\Users\이원표\Desktop\meetpin\scripts\rls.sql
```

### 3-3. 전체 복사
- **Ctrl + A** (전체 선택)
- **Ctrl + C** (복사)

⚠️ **주의**: 파일 전체를 복사! (283줄)

### 3-4. Supabase에 붙여넣기
- SQL Editor에 **Ctrl + V** (붙여넣기)

**이렇게 보여요:**
```sql
-- RLS (Row Level Security) 정책 설정
-- 이 파일은 migrate.sql 실행 후에 실행해야 합니다

-- 모든 테이블에서 RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
...
```

### 3-5. Run 버튼 클릭!
- **"Run"** 버튼 클릭
- 또는 **Ctrl + Enter**

### 3-6. 완료 확인
```
Success. No rows returned
```
→ 성공! ✅

---

## ✅ 4단계: 테이블 생성 확인

### 4-1. Table Editor 열기
왼쪽 메뉴에서:
- **"Table Editor"** 클릭

### 4-2. 테이블 목록 확인
이 8개가 보이면 성공! 🎉

```
✓ profiles
✓ rooms
✓ requests
✓ matches
✓ messages
✓ reports
✓ host_messages
✓ blocked_users
```

**화면 예시:**
```
┌──────────────────────────────────┐
│ Tables                            │
├──────────────────────────────────┤
│ ✓ blocked_users                  │
│ ✓ host_messages                  │
│ ✓ matches                        │
│ ✓ messages                       │
│ ✓ profiles                       │
│ ✓ reports                        │
│ ✓ requests                       │
│ ✓ rooms                          │
└──────────────────────────────────┘
```

---

## 🎯 5단계: Production 확인

### 5-1. 터미널에서 확인
```bash
curl https://meetpin-weld.vercel.app/api/health
```

### 5-2. 성공 확인!
이제 이렇게 나와야 해요:
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "connected"  ← 드디어 connected! 🎉
    }
  }
}
```

---

## 📝 요약 체크리스트

**Supabase 작업:**
- [ ] Supabase Dashboard 접속
- [ ] SQL Editor 열기
- [ ] migrate.sql 복사 & 붙여넣기 & Run
- [ ] "Success" 메시지 확인
- [ ] rls.sql 복사 & 붙여넣기 & Run
- [ ] "Success" 메시지 확인
- [ ] Table Editor에서 8개 테이블 확인

**Production 확인:**
- [ ] Health API 호출
- [ ] "database": "connected" 확인
- [ ] "status": "healthy" 확인

**모두 체크 = 완료! 🎊**

---

## 🆘 문제가 생겼어요!

### "permission denied" 에러
- Supabase Dashboard의 SQL Editor에서 실행하면 자동으로 권한이 있어요
- 다른 곳에서 실행하면 안 돼요!

### "syntax error" 에러
- 파일 전체를 복사했는지 확인하세요
- 중간에 잘린 부분이 없는지 확인하세요

### "relation already exists" 에러
- 무시하고 계속 진행하세요!
- 이미 테이블이 있다는 뜻이에요 (문제 없음)

### 테이블이 8개보다 적어요
- migrate.sql을 다시 실행해보세요
- 에러 메시지를 자세히 읽어보세요

### "database": "disconnected" 계속 나와요
1. Supabase에서 테이블 8개 생성되었는지 확인
2. Vercel 환경 변수 다시 확인
3. 5분 정도 기다려보세요 (캐시 때문)

---

## 🎉 완료 후 다음 단계

### Production 앱 테스트
1. https://meetpin-weld.vercel.app 접속
2. 회원가입 해보기
3. 프로필 작성하기
4. 지도에서 모임 만들기
5. 채팅 테스트

---

**수고하셨습니다! 이제 진짜 완료! 🎊**

---

**작성일**: 2025년 10월 5일
**소요 시간**: 5분
**난이도**: ⭐⭐⭐⭐⭐
