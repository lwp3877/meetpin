# MeetPin 운영 가이드 (RUNBOOK)

## 📋 개요

이 문서는 MeetPin 애플리케이션의 운영, 배포, 모니터링, 트러블슈팅에 대한 종합적인 가이드입니다.

## 🚀 배포 가이드

### Production 배포 체크리스트

#### 1. 사전 준비
- [ ] 모든 테스트 통과 확인 (`pnpm test`, `pnpm e2e`)
- [ ] 타입 체크 통과 (`pnpm typecheck`)
- [ ] 린팅 통과 (`pnpm lint`)
- [ ] 빌드 성공 확인 (`pnpm build`)
- [ ] 환경 변수 검증
- [ ] 데이터베이스 마이그레이션 스크립트 검토

#### 2. 배포 프로세스

```bash
# 1. 최신 코드 업데이트
git checkout main
git pull origin main

# 2. 의존성 설치
pnpm install

# 3. 빌드 테스트
pnpm build

# 4. 테스트 실행
pnpm test
pnpm e2e

# 5. Vercel 배포
vercel --prod
```

#### 3. 배포 후 확인사항
- [ ] 메인 페이지 로딩 확인
- [ ] 인증 플로우 정상 동작
- [ ] 지도 기능 정상 동작
- [ ] API 엔드포인트 응답 확인
- [ ] 결제 시스템 동작 확인 (Stripe)
- [ ] 실시간 채팅 기능 확인

### Staging 배포

```bash
# Staging 브랜치에서 배포
git checkout staging
vercel --target staging
```

### Hot Fix 배포

긴급 수정사항이 있는 경우:

```bash
# 1. Hotfix 브랜치 생성
git checkout -b hotfix/critical-bug-fix main

# 2. 수정사항 커밋
git add .
git commit -m "hotfix: critical bug fix description"

# 3. 테스트 실행 (최소한)
pnpm test:critical

# 4. 배포
vercel --prod

# 5. Main 브랜치에 머지
git checkout main
git merge hotfix/critical-bug-fix
git push origin main
```

## 🔧 환경 설정

### 환경 변수 관리

#### Production 환경
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Kakao Maps
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_prod_key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
SITE_URL=https://meetpin.vercel.app
```

#### Staging 환경
- Production과 동일하지만 별도의 Supabase 프로젝트 사용
- Stripe는 테스트 키 사용

#### Development 환경
- 로컬 개발용 설정
- Mock 데이터 사용 가능

### 데이터베이스 관리

#### Migration 실행

```sql
-- Supabase SQL Editor에서 실행
\i scripts/migrate.sql
```

#### RLS 정책 업데이트

```sql
-- 새로운 보안 정책 적용
\i scripts/rls.sql
```

#### 백업 생성

```bash
# Supabase CLI 사용
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 📊 모니터링

### 핵심 지표 모니터링

#### 성능 지표
- **페이지 로딩 시간**: < 3초
- **API 응답 시간**: < 1초
- **실시간 채팅 지연**: < 500ms
- **지도 렌더링 시간**: < 2초

#### 비즈니스 지표
- **일간 활성 사용자 (DAU)**
- **신규 가입자 수**
- **모임 생성 수**
- **매칭 성공률**
- **결제 완료율**

### 로그 모니터링

#### Vercel Function Logs
```bash
# 실시간 로그 확인
vercel logs --follow

# 특정 기간 로그
vercel logs --since=2024-01-01 --until=2024-01-02
```

#### Supabase Logs
- Supabase Dashboard > Logs 섹션에서 확인
- Database, Auth, API, Realtime 로그 분리 확인

#### 주요 모니터링 포인트
- API 에러율
- 데이터베이스 쿼리 성능
- 인증 실패율
- 결제 실패율

## 🚨 알람 설정

### Critical Alerts (즉시 대응)
- API 에러율 > 5%
- 데이터베이스 연결 실패
- 결제 시스템 장애
- 메인 페이지 접근 불가

### Warning Alerts (30분 내 대응)
- API 응답 시간 > 3초
- 메모리 사용률 > 80%
- 디스크 사용률 > 85%

### Info Alerts (일일 리뷰)
- 일간 사용자 수 감소 > 20%
- 특정 기능 사용률 변화

## 🔍 트러블슈팅

### 일반적인 문제 해결

#### 1. 앱이 로드되지 않는 경우

**증상**: 페이지가 빈 화면이거나 에러 표시

**해결 방법**:
```bash
# 1. 빌드 에러 확인
vercel logs --limit=100

# 2. 환경 변수 확인
vercel env ls

# 3. Supabase 연결 확인
# Dashboard에서 프로젝트 상태 확인
```

#### 2. 인증이 작동하지 않는 경우

**증상**: 로그인/회원가입 실패

**해결 방법**:
1. Supabase Auth 설정 확인
2. 환경 변수 SUPABASE_* 확인
3. CORS 설정 확인
4. JWT 토큰 만료 시간 확인

#### 3. 지도가 표시되지 않는 경우

**증상**: 지도 영역이 빈 화면

**해결 방법**:
1. Kakao Maps API 키 확인
2. 도메인 등록 상태 확인
3. 브라우저 콘솔 에러 로그 확인
4. 네트워크 탭에서 API 요청 상태 확인

#### 4. 실시간 채팅이 작동하지 않는 경우

**증상**: 메시지가 실시간으로 업데이트되지 않음

**해결 방법**:
1. Supabase Realtime 설정 확인
2. WebSocket 연결 상태 확인
3. 브라우저 개발자 도구 Network 탭 확인
4. RLS 정책으로 인한 권한 문제 확인

#### 5. 결제가 작동하지 않는 경우

**증상**: 결제 진행 중 에러 발생

**해결 방법**:
1. Stripe API 키 확인
2. Webhook 엔드포인트 상태 확인
3. Stripe Dashboard에서 에러 로그 확인
4. 결제 금액 및 통화 설정 확인

### 데이터베이스 관련 문제

#### 연결 풀 부족
```sql
-- 현재 연결 상태 확인
SELECT * FROM pg_stat_activity;

-- 불필요한 연결 종료
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < NOW() - INTERVAL '5 minutes';
```

#### 쿼리 성능 문제
```sql
-- 느린 쿼리 확인
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- 인덱스 사용률 확인
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('rooms', 'requests', 'matches', 'messages');
```

### 성능 최적화

#### 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 포맷 적용
- Lazy Loading 구현

#### API 응답 최적화
```typescript
// 페이지네이션 적용
const { data, count } = await supabase
  .from('rooms')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1)

// 인덱스 활용
await supabase
  .from('rooms')
  .select('*')
  .eq('status', 'active') // 인덱스 활용
  .gte('lat', bbox.south)  // BBox 쿼리 최적화
```

#### 클라이언트 사이드 캐싱
```typescript
// React Query 사용
const { data: rooms } = useQuery({
  queryKey: ['rooms', bbox],
  queryFn: () => fetchRooms(bbox),
  staleTime: 5 * 60 * 1000, // 5분
})
```

## 📈 성능 측정

### Core Web Vitals 모니터링

```bash
# Lighthouse CI 실행
npm install -g @lhci/cli
lhci collect --url=https://meetpin.vercel.app
```

**목표 지표**:
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### API 성능 측정

```bash
# 주요 API 엔드포인트 부하 테스트
curl -w "@curl-format.txt" -s -o /dev/null https://meetpin.vercel.app/api/rooms?bbox=37.4,126.8,37.7,127.2
```

## 🔐 보안 점검

### 정기 보안 체크리스트

#### 월간 점검
- [ ] 의존성 보안 업데이트 (`npm audit`)
- [ ] Supabase RLS 정책 검토
- [ ] API Rate Limiting 효과 분석
- [ ] 사용자 신고 내역 검토

#### 분기별 점검
- [ ] 전체 코드 보안 스캔
- [ ] 침투 테스트 실시
- [ ] 백업 복구 테스트
- [ ] 재해 복구 계획 검토

### 보안 사고 대응

#### 1. 보안 사고 발생 시
1. **즉시 조치**: 영향받은 서비스 격리
2. **상황 파악**: 로그 분석, 영향 범위 확인
3. **대응 조치**: 취약점 패치, 비밀번호 재설정 등
4. **사후 조치**: 보고서 작성, 재발 방지 대책 수립

#### 2. 데이터 유출 의심 시
1. Supabase에서 비정상적인 쿼리 패턴 확인
2. API 접근 로그 분석
3. 영향받은 사용자 식별 및 알림
4. 관련 당국 신고 (필요시)

## 📱 모바일 대응

### PWA 기능 점검
- [ ] Service Worker 정상 동작
- [ ] 오프라인 페이지 표시
- [ ] 앱 설치 프롬프트 동작
- [ ] 푸시 알림 (향후 구현 예정)

### 모바일 성능 최적화
- 번들 사이즈 최소화
- 이미지 최적화
- 터치 인터페이스 최적화
- 네트워크 상태에 따른 적응형 로딩

## 📞 긴급 연락처

### 개발팀
- **리드 개발자**: 이원표 (lwp3877@naver.com)

### 외부 서비스 지원
- **Supabase Support**: support@supabase.com
- **Vercel Support**: support@vercel.com
- **Stripe Support**: support@stripe.com
- **Kakao Developers**: developers@kakao.com

### 에스컬레이션 프로세스
1. **Level 1**: 개발자 직접 대응 (응답시간: 1시간)
2. **Level 2**: 팀 리드 참여 (응답시간: 4시간)
3. **Level 3**: 외부 지원팀 연락 (응답시간: 24시간)

---

**문서 업데이트**: 이 문서는 매월 검토하고 업데이트합니다.
**최종 수정일**: 2024년 1월