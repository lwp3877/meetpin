# 🚀 밋핀(MeetPin) 실제 출시 완전 로드맵

**작성일:** 2025-10-30
**현재 버전:** v1.5.0
**목표:** 실제 사용자가 사용 가능한 프로덕션 서비스 런칭

---

## 📋 목차

1. [현재 상태 진단](#1-현재-상태-진단)
2. [법적 요구사항 (최우선)](#2-법적-요구사항-최우선)
3. [인프라 & 보안 강화](#3-인프라--보안-강화)
4. [필수 기능 검증 & 수정](#4-필수-기능-검증--수정)
5. [운영 시스템 구축](#5-운영-시스템-구축)
6. [마케팅 & 사용자 확보](#6-마케팅--사용자-확보)
7. [출시 후 운영 계획](#7-출시-후-운영-계획)
8. [타임라인 & 체크리스트](#8-타임라인--체크리스트)

---

## 1. 현재 상태 진단

### ✅ 완료된 것들

#### 기술 스택 (프로덕션 준비 완료)
- **Next.js 15.5.2** - 최신 App Router, React 19
- **Supabase** - PostgreSQL, Auth, Realtime, Storage, RLS 보안
- **Stripe** - 결제 시스템 완전 구현 (부스트 기능)
- **Kakao Maps SDK** - 지도 기반 서비스
- **Redis/Upstash** - 분산 캐싱 (선택적)
- **TypeScript** - 0 errors, 엄격한 타입 체크
- **Testing** - Jest 60/60 테스트 통과, Playwright E2E

#### 핵심 기능 (90% 완성)
- ✅ 사용자 인증 (이메일 회원가입/로그인)
- ✅ 프로필 관리 (닉네임, 연령대, 사진, 소개)
- ✅ 지도 기반 모임 생성/검색
- ✅ 참가 신청 및 수락/거절 시스템
- ✅ 1:1 실시간 채팅 (Supabase Realtime)
- ✅ 모임 부스트 결제 (Stripe)
- ✅ 이미지 업로드 (Supabase Storage)
- ✅ 신고/차단 시스템
- ✅ 관리자 패널
- ✅ 46개 API 엔드포인트
- ✅ 반응형 UI (모바일 최적화)

#### 품질 지표
- TypeScript: **0 errors**
- ESLint: **0 warnings**
- Jest: **60/60 tests passed**
- Production Build: **성공** (104KB main bundle < 300KB limit)
- 코드 정리: **2,454줄 감소** (불필요한 코드 제거 완료)

### ⚠️ 미완성/문제점

#### 1. **법적 문서 미완성 (심각)**
- 사업자 등록 번호 없음
- 대표자 정보 없음
- 실제 연락처 없음 (privacy@meetpin.com은 더미)
- 실제 주소 없음 ("서울특별시 강남구 테헤란로 123"은 더미)
- 통신판매업 신고번호 없음

#### 2. **인증 수단 부족**
- 현재: 이메일 인증만 (본인 인증 없음)
- 문제: 미성년자 가입 방지 불가, 악성 사용자 대응 어려움
- 필요: 휴대폰 본인 인증 (PASS, NICE 등)

#### 3. **결제 시스템 미검증**
- Stripe은 구현되어 있으나 **실제 결제 테스트 안 함**
- PG사 계약 상태 불명
- 현금영수증/세금계산서 발행 시스템 없음

#### 4. **운영 시스템 부재**
- 고객센터 없음 (문의 응대 시스템 없음)
- 신고 처리 프로세스 없음
- 악성 사용자 제재 기준 없음
- 긴급 상황 대응 매뉴얼 없음

#### 5. **모니터링 부족**
- Sentry 연동 설정되어 있으나 **실제 연결 안 됨**
- 실시간 알림 시스템 없음
- 사용자 행동 분석 없음
- 서버 장애 감지 시스템 없음

#### 6. **Mock 데이터 의존성**
- 개발 모드에서 Mock 인증 사용 중
- 실제 Supabase 연결 검증 필요
- Production 환경 분리 필요

---

## 2. 법적 요구사항 (최우선)

> **⚠️ 이것부터 안 하면 불법입니다. 출시 전 반드시 완료 필수!**

### Phase A: 사업자 등록 (1주)

#### A-1. 사업자 등록 결정
**선택지:**
1. **개인사업자** (추천 - 빠름)
   - 장점: 즉시 등록 가능, 비용 저렴
   - 단점: 무한책임, 신뢰도 낮음
   - 절차: 세무서 방문 → 사업자등록증 발급 (1-2일)

2. **법인사업자** (주식회사)
   - 장점: 유한책임, 투자 유치 유리, 신뢰도 높음
   - 단점: 설립 비용 100만원+, 회계/세무 복잡
   - 절차: 법무사 위임 → 등기 → 사업자등록 (2-3주)

**즉시 할 일:**
```
□ 사업자 형태 결정
□ 상호명 결정 ("밋핀" 또는 "MeetPin")
□ 업종 코드 결정
   - 주업종: 620903 (온라인 정보 제공업)
   - 부업종: 631200 (온라인 광고업)
□ 사업장 주소 확정 (자택 가능)
□ 세무서 방문 예약
```

#### A-2. 통신판매업 신고 (필수!)
- **기한:** 사업자 등록 후 즉시
- **신고처:** 사업장 관할 시/군/구청
- **서류:**
  - 통신판매업 신고서
  - 사업자등록증 사본
  - 신분증 사본
  - (법인) 법인등기부등본
- **수수료:** 무료 또는 5,000원 내외
- **처리기간:** 3-5일

**결과물:** 통신판매업 신고번호 (예: 2025-서울강남-12345)

#### A-3. 법적 문서 업데이트
**즉시 수정 필요:**

```typescript
// src/app/legal/privacy/page.tsx 등 5개 파일
업데이트 필요 항목:
1. 사업자등록번호: [실제 번호]
2. 대표자명: [실제 이름]
3. 사업장 주소: [실제 주소]
4. 대표 전화: 070-xxxx-xxxx (또는 02-xxxx-xxxx)
5. 대표 이메일: support@meetpin.com (실제 운영 이메일)
6. 통신판매업 신고번호: [발급받은 번호]
7. 개인정보보호책임자: [실제 담당자 이름 + 연락처]
```

**파일 목록:**
- `src/app/legal/terms/page.tsx` - 이용약관
- `src/app/legal/privacy/page.tsx` - 개인정보처리방침
- `src/app/legal/location/page.tsx` - 위치기반서비스 약관
- `src/app/legal/location-terms/page.tsx` - 위치정보 이용약관
- `src/app/legal/cookie-policy/page.tsx` - 쿠키 정책

### Phase B: 개인정보보호 컴플라이언스 (2주)

#### B-1. 개인정보보호법 준수
**현재 상태:** ⚠️ 부분 준수 (코드는 있지만 실제 운영 체계 없음)

**즉시 조치 필요:**

1. **개인정보처리방침 공시**
   - ✅ 문서는 있음 (`src/app/legal/privacy/page.tsx`)
   - ❌ 실제 사업자 정보 없음 → **즉시 업데이트**
   - ❌ 홈페이지 하단에 쉽게 접근 가능하게 링크 필요

2. **개인정보보호책임자(CPO) 지정**
   ```
   □ CPO 지정 (대표자 본인 가능)
   □ 연락처 공개 (이메일, 전화)
   □ 개인정보 열람/정정/삭제 요청 처리 프로세스 마련
   ```

3. **만 14세 미만 가입 제한**
   - 현재: 연령 입력만 받음 (검증 없음)
   - 필요: **법정대리인 동의 절차** 또는 **만 14세 미만 가입 차단**

   **즉시 수정:**
   ```typescript
   // src/lib/utils/zodSchemas.ts
   export const signupSchema = z.object({
     age_range: z.enum(['20s_early', '20s_late', ...]), // 현재
     // 추가: 만 14세 미만 차단 로직
     age_verified: z.boolean().refine(val => val === true, {
       message: '만 14세 이상만 가입 가능합니다.'
     })
   })
   ```

4. **개인정보 수집·이용 동의**
   - 회원가입 시 **명시적 동의** 필요
   - 현재: ❌ 동의 체크박스 없음

   **즉시 추가:**
   ```tsx
   // src/app/auth/signup/page.tsx에 추가
   <Checkbox required>
     [필수] 개인정보 수집·이용 동의 <Link to="/legal/privacy">보기</Link>
   </Checkbox>
   <Checkbox required>
     [필수] 위치정보 이용약관 동의 <Link to="/legal/location">보기</Link>
   </Checkbox>
   <Checkbox>
     [선택] 마케팅 정보 수신 동의
   </Checkbox>
   ```

#### B-2. 위치정보법 준수
**현재 상태:** ⚠️ 약관은 있지만 기술적 조치 부족

**즉시 조치:**

1. **위치정보 수집 동의**
   - 브라우저 Geolocation API 사용 전 **명시적 동의** 필요
   ```typescript
   // src/components/map/LocationPicker.tsx 수정
   const requestLocation = async () => {
     const consent = await showConsentModal('위치정보 수집에 동의하시겠습니까?')
     if (!consent) return

     navigator.geolocation.getCurrentPosition(...)
   }
   ```

2. **위치정보 암호화 저장**
   - 현재: ✅ PostgreSQL에 float 타입으로 저장
   - 추가: RLS 정책으로 보호 중 (✅)
   - 확인 필요: 통신 구간 암호화 (HTTPS ✅)

3. **위치정보 보유 기간 명시**
   - 약관에 명시: "회원 탈퇴 시 즉시 삭제" ✅
   - 실제 구현: ✅ (`scripts/rls.sql`에 CASCADE 설정됨)

#### B-3. 정보통신망법 준수

1. **청소년 보호**
   - **즉시 조치:** 만 19세 미만 접근 제한 필요? (술 카테고리 때문)
   - **선택지:**
     - A. 성인 인증 필수 (PASS, NICE 등) - **비용 발생**
     - B. 청소년 이용 가능 모임만 제공 (술 카테고리 제거)

   **권장:** 초기에는 B안 채택 → 사용자 확보 후 A안 전환

2. **스팸 방지**
   - 현재: ✅ Rate Limiting 구현됨
   - 추가: 광고성 메시지 발송 시 (080 수신거부번호) 필요

### Phase C: 결제 관련 법규 (2주)

#### C-1. 전자상거래법 준수

1. **현금영수증 발행 의무**
   - Stripe 결제 시 현금영수증 발행 불가
   - **해결책:**
     - 국내 PG사 추가 연동 (KG이니시스, NHN KCP 등)
     - 또는 Stripe + 현금영수증 수동 발행 시스템

2. **청약철회권 (환불 정책)**
   - 디지털 상품은 7일 이내 환불 가능
   - **현재:** ❌ 환불 정책 없음

   **즉시 작성:**
   ```markdown
   # 환불 정책

   1. 부스트 상품은 디지털 콘텐츠로 즉시 제공됩니다.
   2. 구매 후 7일 이내, 사용하지 않은 경우 전액 환불 가능합니다.
   3. 부스트 효과가 발생한 경우(노출 시작) 환불 불가합니다.
   4. 환불 요청: support@meetpin.com
   5. 처리 기간: 영업일 기준 3-5일
   ```

3. **표시·광고 의무**
   - 부스트 구매 페이지에 명시 필요:
     - 판매자 정보 (상호, 대표자, 주소, 전화)
     - 가격 (부가세 포함 여부)
     - 제공 내용 (1일/3일/7일 노출 증대)
     - 환불 조건

#### C-2. PG사 계약

**Stripe 문제점:**
- 한국 원화(KRW) 결제 지원 약함
- 국내 은행 연동 어려움
- 현금영수증 발행 불가

**권장 솔루션:**
1. **토스페이먼츠** (추천)
   - 간편 결제 지원
   - 수수료: 2.5-3.5%
   - 정산 주기: D+1
   - 개발 난이도: 쉬움

2. **KG이니시스**
   - 수수료: 3-4%
   - 안정성 높음
   - 개발 난이도: 중간

**즉시 할 일:**
```
□ PG사 선택 결정
□ 사업자등록증 준비
□ PG사 가입 신청
□ API 키 발급
□ 결제 테스트 환경 구축
□ 실제 결제 테스트 (소액)
```

---

## 3. 인프라 & 보안 강화

### Phase A: 도메인 & 호스팅 (1일)

#### A-1. 도메인 구매
**현재:** meetpin-weld.vercel.app (무료 Vercel 도메인)

**즉시 구매 필요:**
- **meetpin.com** (약 $10-15/년) - Namecheap, GoDaddy
- 또는 **meetpin.kr** (약 15,000원/년) - 가비아, 후이즈

**DNS 설정:**
```
@ (root)          A     76.76.21.21 (Vercel)
www               CNAME meetpin-weld.vercel.app
```

#### A-2. SSL 인증서
- Vercel은 자동 HTTPS 제공 ✅
- 커스텀 도메인 연결 시 자동 발급 ✅

#### A-3. CDN 설정
- Vercel Edge Network 기본 제공 ✅
- 추가 최적화: Cloudflare (선택사항)

### Phase B: 데이터베이스 프로덕션 설정 (1주)

#### B-1. Supabase 프로젝트 확인
**현재 상태 점검:**
```
□ Supabase 프로젝트 생성됨?
□ PostgreSQL 버전: 15+
□ RLS 정책 적용됨? (scripts/rls.sql)
□ 백업 설정됨?
□ Connection Pooling 활성화?
```

**Production 체크리스트:**
1. **백업 설정**
   - Supabase Dashboard → Database → Backups
   - Point-in-Time Recovery (PITR) 활성화 (Pro 플랜 필요)
   - 수동 백업 주기: 매일 1회

2. **Connection Pooling**
   - Supabase → Settings → Database → Connection Pooling
   - Session mode: 활성화
   - Max connections: 100

3. **성능 모니터링**
   - Supabase Dashboard → Logs 확인
   - Slow query 모니터링

#### B-2. 데이터베이스 마이그레이션 검증
```bash
# 로컬에서 마이그레이션 스크립트 재검증
psql -h [supabase-host] -U postgres -d postgres -f scripts/migrate.sql
psql -h [supabase-host] -U postgres -d postgres -f scripts/rls.sql

# 테스트 데이터 확인 (Production에는 seed.sql 실행 금지!)
# scripts/seed.sql은 개발 환경에서만 사용
```

#### B-3. Supabase Storage 설정
**이미지 업로드 버킷 확인:**
```
□ 'avatars' 버킷 생성됨?
□ 'room-images' 버킷 생성됨?
□ Public Access 설정?
   - avatars: Public (누구나 읽기 가능)
   - room-images: Public
□ RLS 정책 적용됨? (업로드는 인증된 사용자만)
□ 파일 크기 제한: 5MB
□ 허용 확장자: jpg, jpeg, png, webp
```

### Phase C: 환경 변수 관리 (1일)

#### C-1. Vercel 환경 변수 설정
**Vercel Dashboard → Settings → Environment Variables**

**필수 환경 변수 (Production):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (⚠️ Secret!)

# Kakao Maps
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=[실제 키] (도메인 등록 필수!)

# Stripe (또는 국내 PG)
STRIPE_SECRET_KEY=sk_live_... (⚠️ Test키 아닌 Live키!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_SITE_URL=https://meetpin.com
SITE_URL=https://meetpin.com

# Redis (선택)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry (에러 추적)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...

# Feature Flags (Production)
NEXT_PUBLIC_ENABLE_KAKAO_OAUTH=false (초기 비활성화)
NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_USE_MOCK_DATA=false (⚠️ 반드시 false!)
```

**⚠️ 주의사항:**
- **NEXT_PUBLIC_USE_MOCK_DATA=false** 반드시 확인!
- Test API 키와 Live API 키 구분!
- Service Role Key는 절대 브라우저 노출 금지!

#### C-2. 카카오 개발자 콘솔 설정
**https://developers.kakao.com**

1. **애플리케이션 생성**
   - 앱 이름: 밋핀
   - 회사명: [사업자 상호명]

2. **플랫폼 등록**
   - Web: https://meetpin.com
   - Web: https://www.meetpin.com

3. **JavaScript 키 발급**
   - 발급받은 키를 Vercel 환경 변수에 등록

4. **도메인 등록 (중요!)**
   - 설정 → 플랫폼 → Web → 사이트 도메인
   - https://meetpin.com 등록
   - **등록 안 하면 지도 API 작동 안 함!**

### Phase D: 보안 강화 (1주)

#### D-1. HTTPS 강제
- Vercel은 자동 HTTPS ✅
- 추가: `next.config.ts`에서 HSTS 헤더 설정 (이미 있음 ✅)

#### D-2. Rate Limiting 강화
**현재:** 메모리 기반 Rate Limiting (단일 서버에서만 작동)

**개선 필요:**
```typescript
// src/lib/rateLimit.ts 수정
// Upstash Redis 기반으로 전환 (분산 환경 대응)

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
  }),
}
```

#### D-3. XSS/CSRF 방지
- 현재: ✅ Next.js 기본 보호 활성화
- 추가: Content Security Policy (CSP) 강화
  - 이미 `src/middleware.ts`에 구현됨 ✅
  - 확인: `NEXT_PUBLIC_SECURITY_HEADERS_ENFORCE=true` 설정

#### D-4. SQL Injection 방지
- Supabase의 Prepared Statements 사용 ✅
- RLS 정책으로 접근 제어 ✅

#### D-5. 본인 인증 시스템 (선택적이지만 권장)
**PASS/NICE 연동:**
- 비용: 건당 300-500원
- 효과: 악성 사용자 차단, 미성년자 방지
- 시기: 베타 테스트 후 정식 오픈 전 추가 권장

---

## 4. 필수 기능 검증 & 수정

### Phase A: 핵심 시나리오 테스트 (3일)

#### A-1. 사용자 가입/로그인 플로우
**테스트 체크리스트:**
```
□ 이메일 회원가입 (실제 이메일 인증)
  - Gmail/Naver/Daum 등 주요 이메일 테스트
  - 스팸함 확인
□ 로그인 (이메일 + 비밀번호)
□ 비밀번호 찾기 (이메일 링크)
□ 로그아웃
□ 프로필 수정
  - 닉네임 변경
  - 연령대 변경
  - 아바타 업로드 (실제 이미지)
  - 소개 작성
```

**발견된 버그 즉시 수정:**
- 이메일 인증 메일 발송 확인
- Supabase Auth 템플릿 확인 (한글화 필요?)

#### A-2. 모임 생성/검색 플로우
**테스트 체크리스트:**
```
□ 지도에서 위치 선택 (실제 주소)
  - 서울 여러 구역 테스트
  - 지방 도시 테스트 (부산, 대구 등)
□ 모임 정보 입력
  - 제목 (금칙어 필터링 확인)
  - 카테고리 (술/운동/기타)
  - 날짜/시간 (미래 날짜만 가능)
  - 최대 인원 (2-20명)
  - 참가비 (0-1,000,000원)
□ 이미지 업로드 (선택)
  - 5MB 이하 확인
  - WebP/JPG/PNG 확인
□ 모임 생성 완료
□ 내 모임 목록 확인
□ 지도에서 모임 마커 표시 확인
□ 모임 상세 페이지 진입
```

#### A-3. 참가 신청/매칭 플로우
**테스트 체크리스트:**
```
□ 다른 사용자 계정으로 로그인
□ 지도에서 모임 검색
  - 현재 위치 기준
  - 특정 지역 검색
  - 카테고리 필터
□ 모임 상세보기
□ 참가 신청 (메시지 포함)
□ 호스트 계정으로 전환
□ 요청 알림 확인
□ 요청 수락
□ 매치 생성 확인
□ 채팅방 생성 확인
```

#### A-4. 실시간 채팅 플로우
**테스트 체크리스트:**
```
□ 1:1 채팅방 진입
□ 메시지 전송 (양방향)
  - 텍스트 메시지
  - 긴 메시지 (500자)
  - 특수문자 포함
□ 실시간 수신 확인 (페이지 리프레시 없이)
□ 타이핑 인디케이터 확인
□ 읽음 표시 확인
□ 메시지 히스토리 로딩
□ 모바일에서도 테스트
```

#### A-5. 결제 플로우 (부스트)
**⚠️ 실제 결제 테스트 필수!**
```
□ 부스트 버튼 클릭
□ 상품 선택 (1일/3일/7일)
□ Stripe Checkout 페이지 이동
□ 테스트 카드로 결제
  - 카드번호: 4242 4242 4242 4242
  - CVC: 임의 3자리
  - 만료일: 미래 날짜
□ 결제 성공 후 리다이렉트
□ Webhook 수신 확인 (Stripe Dashboard)
□ 데이터베이스에 boost_until 업데이트 확인
□ 모임이 상단 노출되는지 확인
□ 부스트 만료 후 정상 정렬 확인
```

**Production 결제 테스트:**
```
□ Stripe를 Live Mode로 전환
□ 실제 카드로 소액 결제 (1,000원)
□ 결제 성공 확인
□ 환불 테스트
□ Stripe Dashboard에서 거래 내역 확인
```

### Phase B: 모바일 최적화 (2일)

#### B-1. 반응형 디자인 검증
**테스트 기기:**
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)

**체크리스트:**
```
□ 지도 터치 조작 (핀치 줌, 드래그)
□ 버튼 터치 영역 충분한지
□ 텍스트 가독성 (폰트 크기)
□ 이미지 로딩 속도
□ 스크롤 성능
□ 입력 폼 사용성 (키보드 올라올 때)
□ 네비게이션 메뉴
```

#### B-2. PWA 기능 테스트
**현재 상태:**
- Service Worker 삭제됨 (최근 정리에서)
- PWA 설치 기능 없음

**선택지:**
1. PWA 기능 재추가 (오프라인 지원, 앱 설치)
2. 네이티브 앱 개발 (나중에)
3. 웹앱으로만 운영 (초기 권장)

**권장: 초기에는 웹앱만 제공**

### Phase C: 성능 최적화 (2일)

#### C-1. Core Web Vitals 목표
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**현재 상태 측정:**
```bash
# Lighthouse 실행
npx lighthouse https://meetpin-weld.vercel.app --view

# 주요 지표 확인
- Performance Score: 목표 90+
- Accessibility: 목표 100
- Best Practices: 목표 100
- SEO: 목표 90+
```

**최적화 작업 (이미 일부 완료):**
- ✅ 이미지 최적화 (WebP, next/image)
- ✅ 코드 스플리팅 (14개 dynamic imports)
- ✅ 카카오 맵 SDK preload
- 추가: 폰트 최적화 (Pretendard)

#### C-2. 번들 사이즈 최적화
**현재:** 104KB (main bundle) < 300KB limit ✅

**추가 최적화:**
```bash
pnpm analyze:bundle

# 큰 패키지 확인 후 교체
- date-fns → date-fns-tz (필요한 함수만 import)
- lucide-react → 사용하는 아이콘만 import
```

---

## 5. 운영 시스템 구축

### Phase A: 고객 지원 체계 (1주)

#### A-1. 고객센터 구축
**최소 구성:**
1. **이메일 지원**
   - 전용 이메일: support@meetpin.com
   - Gmail Business 또는 Naver Works (무료)
   - 응답 목표: 24시간 이내

2. **FAQ 페이지 작성**
   ```
   □ 회원가입/로그인 관련 (5문항)
   □ 모임 생성/참가 관련 (10문항)
   □ 결제/환불 관련 (5문항)
   □ 신고/차단 관련 (3문항)
   □ 기타 (3문항)
   ```

3. **문의하기 폼 추가**
   ```typescript
   // src/app/contact/page.tsx 수정
   // 현재: 더미 폼
   // 개선: 실제 이메일 발송 (Sendgrid, AWS SES 등)
   ```

#### A-2. 신고 처리 프로세스
**현재:** 신고 기능은 있지만 처리 프로세스 없음

**즉시 구축:**
1. **신고 알림 시스템**
   ```typescript
   // src/app/api/reports/route.ts 수정
   // 신고 접수 시 관리자에게 이메일 발송

   import { sendEmail } from '@/lib/email'

   async function handleReport(report) {
     // DB 저장
     await supabase.from('reports').insert(report)

     // 관리자 알림
     await sendEmail({
       to: 'admin@meetpin.com',
       subject: `[긴급] 신고 접수: ${report.reason}`,
       body: `신고자: ${report.reporter_uid}\n대상: ${report.reported_uid}\n사유: ${report.reason}\n\n관리자 패널: https://meetpin.com/admin`
     })
   }
   ```

2. **신고 처리 기준 수립**
   ```markdown
   # 신고 처리 가이드라인

   ## 즉시 제재 (영구 정지)
   - 불법 콘텐츠 (마약, 불법 도박 등)
   - 성매매 알선
   - 금융 사기

   ## 경고 후 제재 (1차 경고, 2차 7일 정지, 3차 영구 정지)
   - 욕설/비방
   - 스팸/광고
   - 노쇼 반복 (3회 이상)

   ## 경고만
   - 경미한 규칙 위반
   - 프로필 사진 부적절
   ```

3. **관리자 패널 개선**
   ```
   □ 신고 목록 조회 (날짜, 상태 필터)
   □ 신고 상세 보기
   □ 조치 버튼 (경고, 정지, 영구 정지)
   □ 조치 이력 기록
   □ 사용자 활동 로그 조회
   ```

#### A-3. 긴급 상황 대응
**매뉴얼 작성:**
```markdown
# 긴급 상황 대응 매뉴얼

## 1. 서버 장애
- 모니터링: UptimeRobot (https://uptimerobot.com) 무료
- 알림: SMS + 이메일
- 대응: Vercel 상태 페이지 확인 → Supabase 확인 → 롤백

## 2. 대량 신고/악성 사용자
- 즉시 계정 정지 (Supabase Auth 비활성화)
- 경찰 신고 (필요시)

## 3. 데이터 유출 의심
- 즉시 서비스 중단
- Supabase 로그 확인
- 사용자 공지 (개인정보보호법상 24시간 내)

## 4. 결제 오류
- Stripe Dashboard 확인
- 환불 처리
- 고객 안내 이메일
```

### Phase B: 모니터링 & 알림 (3일)

#### B-1. 에러 추적 (Sentry)
**즉시 설정:**
```bash
# 1. Sentry 가입 (https://sentry.io) - 무료 플랜 충분
# 2. 프로젝트 생성
# 3. DSN 발급

# 4. Vercel 환경 변수 등록
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...

# 5. 배포 후 테스트
# src/app/api/test-sentry/route.ts 생성
export async function GET() {
  throw new Error('Sentry test error')
}

# 6. https://meetpin.com/api/test-sentry 접속
# 7. Sentry Dashboard에서 에러 확인
```

**알림 설정:**
- Slack 연동 또는 이메일
- 심각도: Error 이상만 알림
- 빈도: 5분에 1회 최대

#### B-2. 서버 모니터링
**UptimeRobot 설정 (무료):**
```
1. https://uptimerobot.com 가입
2. 모니터 추가:
   - https://meetpin.com (5분마다 체크)
   - https://meetpin.com/api/health (5분마다)
3. 알림 설정:
   - 이메일 (본인)
   - SMS (선택)
4. 다운타임 시 즉시 알림
```

#### B-3. 사용자 행동 분석 (선택)
**Plausible Analytics (추천):**
- GDPR 준수 (개인정보 수집 안 함)
- 무료 30일 트라이얼
- 월 $9 (1만 PV까지)

**설정:**
```html
<!-- src/app/layout.tsx -->
<Script
  defer
  data-domain="meetpin.com"
  src="https://plausible.io/js/script.js"
/>
```

**추적 지표:**
- 페이지 뷰
- 신규/재방문 사용자
- 이탈률
- 전환율 (회원가입, 모임 생성)

### Phase C: 백업 & 재해 복구 (1일)

#### C-1. 데이터 백업
**Supabase 백업:**
- 자동 백업: 매일 1회 (Supabase가 자동 수행)
- 보존 기간: 7일 (무료 플랜) / 30일 (Pro 플랜)

**추가 백업 (권장):**
```bash
# 매주 1회 수동 백업 스크립트
# scripts/backup.sh
#!/bin/bash

DATE=$(date +%Y%m%d)
pg_dump -h [supabase-host] -U postgres -d postgres > backup_$DATE.sql

# Google Drive에 업로드
rclone copy backup_$DATE.sql gdrive:meetpin-backups/
```

#### C-2. 재해 복구 계획
**시나리오별 복구 시간 목표:**
- Vercel 장애: 1시간 (다른 호스팅으로 배포)
- Supabase 장애: 2시간 (백업에서 복구)
- 데이터 손실: 24시간 이내 복구

**복구 절차 문서화:**
```markdown
# 재해 복구 절차

## 1. Vercel 장애
1. 다른 Git branch로 배포
2. 또는 Netlify/Railway로 긴급 배포

## 2. Supabase 장애
1. Supabase 상태 페이지 확인
2. 백업 파일로 새 Supabase 프로젝트 생성
3. 환경 변수 업데이트
4. 재배포

## 3. 데이터 손실
1. 최신 백업 확인
2. 백업 복원 (pg_restore)
3. RLS 정책 재적용
4. 데이터 무결성 검증
```

---

## 6. 마케팅 & 사용자 확보

### Phase A: 베타 테스트 (2주)

#### A-1. 베타 테스터 모집
**목표:** 50-100명

**채널:**
1. **지인 네트워크**
   - 친구, 가족, 동료
   - 대학 동아리, 커뮤니티

2. **온라인 커뮤니티**
   - 디스콰이엇
   - GeekNews
   - Reddit Korea
   - 페이스북 그룹 (스타트업, 사이드프로젝트)

3. **Product Hunt 준비** (정식 런칭 시)

**베타 테스터 혜택:**
- 평생 무료 부스트 (월 1회)
- "Early Adopter" 뱃지
- 피드백 제공 시 스타벅스 기프티콘

#### A-2. 피드백 수집
**수집 도구:**
1. **Google Forms**
   - 베타 테스트 후 설문지
   - 만족도, 개선 사항, 버그 리포트

2. **GitHub Issues**
   - 버그 트래킹
   - 기능 요청

3. **Discord 또는 Slack**
   - 베타 테스터 전용 채널
   - 실시간 소통

**핵심 질문:**
```
1. 서비스를 친구에게 추천하시겠습니까? (NPS)
2. 가장 유용했던 기능은?
3. 가장 불편했던 점은?
4. 추가되었으면 하는 기능은?
5. 비슷한 서비스를 사용해 본 적이 있나요?
```

#### A-3. 버그 수정 & 개선
**우선순위:**
1. **P0 (즉시):** 서비스 사용 불가 버그
2. **P1 (24시간):** 주요 기능 버그
3. **P2 (1주):** UX 개선
4. **P3 (나중에):** Nice-to-have 기능

### Phase B: 정식 런칭 (1주)

#### B-1. 런칭 준비
**체크리스트:**
```
□ 법적 문서 모두 완료 (사업자, 약관 등)
□ 결제 시스템 실제 테스트 완료
□ 베타 피드백 반영 완료
□ 성능 최적화 완료 (Lighthouse 90+)
□ 모니터링 시스템 가동 중
□ 고객센터 준비 완료
□ 긴급 대응 매뉴얼 작성 완료
□ 도메인 연결 완료 (meetpin.com)
□ SNS 계정 생성 (Instagram, Facebook, Twitter)
□ 프로모션 영상/이미지 준비
```

#### B-2. 런칭 채널
**1일차: Soft Launch**
- 베타 테스터에게 먼저 공개
- 모니터링 강화 (24시간 대기)

**2일차: Community Launch**
- 디스콰이엇, GeekNews 공유
- "Show HN" (Hacker News)

**3-5일차: Social Media**
- Instagram, Facebook 광고 ($100 예산)
- 타겟: 20-30대, 서울/수도권
- 관심사: 술, 운동, 모임

**1주차: Press Release**
- Platum, Byline Network 등 스타트업 미디어
- "새로운 위치 기반 모임 플랫폼 출시"

#### B-3. 초기 목표 설정
**1개월 목표:**
- 가입자: 500명
- DAU (일 활성 사용자): 50명
- 생성된 모임: 100개
- 매칭 성공률: 30%

**지표 추적:**
- Google Analytics 또는 Plausible
- Supabase Dashboard (쿼리 직접 작성)

### Phase C: 그로스 해킹 (지속적)

#### C-1. 바이럴 기능 추가
**추천 친구 시스템:**
```typescript
// 구현 예시
- 친구 초대 링크 생성
- 친구 가입 시 양쪽 모두 무료 부스트 지급
- "친구 3명 초대 시 1개월 무료 부스트"
```

**소셜 공유:**
- 모임 생성 시 "친구에게 공유하기" 버튼
- 카카오톡, 트위터, 페이스북 공유

#### C-2. SEO 최적화
**즉시 구현:**
```typescript
// src/app/layout.tsx
export const metadata = {
  title: '밋핀 - 지도에서 만나는 새로운 모임',
  description: '근처 사람들과 술, 운동, 취미 모임을 만들고 함께하세요',
  keywords: '모임, 번개, 위치기반, 술친구, 운동친구, 밋업',
  openGraph: {
    title: '밋핀',
    description: '지도에서 만나는 새로운 모임',
    images: ['/og-image.png'],
  },
}
```

**Sitemap 생성:**
```typescript
// src/app/sitemap.ts (이미 있음)
// 동적 모임 페이지 추가
export default async function sitemap() {
  const rooms = await getRooms()

  return [
    { url: 'https://meetpin.com', priority: 1.0 },
    { url: 'https://meetpin.com/map', priority: 0.9 },
    ...rooms.map(room => ({
      url: `https://meetpin.com/room/${room.id}`,
      lastModified: room.updated_at,
      priority: 0.7,
    })),
  ]
}
```

#### C-3. 리텐션 개선
**푸시 알림 (재방문 유도):**
- "근처에 새로운 모임이 생겼어요"
- "매칭된 친구가 메시지를 보냈어요"

**이메일 마케팅:**
- 주간 모임 요약
- 인기 모임 추천

---

## 7. 출시 후 운영 계획

### Week 1-4: 집중 모니터링

#### 매일 체크리스트
```
□ 신규 가입자 수
□ DAU (Daily Active Users)
□ 생성된 모임 수
□ 매칭 수
□ 에러 로그 확인 (Sentry)
□ 서버 상태 확인 (UptimeRobot)
□ 고객 문의 응답
□ 신고 처리
```

#### 주간 리뷰
```
□ KPI 달성도 확인
□ 베타 피드백 반영 진행도
□ 다음 주 개선 사항 우선순위 결정
□ 재무 현황 (수익, 비용)
```

### Month 2-3: 개선 & 확장

#### 기능 추가 우선순위
1. **본인 인증** (PASS/NICE)
2. **프로필 인증 뱃지**
3. **모임 리뷰 시스템**
4. **관심사 태그**
5. **그룹 채팅** (1:N)
6. **모임 히스토리**

#### 확장 계획
1. **지역 확대**
   - 1단계: 서울/수도권
   - 2단계: 부산, 대구, 광주, 대전
   - 3단계: 전국

2. **카테고리 확대**
   - 현재: 술, 운동, 기타
   - 추가: 스터디, 맛집 탐방, 영화, 독서, 게임

### Month 4-6: 수익화 & 스케일링

#### 수익 모델 다각화
1. **현재:** 모임 부스트 (₩1,000-5,000)
2. **추가:**
   - 프리미엄 멤버십 (월 ₩9,900)
     - 무제한 부스트
     - 우선 매칭
     - 프로필 뱃지
   - 기업 계정 (팀 빌딩, 네트워킹 이벤트)
   - 광고 (지역 맛집, 카페)

#### 투자 유치 고려
**시드 투자 (₩1-5억):**
- 타이밍: DAU 500+ 달성 시
- 용도: 마케팅, 개발자 채용, 인프라
- 예상 지분: 10-20%

---

## 8. 타임라인 & 체크리스트

### 🚨 즉시 (D-Day ~ D+3)

#### 법적 준비 (필수!)
- [ ] 사업자 형태 결정 (개인/법인)
- [ ] 사업자등록증 발급
- [ ] 통신판매업 신고
- [ ] 법적 문서 업데이트 (5개 파일)
  - [ ] 실제 사업자 정보 입력
  - [ ] 연락처 업데이트
  - [ ] 주소 업데이트
- [ ] 개인정보처리방침 공시
- [ ] 회원가입 페이지에 동의 체크박스 추가

### Week 1: 인프라 & 환경 설정

#### 도메인 & 호스팅
- [ ] 도메인 구매 (meetpin.com 또는 meetpin.kr)
- [ ] Vercel에 도메인 연결
- [ ] SSL 인증서 자동 발급 확인
- [ ] DNS 설정 완료

#### 외부 서비스 설정
- [ ] Supabase Production 프로젝트 확인
  - [ ] 백업 설정
  - [ ] Connection Pooling 활성화
  - [ ] RLS 정책 확인
- [ ] Kakao Maps 개발자 콘솔
  - [ ] 애플리케이션 생성
  - [ ] 도메인 등록
  - [ ] JavaScript 키 발급
- [ ] Stripe (또는 국내 PG)
  - [ ] PG사 선택 및 계약
  - [ ] Live API 키 발급
  - [ ] Webhook 설정
  - [ ] 실제 결제 테스트 (소액)
- [ ] Sentry 설정
  - [ ] 프로젝트 생성
  - [ ] DSN 발급
  - [ ] Vercel 환경 변수 등록
  - [ ] 에러 알림 테스트

#### 환경 변수 설정
- [ ] Vercel Production 환경 변수 등록
- [ ] **NEXT_PUBLIC_USE_MOCK_DATA=false** 확인
- [ ] 모든 API 키 Live 버전으로 전환
- [ ] Stripe Live 키 등록

### Week 2: 필수 기능 검증

#### 사용자 플로우 테스트
- [ ] 회원가입/로그인 (실제 이메일)
- [ ] 프로필 설정 (이미지 업로드 포함)
- [ ] 모임 생성 (여러 지역에서)
- [ ] 모임 검색/필터링
- [ ] 참가 신청/수락
- [ ] 1:1 채팅 (실시간)
- [ ] 부스트 결제 (실제 결제 테스트)

#### 모바일 테스트
- [ ] iPhone Safari 테스트
- [ ] Android Chrome 테스트
- [ ] Tablet 테스트
- [ ] 터치 인터랙션 확인

#### 성능 최적화
- [ ] Lighthouse 실행 (목표: 90+)
- [ ] Core Web Vitals 확인
- [ ] 번들 사이즈 확인 (< 300KB)

### Week 3: 운영 시스템 구축

#### 고객 지원
- [ ] support@meetpin.com 이메일 설정
- [ ] FAQ 페이지 작성 (20+ 문항)
- [ ] 문의하기 폼 실제 동작 (이메일 발송)
- [ ] 응답 템플릿 작성

#### 신고 처리
- [ ] 신고 알림 시스템 구현
- [ ] 신고 처리 가이드라인 문서화
- [ ] 관리자 패널 개선
  - [ ] 신고 목록/상세
  - [ ] 조치 버튼
  - [ ] 이력 기록

#### 모니터링
- [ ] UptimeRobot 설정 (서버 모니터링)
- [ ] Sentry 알림 설정
- [ ] Plausible Analytics 연동 (선택)

#### 긴급 대응
- [ ] 긴급 상황 대응 매뉴얼 작성
- [ ] 백업 스크립트 작성
- [ ] 재해 복구 절차 문서화

### Week 4: 베타 테스트

#### 베타 테스터 모집
- [ ] 지인 네트워크 (30명 목표)
- [ ] 온라인 커뮤니티 공유 (20명 목표)
- [ ] 베타 테스터 전용 Discord/Slack 채널 개설

#### 피드백 수집
- [ ] Google Forms 설문지 작성
- [ ] NPS 측정
- [ ] 버그 리포트 수집

#### 개선 작업
- [ ] P0/P1 버그 즉시 수정
- [ ] UX 개선 사항 반영
- [ ] 성능 이슈 해결

### Week 5: 정식 런칭 준비

#### 최종 점검
- [ ] 법적 문서 완료 확인
- [ ] 결제 시스템 검증
- [ ] 베타 피드백 반영 완료
- [ ] Lighthouse Score 90+ 달성
- [ ] 모니터링 시스템 가동 확인

#### 마케팅 준비
- [ ] SNS 계정 생성 (Instagram, Facebook, Twitter)
- [ ] 프로모션 이미지/영상 제작
- [ ] Product Hunt 초안 작성
- [ ] 보도자료 작성

### Week 6: 정식 런칭 🚀

#### Day 1: Soft Launch
- [ ] 베타 테스터에게 공개
- [ ] 24시간 모니터링
- [ ] 긴급 버그 대응 준비

#### Day 2-3: Community Launch
- [ ] 디스콰이엇, GeekNews 공유
- [ ] "Show HN" 포스트

#### Day 4-7: Social Media
- [ ] Instagram/Facebook 광고 시작 ($100)
- [ ] 인플루언서 협업 (마이크로 인플루언서)

#### Week 2: Press Release
- [ ] 스타트업 미디어 보도자료 발송
- [ ] Product Hunt 런칭

---

## 📊 핵심 지표 (KPI)

### 1개월 목표
- 가입자: 500명
- DAU: 50명
- 생성된 모임: 100개
- 매칭 성공률: 30%
- 이탈률: < 50%

### 3개월 목표
- 가입자: 2,000명
- DAU: 200명
- 생성된 모임: 500개
- MRR (월 반복 매출): ₩100만원
- 앱 평점: 4.0+

### 6개월 목표
- 가입자: 10,000명
- DAU: 1,000명
- MRR: ₩500만원
- 투자 유치: ₩1-5억

---

## 💰 예상 비용 (월별)

### 초기 고정 비용
- 사업자 등록: ₩0-100만원 (1회)
- 도메인: ₩15,000/년
- **소계: ~₩100만원 (1회)**

### 월별 운영 비용
| 항목 | 비용 (월) | 필수 여부 |
|------|-----------|-----------|
| Vercel Pro | $20 (₩27,000) | 선택 (무료 플랜으로 시작 가능) |
| Supabase Pro | $25 (₩33,000) | 필수 (무료 플랜으로 시작 가능) |
| Upstash Redis | $0-10 | 선택 |
| Sentry | $0-26 | 필수 (무료 플랜) |
| 이메일 서비스 | $0-10 | 필수 (Gmail 무료) |
| PG 수수료 | 매출의 3% | 필수 |
| 마케팅 | ₩50-100만원 | 선택 |
| **총계** | **₩10-150만원** | - |

**초기 권장: 무료 플랜으로 시작 → 사용자 증가 시 Pro 전환**

---

## ✅ 최종 체크리스트

### 법적 필수 (출시 전 100% 완료)
- [ ] 사업자등록증
- [ ] 통신판매업 신고번호
- [ ] 개인정보처리방침 (실제 정보)
- [ ] 이용약관 (실제 정보)
- [ ] 위치정보 이용약관
- [ ] 회원가입 동의 체크박스

### 기술적 필수 (출시 전 100% 완료)
- [ ] Production 환경 변수 설정
- [ ] Mock 데이터 비활성화
- [ ] 실제 결제 테스트 완료
- [ ] 에러 모니터링 (Sentry)
- [ ] 서버 모니터링 (UptimeRobot)
- [ ] 도메인 연결

### 운영 필수 (출시 전 100% 완료)
- [ ] 고객센터 이메일
- [ ] FAQ 페이지
- [ ] 신고 처리 프로세스
- [ ] 긴급 대응 매뉴얼

### 마케팅 준비 (런칭 전 80% 완료)
- [ ] SNS 계정
- [ ] 프로모션 이미지
- [ ] 초기 사용자 확보 계획

---

## 🎯 결론: 지금 당장 할 일 (우선순위 Top 5)

### 1. 사업자 등록 + 통신판매업 신고 (법적 필수)
**예상 소요: 3-7일**
- 세무서 방문 예약
- 사업자등록증 발급
- 구청에서 통신판매업 신고

### 2. 법적 문서 업데이트 (5개 파일)
**예상 소요: 1일**
- 실제 사업자 정보 입력
- 연락처, 주소 업데이트
- 회원가입에 동의 체크박스 추가

### 3. Production 환경 설정
**예상 소요: 2일**
- 도메인 구매 및 연결
- Vercel 환경 변수 등록
- Kakao Maps 도메인 등록
- Mock 데이터 비활성화

### 4. 실제 결제 테스트
**예상 소요: 1일**
- PG사 계약 (토스페이먼츠 권장)
- Live API 키 발급
- 실제 카드로 소액 결제 테스트
- 환불 테스트

### 5. 모니터링 & 고객 지원 구축
**예상 소요: 2일**
- Sentry 설정 (에러 추적)
- UptimeRobot 설정 (서버 모니터링)
- support@meetpin.com 이메일 설정
- FAQ 페이지 작성

---

**총 예상 기간: 2-3주 (법적 절차 포함)**

**출시 준비 완료 후 → 베타 테스트 (1-2주) → 정식 런칭 🚀**
