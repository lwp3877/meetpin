# 🎯 Vercel 환경 변수 설정 - 초등학생도 할 수 있는 가이드

> **목표**: 5개의 환경 변수를 Vercel에 추가하기
> **소요 시간**: 약 5분
> **필요한 것**: 컴퓨터, 인터넷, Vercel 계정

---

## 🚀 시작하기 전에

**환경 변수란?**
- 프로그램이 사용하는 "비밀 열쇠" 같은 것들이에요
- 데이터베이스 주소, 비밀번호 같은 중요한 정보를 저장해요
- 코드에 직접 쓰면 위험하니까 따로 저장하는 거예요!

**우리가 추가할 5개의 열쇠**:
1. 🗄️ Supabase 데이터베이스 주소
2. 🔑 Supabase 공개 열쇠
3. 🔐 Supabase 비밀 열쇠 (관리자용)
4. 🗺️ 카카오 지도 열쇠
5. 🌐 우리 웹사이트 주소

---

## 📝 1단계: Vercel 웹사이트 열기

### 1-1. 브라우저 열기
- Chrome, Edge, Safari 등 아무 브라우저나 열어주세요

### 1-2. Vercel 접속
```
주소창에 입력: https://vercel.com/dashboard
```

### 1-3. 로그인
- 이미 로그인되어 있으면 건너뛰세요
- 안 되어 있으면 로그인하세요

**이렇게 생긴 화면이 나와요:**
```
┌────────────────────────────────────┐
│  Vercel                    [프로필] │
├────────────────────────────────────┤
│                                     │
│  Your Projects                      │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ meetpin  │  │ 다른프로젝트 │       │
│  └──────────┘  └──────────┘       │
│                                     │
└────────────────────────────────────┘
```

---

## 🎯 2단계: meetpin 프로젝트 찾기

### 2-1. 프로젝트 목록 보기
- 화면에 여러 프로젝트가 보일 거예요
- **"meetpin"** 이라고 쓰인 박스를 찾으세요

### 2-2. meetpin 클릭
- **"meetpin"** 박스를 클릭하세요
- 새 화면이 나타나요

**이렇게 생긴 화면:**
```
┌────────────────────────────────────┐
│  meetpin                            │
├────────────────────────────────────┤
│  [Overview] [Deployments] [Settings]│
│                                     │
│  Production Deployment              │
│  https://meetpin-weld.vercel.app   │
│  ✓ Ready                           │
└────────────────────────────────────┘
```

---

## ⚙️ 3단계: 설정 메뉴 찾기

### 3-1. Settings 버튼 클릭
- 화면 위쪽에 **"Settings"** 버튼이 있어요
- 그걸 클릭하세요!

### 3-2. Environment Variables 찾기
- 왼쪽에 메뉴가 쭉 나와요:
  ```
  General
  Domains
  Environment Variables  ← 이거!
  Git
  ```
- **"Environment Variables"** 를 클릭하세요

**이렇게 생긴 화면:**
```
┌────────────────────────────────────┐
│  Environment Variables              │
├────────────────────────────────────┤
│                                     │
│  Manage your environment variables  │
│                                     │
│  [+ Add New]                       │
│                                     │
│  (아직 변수가 없으면 비어있어요)      │
│                                     │
└────────────────────────────────────┘
```

---

## ➕ 4단계: 첫 번째 변수 추가 (Supabase 주소)

### 4-1. "Add New" 버튼 클릭
- **"+ Add New"** 또는 **"Add"** 버튼을 클릭하세요
- 입력창이 3개 나타나요!

### 4-2. 변수 이름 입력
**Name 칸에 정확히 입력:**
```
NEXT_PUBLIC_SUPABASE_URL
```
⚠️ **주의**: 대문자, 소문자, 언더바(_) 정확히 똑같이!

### 4-3. 변수 값 입력
**Value 칸에 복사해서 붙여넣기:**
```
https://xnrqfkecpabucnoxxtwa.supabase.co
```

### 4-4. 환경 선택
**Environment 체크박스 - 3개 모두 체크:**
- ✅ Production
- ✅ Preview
- ✅ Development

**이렇게 보여요:**
```
┌────────────────────────────────────┐
│  Add Environment Variable           │
├────────────────────────────────────┤
│  Name                               │
│  [NEXT_PUBLIC_SUPABASE_URL      ]  │
│                                     │
│  Value                              │
│  [https://xnrqfkecpabucnoxxtwa...] │
│                                     │
│  Environment                        │
│  ✅ Production                      │
│  ✅ Preview                         │
│  ✅ Development                     │
│                                     │
│  [Save]                            │
└────────────────────────────────────┘
```

### 4-5. Save 버튼 클릭
- **"Save"** 버튼을 클릭하세요
- 잠깐 기다리면 "Saved!" 메시지가 나와요

---

## 🔑 5단계: 두 번째 변수 추가 (Supabase 공개 키)

### 5-1. 다시 "Add New" 클릭

### 5-2. 변수 이름 입력
**Name:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 5-3. 변수 값 입력 (긴 키!)
**Value (전체 복사!):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzUyNjYsImV4cCI6MjA3MTg1MTI2Nn0.YkIzsHezbQwLKc7hTM9akTZEh6kT2m9MLzmaIwpXEks
```

### 5-4. 환경 선택
- ✅ Production
- ✅ Preview
- ✅ Development

### 5-5. Save 클릭!

**완료! 2개 끝났어요! 💪**

---

## 🔐 6단계: 세 번째 변수 추가 (Supabase 비밀 키)

### 6-1. "Add New" 클릭

### 6-2. 변수 이름 입력
**Name:**
```
SUPABASE_SERVICE_ROLE_KEY
```

### 6-3. 변수 값 입력 (또 긴 키!)
**Value (전체 복사!):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3NTI2NiwiZXhwIjoyMDcxODUxMjY2fQ.YxKU1hb8F9hTrjGP5UgoeCClaihaZDH7nZf3u0UQLWc
```

### 6-4. 환경 선택
- ✅ Production
- ✅ Preview
- ✅ Development

### 6-5. Save 클릭!

**완료! 3개 끝났어요! 🎉**

---

## 🗺️ 7단계: 네 번째 변수 추가 (카카오 지도)

### 7-1. "Add New" 클릭

### 7-2. 변수 이름 입력
**Name:**
```
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
```

### 7-3. 변수 값 입력 (짧아요!)
**Value:**
```
11764377687ae8ad3d8decc7ac0078d5
```

### 7-4. 환경 선택
- ✅ Production
- ✅ Preview
- ✅ Development

### 7-5. Save 클릭!

**완료! 4개 끝났어요! 거의 다 왔어요! 🚀**

---

## 🌐 8단계: 다섯 번째 변수 추가 (웹사이트 주소)

### 8-1. "Add New" 클릭

### 8-2. 변수 이름 입력
**Name:**
```
SITE_URL
```

### 8-3. 변수 값 입력
**Value:**
```
https://meetpin-weld.vercel.app
```

### 8-4. 환경 선택 (이번엔 하나만!)
- ✅ Production ← **이것만 체크!**
- ⬜ Preview ← 체크 안 함
- ⬜ Development ← 체크 안 함

### 8-5. Save 클릭!

**🎊 축하합니다! 5개 모두 완료! 🎊**

---

## ✅ 9단계: 설정 완료 확인

### 9-1. 환경 변수 목록 확인
화면에 5개가 보이는지 확인하세요:

```
┌────────────────────────────────────┐
│  Environment Variables              │
├────────────────────────────────────┤
│  ✓ NEXT_PUBLIC_SUPABASE_URL        │
│  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY   │
│  ✓ SUPABASE_SERVICE_ROLE_KEY       │
│  ✓ NEXT_PUBLIC_KAKAO_JAVASCRIPT... │
│  ✓ SITE_URL                        │
└────────────────────────────────────┘
```

### 9-2. 자동 재배포 확인
- 설정을 저장하면 Vercel이 자동으로 다시 배포해요
- 화면 위쪽에 **"Deploying..."** 같은 메시지가 보일 수 있어요
- **2-3분** 기다려주세요 ⏰

---

## 🔍 10단계: 잘 되었는지 확인하기

### 10-1. 배포 완료 대기
- Deployments 탭을 클릭해서 확인할 수 있어요
- **"Ready"** 라고 나오면 완료!

### 10-2. 데이터베이스 연결 확인
**컴퓨터에서 확인:**

**Windows (명령 프롬프트):**
```bash
curl https://meetpin-weld.vercel.app/api/health
```

**Mac/Linux (터미널):**
```bash
curl https://meetpin-weld.vercel.app/api/health
```

**또는 브라우저에서:**
- 주소창에 입력: `https://meetpin-weld.vercel.app/api/health`
- Enter!

### 10-3. 성공 확인!
이렇게 나오면 **성공**:
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "connected"  ← 이게 중요!
    }
  }
}
```

✅ **"database": "connected"** 가 보이면 성공! 🎉

❌ **"database": "disconnected"** 면 2-3분 더 기다리거나, 변수 다시 확인

---

## 🎯 요약 체크리스트

**완료했는지 체크해보세요:**

- [ ] Vercel 웹사이트 접속했나요?
- [ ] meetpin 프로젝트 찾았나요?
- [ ] Settings → Environment Variables 들어갔나요?
- [ ] 변수 1: NEXT_PUBLIC_SUPABASE_URL 추가했나요?
- [ ] 변수 2: NEXT_PUBLIC_SUPABASE_ANON_KEY 추가했나요?
- [ ] 변수 3: SUPABASE_SERVICE_ROLE_KEY 추가했나요?
- [ ] 변수 4: NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY 추가했나요?
- [ ] 변수 5: SITE_URL 추가했나요? (Production만!)
- [ ] 5개 모두 목록에 보이나요?
- [ ] 2-3분 기다렸나요?
- [ ] Health API에서 "connected" 확인했나요?

**모두 체크되었다면 완료! 🎊**

---

## 🆘 문제가 생겼어요!

### "Save 버튼이 안 눌러져요"
- Name이나 Value 칸이 비어있지 않은지 확인하세요
- 전체를 복사했는지 확인하세요 (빠진 글자 없이!)

### "환경 변수가 안 보여요"
- 페이지를 새로고침(F5) 해보세요
- 다시 Settings → Environment Variables 들어가보세요

### "database: disconnected가 계속 나와요"
1. 5-10분 더 기다려보세요 (배포가 느릴 수 있어요)
2. 변수 이름을 정확히 입력했는지 다시 확인하세요
3. Value 값을 전체 복사했는지 확인하세요

### "변수 이름을 잘못 입력했어요"
1. 잘못된 변수 옆의 **"︙"** (점 3개) 클릭
2. **"Delete"** 클릭
3. 다시 올바르게 추가하세요

---

## 🎉 다음 단계는?

환경 변수 설정이 완료되었다면:

**2단계: Supabase 데이터베이스 만들기**
- 테이블 생성
- 보안 설정
- 샘플 데이터 추가

**3단계: 실제 앱 테스트**
- 회원가입해보기
- 모임 만들어보기
- 채팅해보기

---

**수고하셨습니다! 🎊**

**작성일**: 2025년 10월 5일
**난이도**: 초등학생도 OK! ⭐⭐⭐⭐⭐
