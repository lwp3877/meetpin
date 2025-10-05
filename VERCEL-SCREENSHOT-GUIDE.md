# 📸 Vercel 환경 변수 설정 - 화면 설명 가이드

> **그림으로 보는 단계별 가이드**

---

## 🖼️ 1단계: Vercel 접속

### 화면 구성:
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 vercel.com/dashboard                    [프로필 아이콘] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Vercel                                                   │
│  ────────                                                 │
│                                                           │
│  Your Projects                                            │
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │                 │  │                 │               │
│  │    meetpin      │  │  my-other-app   │               │
│  │                 │  │                 │               │
│  │  🟢 Ready       │  │  🟢 Ready       │               │
│  │                 │  │                 │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                           │
│        👆 여기를 클릭하세요!                               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**찾는 방법:**
1. 주소창에 `vercel.com/dashboard` 입력
2. 프로젝트 목록에서 **"meetpin"** 찾기
3. meetpin 박스 전체를 클릭

---

## 🖼️ 2단계: 프로젝트 화면

### 화면 구성:
```
┌─────────────────────────────────────────────────────────┐
│ ← meetpin                                   [프로필]       │
├─────────────────────────────────────────────────────────┤
│  [Overview]  [Deployments]  [Analytics]  [Settings]      │
│                                                    👆      │
│                                              여기 클릭!     │
│                                                           │
│  Production Deployment                                    │
│  ─────────────────────                                   │
│  https://meetpin-weld.vercel.app                         │
│  🟢 Ready                                                 │
│  Deployed 2 hours ago                                     │
│                                                           │
│  Latest Deployments                                       │
│  ─────────────────                                       │
│  📦 feat: achieve perfect WCAG 2.1 AA                    │
│  📦 feat: complete all quality improvements              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**찾는 방법:**
1. 화면 위쪽 탭 중에서 **"Settings"** 찾기
2. Settings 탭 클릭

---

## 🖼️ 3단계: Settings 메뉴

### 화면 구성:
```
┌──────────────────┬──────────────────────────────────────┐
│                  │  General                              │
│  Settings        │  ────────                             │
│  ────────        │                                       │
│                  │  Project Name: meetpin                │
│  General         │  Build & Development Settings         │
│  Domains         │                                       │
│  Environment     │  [Edit]                              │
│  Variables  👈   │                                       │
│                  │                                       │
│  Git             │                                       │
│  Functions       │                                       │
│  Advanced        │                                       │
│                  │                                       │
└──────────────────┴──────────────────────────────────────┘
```

**찾는 방법:**
1. 왼쪽 메뉴에서 **"Environment Variables"** 찾기
2. Environment Variables 클릭

---

## 🖼️ 4단계: Environment Variables 화면 (비어있을 때)

### 화면 구성:
```
┌─────────────────────────────────────────────────────────┐
│  Environment Variables                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Environment variables are encrypted and allow you to     │
│  store sensitive information.                             │
│                                                           │
│  [+ Add New]  👈 여기 클릭!                                │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │  No environment variables found                      ││
│  │                                                       ││
│  │  Add your first environment variable to get started  ││
│  └─────────────────────────────────────────────────────┘│
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**찾는 방법:**
1. **"+ Add New"** 버튼 찾기 (파란색 버튼)
2. 버튼 클릭

---

## 🖼️ 5단계: 변수 추가 입력창 (첫 번째 변수)

### 화면 구성:
```
┌─────────────────────────────────────────────────────────┐
│  Add Environment Variable                                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Name                                                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │ NEXT_PUBLIC_SUPABASE_URL                           │ │
│  └────────────────────────────────────────────────────┘ │
│       👆 여기에 정확히 입력!                               │
│                                                           │
│  Value                                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ https://xnrqfkecpabucnoxxtwa.supabase.co           │ │
│  └────────────────────────────────────────────────────┘ │
│       👆 여기에 복사해서 붙여넣기!                         │
│                                                           │
│  Environment                                              │
│  ☑ Production     👈 체크!                                │
│  ☑ Preview        👈 체크!                                │
│  ☑ Development    👈 체크!                                │
│                                                           │
│  [Cancel]  [Save] 👈 마지막에 여기 클릭!                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**입력 방법:**
1. **Name 칸**: `NEXT_PUBLIC_SUPABASE_URL` 입력
2. **Value 칸**: `https://xnrqfkecpabucnoxxtwa.supabase.co` 붙여넣기
3. **Environment**: 3개 모두 체크
4. **Save** 버튼 클릭

---

## 🖼️ 6단계: 변수 추가 완료 (1개 추가됨)

### 화면 구성:
```
┌─────────────────────────────────────────────────────────┐
│  Environment Variables                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [+ Add New]  👈 다시 여기 클릭해서 2번째 변수 추가!         │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │ NEXT_PUBLIC_SUPABASE_URL                            ││
│  │ https://xnrqfke... (hidden)                         ││
│  │ 🌍 Production, Preview, Development                 ││
│  │                                              [⋮]     ││
│  └─────────────────────────────────────────────────────┘│
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**다음 단계:**
1. **"+ Add New"** 다시 클릭
2. 2번째 변수 추가 시작

---

## 🖼️ 7단계: 5개 모두 추가 완료!

### 화면 구성:
```
┌─────────────────────────────────────────────────────────┐
│  Environment Variables                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [+ Add New]                                             │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │ NEXT_PUBLIC_SUPABASE_URL                       [⋮] ││
│  │ 🌍 Production, Preview, Development                 ││
│  ├─────────────────────────────────────────────────────┤│
│  │ NEXT_PUBLIC_SUPABASE_ANON_KEY                  [⋮] ││
│  │ 🌍 Production, Preview, Development                 ││
│  ├─────────────────────────────────────────────────────┤│
│  │ SUPABASE_SERVICE_ROLE_KEY                      [⋮] ││
│  │ 🌍 Production, Preview, Development                 ││
│  ├─────────────────────────────────────────────────────┤│
│  │ NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY               [⋮] ││
│  │ 🌍 Production, Preview, Development                 ││
│  ├─────────────────────────────────────────────────────┤│
│  │ SITE_URL                                        [⋮] ││
│  │ 🌍 Production                                       ││
│  └─────────────────────────────────────────────────────┘│
│                                                           │
│      👆 5개가 모두 보이면 성공! 🎉                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🖼️ 8단계: 배포 진행 중

### 화면 구성:
```
┌─────────────────────────────────────────────────────────┐
│ meetpin                                                   │
├─────────────────────────────────────────────────────────┤
│  [Overview]  [Deployments] 👈 여기 클릭해서 확인!          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 🔄 Building...                                      ││
│  │ main branch                                         ││
│  │ Just now                                            ││
│  └─────────────────────────────────────────────────────┘│
│                                                           │
│  2-3분 기다려주세요! ⏰                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🖼️ 9단계: 배포 완료!

### 화면 구성:
```
┌─────────────────────────────────────────────────────────┐
│ meetpin                                                   │
├─────────────────────────────────────────────────────────┤
│  [Overview]  [Deployments]                               │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │ ✅ Ready                                            ││
│  │ main branch                                         ││
│  │ 2 minutes ago                                       ││
│  │                                                      ││
│  │ Visit: https://meetpin-weld.vercel.app             ││
│  └─────────────────────────────────────────────────────┘│
│                                                           │
│  이제 확인해볼까요? 👇                                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🖼️ 10단계: Health API 확인 (브라우저)

### 주소창에 입력:
```
https://meetpin-weld.vercel.app/api/health
```

### 성공 화면:
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-05T12:00:00.000Z",
    "version": "1.4.22",
    "environment": "production",
    "services": {
      "database": "connected",    👈 이거 확인!
      "auth": "configured",
      "maps": "configured",
      "payments": "configured"
    }
  }
}
```

✅ **"database": "connected"** 가 보이면 완벽! 🎉

---

## 📝 5개 변수 한눈에 보기

### 복사해서 사용하세요:

**변수 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xnrqfkecpabucnoxxtwa.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development
```

**변수 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzUyNjYsImV4cCI6MjA3MTg1MTI2Nn0.YkIzsHezbQwLKc7hTM9akTZEh6kT2m9MLzmaIwpXEks
Environment: ✅ Production ✅ Preview ✅ Development
```

**변수 3:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3NTI2NiwiZXhwIjoyMDcxODUxMjY2fQ.YxKU1hb8F9hTrjGP5UgoeCClaihaZDH7nZf3u0UQLWc
Environment: ✅ Production ✅ Preview ✅ Development
```

**변수 4:**
```
Name: NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
Value: 11764377687ae8ad3d8decc7ac0078d5
Environment: ✅ Production ✅ Preview ✅ Development
```

**변수 5:**
```
Name: SITE_URL
Value: https://meetpin-weld.vercel.app
Environment: ✅ Production (이것만!)
```

---

## 🎯 체크리스트

- [ ] Vercel 접속했나요?
- [ ] meetpin 프로젝트 찾았나요?
- [ ] Settings 클릭했나요?
- [ ] Environment Variables 메뉴 들어갔나요?
- [ ] Add New 버튼 찾았나요?
- [ ] 변수 1 추가했나요? (NEXT_PUBLIC_SUPABASE_URL)
- [ ] 변수 2 추가했나요? (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] 변수 3 추가했나요? (SUPABASE_SERVICE_ROLE_KEY)
- [ ] 변수 4 추가했나요? (NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY)
- [ ] 변수 5 추가했나요? (SITE_URL)
- [ ] 5개 모두 목록에 보이나요?
- [ ] Deployments에서 "Ready" 확인했나요?
- [ ] Health API에서 "connected" 확인했나요?

**모두 체크 = 완료! 🎊**

---

**작성일**: 2025년 10월 5일
**난이도**: ⭐⭐⭐⭐⭐ (누구나 가능!)
